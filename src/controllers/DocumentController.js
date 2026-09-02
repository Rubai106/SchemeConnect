const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Document = require("../models/Document");
const asyncHandler = require("../utils/asyncHandler");
const createError = require("../utils/appError");
const { sendSuccess } = require("../utils/apiResponse");

// ============================================================
// Easy to modify: upload configuration
// ============================================================

// Easy to modify: allowed file types
const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png"
];

// Easy to modify: allowed file extensions
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

// Easy to modify: max file size in bytes (5 MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Easy to modify: upload directory
const UPLOAD_DIR = path.join(__dirname, "../../uploads/documents");

// Create upload directory if it does not exist
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

// Multer file filter
const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return cb(new Error("File type not allowed. Allowed types: PDF, JPG, JPEG, PNG"), false);
    }

    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        return cb(new Error("File type not allowed. Allowed types: PDF, JPG, JPEG, PNG"), false);
    }

    cb(null, true);
};

// Multer upload instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

// Wrapper to handle Multer errors with proper status codes
const handleMulterUpload = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return next(createError("File too large. Maximum size is 5 MB.", 400));
            }

            return next(createError(err.message, 400));
        }

        next();
    });
};

// ============================================================
// Easy to modify: document types list
// ============================================================
const DOCUMENT_TYPES = Document.DOCUMENT_TYPES || [
    "National ID",
    "Birth Certificate",
    "Income Certificate",
    "Disability Certificate",
    "Educational Record",
    "Other"
];

// ============================================================
// Helper: delete file from disk
// ============================================================
const deleteFileFromDisk = (filePath) => {
    try {
        const fullPath = path.join(__dirname, "../../", filePath);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (error) {
        // Log but do not crash if file deletion fails
        console.error("Could not delete file:", error.message);
    }
};

// ============================================================
// Upload document
// ============================================================
const uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw createError("No file uploaded. Please select a file.", 400);
    }

    const { documentType, documentNumber } = req.body;

    if (!documentType) {
        // Remove uploaded file if validation fails
        deleteFileFromDisk(req.file.path);
        throw createError("Document type is required.", 400);
    }

    if (!DOCUMENT_TYPES.includes(documentType)) {
        deleteFileFromDisk(req.file.path);
        throw createError(
            `Invalid document type. Allowed types: ${DOCUMENT_TYPES.join(", ")}`,
            400
        );
    }

    // Store relative path for portability
    const relativeFilePath = path.relative(
        path.join(__dirname, "../../"),
        req.file.path
    ).replace(/\\/g, "/");

    const document = await Document.create({
        userId: req.user.userId,
        documentType,
        documentNumber: documentNumber ? documentNumber.trim() : "",
        fileName: req.file.originalname,
        filePath: relativeFilePath
    });

    return sendSuccess(res, 201, "Document uploaded successfully", {
        document
    });
});

// ============================================================
// Get all documents for the logged-in citizen
// ============================================================
const getMyDocuments = asyncHandler(async (req, res) => {
    const documents = await Document.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Documents fetched successfully", {
        documents
    });
});

// ============================================================
// Get one document by ID (only if owned by logged-in citizen)
// ============================================================
const getDocumentById = asyncHandler(async (req, res) => {
    const document = await Document.findById(req.params.id);

    if (!document) {
        throw createError("Document not found.", 404);
    }

    if (document.userId.toString() !== req.user.userId.toString()) {
        throw createError("Document not found.", 404);
    }

    return sendSuccess(res, 200, "Document fetched successfully", {
        document
    });
});

// ============================================================
// Delete document (only if owned by logged-in citizen)
// ============================================================
const deleteDocument = asyncHandler(async (req, res) => {
    const document = await Document.findById(req.params.id);

    if (!document) {
        throw createError("Document not found.", 404);
    }

    if (document.userId.toString() !== req.user.userId.toString()) {
        throw createError("Document not found.", 404);
    }

    // Delete file from disk
    deleteFileFromDisk(document.filePath);

    // Delete database record
    await Document.findByIdAndDelete(req.params.id);

    return sendSuccess(res, 200, "Document deleted successfully", null);
});

// ============================================================
// Download/view document file (only if owned by logged-in citizen)
// ============================================================
const downloadDocument = asyncHandler(async (req, res) => {
    const document = await Document.findById(req.params.id);

    if (!document) {
        throw createError("Document not found.", 404);
    }

    if (document.userId.toString() !== req.user.userId.toString()) {
        throw createError("Document not found.", 404);
    }

    const fullPath = path.join(__dirname, "../../", document.filePath);

    if (!fs.existsSync(fullPath)) {
        throw createError("File not found on server.", 404);
    }

    res.sendFile(fullPath);
});

module.exports = {
    handleMulterUpload,
    uploadDocument,
    getMyDocuments,
    getDocumentById,
    deleteDocument,
    downloadDocument,
    DOCUMENT_TYPES,
    ALLOWED_EXTENSIONS,
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE
};
