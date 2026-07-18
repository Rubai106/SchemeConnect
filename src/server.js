const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("SchemeConnect API is running...");
});

const PORT = process.env.PORT || 1234;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});