// ==========================================
// HAXIC APPLICATION
// ==========================================

import { HAXIC_CONFIG } from "./core/config.js";

import { state } from "./core/state.js";

import {
    loadData,
    saveData,
    clearHaxicStorage
} from "./storage/storage.js";

import {
    startNewChat,
    getAllChats,
    generateChatTitle,
    renameChat
} from "./chat/chat.js";

import {
    addChatMessage,
    getChatMessages
} from "./chat/messages.js";
import { deleteChat } from "./storage/chats.js";

import {
    setStatus,
    setLoading,
    addMessage,
    clearMessages,
    hideWelcome,
    showWelcome
} from "./ui/ui.js";

import {
    getInput,
    clearInput,
    focusInput,
    handleInputKey
} from "./chat/input.js";

import {
    askAI
} from "./ai/ai.js";


// ==========================================
// ELEMENTS
// ==========================================

const askButton =
    document.getElementById("askButton");

const newChatButton =
    document.getElementById("newChatButton");

const sidebarToggle =
    document.getElementById("sidebarToggle");

const settingsButton =
    document.getElementById("settingsButton");

const settingsOverlay =
    document.getElementById("settingsOverlay");

const closeSettingsButton =
    document.getElementById("closeSettingsButton");

const themeSelect =
    document.getElementById("themeSelect");
const accentSelect = document.getElementById("accentSelect");
const textSizeSelect = document.getElementById("textSizeSelect");
const messageWidthSelect = document.getElementById("messageWidthSelect");
const cornerStyleSelect = document.getElementById("cornerStyleSelect");
const compactToggle = document.getElementById("compactToggle");

const clearDataButton =
    document.getElementById("clearDataButton");

const chatList =
    document.getElementById("chatList");

const questionInput =
    document.getElementById("questionInput");
const apiKeyInput = document.getElementById("apiKeyInput");
const toggleKeyButton = document.getElementById("toggleKeyButton");
const providerSelect = document.getElementById("providerSelect");
const apiKeyLabel = document.getElementById("apiKeyLabel");
const apiKeyHelp = document.getElementById("apiKeyHelp");
const getKeyLink = document.getElementById("getKeyLink");
const compatibleApiSettings = document.getElementById("compatibleApiSettings");
const apiBaseUrlInput = document.getElementById("apiBaseUrlInput");
const apiModelInput = document.getElementById("apiModelInput");
const webSearchButton = document.getElementById("webSearchButton");
const openWebsiteButton = document.getElementById("openWebsiteButton");
const chatbotEnabledToggle = document.getElementById("chatbotEnabledToggle");
const botFeatureNotice = document.getElementById("botFeatureNotice");


// ==========================================
// START HAXIC
// ==========================================

function startHaxic() {

    console.log(
        `${HAXIC_CONFIG.name} v${HAXIC_CONFIG.version} started.`
    );


    // Load settings

    state.settings =
        loadData(
            "settings",
            {
                theme:
                    HAXIC_CONFIG.defaultTheme
            }
        );


    // Load chats

    state.chats =
        getAllChats();


    // Apply theme selection

    if (themeSelect) {

        themeSelect.value =
            state.settings.theme;

    }
    document.documentElement.dataset.theme = state.settings.theme;
    document.documentElement.dataset.accent = state.settings.accent || "violet";
    document.documentElement.dataset.textSize = state.settings.textSize || "comfortable";
    document.documentElement.dataset.messageWidth = state.settings.messageWidth || "standard";
    document.documentElement.dataset.cornerStyle = state.settings.cornerStyle || "rounded";
    document.documentElement.classList.toggle("compact-messages", Boolean(state.settings.compactMessages));
    if (accentSelect) accentSelect.value = state.settings.accent || "violet";
    if (textSizeSelect) textSizeSelect.value = state.settings.textSize || "comfortable";
    if (messageWidthSelect) messageWidthSelect.value = state.settings.messageWidth || "standard";
    if (cornerStyleSelect) cornerStyleSelect.value = state.settings.cornerStyle || "rounded";
    if (compactToggle) compactToggle.checked = Boolean(state.settings.compactMessages);
    if (chatbotEnabledToggle) chatbotEnabledToggle.checked = state.settings.chatbotEnabled === true;
    if (providerSelect) providerSelect.value = state.settings.aiProvider || "gemini";
    if (apiBaseUrlInput) apiBaseUrlInput.value = state.settings.openaiBaseUrl || "https://api.openai.com/v1";
    if (apiModelInput) apiModelInput.value = state.settings.openaiModel || "gpt-4.1-mini";
    updateProviderSettingsUI();
    renderBots();
    updateConnectionLabel();


    // Render sidebar

    renderChatList();


    // Status

    setStatus(
        "HAXICS is ready."
    );


    // Focus input

    focusInput();


    console.log(
        "HAXICS state:",
        state
    );

}


// ==========================================
// ASK HAXIC
// ==========================================

async function askHaxic() {

    const question =
        getInput();


    // ======================================
    // EMPTY QUESTION
    // ======================================

    if (!question) {

        setStatus(
            "Enter a coding question first."
        );

        focusInput();

        return;

    }


    // ======================================
    // ALREADY THINKING
    // ======================================

    if (state.isThinking) {

        return;

    }


    state.isThinking =
        true;

    setLoading(
        true
    );


    hideWelcome();


    // ======================================
    // CREATE CHAT
    // ======================================

    let isFirstMessage =
        false;


    if (!state.currentChatId) {

        const chat =
            startNewChat();


        state.currentChatId =
            chat.id;


        isFirstMessage =
            true;

    }

    state.settings.currentChatId = state.currentChatId;
    saveData("settings", state.settings);


    // ======================================
    // CREATE CHAT TITLE
    // ======================================

    if (isFirstMessage) {

        const title =
            generateChatTitle(
                question
            );


        renameChat(
            state.currentChatId,
            title
        );

    }


    // ======================================
    // SAVE USER MESSAGE
    // ======================================

    addChatMessage(
        state.currentChatId,
        "user",
        question
    );


    // ======================================
    // DISPLAY USER MESSAGE
    // ======================================

    addMessage(
        "user",
        question
    );


    // ======================================
    // CLEAR INPUT
    // ======================================

    clearInput();


    setStatus(
        "HAXICS is preparing your coding question..."
    );


    // ======================================
    // ASK AI ENGINE
    // ======================================

    try {

        const result =
            await askAI(
                question,
                setStatus
            );


        // ==================================
        // GET ANSWER
        // ==================================

        let answer;


        if (
            result &&
            result.message
        ) {

            answer =
                result.message;

        }

        else if (
            result &&
            result.answer
        ) {

            answer =
                result.answer;

        }

        else {

            answer =
                "HAXICS did not receive an answer.";

        }


        // ==================================
        // SAVE HAXIC MESSAGE
        // ==================================

        addChatMessage(
            state.currentChatId,
            "haxic",
            answer
        );


        // ==================================
        // DISPLAY HAXIC MESSAGE
        // ==================================

        addMessage(
            "haxic",
            answer
        );


        // ==================================
        // UPDATE SIDEBAR
        // ==================================

        state.chats =
            getAllChats();


        renderChatList();


        setStatus(
            "HAXICS is ready."
        );

    }


    // ======================================
    // ERROR
    // ======================================

    catch (error) {

        console.error(
            "HAXICS AI error:",
            error
        );


        const errorMessage = error.message || "HAXICS could not get an answer. Please try again.";


        addMessage(
            "haxic",
            errorMessage
        );
        addChatMessage(state.currentChatId, "haxic", errorMessage);

        questionInput.value = question;
        questionInput.dispatchEvent(new Event("input", { bubbles: true }));


        setStatus(
            errorMessage
        );

    }


    // ======================================
    // FINISH
    // ======================================

    state.isThinking =
        false;


    setLoading(
        false
    );


    focusInput();

}


// ==========================================
// NEW CHAT
// ==========================================

function newChat() {

    state.currentChatId =
        null;


    state.messages =
        [];


    clearMessages();


    showWelcome();


    clearInput();


    setStatus(
        "New chat started."
    );


    focusInput();

}


// ==========================================
// LOAD CHAT
// ==========================================

function loadChat(chatId) {

    const messages =
        getChatMessages(
            chatId
        );


    state.currentChatId =
        chatId;


    state.messages =
        messages;


    clearMessages();


    // ======================================
    // EMPTY CHAT
    // ======================================

    if (
        messages.length === 0
    ) {

        showWelcome();

    }


    // ======================================
    // CHAT WITH MESSAGES
    // ======================================

    else {

        hideWelcome();


        messages.forEach(
            message => {

                addMessage(
                    message.role,
                    message.content
                );

            }
        );

    }


    setStatus(
        "Chat loaded."
    );


    focusInput();

}


// ==========================================
// CHAT LIST
// ==========================================

function renderChatList() {

    if (!chatList) {

        return;

    }


    chatList.innerHTML =
        "";


    const chats =
        getAllChats();


    chats.forEach(
        chat => {

            const row = document.createElement("div");
            row.className = "chat-history-row";
            const button = document.createElement("button");
            button.className = "chat-history-item";
            button.textContent = chat.title;
            button.title = chat.title;


            // Active chat

            if (
                chat.id ===
                state.currentChatId
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.addEventListener(
                "click",
                () => {

                    loadChat(
                        chat.id
                    );


                    renderChatList();

                }
            );
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-chat-button";
            deleteButton.textContent = "×";
            deleteButton.title = `Delete ${chat.title}`;
            deleteButton.setAttribute("aria-label", `Delete chat: ${chat.title}`);
            deleteButton.addEventListener("click", event => {
                event.stopPropagation();
                deleteChat(chat.id);
                if (state.currentChatId === chat.id) {
                    state.currentChatId = null;
                    state.messages = [];
                    clearMessages();
                    showWelcome();
                    setStatus("Chat deleted.");
                }
                state.chats = getAllChats();
                renderChatList();
            });
            row.append(button, deleteButton);
            chatList.appendChild(row);

        }
    );

}


// ==========================================
// SIDEBAR
// ==========================================

function toggleSidebar() {

    document.body.classList.toggle("sidebar-closed");

}


// ==========================================
// SETTINGS
// ==========================================

function openSettings() {

    if (!settingsOverlay) {

        return;

    }


    settingsOverlay.classList.remove(
        "hidden"
    );

}


function closeSettings() {

    if (!settingsOverlay) {

        return;

    }


    settingsOverlay.classList.add(
        "hidden"
    );

}


// ==========================================
// THEME
// ==========================================

function changeTheme() {

    if (!themeSelect) {

        return;

    }


    const theme =
        themeSelect.value;


    state.settings.theme =
        theme;
    document.documentElement.dataset.theme = theme;


    saveData(
        "settings",
        state.settings
    );


    setStatus(
        `Theme changed to ${theme}.`
    );

}

function saveCustomization() {
    if (accentSelect) {
        state.settings.accent = accentSelect.value;
        document.documentElement.dataset.accent = accentSelect.value;
    }
    if (textSizeSelect) {
        state.settings.textSize = textSizeSelect.value;
        document.documentElement.dataset.textSize = textSizeSelect.value;
    }
    if (compactToggle) {
        state.settings.compactMessages = compactToggle.checked;
        document.documentElement.classList.toggle("compact-messages", compactToggle.checked);
    }
    if (messageWidthSelect) {
        state.settings.messageWidth = messageWidthSelect.value;
        document.documentElement.dataset.messageWidth = messageWidthSelect.value;
    }
    if (cornerStyleSelect) {
        state.settings.cornerStyle = cornerStyleSelect.value;
        document.documentElement.dataset.cornerStyle = cornerStyleSelect.value;
    }
    saveData("settings", state.settings);
}

function updateConnectionLabel() {
    const label = document.getElementById("connectionLabel");
    if (!label) return;
    const provider = state.settings.aiProvider || "gemini";
    const customEndpoint = provider === "openai" && (state.settings.openaiBaseUrl || "https://api.openai.com/v1").replace(/\/$/, "") !== "https://api.openai.com/v1";
    const connected = Boolean((provider === "openai" ? state.settings.openaiApiKey : state.settings.geminiApiKey)?.trim()) || customEndpoint;
    label.textContent = connected ? `${provider === "openai" ? "AI API" : "Gemini"} connected` : "Offline coding help";
    label.closest(".connection-status")?.classList.toggle("connected", connected);
}

function saveApiKey() {
    const provider = state.settings.aiProvider || "gemini";
    state.settings[provider === "openai" ? "openaiApiKey" : "geminiApiKey"] = apiKeyInput?.value.trim() || "";
    saveData("settings", state.settings);
    updateConnectionLabel();
    setStatus(apiKeyInput?.value.trim() ? `${provider === "openai" ? "AI API" : "Gemini"} key saved.` : "API key removed. Offline coding help is ready.");
}

function saveCompatibleApiSettings() {
    const url = apiBaseUrlInput?.value.trim();
    const baseUrl = url || "https://api.openai.com/v1";
    try {
        const parsed = new URL(baseUrl);
        if (!["http:", "https:"].includes(parsed.protocol) || parsed.search || parsed.hash) throw new Error("Invalid API base URL");
    } catch {
        setStatus("Enter a valid API base URL without query parameters.");
        return;
    }
    state.settings.openaiBaseUrl = baseUrl;
    state.settings.openaiModel = apiModelInput?.value.trim() || "gpt-4.1-mini";
    saveData("settings", state.settings);
    updateProviderSettingsUI();
    setStatus("AI API endpoint and model saved.");
}

function searchWeb() {
    const query = questionInput?.value.trim();
    if (!query) {
        setStatus("Type a question or search phrase first, then choose Search web.");
        questionInput?.focus();
        return;
    }
    window.open(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
    setStatus("Opened web search results in a new tab.");
}

function openWebsite() {
    const address = questionInput?.value.trim();
    if (!address) {
        setStatus("Type a website address first, such as wikipedia.org, then choose Open website.");
        questionInput?.focus();
        return;
    }
    const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(address) ? address : `https://${address}`;
    try {
        const url = new URL(candidate);
        if (!["http:", "https:"].includes(url.protocol) || !url.hostname || /\s/.test(address)) throw new Error("Invalid website address");
        window.open(url.href, "_blank", "noopener,noreferrer");
        setStatus(`Opened ${url.hostname} in a new tab.`);
    } catch {
        setStatus("Enter a website address such as wikipedia.org or https://example.com.");
    }
}

function updateProviderSettingsUI() {
    const provider = providerSelect?.value || state.settings.aiProvider || "gemini";
    const openai = provider === "openai";
    if (compatibleApiSettings) compatibleApiSettings.hidden = !openai;
    const baseUrl = apiBaseUrlInput?.value.trim() || state.settings.openaiBaseUrl || "https://api.openai.com/v1";
    const isOpenAIEndpoint = /^https:\/\/api\.openai\.com\/?(?:v1)?$/i.test(baseUrl);
    if (apiKeyLabel) apiKeyLabel.textContent = openai ? (isOpenAIEndpoint ? "OpenAI API key" : "Service API key (if required)") : "Gemini API key";
    if (apiKeyHelp) apiKeyHelp.textContent = openai
        ? "Use a key issued by the API service. It is stored in this browser. Browser-side keys can be exposed; use a private local copy only. Some local services do not require a key."
        : "Connect Gemini for full AI answers. Your key is saved only in this browser.";
    if (getKeyLink) {
        getKeyLink.hidden = openai && !isOpenAIEndpoint;
        getKeyLink.href = openai ? "https://platform.openai.com/api-keys" : "https://aistudio.google.com/apikey";
        getKeyLink.textContent = openai ? "Create an OpenAI API key ↗" : "Get a Gemini API key ↗";
    }
    if (apiKeyInput) {
        apiKeyInput.value = openai ? state.settings.openaiApiKey || "" : state.settings.geminiApiKey || "";
        apiKeyInput.placeholder = openai ? "Paste this service’s API key (optional for local APIs)" : "Paste your Gemini API key";
    }
    if (apiBaseUrlInput) apiBaseUrlInput.value = state.settings.openaiBaseUrl || "https://api.openai.com/v1";
    if (apiModelInput) apiModelInput.value = state.settings.openaiModel || "gpt-4.1-mini";
    updateConnectionLabel();
}

function renderBots() {
    state.settings.chatbotEnabled = false;
    if (chatbotEnabledToggle) chatbotEnabledToggle.checked = false;
    saveData("settings", state.settings);
}


// ==========================================
// CLEAR DATA
// ==========================================

function clearData() {

    const confirmed =
        confirm(
            "Delete all HAXICS local data?"
        );


    if (!confirmed) {

        return;

    }


    clearHaxicStorage();

    state.settings = { theme: HAXIC_CONFIG.defaultTheme, accent: "violet", textSize: "comfortable", compactMessages: false, aiProvider: "gemini" };
    document.documentElement.dataset.theme = state.settings.theme;
    document.documentElement.dataset.accent = state.settings.accent;
    document.documentElement.dataset.textSize = state.settings.textSize;
    document.documentElement.dataset.messageWidth = "standard";
    document.documentElement.dataset.cornerStyle = "rounded";
    document.documentElement.classList.remove("compact-messages");
    if (themeSelect) themeSelect.value = state.settings.theme;
    if (accentSelect) accentSelect.value = state.settings.accent;
    if (textSizeSelect) textSizeSelect.value = state.settings.textSize;
    if (messageWidthSelect) messageWidthSelect.value = "standard";
    if (cornerStyleSelect) cornerStyleSelect.value = "rounded";
    if (compactToggle) compactToggle.checked = false;
    if (apiKeyInput) apiKeyInput.value = "";
    if (providerSelect) providerSelect.value = "gemini";
    if (apiBaseUrlInput) apiBaseUrlInput.value = "https://api.openai.com/v1";
    if (apiModelInput) apiModelInput.value = "gpt-4.1-mini";
    updateProviderSettingsUI();
    renderBots();
    updateConnectionLabel();


    state.chats =
        [];


    state.messages =
        [];


    state.currentChatId =
        null;


    clearMessages();


    showWelcome();


    renderChatList();


    setStatus(
        "HAXICS data cleared."
    );


    focusInput();

}


// ==========================================
// KEYBOARD INPUT
// ==========================================

function handleKeyboardInput(
    event
) {

    handleInputKey(
        event,
        askHaxic
    );

}


// ==========================================
// EVENTS
// ==========================================

if (askButton) {

    askButton.addEventListener(
        "click",
        askHaxic
    );

}

if (webSearchButton) webSearchButton.addEventListener("click", searchWeb);
if (openWebsiteButton) openWebsiteButton.addEventListener("click", openWebsite);


if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        newChat
    );

}


if (sidebarToggle) {

    sidebarToggle.addEventListener(
        "click",
        toggleSidebar
    );

}


if (settingsButton) {

    settingsButton.addEventListener(
        "click",
        openSettings
    );

}


if (closeSettingsButton) {

    closeSettingsButton.addEventListener(
        "click",
        closeSettings
    );

}
if (settingsOverlay) settingsOverlay.addEventListener("click", event => {
    if (event.target === settingsOverlay) closeSettings();
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && settingsOverlay && !settingsOverlay.classList.contains("hidden")) closeSettings();
});


if (themeSelect) {

    themeSelect.addEventListener(
        "change",
        changeTheme
    );

}
if (accentSelect) accentSelect.addEventListener("change", saveCustomization);
if (textSizeSelect) textSizeSelect.addEventListener("change", saveCustomization);
if (messageWidthSelect) messageWidthSelect.addEventListener("change", saveCustomization);
if (cornerStyleSelect) cornerStyleSelect.addEventListener("change", saveCustomization);
if (compactToggle) compactToggle.addEventListener("change", saveCustomization);


if (clearDataButton) {

    clearDataButton.addEventListener(
        "click",
        clearData
    );

}


if (questionInput) {

    questionInput.addEventListener(
        "keydown",
        handleKeyboardInput
    );

}

if (apiKeyInput) apiKeyInput.addEventListener("change", saveApiKey);
if (providerSelect) providerSelect.addEventListener("change", () => {
    state.settings.aiProvider = providerSelect.value;
    saveData("settings", state.settings);
    updateProviderSettingsUI();
});
if (document.getElementById("addBotButton")) document.getElementById("addBotButton").addEventListener("click", () => { if (botFeatureNotice) botFeatureNotice.hidden = false; setStatus("Bot connections are not available yet. Use AI Connection settings for now."); });
if (chatbotEnabledToggle) chatbotEnabledToggle.addEventListener("change", () => { state.settings.chatbotEnabled = false; chatbotEnabledToggle.checked = false; saveData("settings", state.settings); if (botFeatureNotice) botFeatureNotice.hidden = false; setStatus("Chatbot mode is not available yet. Your existing AI provider settings are unchanged."); });
if (apiBaseUrlInput) apiBaseUrlInput.addEventListener("change", saveCompatibleApiSettings);
if (apiModelInput) apiModelInput.addEventListener("change", saveCompatibleApiSettings);
if (toggleKeyButton && apiKeyInput) toggleKeyButton.addEventListener("click", () => {
    const visible = apiKeyInput.type === "password";
    apiKeyInput.type = visible ? "text" : "password";
    toggleKeyButton.textContent = visible ? "Hide" : "Show";
});
document.querySelectorAll(".suggestion").forEach(button => button.addEventListener("click", () => {
    questionInput.value = button.dataset.prompt || "";
    questionInput.dispatchEvent(new Event("input", { bubbles: true }));
    askHaxic();
}));


// ==========================================
// START APPLICATION
// ==========================================

// Keep the chat visible on phones when the app first opens.
if (window.matchMedia("(max-width: 700px)").matches) {
    document.body.classList.add("sidebar-closed");
}

startHaxic();
