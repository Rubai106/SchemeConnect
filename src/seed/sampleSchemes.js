// ============================================================
// SAMPLE / DEMO DATA — not real government information
// ============================================================

const sampleSchemes = [
    {
        name: "Farmer Subsidy Programme",
        category: "Agriculture",
        description: "Financial assistance for small and marginal farmers to support crop production and reduce input costs. This DEMO scheme provides seasonal subsidies for seeds, fertilizers, and irrigation.",
        eligibilityCriteria: {
            minimumIncome: null,
            maximumIncome: 25000,
            district: "",
            disabilityRequired: false,
            minimumFamilySize: null
        },
        applicationDeadline: new Date("2027-06-30"),
        requiredDocuments: ["National ID", "Land Ownership Certificate", "Income Certificate"],
        benefitAmount: 15000,
        applicationStatus: "Open"
    },
    {
        name: "Primary Education Stipend",
        category: "Education",
        description: "Monthly stipend for families with children enrolled in primary education to encourage school attendance and reduce dropout rates. DEMO programme for development purposes.",
        eligibilityCriteria: {
            minimumIncome: null,
            maximumIncome: 20000,
            district: "",
            disabilityRequired: false,
            minimumFamilySize: 2
        },
        applicationDeadline: new Date("2027-03-31"),
        requiredDocuments: ["National ID", "Birth Certificate", "Educational Record"],
        benefitAmount: 2000,
        applicationStatus: "Open"
    },
    {
        name: "Maternal Health Support",
        category: "Healthcare",
        description: "Cash assistance and free prenatal/postnatal healthcare services for expectant mothers from low-income households. DEMO data for illustration only.",
        eligibilityCriteria: {
            minimumIncome: null,
            maximumIncome: 15000,
            district: "",
            disabilityRequired: false,
            minimumFamilySize: null
        },
        applicationDeadline: new Date("2027-12-31"),
        requiredDocuments: ["National ID", "Income Certificate", "Birth Certificate"],
        benefitAmount: 10000,
        applicationStatus: "Open"
    },
    {
        name: "Disability Allowance",
        category: "Disability",
        description: "Monthly financial allowance for persons with recognized disabilities to support daily living expenses and access to assistive devices. DEMO programme sample.",
        eligibilityCriteria: {
            minimumIncome: null,
            maximumIncome: 30000,
            district: "",
            disabilityRequired: true,
            minimumFamilySize: null
        },
        applicationDeadline: new Date("2027-09-30"),
        requiredDocuments: ["National ID", "Disability Certificate", "Income Certificate"],
        benefitAmount: 5000,
        applicationStatus: "Open"
    },
    {
        name: "Women Entrepreneur Grant",
        category: "Women",
        description: "One-time grant to support women-led small businesses and micro-enterprises. Covers startup costs, equipment purchase, and initial working capital. DEMO data only.",
        eligibilityCriteria: {
            minimumIncome: null,
            maximumIncome: 35000,
            district: "",
            disabilityRequired: false,
            minimumFamilySize: null
        },
        applicationDeadline: new Date("2027-08-15"),
        requiredDocuments: ["National ID", "Income Certificate", "Business Registration"],
        benefitAmount: 50000,
        applicationStatus: "Open"
    },
    {
        name: "SME Development Loan",
        category: "SME",
        description: "Low-interest loans for small and medium enterprises to expand operations, adopt technology, or enter new markets. DEMO programme for illustration purposes.",
        eligibilityCriteria: {
            minimumIncome: 10000,
            maximumIncome: 100000,
            district: "",
            disabilityRequired: false,
            minimumFamilySize: null
        },
        applicationDeadline: new Date("2027-05-31"),
        requiredDocuments: ["National ID", "Income Certificate", "Business Registration", "Tax Certificate"],
        benefitAmount: 200000,
        applicationStatus: "Open"
    },
    {
        name: "Rural Housing Assistance",
        category: "Housing",
        description: "Financial support for construction or repair of houses in rural areas for families below the poverty line. DEMO sample data — not a real government programme.",
        eligibilityCriteria: {
            minimumIncome: null,
            maximumIncome: 12000,
            district: "Gazipur",
            disabilityRequired: false,
            minimumFamilySize: 3
        },
        applicationDeadline: new Date("2026-12-31"),
        requiredDocuments: ["National ID", "Income Certificate", "Land Ownership Certificate"],
        benefitAmount: 80000,
        applicationStatus: "Open"
    },
    {
        name: "Secondary School Scholarship",
        category: "Education",
        description: "Merit and need-based scholarship for students in secondary education. Covers tuition, books, and examination fees. DEMO data — sample scheme only.",
        eligibilityCriteria: {
            minimumIncome: null,
            maximumIncome: 18000,
            district: "",
            disabilityRequired: false,
            minimumFamilySize: null
        },
        applicationDeadline: new Date("2026-09-15"),
        requiredDocuments: ["National ID", "Birth Certificate", "Educational Record", "Income Certificate"],
        benefitAmount: 8000,
        applicationStatus: "Closed"
    }
];

module.exports = sampleSchemes;
