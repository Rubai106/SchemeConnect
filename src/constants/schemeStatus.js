// Easy to modify: scheme statuses
// Shared across all features (Scheme Configuration Studio + Welfare Opportunity Explorer)
//
// Citizen-facing meaning:
//   Active  = currently available
//   Draft   = not visible to citizens
//   Paused  = not currently available
//   Closed  = closed
const SCHEME_STATUS = {
    DRAFT: "Draft",
    ACTIVE: "Active",
    PAUSED: "Paused",
    CLOSED: "Closed"
};

module.exports = SCHEME_STATUS;
