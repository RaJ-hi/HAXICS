// ==========================================
// HAXIC INPUT SYSTEM
// ==========================================

const input =
    document.getElementById("questionInput");


// ==========================================
// GET INPUT
// ==========================================

export function getInput() {

    return input.value.trim();

}


// ==========================================
// CLEAR INPUT
// ==========================================

export function clearInput() {

    input.value = "";

    resizeInput();

}


// ==========================================
// ENABLE / DISABLE
// ==========================================

export function setInputEnabled(enabled) {

    input.disabled = !enabled;

}


// ==========================================
// FOCUS INPUT
// ==========================================

export function focusInput() {

    input.focus();

}


// ==========================================
// RESIZE INPUT
// ==========================================

export function resizeInput() {

    input.style.height = "auto";

    input.style.height =
        Math.min(
            input.scrollHeight,
            200
        ) + "px";

}


// ==========================================
// ENTER / SHIFT+ENTER
// ==========================================

export function handleInputKey(
    event,
    onSend
) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        onSend();

        return;

    }


    if (
        event.key === "Enter" &&
        event.shiftKey
    ) {

        // Allow normal newline

        setTimeout(
            resizeInput,
            0
        );

    }

}


// ==========================================
// INPUT EVENT
// ==========================================

input.addEventListener(
    "input",
    resizeInput
);


// ==========================================
// INITIAL SIZE
// ==========================================

resizeInput();