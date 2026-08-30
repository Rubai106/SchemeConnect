const mongoose = require("mongoose");
const TRANSACTION_STATUS = require("../constants/transactionStatus");

const transactionSchema = new mongoose.Schema(
{
    scheme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scheme",
        required: true
    },

    beneficiaryName: {
        type: String,
        required: true,
        trim: true
    },

    beneficiaryPhone: {
        type: String,
        required: true,
        trim: true
    },

    amount: {
        type: Number,
        required: true,
        min: 0
    },

    paymentGateway: {
        type: String,
        default: "Stripe"
    },

    gatewayReference: {
        type: String,
        default: null
    },

    status: {
        type: String,
        enum: Object.values(TRANSACTION_STATUS),
        default: TRANSACTION_STATUS.PENDING
    },

    initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Transaction", transactionSchema);
