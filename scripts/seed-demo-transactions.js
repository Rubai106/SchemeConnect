const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const Scheme = require("../src/models/Scheme");
const Transaction = require("../src/models/Transaction");
const ROLES = require("../src/constants/roles");
const SCHEME_STATUS = require("../src/constants/schemeStatus");
const TRANSACTION_STATUS = require("../src/constants/transactionStatus");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const adminEmail = "mahima@schemeconnect.com";
    const financeEmail = "nafisa@schemeconnect.com";

    const admin = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        fullName: "Mahima",
        email: adminEmail,
        password: await bcrypt.hash("Mahima@123", 10),
        nationalId: "1234567890",
        contactNumber: "+8801700000001",
        division: "Dhaka",
        district: "Dhaka",
        role: ROLES.ADMINISTRATOR
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const finance = await User.findOneAndUpdate(
      { email: financeEmail },
      {
        fullName: "Nafisa",
        email: financeEmail,
        password: await bcrypt.hash("Nafisa@123", 10),
        nationalId: "0987654321",
        contactNumber: "+8801700000002",
        division: "Chattogram",
        district: "Chattogram",
        role: ROLES.FINANCE_OFFICER
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    let scheme = await Scheme.findOne({ name: "Emergency Relief Grant" });
    if (!scheme) {
      scheme = await Scheme.create({
        name: "Emergency Relief Grant",
        category: "Healthcare",
        description: "Emergency support for vulnerable families.",
        eligibilityCriteria: "Low income households with documented need.",
        benefitAmount: 8000,
        allocatedBudget: 50000,
        status: SCHEME_STATUS.ACTIVE,
        lowBudgetThresholdPercent: 15,
        createdBy: admin._id
      });
    } else {
      scheme.status = SCHEME_STATUS.ACTIVE;
      scheme.allocatedBudget = 50000;
      scheme.createdBy = admin._id;
      await scheme.save();
    }

    const demoTransactions = [
      {
        scheme: scheme._id,
        beneficiaryName: "Rahima Akter",
        beneficiaryPhone: "01710000001",
        amount: 5000,
        paymentGateway: "Stripe",
        gatewayReference: "pi_success_demo_001",
        status: TRANSACTION_STATUS.SUCCESSFUL,
        initiatedBy: finance._id
      },
      {
        scheme: scheme._id,
        beneficiaryName: "Sadia Hasan",
        beneficiaryPhone: "01710000002",
        amount: 2500,
        paymentGateway: "Stripe",
        gatewayReference: "pi_failed_demo_002",
        status: TRANSACTION_STATUS.FAILED,
        initiatedBy: finance._id
      },
      {
        scheme: scheme._id,
        beneficiaryName: "Abdul Karim",
        beneficiaryPhone: "01710000003",
        amount: 3500,
        paymentGateway: "Stripe",
        gatewayReference: "pi_pending_demo_003",
        status: TRANSACTION_STATUS.PENDING,
        initiatedBy: finance._id
      }
    ];

    for (const txn of demoTransactions) {
      await Transaction.findOneAndUpdate(
        { scheme: txn.scheme, beneficiaryName: txn.beneficiaryName, amount: txn.amount },
        txn,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const allTxns = await Transaction.find({ scheme: scheme._id }).sort({ createdAt: -1 }).lean();
    console.log("✅ Demo transactions ready for testing:");
    console.log(JSON.stringify(allTxns, null, 2));

    console.log("\nLogin credentials:");
    console.log("Admin: mahima@schemeconnect.com / Mahima@123");
    console.log("Finance Officer: nafisa@schemeconnect.com / Nafisa@123");
  } catch (error) {
    console.error("❌ Seed failed:");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
