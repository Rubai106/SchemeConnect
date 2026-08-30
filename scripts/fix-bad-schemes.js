const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const mongoose = require("mongoose");
const Scheme = require("../src/models/Scheme");

const fixBadSchemes = async () => {
  let deletedCount = 0;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const schemes = Scheme.collection.find({});

    for await (const scheme of schemes) {
      if (typeof scheme.allocatedBudget === "number" && Number.isFinite(scheme.allocatedBudget)) {
        continue;
      }

      console.log(`Deleting scheme: ${scheme.name} (${scheme._id})`);
      await Scheme.collection.deleteOne({ _id: scheme._id });
      deletedCount += 1;
    }

    console.log(`Deleted ${deletedCount} bad scheme(s)`);
  } catch (error) {
    console.error("Failed to fix bad schemes");
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

fixBadSchemes();