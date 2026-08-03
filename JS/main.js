document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const fab = document.getElementById("moldrivo-fab");
    const chatWindow = document.getElementById("moldrivo-chat-window");
    const closeChatBtn = document.getElementById("close-chat");
    const minimizeChatBtn = document.getElementById("minimize-chat");
    const clearChatBtn = document.getElementById("clear-chat");
    const downloadChatBtn = document.getElementById("download-chat");
    const themeToggleBtn = document.getElementById("theme-toggle");
    
    const messagesContainer = document.getElementById("chat-messages");
    const inputField = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const chips = document.querySelectorAll(".chip");

    // State
    let isChatOpen = false;
    let isWaitingForAI = false;
    let chatHistory = []; // Format: { role: 'user' | 'model', text: string }

    // Initialize
    initChat();

    function initChat() {
        loadHistory();
        if (chatHistory.length === 0) {
            addWelcomeMessage();
        } else {
            renderHistory();
        }
        adjustInputHeight();
    }

    // --- UI Interactions ---

    fab.addEventListener("click", toggleChat);
    closeChatBtn.addEventListener("click", () => toggleChat(false));
    minimizeChatBtn.addEventListener("click", () => toggleChat(false));
    
    themeToggleBtn.addEventListener("click", () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute("data-theme");
        html.setAttribute("data-theme", currentTheme === "dark" ? "light" : "dark");
    });

    clearChatBtn.addEventListener("click", () => {
        if(confirm("Are you sure you want to clear the chat history?")) {
            chatHistory = [];
            saveHistory();
            messagesContainer.innerHTML = '';
            addWelcomeMessage();
        }
    });

    downloadChatBtn.addEventListener("click", downloadChatHistory);

    function toggleChat(forceState = null) {
        isChatOpen = forceState !== null ? forceState : !isChatOpen;
        if (isChatOpen) {
            chatWindow.classList.remove("hidden");
            fab.classList.add("hidden");
            setTimeout(() => inputField.focus(), 100);
            scrollToBottom();
        } else {
            chatWindow.classList.add("hidden");
            fab.classList.remove("hidden");
        }
    }

    // --- Input Handling ---

    inputField.addEventListener("input", () => {
        sendBtn.disabled = inputField.value.trim() === "" || isWaitingForAI;
        adjustInputHeight();
    });

    inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled) handleSend();
        }
    });

    sendBtn.addEventListener("click", handleSend);

    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            if (isWaitingForAI) return;
            const msg = chip.getAttribute("data-msg");
            inputField.value = msg;
            handleSend();
        });
    });

    function adjustInputHeight() {
        inputField.style.height = "auto";
        inputField.style.height = Math.min(inputField.scrollHeight, 100) + "px";
    }

    // --- Messaging Logic ---

    async function handleSend() {
        const text = inputField.value.trim();
        if (!text) return;

        // Reset input
        inputField.value = "";
        inputField.style.height = "auto";
        sendBtn.disabled = true;

        // Add user message to UI and history
        appendMessage("user", text);
        chatHistory.push({ role: "user", text: text });
        saveHistory();

        // Show loading state
        isWaitingForAI = true;
        const typingId = showTypingIndicator();

        try {
            // Call API
            const responseText = await aiApi.sendMessage(chatHistory);
            
            // Remove typing indicator
            document.getElementById(typingId)?.remove();
            
            // Process response for tags
            let finalOutput = responseText;
            let showCTAs = false;

            if (finalOutput.includes("[SHOW_CTA]")) {
                showCTAs = true;
                finalOutput = finalOutput.replace("[SHOW_CTA]", "").trim();
            }

            // Update history
            chatHistory.push({ role: "model", text: responseText }); // Save raw to history for context
            saveHistory();

            // Render AI Message
            appendMessage("ai", finalOutput, showCTAs);

        } catch (error) {
            document.getElementById(typingId)?.remove();
            appendMessage("ai", "Sorry, AI is currently unavailable. Please try again later or contact us via email.");
        } finally {
            isWaitingForAI = false;
            if (inputField.value.trim().length > 0) sendBtn.disabled = false;
            scrollToBottom();
        }
    }

    // --- Rendering logic ---

    function appendMessage(role, text, showCTAs = false) {
        const div = document.createElement("div");
        div.className = `message ${role}`;
        
        // Parse basic Markdown (Bold, Lists, Code)
        let formattedText = parseMarkdown(text);
        div.innerHTML = formattedText;

        if (showCTAs && role === "ai") {
            const ctaContainer = document.createElement("div");
            ctaContainer.className = "action-buttons";
            ctaContainer.innerHTML = `
                <button class="btn-cta primary" onclick="window.open('${CONFIG.URLS.booking}', '_blank')">📅 Book a Free Consultation</button>
                <button class="btn-cta" onclick="window.open('${CONFIG.URLS.whatsapp}', '_blank')">📱 Continue on WhatsApp</button>
                <button class="btn-cta" onclick="window.location.href='${CONFIG.URLS.email}'">📧 Send Details via Email</button>
            `;
            div.appendChild(ctaContainer);
        }

        messagesContainer.appendChild(div);
        scrollToBottom();
    }

    function addWelcomeMessage() {
        const welcomeText = "👋 Hello!\n\nWelcome to Moldrivo.\n\nHow can I help you build your next digital experience today?";
        appendMessage("ai", welcomeText);
        chatHistory.push({ role: "model", text: welcomeText });
        saveHistory();
    }

    function showTypingIndicator() {
        const id = "typing-" + Date.now();
        const div = document.createElement("div");
        div.className = "message ai";
        div.id = id;
        div.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        messagesContainer.appendChild(div);
        scrollToBottom();
        return id;
    }

    function scrollToBottom() {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 50);
    }

    function parseMarkdown(text) {
        let html = text.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Sanitize
        
        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Bullet Points
        html = html.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>');
        html = html.replace(/<\/ul>\n<ul>/g, ''); // Fix consecutive lists
        
        // Line breaks
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    // --- Local Storage Management ---

    function saveHistory() {
        try {
            localStorage.setItem("moldrivo_chat_history", JSON.stringify(chatHistory));
        } catch (e) {
            console.warn("Could not save to localStorage");
        }
    }

    function loadHistory() {
        try {
            const saved = localStorage.getItem("moldrivo_chat_history");
            if (saved) {
                chatHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.warn("Could not load from localStorage");
        }
    }

    function renderHistory() {
        messagesContainer.innerHTML = '';
        chatHistory.forEach(msg => {
            // Check if it contained the secret CTA tag to re-render buttons
            let text = msg.text;
            let showCTA = false;
            if(text.includes("[SHOW_CTA]")) {
                showCTA = true;
                text = text.replace("[SHOW_CTA]", "").trim();
            }
            appendMessage(msg.role, text, showCTA);
        });
        scrollToBottom();
    }

    // --- Export Chat ---
    
    function downloadChatHistory() {
        if (chatHistory.length === 0) return alert("Chat is empty.");
        let txt = "Moldrivo AI Chat History\n\n";
        chatHistory.forEach(msg => {
            let role = msg.role === 'user' ? "You" : "Moldrivo AI";
            let text = msg.text.replace("[SHOW_CTA]", "").trim();
            txt += `${role}:\n${text}\n\n`;
        });
        
        const blob = new Blob([txt], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Moldrivo_Chat.txt";
        a.click();
        URL.revokeObjectURL(url);
    }
});
