const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('./src/config');
const { log } = require('./src/utils');
const { notFound, errorHandler } = require('./src/middleware/errors');

const healthRouter = require('./src/routes/health');
const contactRouter = require('./src/routes/contact');
const newsletterRouter = require('./src/routes/newsletter');
const chatRouter = require('./src/routes/chat');

const app = express();
const isProd = config.env === 'production';

app.set('trust proxy', 1);

app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(cors());

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname)));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: false,
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ error: 'Too many requests, please try again later.' })
});

const formLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: false,
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ error: 'Too many submissions, please try again later.' })
});

app.use('/api', apiLimiter);
app.use('/api/contact', formLimiter);
app.use('/api/newsletter', formLimiter);

app.use('/api/health', healthRouter);
app.use('/api/contact', contactRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/chat', chatRouter);

app.use('/api', notFound);

if (!isProd) {
    app.use((req, res, next) => {
        log('DEBUG', `${req.method} ${req.originalUrl}`);
        next();
    });
}

app.use(errorHandler);

const server = app.listen(config.port, () => {
    log('INFO', `Moldrivo backend running at http://localhost:${config.port} (${config.env})`);
});

function shutdown(signal) {
    log('INFO', `${signal} received, shutting down...`);
    server.close(() => {
        log('INFO', 'Server closed gracefully');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;