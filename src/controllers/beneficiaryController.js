const Beneficiary = require('../models/Beneficiary');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const createError = require('../utils/appError');
const { sendSuccess } = require('../utils/apiResponse');
const ROLES = require('../constants/roles');

// GET all beneficiaries (supports ?region=&status=&schemeId= filters)
exports.getAllBeneficiaries = asyncHandler(async (req, res) => {
    const { region, status, schemeId } = req.query;
    const filter = {};
    if (region) filter.region = region;
    if (status) filter.status = status;
    if (schemeId) filter.schemeId = schemeId;

    const beneficiaries = await Beneficiary.find(filter).populate('schemeId', 'name category');
    return sendSuccess(res, 200, "Beneficiaries fetched successfully", beneficiaries);
});

// POST register a new beneficiary + logs the action
exports.createBeneficiary = asyncHandler(async (req, res) => {
    const beneficiary = await Beneficiary.create(req.body);

    await AuditLog.create({
        action: 'BENEFICIARY_REGISTERED',
        performedBy: req.body.registeredBy || ROLES.ADMINISTRATOR,
        role: ROLES.ADMINISTRATOR,
        targetType: 'Beneficiary',
        targetId: beneficiary._id.toString(),
        details: `New beneficiary registered: ${beneficiary.name} (${beneficiary.nationalId})`
    });

    return sendSuccess(res, 201, "Beneficiary registered successfully", beneficiary);
});

// GET single beneficiary by id
exports.getBeneficiaryById = asyncHandler(async (req, res) => {
    const beneficiary = await Beneficiary.findById(req.params.id).populate('schemeId', 'name category');
    if (!beneficiary) {
        throw createError('Beneficiary not found', 404);
    }
    return sendSuccess(res, 200, "Beneficiary fetched successfully", beneficiary);
});

// PUT update a beneficiary record (status, region, etc.) + logs the action.
exports.updateBeneficiary = asyncHandler(async (req, res) => {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) {
        throw createError('Beneficiary not found', 404);
    }

    Object.assign(beneficiary, req.body);
    const updated = await beneficiary.save();

    await AuditLog.create({
        action: 'BENEFICIARY_UPDATED',
        performedBy: req.body.updatedBy || ROLES.ADMINISTRATOR,
        role: ROLES.ADMINISTRATOR,
        targetType: 'Beneficiary',
        targetId: updated._id.toString(),
        details: `Beneficiary record updated with: ${JSON.stringify(req.body)}`
    });

    return sendSuccess(res, 200, "Beneficiary updated successfully", updated);
});

// DELETE a beneficiary record + logs the action
exports.deleteBeneficiary = asyncHandler(async (req, res) => {
    const deleted = await Beneficiary.findByIdAndDelete(req.params.id);
    if (!deleted) {
        throw createError('Beneficiary not found', 404);
    }

    await AuditLog.create({
        action: 'BENEFICIARY_DELETED',
        performedBy: req.body.deletedBy || ROLES.ADMINISTRATOR,
        role: ROLES.ADMINISTRATOR,
        targetType: 'Beneficiary',
        targetId: req.params.id,
        details: 'Beneficiary record removed from the system'
    });

    return sendSuccess(res, 200, "Beneficiary deleted successfully", null);
});
