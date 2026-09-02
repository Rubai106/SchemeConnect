require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");

// Fariha's existing routes
const citizenRoutes = require("./routes/citizenRoutes");
const documentRoutes = require("./routes/DocumentRoutes");
const eligibilityRoutes = require("./routes/eligibilityRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const beneficiaryRoutes = require("./routes/beneficiaryRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const circularRoutes = require("./routes/circularRoutes");

// Mahima's features
const schemeRoutes = require("./routes/schemeRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

// Nafisaa's features
const fraudRoutes = require("./routes/Fraudroutes");
const caseRoutes = require("./routes/caseRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Member 1 features
const officeRoutes = require("./routes/officeRoutes");

const requestLogger = require("./middleware/requestLogger");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static(path.join(__dirname, "../public")));

// Serve uploaded document files for the Document Vault.
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Authentication
app.use("/api/auth", authRoutes);

// Fariha's existing API routes
app.use("/api/citizens", citizenRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/eligibility", eligibilityRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/beneficiaries", beneficiaryRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/circulars", circularRoutes);

// Nafisaa's features
app.use("/", fraudRoutes);
app.use("/", caseRoutes);
app.use("/", inspectionRoutes);
app.use("/", dashboardRoutes);

// Mahima's features
app.use("/api/schemes", schemeRoutes);
app.use("/api/transactions", transactionRoutes);

// Member 1 Nearby Welfare Office Navigator
app.use("/api/offices", officeRoutes);

app.get("/api/config", (req, res) => {
    res.json({
        success: true,
        data: {
            stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null
        }
    });
});

app.get("/", (req, res) => {
    res.send("SchemeConnect API is running...");
});

// Expose non-secret frontend configuration.
app.get("/api/config/maps-key", (req, res) => {
    res.json({ key: process.env.GOOGLE_MAPS_API_KEY || "" });
});

// Frontend routes from all branches.
app.get(
    [
        "/login",
        "/register",
        "/dashboard",
        "/eligibility",
        "/documents",
        "/schemes",
        "/schemes/:id",
        "/offices",
        "/console",
        "/console/beneficiaries",
        "/console/analytics",
        "/console/audit-log",
        "/console/circulars",
        "/scheme-studio",
        "/staff",
        "/finance"
    ],
    (req, res) => {
        res.sendFile(path.join(__dirname, "../public/index.html"));
    }
);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 1234;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
