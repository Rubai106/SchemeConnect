require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('./src/models/Scheme');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function listSchemes() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const schemes = await Scheme.find();

  if (schemes.length === 0) {
    console.log('No schemes found in this database.');
  } else {
    console.log(`Found ${schemes.length} scheme(s):\n`);
    schemes.forEach((s) => {
      console.log(`${s.name}`);
      console.log(`  _id: ${s._id}`);
      console.log(`  category: ${s.category || 'n/a'}`);
      console.log('');
    });
  }

  await mongoose.connection.close();
  process.exit(0);
}

listSchemes().catch((err) => {
  console.error('Failed to list schemes:', err);
  process.exit(1);
});
