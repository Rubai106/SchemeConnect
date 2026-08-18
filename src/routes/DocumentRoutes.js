const express = require("express");
const router = express.Router();

const {
    handleMulterUpload,
    uploadDocument,
    getMyDocuments,
    getDocumentById,
    deleteDocument,
    downloadDocument
} = require("../controllers/DocumentController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All document routes require authentication and Citizen role
router.use(protect);
router.use(authorizeRoles("Citizen"));

router.post("/", handleMulterUpload, uploadDocument);
router.get("/", getMyDocuments);
router.get("/:id", getDocumentById);
router.get("/:id/download", downloadDocument);
router.delete("/:id", deleteDocument);

module.exports = router;
