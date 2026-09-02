const express = require("express");
const router = express.Router();
const { getCirculars, syncCirculars, deleteCircular } = require("../controllers/circularController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getCirculars);
router.post("/sync", protect, syncCirculars);
router.delete("/:id", protect, deleteCircular);

module.exports = router;
