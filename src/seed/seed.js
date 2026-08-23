// Run this script to seed sample data: node src/seed/seed.js
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Scheme = require("../models/Scheme");
const WelfareOffice = require("../models/WelfareOffice");
const sampleSchemes = require("./sampleSchemes");
const sampleOffices = require("./sampleOffices");

const seed = async () => {
    await connectDB();

    // Seed schemes
    const existingSchemes = await Scheme.countDocuments();
    if (existingSchemes > 0) {
        console.log(`Schemes already seeded (${existingSchemes} found). Skipping.`);
    } else {
        await Scheme.insertMany(sampleSchemes);
        console.log(`Seeded ${sampleSchemes.length} sample schemes.`);
    }

    // Seed offices
    const existingOffices = await WelfareOffice.countDocuments();
    if (existingOffices > 0) {
        console.log(`Offices already seeded (${existingOffices} found). Skipping.`);
    } else {
        await WelfareOffice.insertMany(sampleOffices);
        console.log(`Seeded ${sampleOffices.length} sample offices.`);
    }

    process.exit(0);
};

seed().catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
});
