// Run this script to seed sample data: node src/seed/seed.js
//
// Scheme re-seeding:
//   This script deletes ALL existing Scheme documents and re-inserts
//   the current sample data. This is necessary because the Scheme schema
//   may have changed (e.g. applicationStatus → status).
//   Only DEMO data is affected. No user data or other collections are touched.
//
// Office seeding:
//   Offices are only inserted if the collection is empty.
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Scheme = require("../models/Scheme");
const WelfareOffice = require("../models/WelfareOffice");
const sampleSchemes = require("./sampleSchemes");
const sampleOffices = require("./sampleOffices");

const seed = async () => {
    await connectDB();

    // Re-seed schemes (schema may have changed)
    const existingSchemes = await Scheme.countDocuments();
    if (existingSchemes > 0) {
        console.log(`Removing ${existingSchemes} existing scheme(s) for re-seed...`);
        await Scheme.deleteMany({});
    }
    await Scheme.insertMany(sampleSchemes);
    console.log(`Seeded ${sampleSchemes.length} sample schemes.`);

    // Seed offices (skip if already present)
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
