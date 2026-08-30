const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const ROLES = require("../src/constants/roles");

const seedUsers = [
  {
    fullName: "Mahima",
    email: "mahima@schemeconnect.com",
    password: "Mahima@123",
    nationalId: "1234567890",
    contactNumber: "+8801700000001",
    division: "Dhaka",
    district: "Dhaka",
    role: ROLES.ADMINISTRATOR
  },
  {
    fullName: "Nafisa",
    email: "nafisa@schemeconnect.com",
    password: "Nafisa@123",
    nationalId: "0987654321",
    contactNumber: "+8801700000002",
    division: "Chattogram",
    district: "Chattogram",
    role: ROLES.FINANCE_OFFICER
  }
];

const seedRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    for (const user of seedUsers) {
      const existingUserByEmail = await User.findOne({ email: user.email.toLowerCase() });

      if (existingUserByEmail) {
        existingUserByEmail.role = user.role;
        existingUserByEmail.division = user.division;
        existingUserByEmail.district = user.district;
        existingUserByEmail.fullName = user.fullName;
        existingUserByEmail.contactNumber = user.contactNumber;
        existingUserByEmail.nationalId = user.nationalId;

        if (user.password) {
          existingUserByEmail.password = await bcrypt.hash(user.password, 10);
        }

        await existingUserByEmail.save();
        console.log(`🔁 Updated existing user: ${user.email} -> ${user.role}`);
        continue;
      }

      const existingUserByNationalId = await User.findOne({ nationalId: user.nationalId });

      if (existingUserByNationalId) {
        existingUserByNationalId.email = user.email.toLowerCase();
        existingUserByNationalId.role = user.role;
        existingUserByNationalId.division = user.division;
        existingUserByNationalId.district = user.district;
        existingUserByNationalId.fullName = user.fullName;
        existingUserByNationalId.contactNumber = user.contactNumber;

        if (user.password) {
          existingUserByNationalId.password = await bcrypt.hash(user.password, 10);
        }

        await existingUserByNationalId.save();
        console.log(`🔁 Updated existing nationalId user: ${user.nationalId} -> ${user.email} (${user.role})`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      await User.create({
        fullName: user.fullName,
        email: user.email.toLowerCase(),
        password: hashedPassword,
        nationalId: user.nationalId,
        contactNumber: user.contactNumber,
        division: user.division,
        district: user.district,
        role: user.role
      });

      console.log(`✅ Created user: ${user.email} -> ${user.role}`);
    }

    console.log("\nLogin with:");
    console.log("Mahima: mahima@schemeconnect.com / Mahima@123");
    console.log("Nafisa: nafisa@schemeconnect.com / Nafisa@123");
  } catch (error) {
    console.error("❌ Seed failed");
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedRoles();
