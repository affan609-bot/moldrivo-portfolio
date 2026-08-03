const express = require('express');

const { createSubscriber, findSubscriberByEmail } = require('../db');
const { isValidEmail, cleanText, log } = require('../utils');

const router = express.Router();

router.post('/', (req, res) => {
    const email = cleanText(req.body?.email || '');

    if (!isValidEmail(email)) return res.status(400).json({ error: 'A valid email is required' });

    const normalized = email.toLowerCase();

    if (findSubscriberByEmail(normalized)) {
        return res.json({ success: true, alreadySubscribed: true });
    }

    createSubscriber({
        email: normalized,
        createdAt: new Date().toISOString(),
        source: req.get('referer') || 'unknown'
    });

    log('INFO', `New subscriber ${normalized}`);
    res.status(201).json({ success: true });
});

module.exports = router;
