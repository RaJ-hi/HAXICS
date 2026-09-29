// ==========================================
// HAXIC CHAT MANAGER
// ==========================================

import {
    createChat,
    getChat,
    getChats,
    updateChat
} from "../storage/chats.js";


// ==========================================
// CREATE NEW CHAT
// ==========================================

export function startNewChat() {

    return createChat(
        "New Chat"
    );

}


// ==========================================
// GET ALL CHATS
// ==========================================

export function getAllChats() {

    return getChats();

}


// ==========================================
// GET CURRENT CHAT
// ==========================================

export function getCurrentChat(chatId) {

    return getChat(chatId);

}


// ==========================================
// RENAME CHAT
// ==========================================

export function renameChat(
    chatId,
    title
) {

    return updateChat(
        chatId,
        {
            title: title
        }
    );

}


// ==========================================
// GENERATE CHAT TITLE
// ==========================================

export function generateChatTitle(question) {

    if (!question) {

        return "New Chat";

    }


    let title =
        question
            .replace(/\s+/g, " ")
            .trim();


    // Remove common question endings
    title =
        title.replace(/[?!.]+$/, "");


    // Maximum title length
    const maxLength = 42;


    if (title.length > maxLength) {

        title =
            title.substring(
                0,
                maxLength
            );


        // Don't cut in the middle of a word
        const lastSpace =
            title.lastIndexOf(" ");


        if (lastSpace > 10) {

            title =
                title.substring(
                    0,
                    lastSpace
                );

        }


        title += "...";

    }


    return title;

}