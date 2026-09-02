require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const Transaction = require('../src/models/Transaction');

dns.setServers(['8.8.8.8', '8.8.4.4']);

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    const result = await Transaction.deleteMany({
      $or: [
        { gatewayReference: /^BK/i },
        { paymentGateway: 'bKash' },
        { gatewayReference: 'budget_exceeded' }
      ]
    });
    console.log(JSON.stringify({ deletedCount: result.deletedCount, acknowledged: result.acknowledged }, null, 2));
  } catch (e) {
    console.error('DELETE_FAILED:', e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
