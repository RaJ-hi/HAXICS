// ==========================================
// HAXIC AI ENGINE
// ==========================================

import {
    getEnabledProviders
} from "./providers.js";
import { loadData } from "../storage/storage.js";

const MODELS = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite"
];

async function askGemini(question, onStatus, bot = null) {
    const settings = loadData("settings", {});
    const apiKey = (bot?.apiKey || settings.geminiApiKey)?.trim();
    if (!apiKey) return null;

    const history = loadData("chats", []).find(chat => chat.id === settings.currentChatId)?.messages || [];
    const recentHistory = history.at(-1)?.role === "user" && history.at(-1)?.content === question
        ? history.slice(0, -1)
        : history;
    const contents = recentHistory.slice(-12).map(message => ({
        role: message.role === "user" ? "user" : "model",
        parts: [{ text: message.content }]
    }));
    contents.push({ role: "user", parts: [{ text: question }] });

    for (let index = 0; index < MODELS.length; index++) {
        const model = MODELS[index];
        let response;
        try {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: "You are HAXICS, a precise, friendly coding assistant. Give practical explanations and working code examples when useful. Ask a focused follow-up if key details are missing. Format code using fenced Markdown blocks." }] },
                    contents,
                    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
                })
            });
        } catch {
            throw new Error("Could not reach Gemini. Check your internet connection and try again.");
        }

        const payload = await response.json().catch(() => ({}));
        if ((response.status === 503 || response.status === 429) && index < MODELS.length - 1) {
            const nextModel = MODELS[index + 1].replace("gemini-", "Gemini ").replaceAll("-", " ");
            const reason = response.status === 429 ? "Quota reached" : "Model is busy";
            onStatus?.(`${reason} for ${model}. Trying ${nextModel}…`);
            if (response.status === 503) await new Promise(resolve => setTimeout(resolve, 500));
            continue;
        }
        if (!response.ok) {
            const detail = payload.error?.message || "";
            if (response.status === 503) throw new Error(`Gemini is temporarily unavailable. Your question is still here—please try again shortly.${detail ? ` ${detail}` : ""}`);
            if (response.status === 429) throw new Error(`Limit reached for ${bot?.name || "Gemini"}. Switch to another bot using the selector below the chat, or check this provider’s quota and billing.${detail ? ` API detail: ${detail}` : ""}`);
            if (response.status === 400 || response.status === 401 || response.status === 403) throw new Error(`Gemini rejected this request. Check that this is a Gemini API key with access to the selected model.${detail ? ` API detail: ${detail}` : ""}`);
            if (response.status === 404) throw new Error(`Gemini model or API endpoint was not found. Check model access.${detail ? ` API detail: ${detail}` : ""}`);
            throw new Error(payload.error?.message || `Gemini request failed (${response.status}). Please try again.`);
        }
        const answer = payload.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
        if (!answer) throw new Error("Gemini returned an empty answer. Please try again.");
        return answer;
    }
}

async function askOpenAI(question, bot = null) {
    const settings = loadData("settings", {});
    const apiKey = (bot?.apiKey || settings.openaiApiKey)?.trim();
    let baseUrl = (bot?.baseUrl || settings.openaiBaseUrl || "https://api.openai.com/v1").trim();
    if (/^https:\/\/api\.openai\.com\/?$/i.test(baseUrl)) baseUrl = "https://api.openai.com/v1";
    const isDefaultOpenAI = /^https:\/\/api\.openai\.com\/v1\/?$/i.test(baseUrl);
    if (!apiKey && isDefaultOpenAI) return null;
    const endpoint = /\/chat\/completions\/?$/i.test(baseUrl)
        ? baseUrl.replace(/\/$/, "")
        : `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

    const history = loadData("chats", []).find(chat => chat.id === settings.currentChatId)?.messages || [];
    const recentHistory = history.at(-1)?.role === "user" && history.at(-1)?.content === question
        ? history.slice(0, -1)
        : history;
    const messages = [
        { role: "system", content: "You are HAXICS, a precise, friendly coding assistant. Give practical explanations and working code examples when useful. Ask a focused follow-up if key details are missing. Format code using fenced Markdown blocks." },
        ...recentHistory.slice(-12).map(message => ({
            role: message.role === "user" ? "user" : "assistant",
            content: message.content
        })),
        { role: "user", content: question }
    ];

    let response;
    try {
        const headers = { "Content-Type": "application/json" };
        if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
        response = await fetch(endpoint, {
            method: "POST",
            headers,
        body: JSON.stringify({ model: bot?.model?.trim() || settings.openaiModel?.trim() || "gpt-4.1-mini", messages })
        });
    } catch {
        throw new Error("Could not reach this AI API. Check the base URL, connection, and whether the service allows browser requests (CORS).");
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const detail = payload.error?.message || payload.message || "";
        const reason = detail ? ` API detail: ${detail}` : "";
        if (response.status === 401 || response.status === 403) throw new Error(`The AI service rejected the API key or its permissions (${response.status}). Check that the key belongs to this service and can use the selected model.${reason}`);
        if (response.status === 429) throw new Error(`Limit reached for ${bot?.name || "this bot"}. Switch to another bot using the selector below the chat, or check this provider’s account limits.${reason}`);
        if (response.status === 404) throw new Error(`The API endpoint or model was not found. Check the base URL and model name in Settings.${reason}`);
        throw new Error(detail || `AI API request failed (${response.status}). Check the endpoint and model settings.`);
    }
    const answer = payload.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("OpenAI returned an empty answer. Please try again.");
    return answer;
}

function localAnswer(question) {
    const q = question.toLowerCase();
    const providerName = loadData("settings", {}).aiProvider === "openai" ? "OpenAI API" : "Gemini API";
    if (/^(hi|hello|hey|yo)\b/.test(q)) return `Hey! I’m HAXICS, your coding assistant. Ask me to explain a concept, write a snippet, or help debug an issue. For full AI answers, add your ${providerName} key in Settings.`;
    if (/async.?await|promise/.test(q)) return "`async` and `await` make JavaScript promises easier to read. An `async` function always returns a promise; `await` pauses that function until the promise settles.\n\n```js\nasync function loadUser(id) {\n  try {\n    const response = await fetch(`/api/users/${id}`);\n    if (!response.ok) throw new Error(`Request failed: ${response.status}`);\n    return await response.json();\n  } catch (error) {\n    console.error('Could not load user:', error);\n    throw error;\n  }\n}\n```\n\nCall it with `loadUser(42).then(console.log)`, or use `await loadUser(42)` inside another async function.";
    if (/responsive|navbar|navigation bar/.test(q)) return "Here’s a responsive navigation bar that collapses naturally on narrow screens:\n\n```html\n<nav class=\"navbar\">\n  <a class=\"brand\" href=\"#home\">My site</a>\n  <div class=\"nav-links\">\n    <a href=\"#work\">Work</a><a href=\"#about\">About</a><a href=\"#contact\">Contact</a>\n  </div>\n</nav>\n```\n\n```css\n.navbar { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1rem 1.5rem; }\n.nav-links { display:flex; flex-wrap:wrap; gap:1.25rem; }\n.navbar a { color:inherit; text-decoration:none; }\n@media (max-width: 520px) { .navbar { align-items:flex-start; flex-direction:column; } .nav-links { gap:.75rem; } }\n```\n\nAdd your own colors and links to match your page.";
    if (/debug|not working|error|bug/.test(q)) return `Let’s narrow it down. Check these first:\n\n1. Open the browser console and copy the first error, including its file and line number.\n2. Confirm the element selector matches the HTML exactly and the script runs after the element exists (or waits for \`DOMContentLoaded\`).\n3. Check for an earlier JavaScript error that may stop the rest of the file.\n4. Add \`console.log\` just before the failing line to confirm the value is what you expect.\n\nPaste the relevant code and exact error here and I’ll help pinpoint the cause. For deeper, context-aware debugging, add your ${providerName} key in Settings.`;
    if (/^what can you do|help$/.test(q)) return `I can help explain code, draft snippets, and work through common debugging steps. Add your ${providerName} key in Settings to enable full AI answers for any coding question.`;
    return `I can answer common coding questions offline, but this one needs the connected AI. Add your ${providerName} key in Settings to enable full answers.`;
}


// ==========================================
// ASK HAXIC
// ==========================================

export async function askAI(
    question,
    onStatus
) {

    if (
        !question ||
        !question.trim()
    ) {

        throw new Error(
            "Question cannot be empty."
        );

    }


    const settings = loadData("settings", {});
    const bot = null;
    const selectedProvider = settings.aiProvider || "gemini";
    const connectedAnswer = selectedProvider === "gemini"
        ? await askGemini(question, onStatus, bot)
        : await askOpenAI(question, bot);
    if (connectedAnswer) return { success: true, message: connectedAnswer, provider: bot?.name || (selectedProvider === "openai" ? "ChatGPT" : "Gemini") };

    const providers =
        getEnabledProviders();


    console.log(
        "--------------------------------"
    );

    console.log(
        "HAXIC QUESTION:"
    );

    console.log(
        question
    );

    console.log(
        "ENABLED PROVIDERS:"
    );

    console.log(
        providers
    );

    console.log(
        "--------------------------------"
    );


    // ======================================
    // NO PROVIDERS
    // ======================================

    if (
        providers.length === 0
    ) {

        return {

            success: false,

            question: question,

            answers: [],

            message: localAnswer(question)

        };

    }


    // ======================================
    // ASK ALL PROVIDERS
    // ======================================

    const results =
        await Promise.allSettled(

            providers.map(
                provider =>
                    provider.ask(
                        question
                    )
            )

        );


    // ======================================
    // COLLECT SUCCESSFUL ANSWERS
    // ======================================

    const answers = [];


    results.forEach(
        (result, index) => {

            if (
                result.status ===
                "fulfilled"
            ) {

                answers.push(
                    result.value
                );

            }

            else {

                console.warn(
                    `${providers[index].name} failed:`,
                    result.reason
                );

            }

        }
    );


    // ======================================
    // NOTHING RETURNED
    // ======================================

    if (
        answers.length === 0
    ) {

        return {

            success: false,

            question: question,

            answers: [],

            message:
                "HAXICS contacted the enabled providers, but none returned an answer."

        };

    }


    // ======================================
    // RETURN ANSWERS
    // ======================================

    return {

        success: true,

        question: question,

        answers: answers,

        message:
            answers[0].content

    };

}
