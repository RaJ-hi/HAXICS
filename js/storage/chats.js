// ==========================================
// HAXIC CHAT STORAGE
// ==========================================

import {
    saveData,
    loadData
} from "./storage.js";


// ==========================================
// GET ALL CHATS
// ==========================================

export function getChats() {

    return loadData("chats", []);

}


// ==========================================
// SAVE ALL CHATS
// ==========================================

export function saveChats(chats) {

    return saveData("chats", chats);

}


// ==========================================
// CREATE CHAT
// ==========================================

export function createChat(title = "New Chat") {

    const chats = getChats();

    const chat = {

        id: crypto.randomUUID(),

        title: title,

        createdAt: Date.now(),

        updatedAt: Date.now(),

        messages: []

    };

    chats.unshift(chat);

    saveChats(chats);

    return chat;

}


// ==========================================
// GET CHAT
// ==========================================

export function getChat(chatId) {

    const chats = getChats();

    return chats.find(
        chat => chat.id === chatId
    ) || null;

}


// ==========================================
// UPDATE CHAT
// ==========================================

export function updateChat(chatId, updates) {

    const chats = getChats();

    const index = chats.findIndex(
        chat => chat.id === chatId
    );

    if (index === -1) {

        return null;

    }

    chats[index] = {

        ...chats[index],

        ...updates,

        updatedAt: Date.now()

    };

    saveChats(chats);

    return chats[index];

}


// ==========================================
// DELETE CHAT
// ==========================================

export function deleteChat(chatId) {

    const chats = getChats();

    const filteredChats =
        chats.filter(
            chat => chat.id !== chatId
        );

    saveChats(filteredChats);

    return true;

}