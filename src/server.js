const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const citizenRoutes = require("./routes/citizenRoutes");
const documentRoutes = require("./routes/DocumentRoutes");
const eligibilityRoutes = require("./routes/eligibilityRoutes");
const requestLogger = require("./middleware/requestLogger");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(requestLogger);
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/auth", authRoutes);
app.use("/api/citizens", citizenRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/eligibility", eligibilityRoutes);

app.get("/", (req, res) => {
    res.send("SchemeConnect API is running...");
});

app.get(["/login", "/register", "/dashboard", "/eligibility"], (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 1234;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
