function isValidEmail(email) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function cleanText(value) {
    return String(value || '').trim();
}

function log(level, msg, meta) {
    const ts = new Date().toISOString();
    const suffix = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`[${ts}] [${level}] ${msg}${suffix}`);
}

function asyncHandler(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

module.exports = { isValidEmail, cleanText, log, asyncHandler, HttpError };