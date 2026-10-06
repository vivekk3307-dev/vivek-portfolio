const themeButton = document.querySelector("#themeButton");

themeButton.addEventListener("click", function () {
    const isLightMode = document.body.classList.toggle("light-mode");

    themeButton.textContent = isLightMode ? "🌙 Dark" : "☀️ Light";
});

const projects = [
    {
        title: "DevSpace Portfolio",
        description: "My personal portfolio website.",
        technology: "HTML, CSS, JavaScript, Node.js, Express"
    },
    {
        title: "Task Manager",
        description: "A simple application to manage daily tasks.",
        technology: "HTML, CSS, JavaScript"
    },
    {
        title: "Study Tracker",
        description: "Track study sessions and learning progress.",
        technology: "JavaScript, Node.js, Express"
    }
];

const projectContainer = document.querySelector("#projectContainer");

projects.forEach(function (project) {
    const card = document.createElement("article");
    card.className = "project-card";

    const title = document.createElement("h3");
    title.textContent = project.title;

    const description = document.createElement("p");
    description.textContent = project.description;

    const technology = document.createElement("strong");
    technology.textContent = `Built with: ${project.technology}`;

    card.append(title, description, technology);
    projectContainer.append(card);
});

if ("IntersectionObserver" in window) {
    const revealItems = document.querySelectorAll(
        "section, .project-card, .blog-card, .skill-card, footer"
    );
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );

    revealItems.forEach((item, index) => {
        item.classList.add("reveal");
        item.style.setProperty("--reveal-delay", `${(index % 4) * 75}ms`);
        revealObserver.observe(item);
    });
}

const chatPanel = document.querySelector("#chatPanel");
const openChatButton = document.querySelector("#openChatButton");
const closeChatButton = document.querySelector("#closeChatButton");
const newChatButton = document.querySelector("#newChatButton");
const chatMessages = document.querySelector("#chatMessages");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const sendChatButton = document.querySelector("#sendChatButton");
const welcomeMessage = chatMessages.querySelector(".chat-welcome");
const chatSessionStorageKey = "devspace-vky-session";
let historyLoaded = false;

function createChatSessionId() {
    return crypto.randomUUID();
}

function getChatSessionId() {
    let sessionId = localStorage.getItem(chatSessionStorageKey);

    if (!sessionId) {
        sessionId = createChatSessionId();
        localStorage.setItem(chatSessionStorageKey, sessionId);
    }

    return sessionId;
}

function scrollChatToLatest() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendChatMessage(role, content) {
    const message = document.createElement("div");
    message.className = `chat-message ${role === "user" ? "is-user" : "is-assistant"}`;
    message.textContent = content;
    chatMessages.append(message);
    scrollChatToLatest();
    return message;
}

function appendChatStatus(content, isError = false) {
    chatMessages.querySelector(".chat-status")?.remove();
    const status = document.createElement("p");
    status.className = `chat-status${isError ? " is-error" : ""}`;
    status.setAttribute("role", isError ? "alert" : "status");
    status.textContent = content;
    chatMessages.append(status);
    scrollChatToLatest();
    return status;
}

async function loadChatHistory() {
    chatMessages.querySelector(".chat-status")?.remove();

    try {
        const response = await fetch(`/api/chat/${encodeURIComponent(getChatSessionId())}`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || "Chat history could not be loaded.");
        }

        chatMessages.querySelectorAll(".chat-message").forEach((message) => message.remove());
        data.messages.forEach((message) => {
            if (message.role === "user" || message.role === "assistant") {
                appendChatMessage(message.role, message.content);
            }
        });
        historyLoaded = true;
    } catch (error) {
        appendChatStatus(error.message, true);
    }
}

function openChat() {
    chatPanel.hidden = false;
    chatPanel.setAttribute("aria-hidden", "false");
    openChatButton.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => chatPanel.classList.add("is-open"));
    chatInput.focus();

    if (!historyLoaded) {
        loadChatHistory();
    }
}

function closeChat() {
    chatPanel.classList.remove("is-open");
    chatPanel.setAttribute("aria-hidden", "true");
    openChatButton.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
        if (chatPanel.getAttribute("aria-hidden") === "true") {
            chatPanel.hidden = true;
        }
    }, 220);
    openChatButton.focus();
}

openChatButton.addEventListener("click", openChat);
closeChatButton.addEventListener("click", closeChat);

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !chatPanel.hidden) {
        closeChat();
    }
});

newChatButton.addEventListener("click", () => {
    localStorage.setItem(chatSessionStorageKey, createChatSessionId());
    chatMessages.querySelectorAll(".chat-message, .chat-status").forEach((message) => {
        message.remove();
    });
    chatMessages.prepend(welcomeMessage);
    historyLoaded = true;
    chatInput.focus();
});

chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();

    if (!message || sendChatButton.disabled) {
        return;
    }

    if (!historyLoaded) {
        await loadChatHistory();
    }

    chatMessages.querySelector(".chat-status")?.remove();
    appendChatMessage("user", message);
    chatInput.value = "";
    sendChatButton.disabled = true;
    chatInput.disabled = true;

    const typingIndicator = document.createElement("div");
    typingIndicator.className = "chat-typing";
    typingIndicator.setAttribute("role", "status");
    typingIndicator.setAttribute("aria-label", "VKY is thinking");
    typingIndicator.innerHTML = "<span></span><span></span><span></span>";
    chatMessages.append(typingIndicator);
    scrollChatToLatest();

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: getChatSessionId(),
                message
            })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || "VKY could not reply. Please try again.");
        }

        appendChatMessage("assistant", data.reply);
    } catch (error) {
        appendChatStatus(error.message, true);
    } finally {
        typingIndicator.remove();
        sendChatButton.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
    }
});