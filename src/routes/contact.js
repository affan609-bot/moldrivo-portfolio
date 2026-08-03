const express = require('express');

const { createLead } = require('../db');
const { sendLeadEmail } = require('../mailer');
const { isValidEmail, cleanText, log } = require('../utils');

const router = express.Router();

router.post('/', (req, res) => {
    const { name, email, company = '', budget = '', service = '', message } = req.body || {};

    const cleanName = cleanText(name);
    const cleanEmail = cleanText(email);
    const cleanService = cleanText(service);
    const cleanMessage = cleanText(message);

    if (!cleanName) return res.status(400).json({ error: 'Name is required' });
    if (!isValidEmail(cleanEmail)) return res.status(400).json({ error: 'A valid email is required' });
    if (!cleanService) return res.status(400).json({ error: 'Service is required' });
    if (!cleanMessage) return res.status(400).json({ error: 'Project details are required' });

    const lead = {
        name: cleanName,
        email: cleanEmail,
        company: cleanText(company),
        budget: cleanText(budget),
        service: cleanService,
        message: cleanMessage,
        createdAt: new Date().toISOString(),
        source: req.get('referer') || 'unknown',
        ip: req.ip || null
    };

    createLead(lead);
    sendLeadEmail(lead);

    log('INFO', `New lead from ${lead.email} (${lead.service})`);
    res.status(201).json({ success: true, id: lead.id });
});

module.exports = router;
