// ==========================================
// HAXIC UI
// ==========================================

import {
    renderMessage,
    clearRenderedMessages
} from "./messagesUI.js";


// ==========================================
// STATUS
// ==========================================

export function setStatus(message) {

    const status =
        document.getElementById("status");


    if (!status) {

        return;

    }


    status.textContent =
        message;

}


// ==========================================
// LOADING
// ==========================================

export function setLoading(isLoading) {

    const button =
        document.getElementById("askButton");


    if (!button) {

        return;

    }


    button.disabled =
        isLoading;


    button.textContent =
        isLoading
            ? "..."
            : "↑";

}


// ==========================================
// ADD MESSAGE
// ==========================================

export function addMessage(
    type,
    text
) {

    renderMessage(
        type,
        text
    );

}


// ==========================================
// CLEAR MESSAGES
// ==========================================

export function clearMessages() {

    clearRenderedMessages();

}


// ==========================================
// WELCOME
// ==========================================

export function hideWelcome() {

    const welcome =
        document.getElementById("welcome");


    if (welcome) {

        welcome.style.display =
            "none";

    }

}


export function showWelcome() {

    const welcome =
        document.getElementById("welcome");


    if (welcome) {

        welcome.style.display =
            "block";

    }

}