// ==========================================
// HAXIC MESSAGE UI
// ==========================================


// ==========================================
// ELEMENT
// ==========================================

const messages =
    document.getElementById("messages");


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// COPY CODE
// ==========================================

async function copyCode(button) {
    const code = button.closest(".code-block")?.querySelector("pre code")?.textContent ?? "";
    if (!code) return;
    const originalLabel = button.textContent;
    button.disabled = true;
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(code);
        } else {
            const helper = document.createElement("textarea");
            helper.value = code;
            helper.setAttribute("readonly", "");
            helper.style.cssText = "position:fixed;opacity:0;left:-9999px;top:0";
            document.body.appendChild(helper);
            helper.select();
            const copied = document.execCommand("copy");
            helper.remove();
            if (!copied) throw new Error("Clipboard access is unavailable");
        }
        button.textContent = "Copied";
        button.classList.add("copied");
    } catch (error) {
        console.error("Could not copy code:", error);
        button.textContent = "Copy failed";
    } finally {
        window.setTimeout(() => {
            button.textContent = originalLabel;
            button.classList.remove("copied");
            button.disabled = false;
        }, 1600);
    }
}


// ==========================================
// CREATE CODE BLOCK
// ==========================================

function createCodeBlock(
    language,
    code
) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "code-block";


    // Header

    const header =
        document.createElement("div");


    header.className =
        "code-header";


    // Language

    const languageLabel =
        document.createElement("span");


    languageLabel.textContent =
        language || "code";


    // Copy button

    const copyButton =
        document.createElement("button");


    copyButton.textContent =
        "Copy";


    copyButton.className =
        "copy-code-button";


    copyButton.addEventListener(
        "click",
        () => {

            copyCode(
                copyButton
            );

        }
    );


    header.appendChild(
        languageLabel
    );


    header.appendChild(
        copyButton
    );


    // Code

    const pre =
        document.createElement("pre");


    const codeElement =
        document.createElement("code");


    codeElement.textContent =
        code;


    pre.appendChild(
        codeElement
    );


    wrapper.appendChild(
        header
    );


    wrapper.appendChild(
        pre
    );


    return wrapper;

}


// ==========================================
// RENDER CONTENT
// ==========================================

function renderContent(
    container,
    text
) {

    // Split fenced code blocks:
    //
    // ```python
    // print("Hello")
    // ```

    const parts =
        text.split(
            /```([a-zA-Z0-9_+#.-]*)\n?([\s\S]*?)```/g
        );


    for (
        let i = 0;
        i < parts.length;
        i++
    ) {

        // Normal text

        if (i % 3 === 0) {

            const normalText =
                parts[i];


            if (
                normalText.trim()
            ) {

                const paragraph =
                    document.createElement("div");


                paragraph.className =
                    "message-text";


                paragraph.textContent =
                    normalText;


                container.appendChild(
                    paragraph
                );

            }

        }

        // Code block

        else if (i % 3 === 1) {

            const language =
                parts[i];


            const code =
                parts[i + 1];


            const block =
                createCodeBlock(
                    language,
                    code
                );


            container.appendChild(
                block
            );


            i++;

        }

    }

}


// ==========================================
// ADD MESSAGE
// ==========================================

export function renderMessage(
    role,
    text
) {

    if (!messages) {

        return;

    }


    const message =
        document.createElement("div");


    message.className =
        role === "user"
            ? "message message-user"
            : "message message-haxic";


    // Label

    const label =
        document.createElement("div");


    label.className =
        "message-label";


    label.textContent =
        role === "user"
            ? "You"
            : "HAXICS";


    // Content

    const content =
        document.createElement("div");


    content.className =
        "message-content";


    renderContent(
        content,
        text
    );


    message.appendChild(
        label
    );


    message.appendChild(
        content
    );


    messages.appendChild(
        message
    );


    message.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


// ==========================================
// CLEAR
// ==========================================

export function clearRenderedMessages() {

    if (messages) {

        messages.innerHTML = "";

    }

}
