const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const Beneficiary = require('../models/Beneficiary');

// GET total applications, approval/rejection rates
exports.getOverview = async (req, res) => {
  try {
    const total = await Application.countDocuments();
    const approved = await Application.countDocuments({ status: 'approved' });
    const rejected = await Application.countDocuments({ status: 'rejected' });
    const pending = await Application.countDocuments({ status: 'pending' });

    res.status(200).json({
      totalApplications: total,
      approved,
      rejected,
      pending,
      approvalRate: total ? ((approved / total) * 100).toFixed(2) + '%' : '0%',
      rejectionRate: total ? ((rejected / total) * 100).toFixed(2) + '%' : '0%'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET region-wise beneficiary distribution
// Renamed from getDistrictDistribution — Beneficiary.district was renamed to
// Beneficiary.region to match the "Region" column in the UI. Update your
// routes file (and any frontend calls) from /district-distribution to
// /region-distribution if you're carrying over the old route name.
exports.getRegionDistribution = async (req, res) => {
  try {
    const data = await Beneficiary.aggregate([
      { $group: { _id: '$region', totalBeneficiaries: { $sum: 1 } } },
      { $project: { _id: 0, region: '$_id', totalBeneficiaries: 1 } },
      { $sort: { totalBeneficiaries: -1 } }
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET budget utilization (allocated vs utilized) per scheme
exports.getBudgetUtilization = async (req, res) => {
  try {
    const schemes = await Scheme.find({}, 'name budgetAllocated budgetUtilized');
    const data = schemes.map((s) => ({
      scheme: s.name,
      budgetAllocated: s.budgetAllocated,
      budgetUtilized: s.budgetUtilized,
      remaining: s.budgetAllocated - s.budgetUtilized,
      utilizationRate: s.budgetAllocated
        ? ((s.budgetUtilized / s.budgetAllocated) * 100).toFixed(2) + '%'
        : '0%'
    }));
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET average processing time (submission -> decision) in days
exports.getProcessingTime = async (req, res) => {
  try {
    const result = await Application.aggregate([
      { $match: { decisionAt: { $ne: null } } },
      {
        $project: {
          processingDays: {
            $divide: [{ $subtract: ['$decisionAt', '$submittedAt'] }, 1000 * 60 * 60 * 24]
          }
        }
      },
      { $group: { _id: null, avgProcessingDays: { $avg: '$processingDays' } } }
    ]);

    res.status(200).json({
      averageProcessingTimeDays: result[0] ? Number(result[0].avgProcessingDays.toFixed(2)) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET scheme popularity ranked by number of applications
exports.getSchemePopularity = async (req, res) => {
  try {
    const data = await Application.aggregate([
      { $group: { _id: '$schemeId', applicationCount: { $sum: 1 } } },
      { $lookup: { from: 'schemes', localField: '_id', foreignField: '_id', as: 'scheme' } },
      { $unwind: '$scheme' },
      { $project: { _id: 0, schemeName: '$scheme.name', applicationCount: 1 } },
      { $sort: { applicationCount: -1 } }
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET filtered dashboard: ?schemeId=&district=&category=&startDate=&endDate=
exports.getDashboard = async (req, res) => {
  try {
    const { schemeId, district, category, startDate, endDate } = req.query;
    const filter = {};
    if (schemeId) filter.schemeId = schemeId;
    if (district) filter.district = district;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.submittedAt = {};
      if (startDate) filter.submittedAt.$gte = new Date(startDate);
      if (endDate) filter.submittedAt.$lte = new Date(endDate);
    }

    const applications = await Application.find(filter).populate('schemeId', 'name category');
    const total = applications.length;
    const approved = applications.filter((a) => a.status === 'approved').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    const pending = applications.filter((a) => a.status === 'pending').length;

    res.status(200).json({
      filtersApplied: { schemeId, district, category, startDate, endDate },
      totalApplications: total,
      approved,
      rejected,
      pending,
      applications
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET the "Scheme Analytics" screen data: total beneficiaries, active rate,
// avg verification time, compliance score, and per-scheme active rate.
//
// Definitions (documented here since none of these are standard/self-evident
// metrics — swap these formulas out if your spec defines them differently):
//
// - activeRate: % of all beneficiaries whose status is NOT 'flagged'.
//   i.e. beneficiaries currently in good standing, regardless of stage.
//
// - avgVerificationTimeDays: average days between caseOpenedAt and verifiedAt,
//   across beneficiaries who have reached 'verified'. Beneficiaries missing
//   either timestamp are excluded rather than counted as 0.
//
// - complianceScore: starts at 100 and subtracts weighted penalties:
//     -40 x (flagged beneficiaries / total beneficiaries)
//     -30 x (overdue verification cases / all pending+under_review cases)
//     -30 x (failed disbursements / all disbursement attempts)
//   Weights are a judgment call, not a spec requirement — tune them if you
//   have a different formula to satisfy.
//
// - schemeWiseActiveRate: per scheme, % of that scheme's beneficiaries that
//   are NOT flagged. These are independent percentages per scheme, so they
//   are not expected to sum to 100 across schemes.
exports.getSchemeAnalytics = async (req, res) => {
  try {
    const totalBeneficiaries = await Beneficiary.countDocuments();
    const flaggedCount = await Beneficiary.countDocuments({ status: 'flagged' });

    const activeRate = totalBeneficiaries
      ? (((totalBeneficiaries - flaggedCount) / totalBeneficiaries) * 100).toFixed(1) + '%'
      : '0%';

    const verificationTimes = await Beneficiary.aggregate([
      { $match: { status: 'verified', caseOpenedAt: { $ne: null }, verifiedAt: { $ne: null } } },
      {
        $project: {
          days: { $divide: [{ $subtract: ['$verifiedAt', '$caseOpenedAt'] }, 1000 * 60 * 60 * 24] }
        }
      },
      { $group: { _id: null, avgDays: { $avg: '$days' } } }
    ]);
    const avgVerificationTimeDays = verificationTimes[0] ? Number(verificationTimes[0].avgDays.toFixed(1)) : 0;

    const now = new Date();
    const pendingLikeCount = await Beneficiary.countDocuments({ status: { $in: ['pending', 'under_review'] } });
    const overdueCount = await Beneficiary.countDocuments({
      status: { $in: ['pending', 'under_review'] },
      verificationDeadline: { $lt: now }
    });
    const overdueRate = pendingLikeCount ? overdueCount / pendingLikeCount : 0;

    const disbursementStats = await Beneficiary.aggregate([
      { $unwind: '$disbursements' },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          failed: { $sum: { $cond: [{ $eq: ['$disbursements.status', 'failed'] }, 1, 0] } }
        }
      }
    ]);
    const failedDisbursementRate =
      disbursementStats[0] && disbursementStats[0].total
        ? disbursementStats[0].failed / disbursementStats[0].total
        : 0;

    const flaggedRate = totalBeneficiaries ? flaggedCount / totalBeneficiaries : 0;
    const rawScore = 100 - flaggedRate * 40 - overdueRate * 30 - failedDisbursementRate * 30;
    const complianceScore = Math.max(0, Math.round(rawScore));

    const schemeWiseActiveRate = await Beneficiary.aggregate([
      {
        $group: {
          _id: '$schemeId',
          total: { $sum: 1 },
          flagged: { $sum: { $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0] } }
        }
      },
      { $lookup: { from: 'schemes', localField: '_id', foreignField: '_id', as: 'scheme' } },
      { $unwind: '$scheme' },
      {
        $project: {
          _id: 0,
          schemeName: '$scheme.name',
          activeRateValue: {
            $round: [{ $multiply: [{ $divide: [{ $subtract: ['$total', '$flagged'] }, '$total'] }, 100] }, 1]
          }
        }
      },
      { $sort: { schemeName: 1 } }
    ]);

    res.status(200).json({
      totalBeneficiaries,
      activeRate,
      avgVerificationTimeDays,
      complianceScore: `${complianceScore}/100`,
      schemeWiseActiveRate: schemeWiseActiveRate.map((s) => ({
        schemeName: s.schemeName,
        activeRate: `${s.activeRateValue}%`
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
