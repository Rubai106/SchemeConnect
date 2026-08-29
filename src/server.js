const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");
const fraudRoutes = require("./routes/fraudRoutes");
const caseRoutes = require("./routes/caseRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const requestLogger = require("./middleware/requestLogger");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/auth", authRoutes);
app.use("/", fraudRoutes);
app.use("/", caseRoutes);
app.use("/", inspectionRoutes);
app.use("/", dashboardRoutes);

app.get("/", (req, res) => {
    res.send("SchemeConnect API is running...");
});

app.get(["/login", "/register", "/dashboard"], (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 1234;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
