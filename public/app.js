const app = document.getElementById("app");
const TOKEN_KEY = "schemeconnectToken";

const loadStripeConfig = async () => {
    if (window.__SCHEMECONNECT_STRIPE_PUBLISHABLE_KEY) {
        return window.__SCHEMECONNECT_STRIPE_PUBLISHABLE_KEY;
    }

    try {
        const result = await apiRequest("/api/config");
        window.__SCHEMECONNECT_STRIPE_PUBLISHABLE_KEY = result.data.stripePublishableKey;
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
    schemeStudio: "/scheme-studio",
    staff: "/staff",
    finance: "/finance"
};

let currentUser = null;

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
        const error = new Error(result.message || "Something went wrong.");
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

                                ${
                                    currentUser
                                        ? `
                                            ${currentUser.role === "Administrator" ? `<a href="/staff" data-link class="${activePage === "staff" ? "active" : ""}">Staff Management</a>` : ""}
                                            <a href="/finance" data-link class="${activePage === "finance" ? "active" : ""}">Finance Dashboard</a>
                                            <a href="/scheme-studio" data-link class="${activePage === "scheme-studio" ? "active" : ""}">Scheme Studio</a>
                                        `
                                        : ""
                                }

                                <span aria-disabled="true">Offices</span>
                            </nav>

                            <div class="user-area">
                                ${
                                    currentUser
                                        ? `
                                            <span>${currentUser.fullName} · ${currentUser.role}</span>
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

//  here changes by mahima //

// const requireAuth = async () => {
//     const user = await loadCurrentUser();

//     if (!user || user.role !== "Citizen") {
//         navigate(routes.login);
//         return false;
//     }

//     return true;
// };

const requireAuth = async (allowedRoles = ["Citizen", "Administrator", "Finance Officer", "Verification Officer", "Auditor"]) => {
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

            navigate(routes.staff);
            return;
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
    if (!(await requireAuth(["Citizen", "Administrator", "Finance Officer", "Verification Officer", "Auditor"]))) {
        return;
    }

    setPage(
        `
        <section class="page-title">
            <h1>${currentUser.role === "Administrator" ? "Admin Dashboard" : currentUser.role === "Finance Officer" ? "Finance Dashboard" : "Citizen Dashboard"}</h1>
            <p>Welcome, ${currentUser.fullName}. Manage your SchemeConnect account.</p>
        </section>

        <section class="dashboard-grid">
            <div class="card summary-card">
                <h2>Account Information</h2>
                <p>${currentUser.email}</p>
                <p>${currentUser.role}</p>
                <p>${currentUser.division}, ${currentUser.district}</p>
            </div>

            <div class="card summary-card">
                <h2>Available Services</h2>
                <p>${currentUser.role === "Administrator" ? "Staff management, scheme control, and oversight are available." : currentUser.role === "Finance Officer" ? "Financial disbursement and budget monitoring are available." : "Your citizen services will appear here as features are completed."}</p>
            </div>
        </section>
        `,
        "dashboard"
    );
};

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
                <div id="staffList"><p class="empty-note">Loading staff…</p></div>
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
    if (!(await requireAuth())) {
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
                    <tr><td colspan="6" class="empty-note">Loading ledger…</td></tr>
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



// =========================
// SCHEME CONFIGURATION STUDIO  (Module 1, Feature 3)
// =========================

const schemeStudioRoles = ["Administrator", "Finance Officer", "Auditor"];

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
                    <p class="budget-meta">Loading budget…</p>
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
                <td>${transaction.scheme ? transaction.scheme.name : "—"}</td>
                <td>${transaction.beneficiaryName}</td>
                <td>${formatMoney(transaction.amount)}</td>
                <td class="mono">${transaction.gatewayReference || "—"}</td>
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

    receiptContent.innerHTML = "<p class=\"empty-note\">Loading receipt…</p>";
    modal.classList.remove("hidden");

    try {
        const result = await apiRequest(`/api/transactions/${transactionId}`);
        const transaction = result.data.transaction;
        const amount = Number(transaction.amount || 0);
        const schemeName = transaction.scheme ? transaction.scheme.name : "—";
        const createdAt = transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : "—";

        receiptContent.innerHTML = `
            <div class="receipt-card">
                <div class="receipt-brand">
                    <h4>SchemeConnect</h4>
                    <span>Disbursement Receipt</span>
                </div>
                <div class="receipt-grid">
                    <div><strong>Beneficiary</strong><span>${transaction.beneficiaryName || "—"}</span></div>
                    <div><strong>Phone</strong><span>${transaction.beneficiaryPhone || "—"}</span></div>
                    <div><strong>Scheme</strong><span>${schemeName}</span></div>
                    <div><strong>Amount</strong><span>${formatMoney(amount)}</span></div>
                    <div><strong>Reference</strong><span class="mono">${transaction.gatewayReference || "—"}</span></div>
                    <div><strong>Status</strong><span class="badge badge-${transaction.status.toLowerCase()}">${transaction.status}</span></div>
                    <div><strong>Date</strong><span>${createdAt}</span></div>
                    <div><strong>Payment Gateway</strong><span>${transaction.paymentGateway || "—"}</span></div>
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
        <h2>Disburse Funds — ${selectedScheme.name}</h2>
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
                messageBox.textContent = `${result.message}${transaction.gatewayReference ? " — Ref: " + transaction.gatewayReference : ""}`;
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
                messageBox.textContent = `${confirmation.message} — Ref: ${confirmation.data.transaction.gatewayReference}`;
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
                messageBox.textContent = `${error.result.message} — Failed transaction recorded.`;
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
    if (!(await requireAuth())) {
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
                <div id="schemeList"><p class="empty-note">Loading schemes…</p></div>
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
                    <tr><td colspan="6" class="empty-note">Loading ledger…</td></tr>
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



// const render = async () => {
//     const path = window.location.pathname;

//     if (path === routes.register) {
//         renderRegister();
//         return;
//     }

//     if (path === routes.dashboard) {
//         await renderDashboard();
//         return;
//     }

//     renderLogin();
// };


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

    if (path === routes.schemeStudio) {
        await renderSchemeStudio();
        return;
    }

    renderLogin();
};


window.addEventListener("popstate", render);
render();
