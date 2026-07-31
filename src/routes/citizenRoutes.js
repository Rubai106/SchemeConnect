const express = require("express");
const router = express.Router();

const {
    createCitizen,
    getAllCitizens,
    getCitizenById,
    updateCitizen,
    deleteCitizen
} = require("../controllers/citizenController");

// Create Citizen
router.post("/", createCitizen);

// Get All Citizens
router.get("/", getAllCitizens);

// Get Citizen by ID
router.get("/:id", getCitizenById);

// Update Citizen
router.put("/:id", updateCitizen);

// Delete Citizen
router.delete("/:id", deleteCitizen);

module.exports = router;