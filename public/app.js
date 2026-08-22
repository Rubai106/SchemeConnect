const app = document.getElementById("app");
const TOKEN_KEY = "schemeconnectToken";

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const routes = {
    login: "/login",
    register: "/register",
    dashboard: "/dashboard",
    eligibility: "/eligibility",
    // Added for the Administrator console (Member 4's four features)
    console: "/console",
    consoleBeneficiaries: "/console/beneficiaries",
    consoleAnalytics: "/console/analytics",
    consoleAuditLog: "/console/audit-log",
    consoleCirculars: "/console/circulars"
};

let currentUser = null;

// Display-only label — the actual stored/compared role stays "Administrator"
// everywhere (JWT, database, ROLES constant); this just controls what text
// shows up in the UI.
const roleDisplayLabel = (role) => (role === "Administrator" ? "Govt. Administrator" : role);

const apiRequest = async (url, options = {}) => {
    const headers = {
        "Content-Type": "application/json",
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
        throw new Error(result.message || "Something went wrong.");
    }

    return result;
};

const navigate = (path) => {
    window.history.pushState({}, "", path);
    render();
};

const setPage = (content, activePage = "") => {
    const isAuthPage = activePage === "login" || activePage === "register";
    const isConsolePage = activePage.startsWith("console");

    app.innerHTML = `
        <header class="topbar">
            <div class="topbar-inner">
                <div class="brand">
                    <span class="brand-mark"></span>
                    <div>
                        SchemeConnect
                        <small>${isConsolePage ? "Govt. Administrator Console" : "Citizen Welfare Portal"}</small>
                    </div>
                </div>

                ${
                    isAuthPage
                        ? `
                            <nav class="nav auth-nav" aria-label="Authentication navigation">
                                <a href="/login" data-link class="${activePage === "login" ? "active" : ""}">Login</a>
                                <a href="/register" data-link class="${activePage === "register" ? "active" : ""}">Register</a>
                            </nav>
                        `
                        : isConsolePage
                        ? `
                            <nav class="nav" aria-label="Administrator navigation">
                                <a href="/console/beneficiaries" data-link class="${activePage === "consoleBeneficiaries" ? "active" : ""}">Beneficiary Records</a>
                                <a href="/console/analytics" data-link class="${activePage === "consoleAnalytics" ? "active" : ""}">Performance Intelligence</a>
                                <a href="/console/audit-log" data-link class="${activePage === "consoleAuditLog" ? "active" : ""}">Audit Log</a>
                                <a href="/console/circulars" data-link class="${activePage === "consoleCirculars" ? "active" : ""}">Circulars</a>
                            </nav>

                            <div class="user-area">
                                ${
                                    currentUser
                                        ? `
                                            <span>${currentUser.fullName} (${roleDisplayLabel(currentUser.role)})</span>
                                            <button class="logout-link" id="logoutButton" type="button">Logout</button>
                                        `
                                        : ""
                                }
                            </div>
                        `
                        : `
                            <nav class="nav" aria-label="Primary navigation">
                                <a href="/dashboard" data-link class="${activePage === "dashboard" ? "active" : ""}">Home</a>
                                <a href="/eligibility" data-link class="${activePage === "eligibility" ? "active" : ""}">Eligibility</a>
                                <span aria-disabled="true">Documents</span>
                                <span aria-disabled="true">Offices</span>
                            </nav>

                            <div class="user-area">
                                ${
                                    currentUser
                                        ? `
                                            <span>${currentUser.fullName}</span>
                                            <button class="logout-link" id="logoutButton" type="button">Logout</button>
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

const requireAuth = async () => {
    const user = await loadCurrentUser();

    if (!user || user.role !== "Citizen") {
        navigate(routes.login);
        return false;
    }

    return true;
};

// New: role-gate for the Administrator console, kept separate from
// requireAuth() above so Citizen pages (dashboard, eligibility) are
// untouched. Pass an array of role strings that should be let through -
// anyone else gets redirected to /login.
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

            // Route by role: Administrators (and other staff roles) land in
            // the console, Citizens go to the existing citizen dashboard.
            if (currentUser.role === "Citizen") {
                navigate(routes.dashboard);
            } else {
                navigate(routes.consoleBeneficiaries);
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

    setPage(
        `
        <section class="page-title">
            <h1>Citizen Dashboard</h1>
            <p>Welcome, ${currentUser.fullName}. Manage your available services.</p>
        </section>

        <section class="dashboard-grid">
            <div class="card summary-card">
                <h2>Eligibility Profile</h2>
                <p>Create or update your household and income information for welfare eligibility checks.</p>
                <button class="button primary" id="openEligibility" type="button">Open Eligibility</button>
            </div>

            <div class="card summary-card">
                <h2>Account Information</h2>
                <p>${currentUser.email}</p>
                <p>${currentUser.division}, ${currentUser.district}</p>
            </div>
        </section>
        `,
        "dashboard"
    );

    document.getElementById("openEligibility").addEventListener("click", () => {
        navigate(routes.eligibility);
    });
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

const renderEligibility = async () => {
    if (!(await requireAuth())) {
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

// ===========================================================================
// ADMINISTRATOR CONSOLE — Member 4's four features
// Beneficiary Lifecycle Management / Welfare Performance Intelligence /
// Governance Audit Center / Official Circular Synchronization
// ===========================================================================

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

// --- Beneficiary Records -----------------------------------------------

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

    // Click outside the modal box (on the dark backdrop itself) also closes it
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
            await loadBeneficiaries();
        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
            button.textContent = "Save Changes";
        }
    });
            await loadBeneficiaries();
        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
            button.textContent = "Save Beneficiary";
        }
    });

    await loadBeneficiaries();
};

// --- Welfare Performance Intelligence -----------------------------------

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
        // non-fatal, leave as "-"
    }

    try {
        const regions = await apiRequest("/api/analytics/region-distribution");
        document.getElementById("regionRows").innerHTML =
            regions.data.map((r) => `<tr><td>${r.region}</td><td>${r.totalBeneficiaries}</td></tr>`).join("") ||
            `<tr><td colspan="2">No data yet.</td></tr>`;
    } catch (error) {
        // non-fatal
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
        // non-fatal
    }

    try {
        const popularity = await apiRequest("/api/analytics/scheme-popularity");
        document.getElementById("popularityRows").innerHTML =
            popularity.data
                .map((p) => `<tr><td>${p.schemeName || "-"}</td><td>${p.applicationCount}</td></tr>`)
                .join("") || `<tr><td colspan="2">No applications yet.</td></tr>`;
    } catch (error) {
        // non-fatal
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

            // Your backend's getDashboard only returns totalApplications,
            // approved, rejected, pending, and the raw applications array —
            // not approvalRate/rejectionRate/districtDistribution. Computing
            // them here instead of assuming the backend provides them.
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

// --- Governance Audit Center ---------------------------------------------

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
                                <td>${log.performedBy}</td>
                                <td>${log.role}</td>
                                <td>${log.targetType || ""}${log.targetId ? " · " + log.targetId : ""}</td>
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

// --- Official Circular Synchronization -----------------------------------

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

    if (path === routes.dashboard) {
        await renderDashboard();
        return;
    }

    if (path === routes.eligibility) {
        await renderEligibility();
        return;
    }

    // Administrator console routes
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

    renderLogin();
};

window.addEventListener("popstate", render);
render();