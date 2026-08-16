const express = require("express");
const router = express.Router();
const { getCirculars, syncCirculars } = require("../controllers/circularController");

router.get("/", getCirculars);
router.post("/sync", syncCirculars);

module.exports = router;
