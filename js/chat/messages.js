// ==========================================
// HAXIC MESSAGE SYSTEM
// ==========================================

import {
    getChat,
    updateChat
} from "../storage/chats.js";


// ==========================================
// ADD MESSAGE
// ==========================================

export function addChatMessage(
    chatId,
    role,
    content
) {

    const chat = getChat(chatId);

    if (!chat) {

        return null;

    }


    const message = {

        id: crypto.randomUUID(),

        role: role,

        content: content,

        createdAt: Date.now()

    };


    chat.messages.push(message);


    updateChat(
        chatId,
        {
            messages: chat.messages
        }
    );


    return message;

}


// ==========================================
// GET MESSAGES
// ==========================================

export function getChatMessages(chatId) {

    const chat = getChat(chatId);

    if (!chat) {

        return [];

    }


    return chat.messages || [];

}


// ==========================================
// CLEAR MESSAGES
// ==========================================

export function clearChatMessages(chatId) {

    return updateChat(
        chatId,
        {
            messages: []
        }
    );

}