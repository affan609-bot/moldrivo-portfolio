class AI_Service {
    constructor() {
        this.endpoint = new URL(CONFIG.API_ENDPOINT, window.location.origin).href;
    }

    // Sends chat history to the backend proxy, which calls Gemini with the
    // hidden server-side API key.
    async sendMessage(chatHistory) {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: chatHistory })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("API Error Details:", errorData);
                throw new Error("API responded with an error");
            }

            const data = await response.json();
            if (data.text) {
                return data.text;
            } else {
                throw new Error("No response generated");
            }

        } catch (error) {
            console.error("Chat API Error:", error);
            throw error;
        }
    }
}

const aiApi = new AI_Service();