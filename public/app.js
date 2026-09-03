const app = document.getElementById("app");
const TOKEN_KEY = "schemeconnectToken";

const loadStripeConfig = async () => {
    if (window.__SCHEMECONNECT_STRIPE_PUBLISHABLE_KEY) {
        return window.__SCHEMECONNECT_STRIPE_PUBLISHABLE_KEY;
    }

    try {
        const result = await apiRequest("/api/config");
        window.__SCHEMECONNECT_STRIPE_PUBLISHABLE_KEY =
            result.data.stripePublishableKey;
        return result.data.stripePublishableKey;
    } catch (error) {
        return null;
    }
};

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const routes = {
    login: "/login",
    register: "/register",
    dashboard: "/dashboard",

    // Fariha's routes
    eligibility: "/eligibility",
    console: "/console",
    consoleBeneficiaries: "/console/beneficiaries",
    consoleAnalytics: "/console/analytics",
    consoleAuditLog: "/console/audit-log",
    consoleCirculars: "/console/circulars",

    // Main branch routes
    schemeStudio: "/scheme-studio",
    staff: "/staff",
    finance: "/finance",

    // Member 1 citizen routes
    documents: "/documents",
    schemes: "/schemes",
    offices: "/offices"
};

let currentUser = null;

const roleDisplayLabel = (role) =>
    role === "Administrator" ? "Govt. Administrator" : role;

const apiRequest = async (url, options = {}) => {
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {})
    };

    const token = getToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    let result;

    try {
        result = await response.json();
    } catch (error) {
        throw new Error("Server returned an invalid response.");
    }

    if (!response.ok) {
        const error = new Error(
            result.message || "Something went wrong."
        );

        error.status = response.status;
        error.result = result;

        throw error;
    }

    return result;
};

const navigate = (path) => {
    window.history.pushState({}, "", path);
    render();
};

const setPage = (content, activePage = "") => {
    const isAuthPage =
        activePage === "login" || activePage === "register";

    const isConsolePage = activePage.startsWith("console");

    app.innerHTML = `
        <header class="topbar">
            <div class="topbar-inner">
                <div class="brand">
                    <span class="brand-mark"></span>
                    <div>
                        SchemeConnect
                        <small>
                            ${
                                isConsolePage
                                    ? "Govt. Administrator Console"
                                    : "Citizen Welfare Portal"
                            }
                        </small>
                    </div>
                </div>

                ${
                    isAuthPage
                        ? `
                            <nav class="nav auth-nav" aria-label="Authentication navigation">
                                <a href="/login" data-link class="${
                                    activePage === "login" ? "active" : ""
                                }">Login</a>

                                <a href="/register" data-link class="${
                                    activePage === "register" ? "active" : ""
                                }">Register</a>
                            </nav>
                        `
                        : isConsolePage
                        ? `
                            <nav class="nav" aria-label="Administrator navigation">
                                <a href="/console/beneficiaries"
                                   data-link
                                   class="${
                                       activePage === "consoleBeneficiaries"
                                           ? "active"
                                           : ""
                                   }">
                                    Beneficiary Records
                                </a>

                                <a href="/console/analytics"
                                   data-link
                                   class="${
                                       activePage === "consoleAnalytics"
                                           ? "active"
                                           : ""
                                   }">
                                    Performance Intelligence
                                </a>

                                <a href="/console/audit-log"
                                   data-link
                                   class="${
                                       activePage === "consoleAuditLog"
                                           ? "active"
                                           : ""
                                   }">
                                    Audit Log
                                </a>

                                <a href="/console/circulars"
                                   data-link
                                   class="${
                                       activePage === "consoleCirculars"
                                           ? "active"
                                           : ""
                                   }">
                                    Circulars
                                </a>
                            </nav>

                            <div class="user-area">
                                ${
                                    currentUser
                                        ? `
                                            <span>
                                                ${currentUser.fullName}
                                                (${roleDisplayLabel(
                                                    currentUser.role
                                                )})
                                            </span>

                                            <button
                                                class="logout-link"
                                                id="logoutButton"
                                                type="button">
                                                Logout
                                            </button>
                                        `
                                        : ""
                                }
                            </div>
                        `
                        : `
                            <nav class="nav" aria-label="Primary navigation">
                                <a href="/dashboard"
                                   data-link
                                   class="${
                                       activePage === "dashboard"
                                           ? "active"
                                           : ""
                                   }">
                                    Home
                                </a>

                                <a href="/eligibility"
                                   data-link
                                   class="${
                                       activePage === "eligibility"
                                           ? "active"
                                           : ""
                                   }">
                                    Eligibility
                                </a>

                                ${
                                    currentUser
                                        ? `
                                            ${
                                                currentUser.role ===
                                                "Administrator"
                                                    ? `
                                                        <a href="/staff"
                                                           data-link
                                                           class="${
                                                               activePage ===
                                                               "staff"
                                                                   ? "active"
                                                                   : ""
                                                           }">
                                                            Staff Management
                                                        </a>
                                                    `
                                                    : ""
                                            }

                                            ${
                                                schemeStudioRoles.includes(
                                                    currentUser.role
                                                )
                                                    ? `
                                            <a href="/finance"
                                               data-link
                                               class="${
                                                   activePage === "finance"
                                                       ? "active"
                                                       : ""
                                               }">
                                                Finance Dashboard
                                            </a>

                                            <a href="/scheme-studio"
                                               data-link
                                               class="${
                                                   activePage ===
                                                   "scheme-studio"
                                                       ? "active"
                                                       : ""
                                               }">
                                                Scheme Studio
                                            </a>
                                                    `
                                                    : ""
                                            }
                                        `
                                        : ""
                                }

                                <a href="/documents"
                                   data-link
                                   class="${
                                       activePage === "documents"
                                           ? "active"
                                           : ""
                                   }">
                                    Documents
                                </a>

                                <a href="/schemes"
                                   data-link
                                   class="${
                                       activePage === "schemes"
                                           ? "active"
                                           : ""
                                   }">
                                    Schemes
                                </a>

                                <a href="/offices"
                                   data-link
                                   class="${
                                       activePage === "offices"
                                           ? "active"
                                           : ""
                                   }">
                                    Offices
                                </a>
                            </nav>

                            <div class="user-area">
                                ${
                                    currentUser
                                        ? `
                                            <span>
                                                ${currentUser.fullName}
                                                -
                                                ${roleDisplayLabel(
                                                    currentUser.role
                                                )}
                                            </span>

                                            <button
                                                class="logout-link"
                                                id="logoutButton"
                                                type="button">
                                                Logout
                                            </button>
                                        `
                                        : ""
                                }
                            </div>
                        `
                }
            </div>
        </header>

        <main class="page">
            ${content}
        </main>
    `;

    document.querySelectorAll("[data-link]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            navigate(link.getAttribute("href"));
        });
    });

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }
};

const showMessage = (message, type = "error") => {
    const messageBox = document.getElementById("messageBox");

    if (!messageBox) {
        return;
    }

    messageBox.className = `message ${type}`;
    messageBox.textContent = message;
    messageBox.hidden = false;
};

const loadCurrentUser = async () => {
    if (!getToken()) {
        currentUser = null;
        return null;
    }

    try {
        const result = await apiRequest("/api/auth/me");
        currentUser = result.data.user;
        return currentUser;
    } catch (error) {
        clearToken();
        currentUser = null;
        return null;
    }
};
const requireAuth = async (
    allowedRoles = [
        "Citizen",
        "Administrator",
        "Finance Officer",
        "Verification Officer",
        "Auditor"
    ]
) => {
    const user = await loadCurrentUser();

    if (!user) {
        navigate(routes.login);
        return false;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        navigate(routes.dashboard);
        return false;
    }

    return true;
};

const requireRole = async (allowedRoles) => {
    const user = await loadCurrentUser();

    if (!user || !allowedRoles.includes(user.role)) {
        navigate(routes.login);
        return false;
    }

    return true;
};

const renderLogin = () => {
    currentUser = null;

    setPage(
        `
        <section class="page-title">
            <h1>Login</h1>
            <p>Access your SchemeConnect account.</p>
        </section>

        <section class="card auth-card">
            <form id="loginForm">
                <div id="messageBox" class="message error" hidden></div>

                <div class="form-row">
                    <label for="email">Email</label>
                    <input id="email" name="email" type="email" autocomplete="email" required>
                </div>

                <div class="form-row">
                    <label for="password">Password</label>
                    <input id="password" name="password" type="password" autocomplete="current-password" required>
                </div>

                <div class="auth-actions">
                    <a href="/register" data-link class="auth-link">Create an account</a>
                    <button class="button primary" type="submit">Login</button>
                </div>
            </form>
        </section>
        `,
        "login"
    );

    document.getElementById("loginForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.target;
        const button = form.querySelector("button");

        button.disabled = true;
        button.textContent = "Logging in...";

        try {
            const result = await apiRequest("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: form.email.value.trim(),
                    password: form.password.value
                })
            });

            setToken(result.data.token);
            currentUser = result.data.user;

            // Citizens go to the citizen dashboard.
            // Staff/admin users go to the appropriate management area.
            if (currentUser.role === "Citizen") {
                navigate(routes.dashboard);
            } else if (currentUser.role === "Administrator") {
                navigate(routes.consoleBeneficiaries);
            } else if (currentUser.role === "Finance Officer") {
                navigate(routes.finance);
            } else if (currentUser.role === "Verification Officer") {
                navigate(routes.dashboard);
            } else if (currentUser.role === "Auditor") {
                navigate(routes.consoleAuditLog);
            } else {
                navigate(routes.dashboard);
            }
        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
            button.textContent = "Login";
        }
    });
};

const renderRegister = () => {
    currentUser = null;

    setPage(
        `
        <section class="page-title">
            <h1>Create Account</h1>
            <p>Register as a citizen to use SchemeConnect services.</p>
        </section>

        <section class="card register-card">
            <form id="registerForm">
                <div id="messageBox" class="message error" hidden></div>

                <div class="form-grid">
                    <div class="form-row">
                        <label for="fullName">Full Name</label>
                        <input id="fullName" name="fullName" required>
                    </div>

                    <div class="form-row">
                        <label for="nationalId">National ID</label>
                        <input id="nationalId" name="nationalId" required>
                    </div>

                    <div class="form-row">
                        <label for="email">Email</label>
                        <input id="email" name="email" type="email" required>
                    </div>

                    <div class="form-row">
                        <label for="contactNumber">Contact Number</label>
                        <input id="contactNumber" name="contactNumber" required>
                    </div>

                    <div class="form-row">
                        <label for="password">Password</label>
                        <input id="password" name="password" type="password" required>
                    </div>

                    <div class="form-row">
                        <label for="division">Division</label>
                        <input id="division" name="division" required>
                    </div>

                    <div class="form-row">
                        <label for="district">District</label>
                        <input id="district" name="district" required>
                    </div>
                </div>

                <div class="auth-actions">
                    <a href="/login" data-link class="auth-link">Already registered?</a>
                    <button class="button primary" type="submit">Register</button>
                </div>
            </form>
        </section>
        `,
        "register"
    );
    document.getElementById("registerForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.target;
        const button = form.querySelector("button");

        button.disabled = true;
        button.textContent = "Registering...";

        try {
            await apiRequest("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    fullName: form.fullName.value.trim(),
                    nationalId: form.nationalId.value.trim(),
                    email: form.email.value.trim(),
                    contactNumber: form.contactNumber.value.trim(),
                    password: form.password.value,
                    division: form.division.value.trim(),
                    district: form.district.value.trim()
                })
            });

            showMessage("Registration successful. Please login.", "success");
            setTimeout(() => navigate(routes.login), 900);
        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
            button.textContent = "Register";
        }
    });
};
const renderDashboard = async () => {
    if (!(await requireAuth())) {
        return;
    }

    const isCitizen = currentUser.role === "Citizen";

    const dashboardTitle =
        currentUser.role === "Administrator"
            ? "Admin Dashboard"
            : currentUser.role === "Finance Officer"
            ? "Finance Dashboard"
            : currentUser.role === "Verification Officer"
            ? "Verification Dashboard"
            : currentUser.role === "Auditor"
            ? "Auditor Dashboard"
            : "Citizen Dashboard";

    const servicesMessage =
        currentUser.role === "Administrator"
            ? "Staff management, scheme control, and oversight are available."
            : currentUser.role === "Finance Officer"
            ? "Financial disbursement and budget monitoring are available."
            : currentUser.role === "Verification Officer"
            ? "Beneficiary verification and related services are available."
            : currentUser.role === "Auditor"
            ? "Audit logs, analytics, and oversight tools are available."
            : "Your citizen services and welfare eligibility tools are available.";

    setPage(
        `
        <section class="page-title">
            <h1>${dashboardTitle}</h1>
            <p>Welcome, ${currentUser.fullName}. Manage your SchemeConnect account.</p>
        </section>

        <section class="dashboard-grid">
            <div class="card summary-card">
                <h2>Account Information</h2>
                <p>${currentUser.email}</p>
                <p>${roleDisplayLabel(currentUser.role)}</p>
                <p>${currentUser.division}, ${currentUser.district}</p>
            </div>

            ${
                isCitizen
                    ? `
                        <div class="card summary-card">
                            <h2>Eligibility Profile</h2>
                            <p>
                                Create or update your household and income
                                information for welfare eligibility checks.
                            </p>
                            <button
                                class="button primary"
                                id="openEligibility"
                                type="button">
                                Open Eligibility
                            </button>
                        </div>

                        <div class="card summary-card">
                            <h2>Document Vault</h2>
                            <p>
                                Upload and manage National ID, certificates,
                                and other welfare documents.
                            </p>
                            <button
                                class="button primary"
                                id="openDocuments"
                                type="button">
                                Open Documents
                            </button>
                        </div>

                        <div class="card summary-card">
                            <h2>Welfare Opportunities</h2>
                            <p>
                                Browse available schemes and see personalized
                                recommendations from your profile.
                            </p>
                            <button
                                class="button primary"
                                id="openSchemes"
                                type="button">
                                Open Schemes
                            </button>
                        </div>

                        <div class="card summary-card">
                            <h2>Nearby Offices</h2>
                            <p>
                                Find nearby welfare offices and service centers
                                with map directions.
                            </p>
                            <button
                                class="button primary"
                                id="openOffices"
                                type="button">
                                Open Offices
                            </button>
                        </div>
                    `
                    : ""
            }

            <div class="card summary-card">
                <h2>Available Services</h2>
                <p>${servicesMessage}</p>
            </div>
        </section>
        `,
        "dashboard"
    );

    const openEligibility = document.getElementById("openEligibility");

    if (openEligibility) {
        openEligibility.addEventListener("click", () => {
            navigate(routes.eligibility);
        });
    }

    const openDocuments = document.getElementById("openDocuments");

    if (openDocuments) {
        openDocuments.addEventListener("click", () => {
            navigate(routes.documents);
        });
    }

    const openSchemes = document.getElementById("openSchemes");

    if (openSchemes) {
        openSchemes.addEventListener("click", () => {
            navigate(routes.schemes);
        });
    }

    const openOffices = document.getElementById("openOffices");

    if (openOffices) {
        openOffices.addEventListener("click", () => {
            navigate(routes.offices);
        });
    }
};

const profileTemplate = (profile) => `
    <div class="profile-list">
        <div class="profile-item">
            <span>Occupation</span>
            <strong>${profile.occupation}</strong>
        </div>
        <div class="profile-item">
            <span>Monthly Income</span>
            <strong>${profile.monthlyIncome}</strong>
        </div>
        <div class="profile-item">
            <span>Family Size</span>
            <strong>${profile.familySize}</strong>
        </div>
        <div class="profile-item">
            <span>Disability Status</span>
            <strong>${profile.disabilityStatus ? "Yes" : "No"}</strong>
        </div>
        <div class="profile-item">
            <span>Education Level</span>
            <strong>${profile.educationLevel}</strong>
        </div>
        <div class="profile-item">
            <span>Marital Status</span>
            <strong>${profile.maritalStatus}</strong>
        </div>
        <div class="profile-item">
            <span>Division</span>
            <strong>${profile.division}</strong>
        </div>
        <div class="profile-item">
            <span>District</span>
            <strong>${profile.district}</strong>
        </div>
    </div>
`;

const formTemplate = (profile = {}) => `
    <form id="profileForm">
        <div id="messageBox" class="message error" hidden></div>

        <div class="form-grid">
            <div class="form-row">
                <label for="occupation">Occupation</label>
                <input id="occupation" name="occupation" value="${profile.occupation || ""}" required>
            </div>

            <div class="form-row">
                <label for="monthlyIncome">Monthly Income</label>
                <input id="monthlyIncome" name="monthlyIncome" type="number" min="0" value="${profile.monthlyIncome ?? ""}" required>
            </div>

            <div class="form-row">
                <label for="familySize">Family Size</label>
                <input id="familySize" name="familySize" type="number" min="1" value="${profile.familySize ?? ""}" required>
            </div>

            <div class="form-row">
                <label for="educationLevel">Education Level</label>
                <input id="educationLevel" name="educationLevel" value="${profile.educationLevel || ""}" required>
            </div>

            <div class="form-row">
                <label for="maritalStatus">Marital Status</label>
                <select id="maritalStatus" name="maritalStatus" required>
                    <option value="">Select status</option>
                    <option value="Single" ${profile.maritalStatus === "Single" ? "selected" : ""}>Single</option>
                    <option value="Married" ${profile.maritalStatus === "Married" ? "selected" : ""}>Married</option>
                    <option value="Widowed" ${profile.maritalStatus === "Widowed" ? "selected" : ""}>Widowed</option>
                    <option value="Divorced" ${profile.maritalStatus === "Divorced" ? "selected" : ""}>Divorced</option>
                </select>
            </div>

            <div class="form-row">
                <label for="division">Division</label>
                <input id="division" name="division" value="${profile.division || ""}" required>
            </div>

            <div class="form-row">
                <label for="district">District</label>
                <input id="district" name="district" value="${profile.district || ""}" required>
            </div>

            <div class="form-row">
                <label>Disability Status</label>
                <div class="radio-row">
                    <label>
                        <input type="radio" name="disabilityStatus" value="true" ${profile.disabilityStatus ? "checked" : ""}>
                        Yes
                    </label>
                    <label>
                        <input type="radio" name="disabilityStatus" value="false" ${!profile.disabilityStatus ? "checked" : ""}>
                        No
                    </label>
                </div>
            </div>
        </div>

        <div class="actions">
            <button class="button secondary" type="button" id="cancelProfile">Cancel</button>
            <button class="button primary" type="submit">Save Profile</button>
        </div>
    </form>
`;

const getProfilePayload = (form) => ({
    occupation: form.occupation.value.trim(),
    monthlyIncome: Number(form.monthlyIncome.value),
    familySize: Number(form.familySize.value),
    disabilityStatus: form.disabilityStatus.value === "true",
    educationLevel: form.educationLevel.value.trim(),
    maritalStatus: form.maritalStatus.value,
    division: form.division.value.trim(),
    district: form.district.value.trim()
});

const renderStaffManagement = async () => {
    if (!(await requireAuth(["Administrator"]))) {
        return;
    }

    setPage(
        `
        <section class="page-title">
            <h1>Staff Management</h1>
            <p>Create and manage administrator and finance staff accounts.</p>
        </section>

        <section class="studio-grid staff-layout">
            <div class="card">
                <h2>Create Staff Account</h2>
                <div id="staffFormMessage" class="message error" hidden></div>
                <form id="staffForm">
                    <div class="form-row">
                        <label for="staffFullName">Full Name</label>
                        <input id="staffFullName" name="fullName" required>
                    </div>
                    <div class="form-row">
                        <label for="staffEmail">Email</label>
                        <input id="staffEmail" name="email" type="email" required>
                    </div>
                    <div class="form-row">
                        <label for="staffPassword">Password</label>
                        <input id="staffPassword" name="password" type="password" required>
                    </div>
                    <div class="form-row">
                        <label for="staffRole">Role</label>
                        <select id="staffRole" name="role">
                            <option value="Administrator">Administrator</option>
                            <option value="Finance Officer">Finance Officer</option>
                            <option value="Verification Officer">Verification Officer</option>
                            <option value="Auditor">Auditor</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label for="staffDivision">Division</label>
                        <input id="staffDivision" name="division" required>
                    </div>
                    <div class="form-row">
                        <label for="staffDistrict">District</label>
                        <input id="staffDistrict" name="district" required>
                    </div>
                    <div class="actions">
                        <button class="button primary" type="submit">Create Staff</button>
                    </div>
                </form>
            </div>

            <div class="card">
                <h2>Staff Directory</h2>
                <div id="staffList"><p class="empty-note">Loading staff...</p></div>
            </div>
        </section>
        `,
        "staff"
    );

    const renderStaffList = async () => {
        const staffList = document.getElementById("staffList");

        try {
            const result = await apiRequest("/api/auth/staff");
            const users = result.data.users;

            if (!users.length) {
                staffList.innerHTML = `<p class="empty-note">No staff accounts found.</p>`;
                return;
            }

            staffList.innerHTML = `
                <div class="table-scroll">
                    <table class="ledger-table staff-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Division</th>
                                <th>District</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map((user) => `
                                <tr>
                                    <td>${user.fullName}</td>
                                    <td>${user.email}</td>
                                    <td><span class="badge badge-success">${user.role}</span></td>
                                    <td>${user.division}</td>
                                    <td>${user.district}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            staffList.innerHTML = `<p class="empty-note">Unable to load staff.</p>`;
        }
    };

    document.getElementById("staffForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.target;
        const button = form.querySelector("button");
        const messageBox = document.getElementById("staffFormMessage");

        button.disabled = true;
        button.textContent = "Creating...";
        messageBox.hidden = true;

        try {
            await apiRequest("/api/auth/staff", {
                method: "POST",
                body: JSON.stringify({
                    fullName: form.fullName.value.trim(),
                    email: form.email.value.trim(),
                    password: form.password.value,
                    role: form.role.value,
                    division: form.division.value.trim(),
                    district: form.district.value.trim()
                })
            });

            form.reset();
            await renderStaffList();
            messageBox.className = "message success";
            messageBox.textContent = "Staff account created successfully.";
            messageBox.hidden = false;
        } catch (error) {
            messageBox.className = "message error";
            messageBox.textContent = error.message;
            messageBox.hidden = false;
        } finally {
            button.disabled = false;
            button.textContent = "Create Staff";
        }
    });

    await renderStaffList();
};

const renderFinanceDashboard = async () => {
    if (!(await requireAuth(["Finance Officer", "Administrator"]))) {
        return;
    }

    setPage(
        `
        <section class="page-title">
            <h1>Finance Dashboard</h1>
            <p>Track disbursements, budgets, and transaction activity.</p>
        </section>

        <section class="dashboard-grid">
            <div class="card summary-card">
                <h2>Overview</h2>
                <p>Monitoring active welfare schemes and expenditures.</p>
            </div>
            <div class="card summary-card">
                <h2>Access Level</h2>
                <p>${currentUser.role}</p>
            </div>
        </section>

        <section class="card" style="margin-top: 18px;">
            <div class="ledger-header">
                <h2>Finance Ledger</h2>
                <select id="financeStatusFilter">
                    <option value="">All statuses</option>
                    <option value="Successful">Successful</option>
                    <option value="Failed">Failed</option>
                </select>
            </div>
            <table class="ledger-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Scheme</th>
                        <th>Beneficiary</th>
                        <th>Amount</th>
                        <th>Reference</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="financeLedgerBody">
                    <tr><td colspan="6" class="empty-note">Loading ledger...</td></tr>
                </tbody>
            </table>
        </section>
        `,
        "finance"
    );

    const loadFinanceLedger = async (statusFilter = "") => {
        const tableBody = document.getElementById("financeLedgerBody");

        if (!tableBody) {
            return;
        }

        try {
            const query = statusFilter ? `?status=${statusFilter}` : "";
            const result = await apiRequest(`/api/transactions${query}`);
            tableBody.innerHTML = renderLedgerRows(result.data.ledger);
            attachLedgerRowClicks();
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="6" class="empty-note">Unable to load ledger.</td></tr>`;
        }
    };

    document.getElementById("financeStatusFilter").addEventListener("change", (event) => {
        loadFinanceLedger(event.target.value);
    });

    await loadFinanceLedger();
};

const renderEligibility = async () => {
    if (!(await requireAuth(["Citizen"]))) {
        return;
    }

    setPage(
        `
        <section class="page-title">
            <h1>Eligibility Profile</h1>
            <p>Manage your eligibility information.</p>
        </section>

        <section class="card profile-card">
            <p>Loading profile...</p>
        </section>
        `,
        "eligibility"
    );

    try {
        const result = await apiRequest("/api/eligibility/me");
        showProfile(result.data.profile);
    } catch (error) {
        showEmptyProfile();
    }
};

const showProfile = (profile) => {
    document.querySelector(".profile-card").innerHTML = `
        <div class="status-line">
            <span class="status-dot"></span>
            Profile saved
        </div>

        ${profileTemplate(profile)}

        <div class="actions">
            <button class="button danger" id="deleteProfile" type="button">Delete</button>
            <button class="button primary" id="editProfile" type="button">Edit</button>
        </div>
    `;

    document.getElementById("editProfile").addEventListener("click", () => {
        showProfileForm(profile, true);
    });

    document.getElementById("deleteProfile").addEventListener("click", deleteProfile);
};

const showEmptyProfile = () => {
    document.querySelector(".profile-card").innerHTML = `
        <div class="empty-state">
            <h2>Your eligibility profile has not been created yet.</h2>
            <p>Create your profile to keep your welfare information ready.</p>
            <button class="button primary" id="createProfile" type="button">Create Profile</button>
        </div>
    `;

    document.getElementById("createProfile").addEventListener("click", () => {
        showProfileForm();
    });
};

const showProfileForm = (profile = {}, isEdit = false) => {
    document.querySelector(".profile-card").innerHTML = formTemplate(profile);

    document.getElementById("cancelProfile").addEventListener("click", () => {
        if (isEdit) {
            showProfile(profile);
        } else {
            showEmptyProfile();
        }
    });

    document.getElementById("profileForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.target;
        const button = form.querySelector("button[type='submit']");

        button.disabled = true;
        button.textContent = "Saving...";

        try {
            const result = await apiRequest("/api/eligibility", {
                method: isEdit ? "PUT" : "POST",
                body: JSON.stringify(getProfilePayload(form))
            });

            showProfile(result.data.profile);
        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
            button.textContent = "Save Profile";
        }
    });
};

const deleteProfile = async () => {
    const confirmed = window.confirm("Delete your eligibility profile?");

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest("/api/eligibility", {
            method: "DELETE"
        });

        showEmptyProfile();
    } catch (error) {
        window.alert(error.message);
    }
};

const STATUS_LABELS = {
    pending: "Pending",
    under_review: "Under Review",
    verified: "Verified",
    flagged: "Flagged"
};

const timeAgo = (dateString) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 14) return `${days} days ago`;
    return `${Math.floor(days / 7)} week(s) ago`;
};

const renderConsoleBeneficiaries = async () => {
    if (!(await requireRole(["Administrator", "Auditor", "Verification Officer"]))) {
        return;
    }

    setPage(
        `
        <section class="page-title">
            <h1>Beneficiary Records</h1>
            <p>Register, review, and manage beneficiaries across all welfare schemes.</p>
        </section>

        <section class="card">
            <div id="messageBox" class="message error" hidden></div>

            <div class="actions" style="justify-content: space-between; margin-top: 0; margin-bottom: 18px;">
                <input id="beneficiarySearch" placeholder="Search by name or National ID" style="max-width: 280px;">
                <button class="button primary" id="toggleRegisterForm" type="button">+ Register Beneficiary</button>
            </div>

            <div class="modal-backdrop" id="registerModalBackdrop" hidden>
                <div class="modal">
                    <div class="modal-header">
                        <h2>Register Beneficiary</h2>
                        <button class="modal-close" id="closeRegisterModal" type="button" aria-label="Close">&times;</button>
                    </div>
                    <form id="registerBeneficiaryForm" class="form-grid">
                        <div class="form-row">
                            <label for="benName">Full name</label>
                            <input id="benName" name="name" required>
                        </div>
                        <div class="form-row">
                            <label for="benNationalId">National ID</label>
                            <input id="benNationalId" name="nationalId" required>
                        </div>
                        <div class="form-row">
                            <label for="benContact">Contact number</label>
                            <input id="benContact" name="contactNumber">
                        </div>
                        <div class="form-row">
                            <label for="benRegion">Region</label>
                            <input id="benRegion" name="region" required>
                        </div>
                        <div class="form-row">
                            <label for="benScheme">Scheme ID</label>
                            <input id="benScheme" name="schemeId" required>
                        </div>
                        <div class="form-row" style="justify-content: flex-end; flex-direction: row; align-items: flex-end;">
                            <button class="button primary" type="submit">Save Beneficiary</button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="modal-backdrop" id="editModalBackdrop" hidden>
                <div class="modal">
                    <div class="modal-header">
                        <h2>Update Beneficiary</h2>
                        <button class="modal-close" id="closeEditModal" type="button" aria-label="Close">&times;</button>
                    </div>
                    <form id="editBeneficiaryForm" class="form-grid">
                        <input type="hidden" id="editBenId" name="id">
                        <div class="form-row">
                            <label for="editBenName">Full name</label>
                            <input id="editBenName" name="name" required>
                        </div>
                        <div class="form-row">
                            <label for="editBenNationalId">National ID</label>
                            <input id="editBenNationalId" name="nationalId" required>
                        </div>
                        <div class="form-row">
                            <label for="editBenContact">Contact number</label>
                            <input id="editBenContact" name="contactNumber">
                        </div>
                        <div class="form-row">
                            <label for="editBenRegion">Region</label>
                            <input id="editBenRegion" name="region" required>
                        </div>
                        <div class="form-row">
                            <label for="editBenScheme">Scheme ID</label>
                            <input id="editBenScheme" name="schemeId" required>
                        </div>
                        <div class="form-row">
                            <label for="editBenStatus">Status</label>
                            <select id="editBenStatus" name="status" required>
                                <option value="pending">Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="verified">Verified</option>
                                <option value="flagged">Flagged</option>
                            </select>
                        </div>
                        <div class="form-row" style="justify-content: flex-end; flex-direction: row; align-items: flex-end;">
                            <button class="button primary" type="submit">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="table-wrap">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Beneficiary</th>
                            <th>Scheme</th>
                            <th>Status</th>
                            <th>Region</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="beneficiaryRows">
                        <tr><td colspan="6">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </section>
        `,
        "consoleBeneficiaries"
    );

    let allBeneficiaries = [];

    const renderRows = (list) => {
        document.getElementById("beneficiaryRows").innerHTML =
            list
                .map(
                    (b) => `
                        <tr>
                            <td>${b.name}</td>
                            <td>${b.schemeId && b.schemeId.name ? b.schemeId.name : "-"}</td>
                            <td><span class="badge badge-${b.status}">${STATUS_LABELS[b.status] || b.status}</span></td>
                            <td>${b.region}</td>
                            <td>${timeAgo(b.updatedAt)}</td>
                            <td>
                                <button class="button secondary" type="button" data-edit-id="${b._id}" style="padding: 4px 10px; font-size: 12px; margin-right: 6px;">
                                    Edit
                                </button>
                                <button class="button danger" type="button" data-delete-id="${b._id}" style="padding: 4px 10px; font-size: 12px;">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `
                )
                .join("") || `<tr><td colspan="6">No beneficiary records found.</td></tr>`;

        document.querySelectorAll("[data-edit-id]").forEach((button) => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-edit-id");
                const beneficiary = allBeneficiaries.find((b) => b._id === id);

                if (!beneficiary) {
                    return;
                }

                document.getElementById("editBenId").value = beneficiary._id;
                document.getElementById("editBenName").value = beneficiary.name || "";
                document.getElementById("editBenNationalId").value = beneficiary.nationalId || "";
                document.getElementById("editBenContact").value = beneficiary.contactNumber || "";
                document.getElementById("editBenRegion").value = beneficiary.region || "";
                document.getElementById("editBenScheme").value =
                    beneficiary.schemeId && beneficiary.schemeId._id ? beneficiary.schemeId._id : beneficiary.schemeId || "";
                document.getElementById("editBenStatus").value = beneficiary.status || "pending";

                document.getElementById("editModalBackdrop").hidden = false;
            });
        });

        document.querySelectorAll("[data-delete-id]").forEach((button) => {
            button.addEventListener("click", async () => {
                const id = button.getAttribute("data-delete-id");
                const confirmed = window.confirm("Remove this beneficiary record? This cannot be undone.");

                if (!confirmed) {
                    return;
                }

                button.disabled = true;
                button.textContent = "Removing...";

                try {
                    await apiRequest(`/api/beneficiaries/${id}`, { method: "DELETE" });
                    await loadBeneficiaries();
                } catch (error) {
                    showMessage(error.message);
                    button.disabled = false;
                    button.textContent = "Delete";
                }
            });
        });
    };

    const loadBeneficiaries = async () => {
        try {
            const result = await apiRequest("/api/beneficiaries");
            allBeneficiaries = result.data;
            renderRows(allBeneficiaries);
        } catch (error) {
            showMessage(error.message);
        }
    };

    document.getElementById("beneficiarySearch").addEventListener("input", (event) => {
        const q = event.target.value.trim().toLowerCase();
        const filtered = q
            ? allBeneficiaries.filter(
                  (b) => b.name.toLowerCase().includes(q) || b.nationalId.toLowerCase().includes(q)
              )
            : allBeneficiaries;
        renderRows(filtered);
    });

    document.getElementById("toggleRegisterForm").addEventListener("click", () => {
        document.getElementById("registerModalBackdrop").hidden = false;
    });

    document.getElementById("closeRegisterModal").addEventListener("click", () => {
        document.getElementById("registerModalBackdrop").hidden = true;
    });

    document.getElementById("registerModalBackdrop").addEventListener("click", (event) => {
        if (event.target.id === "registerModalBackdrop") {
            event.target.hidden = true;
        }
    });

    document.getElementById("registerBeneficiaryForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.target;
        const button = form.querySelector("button");

        button.disabled = true;
        button.textContent = "Saving...";

        try {
            await apiRequest("/api/beneficiaries", {
                method: "POST",
                body: JSON.stringify({
                    name: form.name.value.trim(),
                    nationalId: form.nationalId.value.trim(),
                    contactNumber: form.contactNumber.value.trim(),
                    region: form.region.value.trim(),
                    schemeId: form.schemeId.value.trim()
                })
            });

            form.reset();
            document.getElementById("registerModalBackdrop").hidden = true;
            document.getElementById("messageBox").hidden = true;
            await loadBeneficiaries();
        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
            button.textContent = "Save Beneficiary";
        }
    });

    document.getElementById("closeEditModal").addEventListener("click", () => {
        document.getElementById("editModalBackdrop").hidden = true;
    });

    document.getElementById("editModalBackdrop").addEventListener("click", (event) => {
        if (event.target.id === "editModalBackdrop") {
            event.target.hidden = true;
        }
    });

    document.getElementById("editBeneficiaryForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.target;
        const button = form.querySelector("button[type='submit']");
        const id = form.id.value;

        button.disabled = true;
        button.textContent = "Saving...";

        try {
            await apiRequest(`/api/beneficiaries/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    name: form.name.value.trim(),
                    nationalId: form.nationalId.value.trim(),
                    contactNumber: form.contactNumber.value.trim(),
                    region: form.region.value.trim(),
                    schemeId: form.schemeId.value.trim(),
                    status: form.status.value
                })
            });

            document.getElementById("editModalBackdrop").hidden = true;
            document.getElementById("messageBox").hidden = true;
            await loadBeneficiaries();
        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
            button.textContent = "Save Changes";
        }
    });

    await loadBeneficiaries();
};

const renderConsoleAnalytics = async () => {
    if (!(await requireRole(["Administrator", "Auditor"]))) {
        return;
    }

    setPage(
        `
        <section class="page-title">
            <h1>Welfare Performance Intelligence</h1>
            <p>Track applications, budgets, and processing performance across schemes.</p>
        </section>

        <section class="card" style="margin-bottom: 18px;">
            <h2>Filter Applications</h2>
            <div class="form-grid">
                <div class="form-row">
                    <label for="filterSchemeId">Scheme ID</label>
                    <input id="filterSchemeId" placeholder="Optional">
                </div>
                <div class="form-row">
                    <label for="filterDistrict">District</label>
                    <input id="filterDistrict" placeholder="Optional">
                </div>
                <div class="form-row">
                    <label for="filterCategory">Category</label>
                    <select id="filterCategory">
                        <option value="">All categories</option>
                        <option value="agriculture">Agriculture</option>
                        <option value="education">Education</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="disability">Disability</option>
                        <option value="women">Women</option>
                        <option value="sme">SME</option>
                        <option value="housing">Housing</option>
                    </select>
                </div>
                <div class="form-row">
                    <label for="filterStartDate">Start date</label>
                    <input id="filterStartDate" type="date">
                </div>
                <div class="form-row">
                    <label for="filterEndDate">End date</label>
                    <input id="filterEndDate" type="date">
                </div>
                <div class="form-row" style="justify-content: flex-end; flex-direction: row; align-items: flex-end;">
                    <button class="button primary" id="applyAnalyticsFilters" type="button">Apply Filters</button>
                </div>
            </div>
        </section>

        <section class="card" id="filteredResultsCard" style="margin-bottom: 18px;" hidden>
            <h2>Filtered Results</h2>
            <div class="dashboard-grid" style="margin-bottom: 18px;">
                <div class="card summary-card"><h2>Total Applications</h2><p id="filteredTotal">-</p></div>
                <div class="card summary-card"><h2>Approval Rate</h2><p id="filteredApproval">-</p></div>
                <div class="card summary-card"><h2>Rejection Rate</h2><p id="filteredRejection">-</p></div>
            </div>
            <div class="table-wrap">
                <table class="table">
                    <thead><tr><th>District</th><th>Applications</th></tr></thead>
                    <tbody id="filteredDistrictRows"><tr><td colspan="2">-</td></tr></tbody>
                </table>
            </div>
        </section>

        <section class="page-title" style="margin-top: 8px;">
            <p style="text-align: left;">Unfiltered totals across the whole platform, for reference:</p>
        </section>

        <section class="dashboard-grid" id="overviewStats">
            <div class="card summary-card"><h2>Total Applications</h2><p id="statTotal">-</p></div>
            <div class="card summary-card"><h2>Approval Rate</h2><p id="statApproval">-</p></div>
            <div class="card summary-card"><h2>Rejection Rate</h2><p id="statRejection">-</p></div>
            <div class="card summary-card"><h2>Avg Processing Time</h2><p id="statProcessing">-</p></div>
        </section>

        <section class="card" style="margin-top: 18px;">
            <h2>Region-wise Beneficiary Distribution</h2>
            <div class="table-wrap">
                <table class="table">
                    <thead><tr><th>Region</th><th>Total Beneficiaries</th></tr></thead>
                    <tbody id="regionRows"><tr><td colspan="2">Loading...</td></tr></tbody>
                </table>
            </div>
        </section>

        <section class="card" style="margin-top: 18px;">
            <h2>Budget Utilization</h2>
            <div class="table-wrap">
                <table class="table">
                    <thead><tr><th>Scheme</th><th>Allocated</th><th>Utilized</th><th>Remaining</th><th>Utilization</th></tr></thead>
                    <tbody id="budgetRows"><tr><td colspan="5">Loading...</td></tr></tbody>
                </table>
            </div>
        </section>

        <section class="card" style="margin-top: 18px;">
            <h2>Scheme Popularity</h2>
            <div class="table-wrap">
                <table class="table">
                    <thead><tr><th>Scheme</th><th>Applications</th></tr></thead>
                    <tbody id="popularityRows"><tr><td colspan="2">Loading...</td></tr></tbody>
                </table>
            </div>
        </section>

        <section class="page-title" style="margin-top: 36px;">
            <h1>Scheme Analytics</h1>
            <p>Compliance and beneficiary standing across schemes.</p>
        </section>

        <section class="dashboard-grid" id="schemeAnalyticsStats">
            <div class="card summary-card"><h2>Total Beneficiary</h2><p id="statTotalBeneficiary">-</p></div>
            <div class="card summary-card"><h2>Active Rate</h2><p id="statActiveRate">-</p></div>
            <div class="card summary-card"><h2>Avg Verification Time</h2><p id="statVerificationTime">-</p></div>
            <div class="card summary-card"><h2>Compliance Score</h2><p id="statComplianceScore">-</p></div>
        </section>

        <section class="card" style="margin-top: 18px;">
            <h2>Scheme-wise Active Rate</h2>
            <div class="table-wrap">
                <table class="table">
                    <thead><tr><th>Scheme</th><th>Active Rate</th></tr></thead>
                    <tbody id="schemeActiveRateRows"><tr><td colspan="2">Loading...</td></tr></tbody>
                </table>
            </div>
        </section>

        <div class="actions" style="justify-content: flex-start; margin-top: 18px;">
            <button class="button primary" id="downloadReportButton" type="button">Download Report</button>
        </div>
        `,
        "consoleAnalytics"
    );

    try {
        const overview = await apiRequest("/api/analytics/overview");
        document.getElementById("statTotal").textContent = overview.data.totalApplications;
        document.getElementById("statApproval").textContent = overview.data.approvalRate;
        document.getElementById("statRejection").textContent = overview.data.rejectionRate;
    } catch (error) {
        showMessage(error.message);
    }

    try {
        const processing = await apiRequest("/api/analytics/processing-time");
        document.getElementById("statProcessing").textContent = `${processing.data.averageProcessingTimeDays} days`;
    } catch (error) {
    }

    try {
        const regions = await apiRequest("/api/analytics/region-distribution");
        document.getElementById("regionRows").innerHTML =
            regions.data.map((r) => `<tr><td>${r.region}</td><td>${r.totalBeneficiaries}</td></tr>`).join("") ||
            `<tr><td colspan="2">No data yet.</td></tr>`;
    } catch (error) {
    }

    try {
        const budgets = await apiRequest("/api/analytics/budget-utilization");
        document.getElementById("budgetRows").innerHTML =
            budgets.data
                .map(
                    (b) => `
                        <tr>
                            <td>${b.scheme}</td>
                            <td>${b.budgetAllocated}</td>
                            <td>${b.budgetUtilized}</td>
                            <td>${b.remaining}</td>
                            <td>${b.utilizationRate}</td>
                        </tr>
                    `
                )
                .join("") || `<tr><td colspan="5">No schemes configured yet.</td></tr>`;
    } catch (error) {
    }

    try {
        const popularity = await apiRequest("/api/analytics/scheme-popularity");
        document.getElementById("popularityRows").innerHTML =
            popularity.data
                .map((p) => `<tr><td>${p.schemeName || "-"}</td><td>${p.applicationCount}</td></tr>`)
                .join("") || `<tr><td colspan="2">No applications yet.</td></tr>`;
    } catch (error) {
    }

    let schemeAnalyticsData = null;

    try {
        const schemeAnalytics = await apiRequest("/api/analytics/scheme-analytics");
        schemeAnalyticsData = schemeAnalytics.data;

        document.getElementById("statTotalBeneficiary").textContent = schemeAnalyticsData.totalBeneficiaries;
        document.getElementById("statActiveRate").textContent = schemeAnalyticsData.activeRate;
        document.getElementById("statVerificationTime").textContent = `${schemeAnalyticsData.avgVerificationTimeDays} days`;
        document.getElementById("statComplianceScore").textContent = `${schemeAnalyticsData.complianceScore}/100`;

        document.getElementById("schemeActiveRateRows").innerHTML =
            schemeAnalyticsData.schemeWiseActiveRate
                .map((s) => `<tr><td>${s.schemeName}</td><td>${s.activeRate}%</td></tr>`)
                .join("") || `<tr><td colspan="2">No schemes with beneficiaries yet.</td></tr>`;
    } catch (error) {
        showMessage(error.message);
    }

    document.getElementById("applyAnalyticsFilters").addEventListener("click", async () => {
        const params = new URLSearchParams();
        const schemeId = document.getElementById("filterSchemeId").value.trim();
        const district = document.getElementById("filterDistrict").value.trim();
        const category = document.getElementById("filterCategory").value;
        const startDate = document.getElementById("filterStartDate").value;
        const endDate = document.getElementById("filterEndDate").value;

        if (schemeId) params.set("schemeId", schemeId);
        if (district) params.set("district", district);
        if (category) params.set("category", category);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const query = params.toString() ? `?${params.toString()}` : "";

        try {
            const result = await apiRequest(`/api/analytics/dashboard${query}`);
            const data = result.data;

            const approvalRate = data.totalApplications
                ? ((data.approved / data.totalApplications) * 100).toFixed(2)
                : "0.00";
            const rejectionRate = data.totalApplications
                ? ((data.rejected / data.totalApplications) * 100).toFixed(2)
                : "0.00";

            const districtCounts = {};
            (data.applications || []).forEach((application) => {
                const key = application.district || "Unknown";
                districtCounts[key] = (districtCounts[key] || 0) + 1;
            });

            document.getElementById("filteredResultsCard").hidden = false;
            document.getElementById("filteredTotal").textContent = data.totalApplications;
            document.getElementById("filteredApproval").textContent = `${approvalRate}%`;
            document.getElementById("filteredRejection").textContent = `${rejectionRate}%`;
            document.getElementById("filteredDistrictRows").innerHTML =
                Object.entries(districtCounts)
                    .map(([district, count]) => `<tr><td>${district}</td><td>${count}</td></tr>`)
                    .join("") || `<tr><td colspan="2">No matching applications.</td></tr>`;
        } catch (error) {
            window.alert(error.message);
        }
    });

    document.getElementById("downloadReportButton").addEventListener("click", () => {
        if (!schemeAnalyticsData) {
            return;
        }

        const lines = [
            `Total Beneficiaries: ${schemeAnalyticsData.totalBeneficiaries}`,
            `Active Rate: ${schemeAnalyticsData.activeRate}%`,
            `Avg Verification Time: ${schemeAnalyticsData.avgVerificationTimeDays} days`,
            `Compliance Score: ${schemeAnalyticsData.complianceScore}/100`,
            "",
            "Scheme-wise Active Rate:",
            ...schemeAnalyticsData.schemeWiseActiveRate.map((s) => `${s.schemeName}: ${s.activeRate}%`)
        ];

        const blob = new Blob([lines.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `scheme-analytics-${new Date().toISOString().slice(0, 10)}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    });
};

const renderConsoleAuditLog = async () => {
    if (!(await requireRole(["Administrator", "Auditor"]))) {
        return;
    }

    setPage(
        `
        <section class="page-title">
            <h1>Governance Audit Center</h1>
            <p>Review every recorded action across the platform for compliance.</p>
        </section>

        <section class="card" style="margin-bottom: 18px;">
            <h2>Filter Logs</h2>
            <div class="form-grid">
                <div class="form-row">
                    <label for="filterRole">Role</label>
                    <select id="filterRole">
                        <option value="">All roles</option>
                        <option value="Citizen">Citizen</option>
                        <option value="Verification Officer">Verification Officer</option>
                        <option value="Finance Officer">Finance Officer</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Auditor">Auditor</option>
                    </select>
                </div>
                <div class="form-row">
                    <label for="filterAction">Action</label>
                    <input id="filterAction" placeholder="e.g. BENEFICIARY_UPDATED">
                </div>
                <div class="form-row">
                    <label for="auditStartDate">Start date</label>
                    <input id="auditStartDate" type="date">
                </div>
                <div class="form-row">
                    <label for="auditEndDate">End date</label>
                    <input id="auditEndDate" type="date">
                </div>
                <div class="form-row" style="justify-content: flex-end; flex-direction: row; align-items: flex-end;">
                    <button class="button primary" id="applyAuditFilters" type="button">Apply Filters</button>
                </div>
            </div>
        </section>

        <section class="card">
            <div id="messageBox" class="message error" hidden></div>
            <div class="table-wrap">
                <table class="table">
                    <thead>
                        <tr><th>Timestamp</th><th>Action</th><th>Performed By</th><th>Role</th><th>Target</th><th>Details</th></tr>
                    </thead>
                    <tbody id="auditRows">
                        <tr><td colspan="6">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </section>
        `,
        "consoleAuditLog"
    );

    const loadAuditLogs = async (query = "") => {
        try {
            const result = await apiRequest(`/api/audit-logs${query}`);
            document.getElementById("auditRows").innerHTML =
                result.data
                    .map(
                        (log) => `
                            <tr>
                                <td>${new Date(log.timestamp).toLocaleString()}</td>
                                <td>${log.action}</td>
                                <td>${roleDisplayLabel(log.performedBy)}</td>
                                <td>${roleDisplayLabel(log.role)}</td>
                                <td>${log.targetType || ""}</td>
                                <td>${log.details || ""}</td>
                            </tr>
                        `
                    )
                    .join("") || `<tr><td colspan="6">No audit log entries match these filters.</td></tr>`;
        } catch (error) {
            showMessage(error.message);
        }
    };

    document.getElementById("applyAuditFilters").addEventListener("click", () => {
        const params = new URLSearchParams();
        const role = document.getElementById("filterRole").value;
        const action = document.getElementById("filterAction").value.trim();
        const startDate = document.getElementById("auditStartDate").value;
        const endDate = document.getElementById("auditEndDate").value;

        if (role) params.set("role", role);
        if (action) params.set("action", action);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const query = params.toString() ? `?${params.toString()}` : "";
        loadAuditLogs(query);
    });

    await loadAuditLogs();
};

const renderConsoleCirculars = async () => {
    if (!(await requireRole(["Administrator"]))) {
        return;
    }

    setPage(
        `
        <section class="page-title">
            <h1>Official Circular Synchronization</h1>
            <p>Synced circulars update eligibility rules across all schemes automatically.</p>
        </section>

        <section class="card">
            <div id="messageBox" class="message error" hidden></div>

            <form id="syncForm" class="form-grid" style="margin-bottom: 24px;">
                <div class="form-row">
                    <label for="circTitle">Circular title</label>
                    <input id="circTitle" name="title" required>
                </div>
                <div class="form-row">
                    <label for="circDescription">Description</label>
                    <input id="circDescription" name="description">
                </div>
                <div class="form-row">
                    <label for="circFileUrl">Google Drive file URL</label>
                    <input id="circFileUrl" name="fileUrl" type="url" required>
                </div>
                <div class="form-row">
                    <label for="circPublishedDate">Published date</label>
                    <input id="circPublishedDate" name="publishedDate" type="date" required>
                </div>
                <div class="form-row" style="justify-content: flex-end; flex-direction: row; align-items: flex-end;">
                    <button class="button primary" type="submit">Sync from Google Drive</button>
                </div>
            </form>

            <div id="circularList"></div>
        </section>
        `,
        "consoleCirculars"
    );

    const loadCirculars = async () => {
        try {
            const result = await apiRequest("/api/circulars");
            document.getElementById("circularList").innerHTML =
                result.data
                    .map(
                        (c) => `
                            <div class="card" style="margin-bottom: 12px; box-shadow: none; border: 1px solid var(--line);">
                                <strong>${c.title}</strong>
                                <p>${c.description || ""}</p>
                                <p><a href="${c.fileUrl}" target="_blank" rel="noreferrer">${c.fileUrl}</a></p>
                            </div>
                        `
                    )
                    .join("") || "<p>No circulars synced yet.</p>";
        } catch (error) {
            showMessage(error.message);
        }
    };

    document.getElementById("syncForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.target;
        const button = form.querySelector("button");

        button.disabled = true;
        button.textContent = "Syncing...";

        try {
            await apiRequest("/api/circulars/sync", {
                method: "POST",
                body: JSON.stringify({
                    circulars: [
                        {
                            title: form.title.value.trim(),
                            description: form.description.value.trim(),
                            fileUrl: form.fileUrl.value.trim(),
                            publishedDate: form.publishedDate.value
                        }
                    ]
                })
            });

            form.reset();
            await loadCirculars();
        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
            button.textContent = "Sync from Google Drive";
        }
    });

    await loadCirculars();
};

// =========================
// SCHEME CONFIGURATION STUDIO  (Module 1, Feature 3)
// =========================

// Staff-only roles for Scheme Studio, Finance Dashboard and their nav links
const schemeStudioRoles = ["Administrator", "Finance Officer"];

const formatMoney = (amount) => `৳${Number(amount).toLocaleString()}`;

const categoryOptions = ["Agriculture", "Education", "Healthcare", "Disability", "Women", "SME", "Housing"];

const loadBudgetSummary = async (schemeId, targetElement) => {
    try {
        const result = await apiRequest(`/api/schemes/${schemeId}/budget`);
        const summary = result.data;
        const usedPercent = 100 - summary.remainingPercent;

        targetElement.innerHTML = `
            <div class="budget-meta">
                <span>Used: ${formatMoney(summary.utilizedBudget)}</span>
                <span>Remaining: ${formatMoney(summary.remainingBudget)}</span>
            </div>
            <div class="budget-track">
                <div class="budget-fill ${summary.lowBudgetAlert ? "danger" : ""}" style="width:${Math.min(usedPercent, 100)}%"></div>
            </div>
            ${summary.lowBudgetAlert ? `<p class="budget-alert">Low budget: only ${summary.remainingPercent}% remaining</p>` : ""}
        `;
    } catch (error) {
        targetElement.innerHTML = `<p class="budget-meta">Unable to load budget.</p>`;
    }
};

const renderSchemeCards = (schemes, canEdit = false) => {
    if (schemes.length === 0) {
        return `<p class="empty-note">No schemes yet. Create one on the left to get started.</p>`;
    }

    return schemes
        .map(
            (scheme) => `
            <div class="card scheme-card" data-scheme-id="${scheme._id}">
                <div class="scheme-card-top">
                    <div>
                        <h3>${scheme.name}</h3>
                        <p class="scheme-category">${scheme.category}</p>
                    </div>
                    <span class="badge badge-${scheme.status.toLowerCase()}">${scheme.status}</span>
                </div>
                <p class="scheme-budget-line">Allocated: ${formatMoney(scheme.allocatedBudget)}</p>
                <div class="budget-box" id="budget-${scheme._id}">
                    <p class="budget-meta">Loading budget...</p>
                </div>
                ${canEdit ? `<button class="button secondary edit-scheme-button" type="button" data-scheme-id="${scheme._id}">
                    Edit
                </button>` : ""}
                <button class="button secondary select-scheme-button" type="button" data-scheme-id="${scheme._id}" data-scheme-name="${scheme.name}" data-scheme-status="${scheme.status}">
                    Select for Disbursement
                </button>
            </div>
        `
        )
        .join("");
};

const renderLedgerRows = (ledger) => {
    if (ledger.length === 0) {
        return `<tr><td colspan="6" class="empty-note">No transactions yet.</td></tr>`;
    }

    return ledger
        .map(
            (transaction) => `
            <tr class="ledger-row" data-transaction-id="${transaction._id}" title="View receipt">
                <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>${transaction.scheme ? transaction.scheme.name : "-"}</td>
                <td>${transaction.beneficiaryName}</td>
                <td>${formatMoney(transaction.amount)}</td>
                <td class="mono">${transaction.gatewayReference || "-"}</td>
                <td><span class="badge badge-${transaction.status.toLowerCase()}">${transaction.status}</span></td>
            </tr>
        `
        )
        .join("");
};

const ensureReceiptModal = () => {
    let modal = document.getElementById("receiptModal");

    if (modal) {
        return modal;
    }

    modal = document.createElement("div");
    modal.id = "receiptModal";
    modal.className = "receipt-modal hidden";
    modal.innerHTML = `
        <div class="receipt-modal-backdrop" data-close-receipt="true"></div>
        <div class="receipt-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="receiptTitle">
            <div class="receipt-modal-header">
                <h3 id="receiptTitle">Disbursement Receipt</h3>
                <button type="button" class="button secondary" data-close-receipt="true">Close</button>
            </div>
            <div id="receiptContent" class="receipt-content"></div>
            <div class="receipt-modal-actions">
                <button type="button" class="button primary" id="printReceiptButton">Print</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", (event) => {
        if (event.target.dataset.closeReceipt === "true") {
            modal.classList.add("hidden");
        }
    });

    document.getElementById("printReceiptButton").addEventListener("click", () => {
        window.print();
    });

    return modal;
};

const openReceiptModal = async (transactionId) => {
    const modal = ensureReceiptModal();
    const receiptContent = document.getElementById("receiptContent");

    receiptContent.innerHTML = "<p class=\"empty-note\">Loading receipt...</p>";
    modal.classList.remove("hidden");

    try {
        const result = await apiRequest(`/api/transactions/${transactionId}`);
        const transaction = result.data.transaction;
        const amount = Number(transaction.amount || 0);
        const schemeName = transaction.scheme ? transaction.scheme.name : "-";
        const createdAt = transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : "-";

        receiptContent.innerHTML = `
            <div class="receipt-card">
                <div class="receipt-brand">
                    <h4>SchemeConnect</h4>
                    <span>Disbursement Receipt</span>
                </div>
                <div class="receipt-grid">
                    <div><strong>Beneficiary</strong><span>${transaction.beneficiaryName || "-"}</span></div>
                    <div><strong>Phone</strong><span>${transaction.beneficiaryPhone || "-"}</span></div>
                    <div><strong>Scheme</strong><span>${schemeName}</span></div>
                    <div><strong>Amount</strong><span>${formatMoney(amount)}</span></div>
                    <div><strong>Reference</strong><span class="mono">${transaction.gatewayReference || "-"}</span></div>
                    <div><strong>Status</strong><span class="badge badge-${transaction.status.toLowerCase()}">${transaction.status}</span></div>
                    <div><strong>Date</strong><span>${createdAt}</span></div>
                    <div><strong>Payment Gateway</strong><span>${transaction.paymentGateway || "-"}</span></div>
                </div>
            </div>
        `;
    } catch (error) {
        receiptContent.innerHTML = `<p class="empty-note">Unable to load receipt.</p>`;
    }
};

const attachLedgerRowClicks = () => {
    document.querySelectorAll(".ledger-row").forEach((row) => {
        row.onclick = () => openReceiptModal(row.dataset.transactionId);
    });
};

const loadLedger = async (statusFilter = "") => {
    const tableBody = document.getElementById("ledgerBody");

    if (!tableBody) {
        return;
    }

    try {
        const query = statusFilter ? `?status=${statusFilter}` : "";
        const result = await apiRequest(`/api/transactions${query}`);
        tableBody.innerHTML = renderLedgerRows(result.data.ledger);
        attachLedgerRowClicks();
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="6" class="empty-note">Unable to load ledger.</td></tr>`;
    }
};

let selectedScheme = null;

const renderDisbursementPanel = async () => {
    const panel = document.getElementById("disbursementPanel");

    if (!panel) {
        return;
    }

    if (currentUser.role !== "Finance Officer") {
        panel.innerHTML = `<p class="empty-note">Only Finance Officers can disburse funds.</p>`;
        return;
    }

    if (!selectedScheme) {
        panel.innerHTML = `<p class="empty-note">Select a scheme from the list to disburse funds.</p>`;
        return;
    }

    panel.innerHTML = `
        <h2>Disburse Funds - ${selectedScheme.name}</h2>
        <div id="disbursementMessage" class="message error" hidden></div>
        <form id="disbursementForm">
            <div class="form-row">
                <label for="beneficiaryName">Beneficiary Name</label>
                <input id="beneficiaryName" name="beneficiaryName" required>
            </div>
            <div class="form-row">
                <label for="beneficiaryPhone">Beneficiary Phone</label>
                <input id="beneficiaryPhone" name="beneficiaryPhone" placeholder="01XXXXXXXXX" required>
            </div>
            <div class="form-row">
                <label for="amount">Amount (BDT)</label>
                <input id="amount" name="amount" type="number" min="0" required>
            </div>
            <div class="form-row">
                <label>Card Information</label>
                <div class="stripe-card-stack">
                    <div id="card-number-element" class="stripe-card-field"></div>
                    <div class="stripe-card-row">
                        <div id="card-expiry-element" class="stripe-card-field stripe-card-small"></div>
                        <div id="card-cvc-element" class="stripe-card-field stripe-card-small"></div>
                    </div>
                </div>
            </div>
            <div class="actions">
                <button class="button primary" type="submit">Pay with Stripe</button>
            </div>
        </form>
    `;

    const stripePublishableKey = await loadStripeConfig();

    if (!window.Stripe || !stripePublishableKey) {
        const messageBox = document.getElementById("disbursementMessage");
        messageBox.className = "message error";
        messageBox.textContent = "Stripe.js failed to load or the Stripe publishable key is missing.";
        messageBox.hidden = false;
        return;
    }

    const stripe = Stripe(stripePublishableKey);
    const elements = stripe.elements({
        appearance: {
            disablePlaceholders: true
        }
    });
    const cardNumber = elements.create("cardNumber", {
        style: {
            base: {
                color: "#1f2937",
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
                iconColor: "#0f766e"
            }
        }
    });
    const cardExpiry = elements.create("cardExpiry", {
        style: {
            base: {
                color: "#1f2937",
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
                iconColor: "#0f766e"
            }
        }
    });
    const cardCvc = elements.create("cardCvc", {
        style: {
            base: {
                color: "#1f2937",
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
                iconColor: "#0f766e"
            }
        }
    });

    cardNumber.mount("#card-number-element");
    cardExpiry.mount("#card-expiry-element");
    cardCvc.mount("#card-cvc-element");

    document.getElementById("disbursementForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.target;
        const button = form.querySelector("button");
        const messageBox = document.getElementById("disbursementMessage");

        button.disabled = true;
        button.textContent = "Processing payment...";
        messageBox.hidden = true;

        try {
            const result = await apiRequest("/api/transactions/disburse", {
                method: "POST",
                body: JSON.stringify({
                    schemeId: selectedScheme._id,
                    beneficiaryName: form.beneficiaryName.value.trim(),
                    beneficiaryPhone: form.beneficiaryPhone.value.trim(),
                    amount: Number(form.amount.value)
                })
            });

            const { clientSecret, transaction } = result.data;

            if (!clientSecret) {
                const isSuccessful = transaction.status === "Successful";
                messageBox.className = `message ${isSuccessful ? "success" : "error"}`;
                messageBox.textContent = `${result.message}${transaction.gatewayReference ? " - Ref: " + transaction.gatewayReference : ""}`;
                messageBox.hidden = false;
                form.reset();
                loadLedger();
                loadBudgetSummary(selectedScheme._id, document.getElementById(`budget-${selectedScheme._id}`));
                return;
            }

            const paymentResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardNumber,
                    billing_details: {
                        name: form.beneficiaryName.value.trim(),
                        phone: form.beneficiaryPhone.value.trim()
                    }
                }
            });

            if (paymentResult.error) {
                try {
                    await apiRequest(`/api/transactions/${transaction._id}/confirm`, {
                        method: "POST",
                        body: JSON.stringify({
                            status: "failed"
                        })
                    });
                } catch (confirmError) {
                    // ignore confirm error and keep the original card error visible
                }

                loadLedger();
                loadBudgetSummary(selectedScheme._id, document.getElementById(`budget-${selectedScheme._id}`));
                throw new Error(paymentResult.error.message || "Card payment failed.");
            }

            if (paymentResult.paymentIntent && paymentResult.paymentIntent.status === "succeeded") {
                const confirmation = await apiRequest(`/api/transactions/${transaction._id}/confirm`, {
                    method: "POST",
                    body: JSON.stringify({
                        paymentIntentId: paymentResult.paymentIntent.id,
                        status: paymentResult.paymentIntent.status
                    })
                });

                messageBox.className = "message success";
                messageBox.textContent = `${confirmation.message} - Ref: ${confirmation.data.transaction.gatewayReference}`;
                messageBox.hidden = false;

                form.reset();
                loadLedger();
                loadBudgetSummary(selectedScheme._id, document.getElementById(`budget-${selectedScheme._id}`));
            }
        } catch (error) {
            const failedTransaction = error.result && error.result.data && error.result.data.transaction
                ? error.result.data.transaction
                : null;

            if (failedTransaction) {
                messageBox.className = "message error";
                messageBox.textContent = `${error.result.message} - Failed transaction recorded.`;
                messageBox.hidden = false;
                form.reset();
                loadLedger();
                loadBudgetSummary(selectedScheme._id, document.getElementById(`budget-${selectedScheme._id}`));
            } else {
                messageBox.className = "message error";
                messageBox.textContent = error.message;
                messageBox.hidden = false;
            }
        } finally {
            button.disabled = false;
            button.textContent = "Pay with Stripe";
        }
    });
};

const attachSchemeCardListeners = () => {
    document.querySelectorAll(".edit-scheme-button").forEach((button) => {
        button.addEventListener("click", () => {
            startSchemeEdit(button.getAttribute("data-scheme-id"));
        });
    });

    document.querySelectorAll(".select-scheme-button").forEach((button) => {
        button.addEventListener("click", () => {
            selectedScheme = {
                _id: button.getAttribute("data-scheme-id"),
                name: button.getAttribute("data-scheme-name"),
                status: button.getAttribute("data-scheme-status")
            };
            renderDisbursementPanel();
        });
    });

    document.querySelectorAll(".scheme-card").forEach((card) => {
        loadBudgetSummary(card.getAttribute("data-scheme-id"), document.getElementById(`budget-${card.getAttribute("data-scheme-id")}`));
    });
};

const resetSchemeForm = (form) => {
    form.reset();
    form.schemeId.value = "";
    form.status.value = "Draft";
    form.status.disabled = true;
    document.getElementById("statusField").hidden = true;
    document.getElementById("cancelSchemeEdit").hidden = true;
    form.querySelector('button[type="submit"]').textContent = "Create Scheme";
};

const startSchemeEdit = async (schemeId) => {
    const form = document.getElementById("schemeForm");
    const messageBox = document.getElementById("schemeFormMessage");

    try {
        const result = await apiRequest(`/api/schemes/${schemeId}`);
        const scheme = result.data.scheme;

        form.schemeId.value = scheme._id;
        form.name.value = scheme.name;
        form.category.value = scheme.category;
        form.benefitAmount.value = scheme.benefitAmount;
        form.allocatedBudget.value = scheme.allocatedBudget;
        form.eligibilityCriteria.value = scheme.eligibilityCriteria;
        form.status.value = scheme.status;
        form.status.disabled = false;
        document.getElementById("statusField").hidden = false;
        document.getElementById("cancelSchemeEdit").hidden = false;
        form.querySelector('button[type="submit"]').textContent = "Update Scheme";
        messageBox.hidden = true;
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        form.name.focus();
    } catch (error) {
        messageBox.className = "message error";
        messageBox.textContent = error.message;
        messageBox.hidden = false;
    }
};

const loadSchemeList = async (canEdit = currentUser && currentUser.role === "Administrator") => {
    const listElement = document.getElementById("schemeList");

    try {
        const result = await apiRequest("/api/schemes");
        listElement.innerHTML = renderSchemeCards(result.data.schemes, canEdit);
        attachSchemeCardListeners();
    } catch (error) {
        listElement.innerHTML = `<p class="empty-note">Unable to load schemes.</p>`;
    }
};

const renderSchemeStudio = async () => {
    if (!(await requireAuth(schemeStudioRoles))) {
        return;
    }

    selectedScheme = null;

    const canCreateScheme = currentUser.role === "Administrator";
    const canEdit = currentUser.role === "Administrator";

    setPage(
        `
        <section class="page-title">
            <h1>Welfare Scheme Configuration Studio</h1>
            <p>Configure schemes, monitor budgets, disburse funds, and review the audit ledger.</p>
        </section>

        <section class="studio-grid">
            <div class="card" id="schemeFormCard" ${canCreateScheme ? "" : "hidden"}>
                <h2>Create New Scheme</h2>
                <div id="schemeFormMessage" class="message error" hidden></div>
                <form id="schemeForm">
                    <input type="hidden" id="schemeId" name="schemeId" value="">
                    <div class="form-row full">
                        <label for="name">Scheme Name</label>
                        <input id="name" name="name" required>
                    </div>
                    <div class="form-row">
                        <label for="category">Category</label>
                        <select id="category" name="category">
                            ${categoryOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-row">
                        <label for="benefitAmount">Benefit Amount (BDT)</label>
                        <input id="benefitAmount" name="benefitAmount" type="number" min="0" required>
                    </div>
                    <div class="form-row">
                        <label for="allocatedBudget">Allocated Budget (BDT)</label>
                        <input id="allocatedBudget" name="allocatedBudget" type="number" min="0" required>
                    </div>
                    <div class="form-row full">
                        <label for="eligibilityCriteria">Eligibility Criteria</label>
                        <input id="eligibilityCriteria" name="eligibilityCriteria" required placeholder="e.g. Household income below 15,000 BDT/month">
                    </div>
                    <div class="form-row" id="statusField" hidden>
                        <label for="status">Status</label>
                        <select id="status" name="status" disabled>
                            <option value="Draft">Draft</option>
                            <option value="Active">Active</option>
                            <option value="Paused">Paused</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                    <div class="actions">
                        <button class="button primary" type="submit">Create Scheme</button>
                        <button class="button secondary" id="cancelSchemeEdit" type="button" hidden>Cancel</button>
                    </div>
                </form>
            </div>

            <div class="card" id="schemeListCard">
                <h2>Schemes</h2>
                <div id="schemeList"><p class="empty-note">Loading schemes...</p></div>
            </div>

            <div class="card" id="disbursementPanel"></div>
        </section>

        <section class="card" style="margin-top: 18px;">
            <div class="ledger-header">
                <h2>Financial Ledger</h2>
                <select id="ledgerStatusFilter">
                    <option value="">All statuses</option>
                    <option value="Successful">Successful</option>
                    <option value="Failed">Failed</option>
                </select>
            </div>
            <table class="ledger-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Scheme</th>
                        <th>Beneficiary</th>
                        <th>Amount</th>
                        <th>Reference</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="ledgerBody">
                    <tr><td colspan="6" class="empty-note">Loading ledger...</td></tr>
                </tbody>
            </table>
        </section>
        `,
        "scheme-studio"
    );

    renderDisbursementPanel();
    loadSchemeList(canEdit);
    loadLedger();

    document.getElementById("ledgerStatusFilter").addEventListener("change", (event) => {
        loadLedger(event.target.value);
    });

    if (canCreateScheme) {
        const form = document.getElementById("schemeForm");
        const cancelButton = document.getElementById("cancelSchemeEdit");

        cancelButton.addEventListener("click", () => {
            resetSchemeForm(form);
        });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const button = form.querySelector('button[type="submit"]');
            const messageBox = document.getElementById("schemeFormMessage");
            const schemeId = form.schemeId.value.trim();
            const isEditing = Boolean(schemeId);
            const payload = {
                name: form.name.value.trim(),
                category: form.category.value,
                eligibilityCriteria: form.eligibilityCriteria.value.trim(),
                benefitAmount: Number(form.benefitAmount.value),
                allocatedBudget: Number(form.allocatedBudget.value)
            };

            if (isEditing) {
                payload.status = form.status.value;
            }

            button.disabled = true;
            button.textContent = isEditing ? "Updating..." : "Creating...";
            messageBox.hidden = true;

            try {
                await apiRequest(isEditing ? `/api/schemes/${schemeId}` : "/api/schemes", {
                    method: isEditing ? "PUT" : "POST",
                    body: JSON.stringify(payload)
                });

                resetSchemeForm(form);
                loadSchemeList(canEdit);
            } catch (error) {
                messageBox.className = "message error";
                messageBox.textContent = error.message;
                messageBox.hidden = false;
            } finally {
                button.disabled = false;
                button.textContent = form.schemeId.value ? "Update Scheme" : "Create Scheme";
            }
        });
    }
};









const DOCUMENT_TYPES = [
    "National ID",
    "Birth Certificate",
    "Income Certificate",
    "Disability Certificate",
    "Educational Record",
    "Other"
];

const documentTypeOptions = () => {
    return DOCUMENT_TYPES.map(
        (type) => `<option value="${type}">${type}</option>`
    ).join("");
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

const renderDocuments = async () => {
    if (!(await requireAuth())) {
        return;
    }

    setPage(
        `
        <section class="page-title">
            <h1>Document Vault</h1>
            <p>Keep your important welfare documents in one place.</p>
        </section>

        <section class="card upload-card">
            <h2>Upload Document</h2>
            <form id="uploadForm">
                <div id="messageBox" class="message error" hidden></div>

                <div class="form-grid">
                    <div class="form-row">
                        <label for="documentType">Document Type</label>
                        <select id="documentType" name="documentType" required>
                            <option value="">Select type</option>
                            ${documentTypeOptions()}
                        </select>
                    </div>

                    <div class="form-row">
                        <label for="documentNumber">Document Number (optional)</label>
                        <input id="documentNumber" name="documentNumber" type="text">
                    </div>

                    <div class="form-row full">
                        <label for="fileInput">File (PDF, JPG, JPEG, PNG — max 5 MB)</label>
                        <input id="fileInput" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required>
                    </div>
                </div>

                <div class="actions">
                    <button class="button primary" type="submit">Upload Document</button>
                </div>
            </form>
        </section>

        <section class="card documents-card">
            <h2>Your Documents</h2>
            <div id="documentsList">
                <p class="muted-text">Loading documents...</p>
            </div>
        </section>
        `,
        "documents"
    );

    // Attach upload form handler
    document.getElementById("uploadForm").addEventListener("submit", handleUpload);

    // Load documents
    loadDocuments();
};

const handleUpload = async (event) => {
    event.preventDefault();

    const form = event.target;
    const button = form.querySelector("button[type='submit']");
    const fileInput = document.getElementById("fileInput");

    if (!fileInput.files || fileInput.files.length === 0) {
        showMessage("Please select a file.");
        return;
    }

    button.disabled = true;
    button.textContent = "Uploading...";

    const formData = new FormData();
    formData.append("documentType", form.documentType.value);
    formData.append("documentNumber", form.documentNumber.value.trim());
    formData.append("file", fileInput.files[0]);

    try {
        await apiRequest("/api/documents", {
            method: "POST",
            body: formData
        });

        showMessage("Document uploaded successfully.", "success");
        form.reset();
        loadDocuments();
    } catch (error) {
        showMessage(error.message);
    } finally {
        button.disabled = false;
        button.textContent = "Upload Document";
    }
};

const loadDocuments = async () => {
    const container = document.getElementById("documentsList");

    if (!container) {
        return;
    }

    container.innerHTML = "<p class='muted-text'>Loading documents...</p>";

    try {
        const result = await apiRequest("/api/documents");
        const documents = result.data.documents;

        if (!documents || documents.length === 0) {
            container.innerHTML = "<p class='muted-text'>You have not uploaded any documents yet.</p>";
            return;
        }

        renderDocumentList(documents);
    } catch (error) {
        container.innerHTML = `<p class='muted-text error-text'>${error.message}</p>`;
    }
};

const renderDocumentList = (documents) => {
    const container = document.getElementById("documentsList");

    if (!container) {
        return;
    }

    const rows = documents.map((doc) => `
        <tr>
            <td>${doc.documentType}</td>
            <td>${doc.fileName}</td>
            <td>${doc.documentNumber || "—"}</td>
            <td><span class="status-badge status-${doc.verificationStatus.toLowerCase()}">${doc.verificationStatus}</span></td>
            <td>${formatDate(doc.createdAt)}</td>
            <td class="action-cell">
                <button class="action-link" type="button" data-view-id="${doc._id}">View</button>
                <button class="action-link danger-link" type="button" data-delete-id="${doc._id}">Delete</button>
            </td>
        </tr>
    `).join("");

    container.innerHTML = `
        <table class="documents-table">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>File Name</th>
                    <th>Number</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;

    // Attach view handlers
    container.querySelectorAll("[data-view-id]").forEach((button) => {
        button.addEventListener("click", () => {
            handleViewDocument(button.getAttribute("data-view-id"));
        });
    });

    // Attach delete handlers
    container.querySelectorAll("[data-delete-id]").forEach((button) => {
        button.addEventListener("click", () => {
            handleDeleteDocument(button.getAttribute("data-delete-id"));
        });
    });
};

const handleViewDocument = async (id) => {
    const token = getToken();

    if (!token) {
        showMessage("Session expired. Please login again.");
        navigate(routes.login);
        return;
    }

    // Open the tab synchronously inside the click gesture. Browsers drop
    // window.open() once an await has run, which made View silently do nothing.
    const documentWindow = window.open("", "_blank");

    try {
        const response = await fetch(`/api/documents/${id}/download`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            let errorMessage = "Could not load document.";

            try {
                const errorBody = await response.json();
                errorMessage = errorBody.message || errorMessage;
            } catch (parseError) {
                // Response was not JSON, use default message
            }

            if (documentWindow) {
                documentWindow.close();
            }

            showMessage(errorMessage);
            return;
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        if (documentWindow) {
            documentWindow.location.href = blobUrl;
        } else {
            showMessage("Please allow popups to view this document.");
        }

        // Revoke after the new tab has loaded the content
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (error) {
        if (documentWindow) {
            documentWindow.close();
        }

        showMessage(error.message || "Could not load document.");
    }
};

const handleDeleteDocument = async (id) => {
    const confirmed = window.confirm("Delete this document?");

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest(`/api/documents/${id}`, {
            method: "DELETE"
        });

        showMessage("Document deleted successfully.", "success");
        loadDocuments();
    } catch (error) {
        showMessage(error.message);
    }
};

// ============================================================
// Easy to modify: scheme categories (frontend)
// ============================================================
const SCHEME_CATEGORIES = [
    "Agriculture",
    "Education",
    "Healthcare",
    "Disability",
    "Women",
    "SME",
    "Housing"
];

// Citizen-facing statuses (Draft is excluded from citizen view)
const SCHEME_STATUSES = ["Active", "Paused", "Closed"];

const citizenCategoryOptions = () => {
    return SCHEME_CATEGORIES.map(
        (cat) => `<option value="${cat}">${cat}</option>`
    ).join("");
};

const citizenStatusOptions = () => {
    return SCHEME_STATUSES.map(
        (s) => `<option value="${s}">${s}</option>`
    ).join("");
};

// Safe formatting helpers for scheme data
const formatBenefit = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return "Not specified";
    }
    return `৳${Number(amount).toLocaleString()}`;
};

const formatDeadline = (dateValue) => {
    if (!dateValue) {
        return "Not specified";
    }
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
        return "Not specified";
    }
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

// Map scheme status to CSS badge class
const statusBadgeClass = (status) => {
    if (status === "Active") return "status-verified";
    if (status === "Paused") return "status-paused";
    if (status === "Closed") return "status-rejected";
    return "status-pending";
};

// ============================================================
// Schemes page
// ============================================================
const renderSchemes = async () => {
    if (!(await requireAuth())) {
        return;
    }

    setPage(
        `
        <section class="page-title">
            <h1>Welfare Schemes</h1>
            <p>Browse available welfare schemes and check your eligibility.</p>
        </section>

        <section class="card filter-card">
            <div class="filter-row">
                <div class="form-row">
                    <label for="schemeCategory">Category</label>
                    <select id="schemeCategory">
                        <option value="">All</option>
                        ${citizenCategoryOptions()}
                    </select>
                </div>
                <div class="form-row">
                    <label for="schemeStatus">Status</label>
                    <select id="schemeStatus">
                        <option value="">All</option>
                        ${citizenStatusOptions()}
                    </select>
                </div>
                <div class="form-row filter-action">
                    <label>&nbsp;</label>
                    <button class="button primary" id="filterSchemesBtn" type="button">Filter</button>
                </div>
            </div>
        </section>

        <section class="card recommended-card">
            <h2>Recommended for You</h2>
            <div id="recommendedList">
                <p class="muted-text">Loading recommendations...</p>
            </div>
        </section>

        <section class="card schemes-card">
            <h2>All Schemes</h2>
            <div id="schemesList">
                <p class="muted-text">Loading schemes...</p>
            </div>
        </section>
        `,
        "schemes"
    );

    document.getElementById("filterSchemesBtn").addEventListener("click", loadSchemes);
    loadSchemes();
    loadRecommended();
};

const loadSchemes = async () => {
    const container = document.getElementById("schemesList");

    if (!container) {
        return;
    }

    container.innerHTML = "<p class='muted-text'>Loading schemes...</p>";

    const category = document.getElementById("schemeCategory").value;
    const status = document.getElementById("schemeStatus").value;

    let url = "/api/schemes?";
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (status) url += `status=${encodeURIComponent(status)}&`;

    try {
        const result = await apiRequest(url);
        const schemes = result.data.schemes;

        if (!schemes || schemes.length === 0) {
            container.innerHTML = "<p class='muted-text'>No schemes found.</p>";
            return;
        }

        renderCitizenSchemeCards(schemes);
    } catch (error) {
        container.innerHTML = `<p class='muted-text error-text'>${error.message}</p>`;
    }
};

const renderCitizenSchemeCards = (schemes) => {
    const container = document.getElementById("schemesList");

    if (!container) {
        return;
    }

    container.innerHTML = schemes.map((scheme) => {
        const status = scheme.status || "Closed";
        return `
        <div class="scheme-item">
            <div class="scheme-header">
                <h3>${scheme.name}</h3>
                <span class="scheme-badge status-badge ${statusBadgeClass(status)}">${status}</span>
            </div>
            <span class="scheme-category">${scheme.category}</span>
            <p class="scheme-desc">${scheme.description || ""}</p>
            <div class="scheme-meta">
                <span>Benefit: <strong>${formatBenefit(scheme.benefitAmount)}</strong></span>
                <span>Deadline: <strong>${formatDeadline(scheme.applicationDeadline)}</strong></span>
            </div>
            <button class="button secondary scheme-detail-btn" type="button" data-scheme-id="${scheme._id}">View Details</button>
        </div>
    `;
    }).join("");

    container.querySelectorAll("[data-scheme-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
            navigate(`/schemes/${btn.getAttribute("data-scheme-id")}`);
        });
    });
};

const loadRecommended = async () => {
    const container = document.getElementById("recommendedList");

    if (!container) {
        return;
    }

    try {
        const result = await apiRequest("/api/schemes/recommended");
        const data = result.data;

        if (!data.hasProfile) {
            container.innerHTML = "<p class='muted-text'>Create your Eligibility Profile to see recommended schemes.</p>";
            return;
        }

        if (!data.schemes || data.schemes.length === 0) {
            container.innerHTML = "<p class='muted-text'>No matching schemes found based on your profile.</p>";
            return;
        }

        container.innerHTML = data.schemes.map((scheme) => {
            const status = scheme.status || "Closed";
            return `
            <div class="recommended-item">
                <div class="scheme-header">
                    <h3>${scheme.name}</h3>
                    <span class="eligible-badge">You may be eligible</span>
                </div>
                <span class="scheme-category">${scheme.category}</span>
                <p class="scheme-desc">${scheme.description || ""}</p>
                <div class="scheme-meta">
                    <span>Benefit: <strong>${formatBenefit(scheme.benefitAmount)}</strong></span>
                    <span>Deadline: <strong>${formatDeadline(scheme.applicationDeadline)}</strong></span>
                </div>
                <button class="button secondary scheme-detail-btn" type="button" data-scheme-id="${scheme._id}">View Details</button>
            </div>
        `;
        }).join("");

        container.querySelectorAll("[data-scheme-id]").forEach((btn) => {
            btn.addEventListener("click", () => {
                navigate(`/schemes/${btn.getAttribute("data-scheme-id")}`);
            });
        });
    } catch (error) {
        container.innerHTML = `<p class='muted-text error-text'>${error.message}</p>`;
    }
};

// ============================================================
// Scheme detail page
// ============================================================
const renderSchemeDetail = async () => {
    if (!(await requireAuth())) {
        return;
    }

    const pathParts = window.location.pathname.split("/");
    const schemeId = pathParts[pathParts.length - 1];

    setPage(
        `
        <section class="page-title">
            <h1>Scheme Details</h1>
            <p><a href="/schemes" data-link>← Back to all schemes</a></p>
        </section>

        <section class="card detail-card">
            <p class="muted-text">Loading scheme...</p>
        </section>
        `,
        "schemes"
    );

    // Re-bind the back link
    document.querySelectorAll("[data-link]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            navigate(link.getAttribute("href"));
        });
    });

    try {
        const result = await apiRequest(`/api/schemes/${schemeId}`);
        const scheme = result.data.scheme;

        const criteria = scheme.eligibilityDetails || {};
        const criteriaItems = [];
        const minIncome = criteria.minIncome ?? criteria.minimumIncome;
        const maxIncome = criteria.maxIncome ?? criteria.maximumIncome;

        if (minIncome !== null && minIncome !== undefined) {
            criteriaItems.push(`Minimum income: ৳${Number(minIncome).toLocaleString()}`);
        }
        if (maxIncome !== null && maxIncome !== undefined) {
            criteriaItems.push(`Maximum income: ৳${Number(maxIncome).toLocaleString()}`);
        }
        if (criteria.district && criteria.district.trim()) {
            criteriaItems.push(`District: ${criteria.district}`);
        }
        if (criteria.eligibleDistricts && criteria.eligibleDistricts.length > 0) {
            criteriaItems.push(`Eligible districts: ${criteria.eligibleDistricts.join(", ")}`);
        }
        if (criteria.disabilityRequired) {
            criteriaItems.push("Disability certificate required");
        }
        if (criteria.minimumFamilySize !== null && criteria.minimumFamilySize !== undefined) {
            criteriaItems.push(`Minimum family size: ${criteria.minimumFamilySize}`);
        }

        const criteriaHtml = criteriaItems.length > 0
            ? `<ul class="criteria-list">${criteriaItems.map((c) => `<li>${c}</li>`).join("")}</ul>`
            : "<p class='muted-text'>No specific criteria defined.</p>";

        const docsHtml = scheme.requiredDocuments && scheme.requiredDocuments.length > 0
            ? `<ul class="docs-list">${scheme.requiredDocuments.map((d) => `<li>${d}</li>`).join("")}</ul>`
            : "<p class='muted-text'>No documents specified.</p>";

        const detailStatus = scheme.status || "Closed";

        document.querySelector(".detail-card").innerHTML = `
            <div class="scheme-header">
                <h2>${scheme.name}</h2>
                <span class="scheme-badge status-badge ${statusBadgeClass(detailStatus)}">${detailStatus}</span>
            </div>
            <span class="scheme-category">${scheme.category}</span>
            <p class="scheme-desc">${scheme.description || ""}</p>

            <div class="detail-grid">
                <div class="detail-section">
                    <h3>Benefit Amount</h3>
                    <p>${formatBenefit(scheme.benefitAmount)}</p>
                </div>
                <div class="detail-section">
                    <h3>Application Deadline</h3>
                    <p>${formatDeadline(scheme.applicationDeadline)}</p>
                </div>
            </div>

            <div class="detail-section">
                <h3>Eligibility Criteria</h3>
                ${scheme.eligibilityCriteria ? `<p>${scheme.eligibilityCriteria}</p>` : ""}
                ${criteriaHtml}
            </div>

            <div class="detail-section">
                <h3>Required Documents</h3>
                ${docsHtml}
            </div>
        `;
    } catch (error) {
        document.querySelector(".detail-card").innerHTML = `<p class='muted-text error-text'>${error.message}</p>`;
    }
};

// ============================================================
// Easy to modify: office types (frontend)
// ============================================================
const OFFICE_TYPES = [
    "Welfare Office",
    "Union Digital Center",
    "Service Center"
];

const officeTypeOptions = () => {
    return OFFICE_TYPES.map(
        (type) => `<option value="${type}">${type}</option>`
    ).join("");
};

// ============================================================
// Offices page
// ============================================================
let officesMap = null;
let officesMarkers = [];
let allOffices = [];

const renderOffices = async () => {
    if (!(await requireAuth())) {
        return;
    }

    setPage(
        `
        <section class="page-title">
            <h1>Nearby Welfare Offices</h1>
            <p>Find welfare offices, union digital centers, and service centers near you.</p>
        </section>

        <section class="card filter-card">
            <div class="filter-row">
                <div class="form-row">
                    <label for="officeDivision">Division</label>
                    <input id="officeDivision" type="text" placeholder="e.g. Dhaka">
                </div>
                <div class="form-row">
                    <label for="officeDistrict">District</label>
                    <input id="officeDistrict" type="text" placeholder="e.g. Gazipur">
                </div>
                <div class="form-row">
                    <label for="officeType">Office Type</label>
                    <select id="officeType">
                        <option value="">All</option>
                        ${officeTypeOptions()}
                    </select>
                </div>
                <div class="form-row filter-action">
                    <label>&nbsp;</label>
                    <button class="button primary" id="filterOfficesBtn" type="button">Filter</button>
                </div>
            </div>
        </section>

        <section class="card map-card">
            <div id="officesMap" class="map-container">
                <p class="muted-text">Loading map...</p>
            </div>
            <div id="geoStatus" class="geo-status"></div>
        </section>

        <section class="card offices-card">
            <h2>Office Directory</h2>
            <div id="officesList">
                <p class="muted-text">Loading offices...</p>
            </div>
        </section>
        `,
        "offices"
    );

    document.getElementById("filterOfficesBtn").addEventListener("click", loadOffices);

    loadOffices();
    initMap();
};

const initMap = async () => {
    // Fetch Google Maps API key from server config
    let apiKey = "";

    try {
        const response = await fetch("/api/config/maps-key");
        const config = await response.json();
        apiKey = config.key || "";
    } catch (error) {
        // Key fetch failed, map won't load
    }

    const mapContainer = document.getElementById("officesMap");

    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
        mapContainer.innerHTML = "<p class='muted-text'>Google Maps API key not configured. Set GOOGLE_MAPS_API_KEY in .env to enable the map.</p>";
        return;
    }

    // Load Google Maps script
    if (!window.google || !window.google.maps) {
        await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=Function.prototype`;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Default center (Dhaka)
    const defaultCenter = { lat: 23.8103, lng: 90.4125 };

    officesMap = new google.maps.Map(mapContainer, {
        center: defaultCenter,
        zoom: 7
    });

    // Try geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                officesMap.setCenter(userPos);
                officesMap.setZoom(10);

                const statusEl = document.getElementById("geoStatus");
                if (statusEl) {
                    statusEl.textContent = `Location detected: ${userPos.lat.toFixed(4)}, ${userPos.lng.toFixed(4)}`;
                }

                // Load nearby offices
                loadNearbyOffices(userPos.lat, userPos.lng);
            },
            () => {
                const statusEl = document.getElementById("geoStatus");
                if (statusEl) {
                    statusEl.textContent = "Location access denied. Showing all offices.";
                }
            }
        );
    }
};

const loadNearbyOffices = async (lat, lng) => {
    try {
        const result = await apiRequest(`/api/offices/nearby?latitude=${lat}&longitude=${lng}`);
        allOffices = result.data.offices;
        renderOfficesList(allOffices);
        renderMapMarkers(allOffices);
    } catch (error) {
        // Nearby failed, regular list should still work
    }
};

const loadOffices = async () => {
    const container = document.getElementById("officesList");

    if (!container) {
        return;
    }

    container.innerHTML = "<p class='muted-text'>Loading offices...</p>";

    const division = document.getElementById("officeDivision").value.trim();
    const district = document.getElementById("officeDistrict").value.trim();
    const officeType = document.getElementById("officeType").value;

    let url = "/api/offices?";
    if (division) url += `division=${encodeURIComponent(division)}&`;
    if (district) url += `district=${encodeURIComponent(district)}&`;
    if (officeType) url += `officeType=${encodeURIComponent(officeType)}&`;

    try {
        const result = await apiRequest(url);
        allOffices = result.data.offices;

        if (!allOffices || allOffices.length === 0) {
            container.innerHTML = "<p class='muted-text'>No offices found.</p>";
            clearMarkers();
            return;
        }

        renderOfficesList(allOffices);
        renderMapMarkers(allOffices);
    } catch (error) {
        container.innerHTML = `<p class='muted-text error-text'>${error.message}</p>`;
    }
};

const renderOfficesList = (offices) => {
    const container = document.getElementById("officesList");

    if (!container) {
        return;
    }

    container.innerHTML = offices.map((office) => `
        <div class="office-item">
            <div class="office-header">
                <h3>${office.name}</h3>
                <span class="office-type-badge">${office.officeType}</span>
            </div>
            <p class="office-address">${office.address}, ${office.district}, ${office.division}</p>
            <div class="office-meta">
                <span>Phone: ${office.contactNumber}</span>
                <span>Hours: ${office.operatingHours}</span>
                ${office.distance !== undefined ? `<span>Distance: ${office.distance} km</span>` : ""}
            </div>
            <p class="office-services">Services: ${office.services.join(", ")}</p>
            <div class="office-actions">
                <button class="button secondary" type="button" data-map-id="${office._id}">View on Map</button>
                <a class="button secondary" href="https://www.google.com/maps/dir/${office.latitude},${office.longitude}" target="_blank" rel="noopener">Get Directions</a>
            </div>
        </div>
    `).join("");

    container.querySelectorAll("[data-map-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
            focusOfficeOnMap(btn.getAttribute("data-map-id"));
        });
    });
};

const renderMapMarkers = (offices) => {
    if (!officesMap || !window.google || !window.google.maps) {
        return;
    }

    clearMarkers();

    const bounds = new google.maps.LatLngBounds();

    offices.forEach((office) => {
        const position = { lat: office.latitude, lng: office.longitude };

        const marker = new google.maps.Marker({
            position,
            map: officesMap,
            title: office.name
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="font-size:13px;min-width:180px;">
                    <strong>${office.name}</strong><br>
                    <em>${office.officeType}</em><br>
                    ${office.address}<br>
                    Phone: ${office.contactNumber}
                </div>
            `
        });

        marker.addListener("click", () => {
            infoWindow.open(officesMap, marker);
        });

        officesMarkers.push(marker);
        bounds.extend(position);
    });

    if (offices.length > 0) {
        officesMap.fitBounds(bounds);
    }
};

const clearMarkers = () => {
    officesMarkers.forEach((marker) => marker.setMap(null));
    officesMarkers = [];
};

const focusOfficeOnMap = (officeId) => {
    const office = allOffices.find((o) => o._id === officeId);

    if (!office || !officesMap) {
        return;
    }

    officesMap.setCenter({ lat: office.latitude, lng: office.longitude });
    officesMap.setZoom(15);

    // Find and click the marker
    const markerIndex = allOffices.indexOf(office);
    if (markerIndex >= 0 && officesMarkers[markerIndex]) {
        google.maps.event.trigger(officesMarkers[markerIndex], "click");
    }
};


const logout = async () => {
    try {
        await apiRequest("/api/auth/logout", {
            method: "POST"
        });
    } catch (error) {
        // JWT logout is stateless.
    }

    clearToken();
    currentUser = null;
    navigate(routes.login);
};

const render = async () => {
    const path = window.location.pathname;

    if (path === routes.register) {
        renderRegister();
        return;
    }

    if (path === routes.staff) {
        await renderStaffManagement();
        return;
    }

    if (path === routes.finance) {
        await renderFinanceDashboard();
        return;
    }

    if (path === routes.dashboard) {
        await renderDashboard();
        return;
    }

    if (path === routes.eligibility) {
        await renderEligibility();
        return;
    }

    if (path === routes.documents) {
        await renderDocuments();
        return;
    }

    if (path === routes.schemes) {
        await renderSchemes();
        return;
    }

    if (path.startsWith("/schemes/")) {
        await renderSchemeDetail();
        return;
    }

    if (path === routes.offices) {
        await renderOffices();
        return;
    }

    if (path === routes.consoleBeneficiaries) {
        await renderConsoleBeneficiaries();
        return;
    }

    if (path === routes.consoleAnalytics) {
        await renderConsoleAnalytics();
        return;
    }

    if (path === routes.consoleAuditLog) {
        await renderConsoleAuditLog();
        return;
    }

    if (path === routes.consoleCirculars) {
        await renderConsoleCirculars();
        return;
    }

    if (path === routes.console) {
        navigate(routes.consoleBeneficiaries);
        return;
    }

    if (path === routes.schemeStudio) {
        await renderSchemeStudio();

        return;
    }

    renderLogin();
};

window.addEventListener("popstate", render);
render();




