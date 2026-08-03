// Moldrivo AI Configuration
// NOTE: The Gemini API key now lives ONLY in the backend's .env file.
// The frontend never sees it. Chat requests go through the Express proxy.
const CONFIG = {
    // Backend chat endpoint (same-origin, served by Express)
    API_ENDPOINT: "/api/chat",

    // URLs for actions
    URLS: {
        booking: "https://calendly.com/moldrivo",
        whatsapp: "https://wa.me/1234567890",
        email: "mailto:hello@moldrivo.com"
    }
};