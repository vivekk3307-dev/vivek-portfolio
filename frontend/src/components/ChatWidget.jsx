import { useEffect, useRef, useState } from "react";

const chatSessionStorageKey = "devspace-vky-session";

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

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "VKY could not reply. Please try again.");
  }

  return data;
}

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const messagesRef = useRef(null);
  const historyLoadedRef = useRef(false);
  const historyRequestRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      if (!historyLoadedRef.current) {
        loadHistory();
      }
      return undefined;
    }

    if (isVisible) {
      const timeout = window.setTimeout(() => setIsVisible(false), 220);
      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [isOpen, isVisible]);

  useEffect(() => {
    if (isOpen && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [isOpen, messages, status, isLoading]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && isOpen) {
        closeChat();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  async function loadHistory() {
    if (historyRequestRef.current) {
      return historyRequestRef.current;
    }

    setStatus(null);
    const request = (async () => {
      try {
        const response = await fetch(
          `/api/chat/${encodeURIComponent(getChatSessionId())}`
        );
        const data = await readResponse(response);
        setMessages(
          data.messages.filter(
            (message) =>
              (message.role === "user" || message.role === "assistant") &&
              typeof message.content === "string"
          )
        );
        historyLoadedRef.current = true;
      } catch (error) {
        setStatus({ message: error.message, isError: true });
      }
    })();
    historyRequestRef.current = request;

    try {
      await request;
    } finally {
      historyRequestRef.current = null;
    }
  }

  function startNewChat() {
    localStorage.setItem(chatSessionStorageKey, createChatSessionId());
    setMessages([]);
    setStatus(null);
    historyLoadedRef.current = true;
    inputRef.current?.focus();
  }

  function openChat() {
    setIsVisible(true);
    window.requestAnimationFrame(() => setIsOpen(true));
  }

  function closeChat() {
    setIsOpen(false);
    launcherRef.current?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const message = input.trim();

    if (!message || isLoading) {
      return;
    }

    if (!historyLoadedRef.current) {
      await loadHistory();
    }

    setStatus(null);
    setMessages((current) => [...current, { role: "user", content: message }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getChatSessionId(), message })
      });
      const data = await readResponse(response);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply }
      ]);
    } catch (error) {
      setStatus({ message: error.message, isError: true });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="vky-widget">
      <section
        id="chatPanel"
        className={`chat-panel${isOpen ? " is-open" : ""}`}
        role="dialog"
        aria-labelledby="chatTitle"
        aria-hidden={!isOpen}
        hidden={!isVisible}
      >
        <header className="chat-header">
          <div className="chat-brand">
            <span className="chat-avatar" aria-hidden="true">
              V
            </span>
            <div>
              <h2 id="chatTitle">Chat with VKY</h2>
              <p>
                <span className="chat-online-dot" /> Vivek's AI assistant
              </p>
            </div>
          </div>
          <div className="chat-header-actions">
            <button
              className="chat-icon-button"
              type="button"
              onClick={startNewChat}
              aria-label="Start a new chat"
              title="New chat"
            >
              ↻
            </button>
            <button
              className="chat-icon-button"
              type="button"
              onClick={closeChat}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
        </header>

        <div
          ref={messagesRef}
          className="chat-messages"
          aria-live="polite"
          aria-relevant="additions text"
        >
          {messages.length === 0 && (
            <div className="chat-welcome">
              <span className="chat-welcome-icon" aria-hidden="true">
                ✦
              </span>
              <h3>Hey, I’m VKY!</h3>
              <p>
                I’m Vivek’s AI assistant. Ask me about his skills, projects, or
                what he’s learning.
              </p>
              <small>
                I’m an AI, not Vivek himself. Messages are saved to MongoDB.
              </small>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              className={`chat-message ${
                message.role === "user" ? "is-user" : "is-assistant"
              }`}
              key={`${index}-${message.role}`}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div
              className="chat-typing"
              role="status"
              aria-label="VKY is thinking"
            >
              <span />
              <span />
              <span />
            </div>
          )}
          {status && (
            <p
              className={`chat-status${status.isError ? " is-error" : ""}`}
              role={status.isError ? "alert" : "status"}
            >
              {status.message}
            </p>
          )}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="chatInput">
            Message VKY
          </label>
          <input
            ref={inputRef}
            id="chatInput"
            name="message"
            type="text"
            maxLength="2000"
            placeholder="Ask me anything..."
            autoComplete="off"
            required
            value={input}
            disabled={isLoading}
            onChange={(event) => setInput(event.target.value)}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={isLoading || !input.trim()}
          >
            <span aria-hidden="true">↑</span>
          </button>
        </form>
        <p className="chat-footnote">
          Powered by AI · Please don’t share sensitive information
        </p>
      </section>

      <button
        ref={launcherRef}
        className="chat-launcher"
        type="button"
        onClick={openChat}
        aria-controls="chatPanel"
        aria-expanded={isOpen}
      >
        <span className="chat-launcher-icon" aria-hidden="true">
          ✦
        </span>
        <span>Chat with VKY</span>
        <span className="chat-launcher-dot" aria-hidden="true" />
      </button>
    </div>
  );
}

export default ChatWidget;
