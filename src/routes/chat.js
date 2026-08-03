const express = require('express');

const config = require('../config');
const { cleanText } = require('../utils');

const router = express.Router();

const SYSTEM_INSTRUCTION = `You are a senior, professional, and friendly Sales Agent for a modern software agency called "Moldrivo".

Your Tone: Apple/Stripe-like, elegant, concise, professional, no fluff. Use short paragraphs. Use bullet points for readability.

Moldrivo Services:
- AI Agent Development
- Website Development
- Web Applications
- Mobile Apps
- UI UX Design
- Graphic Design
- Branding & Logo Design
- Landing Pages
- Dashboards

Rules:
1. Always be polite. Stay strictly on business topics related to software, design, and Moldrivo's services. Refuse off-topic questions gently.
2. If the user asks for "Price" or "Pricing", provide these estimates:
   - Landing Page: $500 - $1,500
   - Business Website: $1,500 - $5,000
   - Ecommerce: $3,000 - $10,000+
   - Dashboard/Custom Web App: $5,000 - $20,000+
   - AI Agent: $2,000 - $8,000+
   - UI UX Design / Branding / Logo: Custom quote based on scope.
3. LEAD COLLECTION FLOW: If a user states they want to hire Moldrivo (e.g., "I need an ecommerce website", "I want an app"), you MUST ask for exactly these details in a bulleted list: Name, Company, Budget, Deadline, Country.
4. LEAD SUMMARIZATION: Once the user provides the requested lead details, summarize their project nicely.
5. IMPORTANT TRIGGER: At the very end of your project summary message, you MUST append this exact tag: [SHOW_CTA]. This tag will trigger the frontend to show booking/contact buttons. Do NOT show this tag until you have collected the lead info and are summarizing.`;

router.post('/', async (req, res) => {
    if (!config.geminiApiKey) {
        return res.status(500).json({ error: 'Server API key not configured' });
    }

    const { history } = req.body;

    if (!Array.isArray(history) || history.length === 0) {
        return res.status(400).json({ error: 'No chat history provided' });
    }

    const formattedContents = history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: cleanText(msg.text) }]
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;

    const payload = {
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: formattedContents,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
        }
    };

    try {
        const geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            console.error('Gemini API Error:', data.error || data);
            return res.status(502).json({ error: 'Gemini API error' });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return res.json({ text });

        res.status(502).json({ error: 'No response generated' });
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(502).json({ error: 'Server error contacting Gemini' });
    }
});

module.exports = router;