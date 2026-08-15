const Beneficiary = require('../models/Beneficiary');
const AuditLog = require('../models/AuditLog');

// GET all beneficiaries (supports ?region=&status=&schemeId= filters)
exports.getAllBeneficiaries = async (req, res) => {
  try {
    const { region, status, schemeId } = req.query;
    const filter = {};
    if (region) filter.region = region;
    if (status) filter.status = status;
    if (schemeId) filter.schemeId = schemeId;

    const beneficiaries = await Beneficiary.find(filter).populate('schemeId', 'name category');
    res.status(200).json(beneficiaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST register a new beneficiary + logs the action
exports.createBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.create(req.body);

    await AuditLog.create({
      action: 'BENEFICIARY_REGISTERED',
      performedBy: req.body.registeredBy || 'Administrator',
      role: 'Administrator',
      targetType: 'Beneficiary',
      targetId: beneficiary._id.toString(),
      details: `New beneficiary registered: ${beneficiary.name} (${beneficiary.nationalId})`
    });

    res.status(201).json(beneficiary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single beneficiary by id
exports.getBeneficiaryById = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id).populate('schemeId', 'name category');
    if (!beneficiary) return res.status(404).json({ error: 'Beneficiary not found' });
    res.status(200).json(beneficiary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update a beneficiary record (status, region, etc.) + logs the action.

exports.updateBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) return res.status(404).json({ error: 'Beneficiary not found' });

    Object.assign(beneficiary, req.body);
    const updated = await beneficiary.save();

    await AuditLog.create({
      action: 'BENEFICIARY_UPDATED',
      performedBy: req.body.updatedBy || 'Administrator',
      role: 'Administrator',
      targetType: 'Beneficiary',
      targetId: updated._id.toString(),
      details: `Beneficiary record updated with: ${JSON.stringify(req.body)}`
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE a beneficiary record + logs the action
exports.deleteBeneficiary = async (req, res) => {
  try {
    const deleted = await Beneficiary.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Beneficiary not found' });

    await AuditLog.create({
      action: 'BENEFICIARY_DELETED',
      performedBy: req.body.deletedBy || 'Administrator',
      role: 'Administrator',
      targetType: 'Beneficiary',
      targetId: req.params.id,
      details: 'Beneficiary record removed from the system'
    });

    res.status(200).json({ message: 'Beneficiary deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
