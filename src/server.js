const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const fraudRoutes = require("./routes/fraudRoutes");
const caseRoutes = require("./routes/caseRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", fraudRoutes);
app.use("/", caseRoutes);
app.use("/", inspectionRoutes);
app.use("/", dashboardRoutes);

app.get("/", (req, res) => {
    res.send("SchemeConnect API is running...");
});

const PORT = process.env.PORT || 1234;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});