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
    documents: "/documents"
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

    renderLogin();
};

window.addEventListener("popstate", render);
render();
