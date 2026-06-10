const ADMIN_SESSION_KEY = "reverbThreadsAdminSession";
const ADMIN_CREDENTIALS_KEY = "reverbThreadsAdminCredentials";
const BLOCKED_KEYS = new Set(["__proto__", "prototype", "constructor"]);

const textFieldMap = [
    { key: "nav.home", label: "Nav: Home" },
    { key: "nav.portfolio", label: "Nav: Portfolio" },
    { key: "nav.about", label: "Nav: About" },
    { key: "nav.contact", label: "Nav: Contact" },
    { key: "home.title", label: "Home Title" },
    { key: "home.intro", label: "Home Intro" },
    { key: "home.tagline", label: "Home Tagline" },
    { key: "home.cta", label: "Home Button" },
    { key: "portfolio.title", label: "Portfolio Title" },
    { key: "portfolio.intro", label: "Portfolio Intro" },
    { key: "portfolio.soldLabel", label: "Portfolio SOLD Label" },
    { key: "portfolio.productCta", label: "Portfolio Product Link Label" },
    { key: "about.title", label: "About Title" },
    { key: "about.highlight", label: "About Highlight" },
    { key: "about.section1Title", label: "About Section 1 Title" },
    { key: "about.section1Text", label: "About Section 1 Text" },
    { key: "about.section1Caption", label: "About Section 1 Caption" },
    { key: "about.section2Title", label: "About Section 2 Title" },
    { key: "about.section2Text", label: "About Section 2 Text" },
    { key: "about.section2Caption", label: "About Section 2 Caption" },
    { key: "contact.title", label: "Contact Title" },
    { key: "contact.intro", label: "Contact Intro" },
    { key: "contact.emailLabel", label: "Contact Email Label" },
    { key: "contact.emailValue", label: "Contact Email Value" },
    { key: "contact.instagramLabel", label: "Contact Instagram Label" },
    { key: "contact.instagramValue", label: "Contact Instagram Value" },
    { key: "contact.button", label: "Contact Button Text" },
    { key: "contact.quote", label: "Contact Quote" },
    { key: "footer.copyright", label: "Footer Copyright" }
];

const loginView = document.getElementById("login-view");
const editorView = document.getElementById("editor-view");
const textFieldsRoot = document.getElementById("text-fields");
const productsFieldsRoot = document.getElementById("products-fields");
const loginStatus = document.getElementById("login-status");
const editorStatus = document.getElementById("editor-status");

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function getByPath(obj, path) {
    return path.split(".").reduce((acc, chunk) => {
        if (BLOCKED_KEYS.has(chunk)) {
            return "";
        }
        return acc ? acc[chunk] : "";
    }, obj);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

async function hashValue(value) {
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getCredentials() {
    try {
        const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
        if (!stored) {
            return null;
        }
        const credentials = JSON.parse(stored);
        if (!credentials.username || !credentials.passwordHash) {
            return null;
        }
        return credentials;
    } catch (error) {
        return null;
    }
}

async function saveCredentials(username, password) {
    const passwordHash = await hashValue(password);
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify({ username, passwordHash }));
}

const textFieldSetters = {
    "nav.home": (texts, value) => { texts.nav.home = value; },
    "nav.portfolio": (texts, value) => { texts.nav.portfolio = value; },
    "nav.about": (texts, value) => { texts.nav.about = value; },
    "nav.contact": (texts, value) => { texts.nav.contact = value; },
    "home.title": (texts, value) => { texts.home.title = value; },
    "home.intro": (texts, value) => { texts.home.intro = value; },
    "home.tagline": (texts, value) => { texts.home.tagline = value; },
    "home.cta": (texts, value) => { texts.home.cta = value; },
    "portfolio.title": (texts, value) => { texts.portfolio.title = value; },
    "portfolio.intro": (texts, value) => { texts.portfolio.intro = value; },
    "portfolio.soldLabel": (texts, value) => { texts.portfolio.soldLabel = value; },
    "portfolio.productCta": (texts, value) => { texts.portfolio.productCta = value; },
    "about.title": (texts, value) => { texts.about.title = value; },
    "about.highlight": (texts, value) => { texts.about.highlight = value; },
    "about.section1Title": (texts, value) => { texts.about.section1Title = value; },
    "about.section1Text": (texts, value) => { texts.about.section1Text = value; },
    "about.section1Caption": (texts, value) => { texts.about.section1Caption = value; },
    "about.section2Title": (texts, value) => { texts.about.section2Title = value; },
    "about.section2Text": (texts, value) => { texts.about.section2Text = value; },
    "about.section2Caption": (texts, value) => { texts.about.section2Caption = value; },
    "contact.title": (texts, value) => { texts.contact.title = value; },
    "contact.intro": (texts, value) => { texts.contact.intro = value; },
    "contact.emailLabel": (texts, value) => { texts.contact.emailLabel = value; },
    "contact.emailValue": (texts, value) => { texts.contact.emailValue = value; },
    "contact.instagramLabel": (texts, value) => { texts.contact.instagramLabel = value; },
    "contact.instagramValue": (texts, value) => { texts.contact.instagramValue = value; },
    "contact.button": (texts, value) => { texts.contact.button = value; },
    "contact.quote": (texts, value) => { texts.contact.quote = value; },
    "footer.copyright": (texts, value) => { texts.footer.copyright = value; }
};

function setLoggedIn(value) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, value ? "1" : "0");
}

function isLoggedIn() {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

function showEditor() {
    loginView.classList.add("hidden");
    editorView.classList.remove("hidden");
}

function showLogin() {
    editorView.classList.add("hidden");
    loginView.classList.remove("hidden");
}

function buildTextFields(content) {
    textFieldsRoot.innerHTML = "";
    textFieldMap.forEach((field) => {
        const wrapper = document.createElement("label");
        wrapper.className = "admin-field";
        wrapper.innerHTML = `<span>${field.label}</span>`;

        const input = document.createElement("textarea");
        input.dataset.fieldPath = field.key;
        input.value = getByPath(content.texts, field.key) || "";
        wrapper.appendChild(input);
        textFieldsRoot.appendChild(wrapper);
    });
}

function productTemplate(product, index) {
    return `
        <div class="product-card" data-product-index="${index}">
            <div class="admin-grid">
                <label class="admin-field">Title<input data-product-field="title" value="${escapeHtml(product.title || "")}"></label>
                <label class="admin-field">Image URL<input data-product-field="image" value="${escapeHtml(product.image || "")}"></label>
                <label class="admin-field">Price<input data-product-field="price" value="${escapeHtml(product.price || "")}"></label>
                <label class="admin-field">Status
                    <select data-product-field="status">
                        <option value="Available" ${product.status === "Available" ? "selected" : ""}>Available</option>
                        <option value="SOLD" ${product.status === "SOLD" ? "selected" : ""}>SOLD</option>
                    </select>
                </label>
                <label class="admin-field" style="grid-column: 1 / -1;">Description<textarea data-product-field="description">${escapeHtml(product.description || "")}</textarea></label>
            </div>
            <div class="admin-actions">
                <button type="button" class="admin-btn secondary" data-remove-product="${Number(index)}">Remove Product</button>
            </div>
        </div>
    `;
}

function buildProductsFields(content) {
    let htmlOutput = "";
    content.products.forEach((product, index) => {
        htmlOutput += productTemplate(product, index);
    });
    productsFieldsRoot.innerHTML = htmlOutput;

    productsFieldsRoot.querySelectorAll("[data-remove-product]").forEach((button) => {
        button.addEventListener("click", () => {
            const idx = Number(button.dataset.removeProduct);
            const current = window.ReverbThreadsContent.getAll();
            current.products.splice(idx, 1);
            window.ReverbThreadsContent.saveAll(current);
            renderEditor();
            editorStatus.textContent = "Product removed.";
        });
    });
}

function renderEditor() {
    const content = window.ReverbThreadsContent.getAll();
    buildTextFields(content);
    buildProductsFields(content);
}

function collectFormData() {
    const next = deepClone(window.ReverbThreadsContent.defaults);
    const existing = window.ReverbThreadsContent.getAll();
    next.products = [];

    document.querySelectorAll("[data-field-path]").forEach((field) => {
        const setter = textFieldSetters[field.dataset.fieldPath];
        if (setter) {
            setter(next.texts, field.value.trim());
        }
    });

    const productCards = productsFieldsRoot.querySelectorAll("[data-product-index]");
    productCards.forEach((card) => {
        const product = {
            title: card.querySelector('[data-product-field="title"]').value.trim(),
            image: card.querySelector('[data-product-field="image"]').value.trim(),
            description: card.querySelector('[data-product-field="description"]').value.trim(),
            price: card.querySelector('[data-product-field="price"]').value.trim(),
            status: card.querySelector('[data-product-field="status"]').value
        };
        if (product.title || product.description || product.price || product.image) {
            next.products.push(product);
        }
    });

    if (next.products.length === 0) {
        next.products = existing.products.length ? existing.products : deepClone(window.ReverbThreadsContent.defaults.products);
    }
    return next;
}

document.getElementById("login-btn").addEventListener("click", async () => {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    if (!username || !password) {
        loginStatus.textContent = "Enter username and password.";
        return;
    }

    const credentials = getCredentials();
    if (!credentials) {
        await saveCredentials(username, password);
        setLoggedIn(true);
        loginStatus.textContent = "";
        showEditor();
        renderEditor();
        return;
    }

    const passwordHash = await hashValue(password);
    if (username === credentials.username && passwordHash === credentials.passwordHash) {
        setLoggedIn(true);
        loginStatus.textContent = "";
        showEditor();
        renderEditor();
        return;
    }
    loginStatus.textContent = "Invalid login info.";
});

document.getElementById("save-btn").addEventListener("click", () => {
    const content = collectFormData();
    window.ReverbThreadsContent.saveAll(content);
    editorStatus.textContent = "Saved. Refresh public pages to see updates.";
});

document.getElementById("reset-btn").addEventListener("click", () => {
    const allowReset = window.confirm("Reset all texts and products to default values?");
    if (!allowReset) {
        return;
    }
    window.ReverbThreadsContent.reset();
    renderEditor();
    editorStatus.textContent = "Defaults restored.";
});

document.getElementById("add-product-btn").addEventListener("click", () => {
    const current = window.ReverbThreadsContent.getAll();
    current.products.push({
        title: "",
        image: "",
        description: "",
        price: "",
        status: "Available"
    });
    window.ReverbThreadsContent.saveAll(current);
    renderEditor();
    editorStatus.textContent = "New product row added.";
});

document.getElementById("logout-btn").addEventListener("click", () => {
    setLoggedIn(false);
    showLogin();
    editorStatus.textContent = "";
});

if (isLoggedIn()) {
    showEditor();
    renderEditor();
} else {
    showLogin();
    if (!getCredentials()) {
        loginStatus.textContent = "First login sets your admin username and password.";
    }
}
