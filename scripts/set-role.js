const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const email = 'nafisa@gmail.com';
const role = 'Finance Officer';

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await User.updateOne(
      { email: email.toLowerCase() },
      { $set: { role } }
    );

    console.log(JSON.stringify({
      email,
      role,
      matched: result.matchedCount,
      modified: result.modifiedCount
    }, null, 2));
  } catch (error) {
    console.error('Role update failed');
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
