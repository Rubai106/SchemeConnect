// backfillSharedData.js
//
// SAFE, NON-DESTRUCTIVE backfill for the shared SchemeConnect database.
//
// What it does:
//   1. For every Beneficiary with schemeId === null, assigns a real Scheme._id
//      (round-robin across existing schemes) so analytics can group by scheme.
//   2. For every Scheme with budgetAllocated === 0 AND budgetUtilized === 0,
//      sets placeholder budget numbers so Budget Utilization isn't all zeros.
//
// What it does NOT do:
//   - It never deletes anything
//   - It never overwrites a beneficiary that already has a real schemeId
//   - It never overwrites a scheme that already has real budget numbers
//
// Run this ONLY after confirming with your team, since it writes to the
// shared database that your teammates are also using.
//
// Usage: node backfillSharedData.js

require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('./src/models/Scheme');
const Beneficiary = require('./src/models/Beneficiary');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function backfill() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to shared database.');

  const schemes = await Scheme.find();
  if (schemes.length === 0) {
    console.log('No schemes found — nothing to link. Exiting.');
    return process.exit(0);
  }

  // 1. Link unlinked beneficiaries to real schemes, round-robin
  const unlinked = await Beneficiary.find({ schemeId: null });
  console.log(`Found ${unlinked.length} beneficiaries with no schemeId.`);

  for (let i = 0; i < unlinked.length; i++) {
    const scheme = schemes[i % schemes.length];
    unlinked[i].schemeId = scheme._id;
    await unlinked[i].save();
  }
  console.log(`Linked ${unlinked.length} beneficiaries to real schemes.`);

  // 2. Set placeholder budget numbers only where both are currently 0
  const zeroBudgetSchemes = await Scheme.find({ budgetAllocated: 0, budgetUtilized: 0 });
  console.log(`Found ${zeroBudgetSchemes.length} schemes with no budget set.`);

  for (const scheme of zeroBudgetSchemes) {
    scheme.budgetAllocated = 5000000;
    scheme.budgetUtilized = Math.floor(Math.random() * 3000000);
    await scheme.save();
  }
  console.log(`Set placeholder budgets on ${zeroBudgetSchemes.length} schemes.`);

  console.log('Backfill complete. Nothing was deleted or overwritten beyond null/zero fields.');
  await mongoose.connection.close();
  process.exit(0);
}

backfill().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});