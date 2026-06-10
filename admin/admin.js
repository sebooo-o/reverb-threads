const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "reverb123";
const ADMIN_SESSION_KEY = "reverbThreadsAdminSession";

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
    return path.split(".").reduce((acc, chunk) => (acc ? acc[chunk] : ""), obj);
}

function setByPath(obj, path, value) {
    const chunks = path.split(".");
    let cursor = obj;
    for (let i = 0; i < chunks.length - 1; i += 1) {
        const key = chunks[i];
        if (!cursor[key] || typeof cursor[key] !== "object") {
            cursor[key] = {};
        }
        cursor = cursor[key];
    }
    cursor[chunks[chunks.length - 1]] = value;
}

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
                <label class="admin-field">Title<input data-product-field="title" value="${product.title || ""}"></label>
                <label class="admin-field">Image URL<input data-product-field="image" value="${product.image || ""}"></label>
                <label class="admin-field">Price<input data-product-field="price" value="${product.price || ""}"></label>
                <label class="admin-field">Status
                    <select data-product-field="status">
                        <option value="Available" ${product.status === "Available" ? "selected" : ""}>Available</option>
                        <option value="SOLD" ${product.status === "SOLD" ? "selected" : ""}>SOLD</option>
                    </select>
                </label>
                <label class="admin-field" style="grid-column: 1 / -1;">Description<textarea data-product-field="description">${product.description || ""}</textarea></label>
            </div>
            <div class="admin-actions">
                <button type="button" class="admin-btn secondary" data-remove-product="${index}">Remove Product</button>
            </div>
        </div>
    `;
}

function buildProductsFields(content) {
    productsFieldsRoot.innerHTML = "";
    content.products.forEach((product, index) => {
        productsFieldsRoot.innerHTML += productTemplate(product, index);
    });

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
        setByPath(next.texts, field.dataset.fieldPath, field.value.trim());
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

document.getElementById("login-btn").addEventListener("click", () => {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
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
}
