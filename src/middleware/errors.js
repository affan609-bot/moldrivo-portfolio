const { log } = require('../utils');

function notFound(req, res) {
    res.status(404).json({ error: 'Not found' });
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    const status = err.status || 500;
    if (status >= 500) log('ERROR', err.message, { stack: err.stack });
    res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = { notFound, errorHandler };
