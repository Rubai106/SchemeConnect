const Citizen = require("../models/Citizen");
const User = require("../models/User");

const allowedCitizenFields = [
    "userId",
    "occupation",
    "monthlyIncome",
    "educationLevel",
    "familySize",
    "disabilityStatus"
];

const pickCitizenFields = (body) => {
    const payload = {};

    allowedCitizenFields.forEach((field) => {
        if (body[field] !== undefined) {
            payload[field] = body[field];
        }
    });

    return payload;
};

const userPopulateFields = "fullName nationalId email contactNumber role accountStatus division district";

// Create Citizen
const createCitizen = async (req, res) => {
    try {
        const payload = pickCitizenFields(req.body);

        const user = await User.findById(payload.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const citizen = await Citizen.create(payload);
        res.status(201).json(citizen);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get All Citizens
const getAllCitizens = async (req, res) => {
    try {
        const citizens = await Citizen.find().populate("userId", userPopulateFields);
        res.status(200).json(citizens);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Citizen by ID
const getCitizenById = async (req, res) => {
    try {
        const citizen = await Citizen.findById(req.params.id).populate("userId", userPopulateFields);

        if (!citizen) {
            return res.status(404).json({ message: "Citizen not found" });
        }

        res.status(200).json(citizen);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Citizen
const updateCitizen = async (req, res) => {
    try {
        const payload = pickCitizenFields(req.body);

        if (payload.userId) {
            const user = await User.findById(payload.userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
        }

        const citizen = await Citizen.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true, runValidators: true }
        );

        if (!citizen) {
            return res.status(404).json({ message: "Citizen not found" });
        }

        res.status(200).json(citizen);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Citizen
const deleteCitizen = async (req, res) => {
    try {
        const citizen = await Citizen.findByIdAndDelete(req.params.id);

        if (!citizen) {
            return res.status(404).json({ message: "Citizen not found" });
        }

        res.status(200).json({ message: "Citizen deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCitizen,
    getAllCitizens,
    getCitizenById,
    updateCitizen,
    deleteCitizen
};
