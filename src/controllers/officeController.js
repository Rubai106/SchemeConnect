const WelfareOffice = require("../models/WelfareOffice");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/appError");
const { sendSuccess } = require("../utils/apiResponse");

// ============================================================
// Easy to modify: simple distance calculation (Haversine)
// Returns distance in kilometers
// ============================================================
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// ============================================================
// GET /api/offices — list offices with optional filters
// ============================================================
const getOffices = asyncHandler(async (req, res) => {
    const filter = {};

    if (req.query.division) {
        filter.division = req.query.division;
    }

    if (req.query.district) {
        filter.district = req.query.district;
    }

    if (req.query.officeType) {
        filter.officeType = req.query.officeType;
    }

    const offices = await WelfareOffice.find(filter).sort({ name: 1 });

    return sendSuccess(res, 200, "Offices fetched successfully", {
        offices
    });
});

// ============================================================
// GET /api/offices/:id — get one office
// ============================================================
const getOfficeById = asyncHandler(async (req, res) => {
    const office = await WelfareOffice.findById(req.params.id);

    if (!office) {
        throw createError("Office not found.", 404);
    }

    return sendSuccess(res, 200, "Office fetched successfully", {
        office
    });
});

// ============================================================
// GET /api/offices/nearby — offices ordered by distance
// Accepts ?latitude=XX&longitude=YY
// ============================================================
const getNearbyOffices = asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.query;

    const offices = await WelfareOffice.find({}).sort({ name: 1 });

    if (!latitude || !longitude) {
        // No coordinates provided — return all offices without distance
        return sendSuccess(res, 200, "Offices fetched successfully", {
            offices
        });
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    if (isNaN(userLat) || isNaN(userLng)) {
        throw createError("Invalid latitude or longitude.", 400);
    }

    // Add distance to each office
    const officesWithDistance = offices.map((office) => {
        const officeObj = office.toObject();
        officeObj.distance = parseFloat(
            getDistanceKm(userLat, userLng, office.latitude, office.longitude).toFixed(2)
        );
        return officeObj;
    });

    // Sort by distance
    officesWithDistance.sort((a, b) => a.distance - b.distance);

    return sendSuccess(res, 200, "Nearby offices fetched successfully", {
        offices: officesWithDistance
    });
});

module.exports = {
    getOffices,
    getOfficeById,
    getNearbyOffices
};
