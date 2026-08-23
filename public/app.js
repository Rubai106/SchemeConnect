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
    documents: "/documents",
    schemes: "/schemes",
    offices: "/offices"
};

let currentUser = null;

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

    app.innerHTML = `
        <header class="topbar">
            <div class="topbar-inner">
                <div class="brand">
                    <span class="brand-mark"></span>
                    <div>
                        SchemeConnect
                        <small>Citizen Welfare Portal</small>
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
                        : `
                            <nav class="nav" aria-label="Primary navigation">
                                <a href="/dashboard" data-link class="${activePage === "dashboard" ? "active" : ""}">Home</a>
                                <a href="/eligibility" data-link class="${activePage === "eligibility" ? "active" : ""}">Eligibility</a>
                                <a href="/documents" data-link class="${activePage === "documents" ? "active" : ""}">Documents</a>
                                <a href="/schemes" data-link class="${activePage === "schemes" ? "active" : ""}">Schemes</a>
                                <a href="/offices" data-link class="${activePage === "offices" ? "active" : ""}">Offices</a>
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

const renderLogin = () => {
    currentUser = null;

    setPage(
        `
        <section class="page-title">
            <h1>Login</h1>
            <p>Access your SchemeConnect citizen account.</p>
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
            navigate(routes.dashboard);
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
                <h2>Document Vault</h2>
                <p>Upload and manage your welfare documents such as National ID, certificates, and records.</p>
                <button class="button primary" id="openDocuments" type="button">Open Documents</button>
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

    document.getElementById("openDocuments").addEventListener("click", () => {
        navigate(routes.documents);
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

// ============================================================
// Easy to modify: document types list
// ============================================================
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

            showMessage(errorMessage);
            return;
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        window.open(blobUrl, "_blank");

        // Revoke after the new tab has loaded the content
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (error) {
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

const categoryOptions = () => {
    return SCHEME_CATEGORIES.map(
        (cat) => `<option value="${cat}">${cat}</option>`
    ).join("");
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
                        ${categoryOptions()}
                    </select>
                </div>
                <div class="form-row">
                    <label for="schemeStatus">Status</label>
                    <select id="schemeStatus">
                        <option value="">All</option>
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
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

        renderSchemeCards(schemes);
    } catch (error) {
        container.innerHTML = `<p class='muted-text error-text'>${error.message}</p>`;
    }
};

const renderSchemeCards = (schemes) => {
    const container = document.getElementById("schemesList");

    if (!container) {
        return;
    }

    container.innerHTML = schemes.map((scheme) => `
        <div class="scheme-item">
            <div class="scheme-header">
                <h3>${scheme.name}</h3>
                <span class="scheme-badge status-badge status-${scheme.applicationStatus === "Open" ? "verified" : "rejected"}">${scheme.applicationStatus}</span>
            </div>
            <span class="scheme-category">${scheme.category}</span>
            <p class="scheme-desc">${scheme.description}</p>
            <div class="scheme-meta">
                <span>Benefit: <strong>৳${scheme.benefitAmount.toLocaleString()}</strong></span>
                <span>Deadline: <strong>${formatDate(scheme.applicationDeadline)}</strong></span>
            </div>
            <button class="button secondary scheme-detail-btn" type="button" data-scheme-id="${scheme._id}">View Details</button>
        </div>
    `).join("");

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

        container.innerHTML = data.schemes.map((scheme) => `
            <div class="recommended-item">
                <div class="scheme-header">
                    <h3>${scheme.name}</h3>
                    <span class="eligible-badge">You may be eligible</span>
                </div>
                <span class="scheme-category">${scheme.category}</span>
                <p class="scheme-desc">${scheme.description}</p>
                <div class="scheme-meta">
                    <span>Benefit: <strong>৳${scheme.benefitAmount.toLocaleString()}</strong></span>
                    <span>Deadline: <strong>${formatDate(scheme.applicationDeadline)}</strong></span>
                </div>
                <button class="button secondary scheme-detail-btn" type="button" data-scheme-id="${scheme._id}">View Details</button>
            </div>
        `).join("");

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

        const criteria = scheme.eligibilityCriteria || {};
        const criteriaItems = [];

        if (criteria.minimumIncome !== null && criteria.minimumIncome !== undefined) {
            criteriaItems.push(`Minimum income: ৳${criteria.minimumIncome.toLocaleString()}`);
        }
        if (criteria.maximumIncome !== null && criteria.maximumIncome !== undefined) {
            criteriaItems.push(`Maximum income: ৳${criteria.maximumIncome.toLocaleString()}`);
        }
        if (criteria.district && criteria.district.trim()) {
            criteriaItems.push(`District: ${criteria.district}`);
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

        document.querySelector(".detail-card").innerHTML = `
            <div class="scheme-header">
                <h2>${scheme.name}</h2>
                <span class="scheme-badge status-badge status-${scheme.applicationStatus === "Open" ? "verified" : "rejected"}">${scheme.applicationStatus}</span>
            </div>
            <span class="scheme-category">${scheme.category}</span>
            <p class="scheme-desc">${scheme.description}</p>

            <div class="detail-grid">
                <div class="detail-section">
                    <h3>Benefit Amount</h3>
                    <p>৳${scheme.benefitAmount.toLocaleString()}</p>
                </div>
                <div class="detail-section">
                    <h3>Application Deadline</h3>
                    <p>${formatDate(scheme.applicationDeadline)}</p>
                </div>
            </div>

            <div class="detail-section">
                <h3>Eligibility Criteria</h3>
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

    renderLogin();
};

window.addEventListener("popstate", render);
render();
