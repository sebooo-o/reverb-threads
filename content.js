const REVERB_STORAGE_KEY = "reverbThreadsAdminContent";

const DEFAULT_SITE_CONTENT = {
    texts: {
        nav: {
            home: "Home",
            portfolio: "The Stash",
            about: "Story",
            contact: "Signal"
        },
        home: {
            title: "Od Retra po Psychadéliu\nUpcycled in Slovakia.",
            intro: "Jedinečné kúsky ktoré kombinujú farby a vzory pre originálny štýl. Každý kúsok je starostlivo vyrobený z vintage a second-hand materiálov, čím prináša nový život zabudnutým textíliám.",
            tagline: "Jedna ihla, jeden stroj, nekonečno možností.",
            cta: "NAHLIADNI DO STASHU"
        },
        portfolio: {
            title: "Current Collection",
            intro: "Unique 1-of-1 items sourced from Slovak thrift shops.",
            soldLabel: "SOLD",
            productCta: "I want this"
        },
        about: {
            title: "Príbeh Reverb Threads",
            highlight: "Jedna ihla, jeden stroj, nekonečno možností.",
            section1Title: "Stará látka, nový život.",
            section1Text: "Mojou ideou je nielen tvoriť jedinečné kúsky ale dať život materiálu ktorý by inak skončil na zabudnutý.\n\nOkrem šetrenia životného prostredia je prínosom aj vintage estetika a farebná smršť ktorá vznikne kombináciou rôznych vzorov a textúr.",
            section1Caption: "Detail prvej upcyklovanej bundy.",
            section2Title: "Začiatky priamo u mňa doma.",
            section2Text: "Láska ku kreativite cítim v každej oblasti svojho života a práve ona ma priviedla k šitiu.\n\nVšetko to začalo s malým ručným šijacím strojom ktorý nevedel poriadne ani udržať látku pokope a setom vyšívacích ihiel. Tieto jednoduché nástroje mi ukázali že každý kus látky má potenciál stať sa niečím novým a jedinečným. Dnes tvorím na spoľahlivom Singer 4432 ktorý zvládne aj priadne materiály a dokáže vytvoriť spoľahlivé každodenné a najmä jedinečné kúsky pre každého.",
            section2Caption: "Naše srdce: Singer 4432."
        },
        contact: {
            title: "Send a Signal",
            intro: "Interested in a custom piece or have a question about shipping from Trnava?",
            emailLabel: "Email:",
            emailValue: "hello@reverbthreads.sk",
            instagramLabel: "Instagram:",
            instagramValue: "@reverb.threads",
            button: "SEND EMAIL",
            quote: "\"Turn on, tune in, drop out... and sew.\""
        },
        footer: {
            copyright: "© 2025 Reverb Threads. Trnava, Slovakia."
        }
    },
    products: [
        {
            title: "The Festival Vest #001",
            image: "https://via.placeholder.com/400x500/D35400/FFFFFF?text=Festival+Vest",
            description: "Upcycled denim with hand-embroidered mushrooms. Raw hems.",
            price: "€55.00",
            status: "Available"
        },
        {
            title: "LP Vinyl Tote",
            image: "https://via.placeholder.com/400x500/5D6D7E/FFFFFF?text=Vinyl+Tote",
            description: "Vintage floral curtain fabric. Fits 5 records comfortably.",
            price: "€35.00",
            status: "Available"
        },
        {
            title: "Stash Roll",
            image: "https://via.placeholder.com/400x500/8E44AD/FFFFFF?text=Stash+Roll",
            description: "For crochet hooks or pencils. Corduroy & Tie closure.",
            price: "€20.00",
            status: "SOLD"
        }
    ]
};

function cloneContent(value) {
    return JSON.parse(JSON.stringify(value));
}

function mergeObjects(defaultObject, overrideObject) {
    const merged = Array.isArray(defaultObject) ? [] : {};
    Object.keys(defaultObject).forEach((key) => {
        const defaultValue = defaultObject[key];
        const overrideValue = overrideObject ? overrideObject[key] : undefined;

        if (defaultValue && typeof defaultValue === "object" && !Array.isArray(defaultValue)) {
            merged[key] = mergeObjects(defaultValue, overrideValue || {});
            return;
        }
        merged[key] = overrideValue === undefined ? defaultValue : overrideValue;
    });
    return merged;
}

function getStoredContent() {
    try {
        const stored = localStorage.getItem(REVERB_STORAGE_KEY);
        if (!stored) {
            return cloneContent(DEFAULT_SITE_CONTENT);
        }

        const parsed = JSON.parse(stored);
        return {
            texts: mergeObjects(cloneContent(DEFAULT_SITE_CONTENT.texts), parsed.texts || {}),
            products: Array.isArray(parsed.products) ? parsed.products : cloneContent(DEFAULT_SITE_CONTENT.products)
        };
    } catch (error) {
        return cloneContent(DEFAULT_SITE_CONTENT);
    }
}

function saveContent(content) {
    localStorage.setItem(REVERB_STORAGE_KEY, JSON.stringify(content));
}

function resetContent() {
    localStorage.setItem(REVERB_STORAGE_KEY, JSON.stringify(cloneContent(DEFAULT_SITE_CONTENT)));
}

window.ReverbThreadsContent = {
    storageKey: REVERB_STORAGE_KEY,
    defaults: cloneContent(DEFAULT_SITE_CONTENT),
    getAll: getStoredContent,
    getProducts: function getProducts() {
        return getStoredContent().products;
    },
    getTexts: function getTexts() {
        return getStoredContent().texts;
    },
    saveAll: saveContent,
    reset: resetContent
};
