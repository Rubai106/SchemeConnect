const Document = require("../models/Document");
const Citizen = require("../models/Citizen");
const User = require("../models/User");

const allowedDocumentFields = [
    "userId",
    "documentType",
    "fileName",
    "verificationStatus"
];

const pickDocumentFields = (body) => {
    const payload = {};

    allowedDocumentFields.forEach((field) => {
        if (body[field] !== undefined) {
            payload[field] = body[field];
        }
    });

    return payload;
};

const userPopulateFields = "fullName nationalId email contactNumber role accountStatus division district";

const resolveDocumentPayload = async (body) => {
    const payload = pickDocumentFields(body);

    if (!payload.userId && body.citizenId) {
        const citizen = await Citizen.findById(body.citizenId);

        if (!citizen) {
            return { error: { status: 404, message: "Citizen not found" } };
        }

        payload.userId = citizen.userId;
    }

    if (payload.userId) {
        const user = await User.findById(payload.userId);

        if (!user) {
            return { error: { status: 404, message: "User not found" } };
        }
    }

    return { payload };
};

// Create Document
const createDocument = async (req, res) => {
    try {
        const { payload, error } = await resolveDocumentPayload(req.body);

        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const document = await Document.create(payload);
        res.status(201).json(document);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get All Documents
const getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.find().populate("userId", userPopulateFields);
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Document by ID
const getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id).populate("userId", userPopulateFields);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        res.status(200).json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Document
const updateDocument = async (req, res) => {
    try {
        const { payload, error } = await resolveDocumentPayload(req.body);

        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const document = await Document.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true, runValidators: true }
        );

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        res.status(200).json(document);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Document
const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findByIdAndDelete(req.params.id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createDocument,
    getAllDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument
};
