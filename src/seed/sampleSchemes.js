// ============================================================
// SAMPLE / DEMO DATA — not real government information
// Uses shared constants from src/constants/
// ============================================================

const SCHEME_CATEGORY = require("../constants/schemeCategory");
const SCHEME_STATUS = require("../constants/schemeStatus");

const sampleSchemes = [
    {
        name: "Farmer Subsidy Programme",
        category: SCHEME_CATEGORY.AGRICULTURE,
        description: "Financial assistance for small and marginal farmers to support crop production and reduce input costs. This DEMO scheme provides seasonal subsidies for seeds, fertilizers, and irrigation.",
        eligibilityCriteria: "Small and marginal farmers with a monthly income up to ৳25,000.",
        eligibilityDetails: {
            maxIncome: 25000,
            occupationTypes: ["Farmer"]
        },
        benefitAmount: 15000,
        applicationDeadline: new Date("2027-06-30"),
        requiredDocuments: ["National ID", "Land Ownership Certificate", "Income Certificate"],
        status: SCHEME_STATUS.ACTIVE,
        allocatedBudget: 5000000,
        lowBudgetThresholdPercent: 15
    },
    {
        name: "Primary Education Stipend",
        category: SCHEME_CATEGORY.EDUCATION,
        description: "Monthly stipend for families with children enrolled in primary education to encourage school attendance and reduce dropout rates. DEMO programme for development purposes.",
        eligibilityCriteria: "Families with a monthly income up to ৳20,000 and at least 2 members.",
        eligibilityDetails: {
            maxIncome: 20000,
            minimumFamilySize: 2
        },
        benefitAmount: 2000,
        applicationDeadline: new Date("2027-03-31"),
        requiredDocuments: ["National ID", "Birth Certificate", "Educational Record"],
        status: SCHEME_STATUS.ACTIVE,
        allocatedBudget: 3000000,
        lowBudgetThresholdPercent: 10
    },
    {
        name: "Maternal Health Support",
        category: SCHEME_CATEGORY.HEALTHCARE,
        description: "Cash assistance and free prenatal/postnatal healthcare services for expectant mothers from low-income households. DEMO data for illustration only.",
        eligibilityCriteria: "Expectant mothers from households earning up to ৳15,000 per month.",
        eligibilityDetails: {
            maxIncome: 15000
        },
        benefitAmount: 10000,
        applicationDeadline: new Date("2027-12-31"),
        requiredDocuments: ["National ID", "Income Certificate", "Birth Certificate"],
        status: SCHEME_STATUS.ACTIVE,
        allocatedBudget: 4000000,
        lowBudgetThresholdPercent: 15
    },
    {
        name: "Disability Allowance",
        category: SCHEME_CATEGORY.DISABILITY,
        description: "Monthly financial allowance for persons with recognized disabilities to support daily living expenses and access to assistive devices. DEMO programme sample.",
        eligibilityCriteria: "Persons with a recognized disability earning up to ৳30,000 per month.",
        eligibilityDetails: {
            maxIncome: 30000,
            disabilityRequired: true
        },
        benefitAmount: 5000,
        applicationDeadline: new Date("2027-09-30"),
        requiredDocuments: ["National ID", "Disability Certificate", "Income Certificate"],
        status: SCHEME_STATUS.ACTIVE,
        allocatedBudget: 2000000,
        lowBudgetThresholdPercent: 15
    },
    {
        name: "Women Entrepreneur Grant",
        category: SCHEME_CATEGORY.WOMEN,
        description: "One-time grant to support women-led small businesses and micro-enterprises. Covers startup costs, equipment purchase, and initial working capital. DEMO data only.",
        eligibilityCriteria: "Women-led micro and small enterprises earning up to ৳35,000 per month.",
        eligibilityDetails: {
            maxIncome: 35000
        },
        benefitAmount: 50000,
        applicationDeadline: new Date("2027-08-15"),
        requiredDocuments: ["National ID", "Income Certificate", "Business Registration"],
        status: SCHEME_STATUS.ACTIVE,
        allocatedBudget: 8000000,
        lowBudgetThresholdPercent: 10
    },
    {
        name: "SME Development Loan",
        category: SCHEME_CATEGORY.SME,
        description: "Low-interest loans for small and medium enterprises to expand operations, adopt technology, or enter new markets. DEMO programme for illustration purposes.",
        eligibilityCriteria: "Small and medium enterprises earning between ৳10,000 and ৳100,000 per month.",
        eligibilityDetails: {
            minIncome: 10000,
            maxIncome: 100000
        },
        benefitAmount: 200000,
        applicationDeadline: new Date("2027-05-31"),
        requiredDocuments: ["National ID", "Income Certificate", "Business Registration", "Tax Certificate"],
        status: SCHEME_STATUS.ACTIVE,
        allocatedBudget: 10000000,
        lowBudgetThresholdPercent: 20
    },
    {
        name: "Rural Housing Assistance",
        category: SCHEME_CATEGORY.HOUSING,
        description: "Financial support for construction or repair of houses in rural areas for families below the poverty line. DEMO sample data — not a real government programme.",
        eligibilityCriteria: "Rural families in Gazipur with at least 3 members earning up to ৳12,000.",
        eligibilityDetails: {
            maxIncome: 12000,
            district: "Gazipur",
            minimumFamilySize: 3
        },
        benefitAmount: 80000,
        applicationDeadline: new Date("2026-12-31"),
        requiredDocuments: ["National ID", "Income Certificate", "Land Ownership Certificate"],
        status: SCHEME_STATUS.PAUSED,
        allocatedBudget: 6000000,
        lowBudgetThresholdPercent: 15
    },
    {
        name: "Secondary School Scholarship",
        category: SCHEME_CATEGORY.EDUCATION,
        description: "Merit and need-based scholarship for students in secondary education. Covers tuition, books, and examination fees. DEMO data — sample scheme only.",
        eligibilityCriteria: "Secondary students from families earning up to ৳18,000 per month.",
        eligibilityDetails: {
            maxIncome: 18000,
            minEducation: "Secondary"
        },
        benefitAmount: 8000,
        applicationDeadline: new Date("2026-09-15"),
        requiredDocuments: ["National ID", "Birth Certificate", "Educational Record", "Income Certificate"],
        status: SCHEME_STATUS.CLOSED,
        allocatedBudget: 1500000,
        lowBudgetThresholdPercent: 10
    }
];

module.exports = sampleSchemes;
