const app = document.getElementById("app");
const TOKEN_KEY = "schemeconnectToken";

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const routes = {
    login: "/login",
    register: "/register",
    dashboard: "/dashboard"
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
            <p>Welcome, ${currentUser.fullName}. Manage your SchemeConnect account.</p>
        </section>

        <section class="dashboard-grid">
            <div class="card summary-card">
                <h2>Account Information</h2>
                <p>${currentUser.email}</p>
                <p>${currentUser.division}, ${currentUser.district}</p>
            </div>

            <div class="card summary-card">
                <h2>Available Services</h2>
                <p>Your citizen services will appear here as features are completed.</p>
            </div>
        </section>
        `,
        "dashboard"
    );
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

    renderLogin();
};

window.addEventListener("popstate", render);
render();
