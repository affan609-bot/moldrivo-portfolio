const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'moldrivo.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT DEFAULT '',
    budget TEXT DEFAULT '',
    service TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT DEFAULT 'unknown',
    ip TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'unknown',
    created_at TEXT NOT NULL
  );
`);

const insertLeadStmt = db.prepare(`
  INSERT INTO leads (id, name, email, company, budget, service, message, source, ip, created_at)
  VALUES (@id, @name, @email, @company, @budget, @service, @message, @source, @ip, @createdAt)
`);

const insertSubscriberStmt = db.prepare(`
  INSERT INTO subscribers (id, email, source, created_at)
  VALUES (@id, @email, @source, @createdAt)
`);

const findSubscriberStmt = db.prepare('SELECT id FROM subscribers WHERE email = ?');

function createLead(lead) {
    insertLeadStmt.run({ ...lead, id: crypto.randomUUID() });
    return lead;
}

function createSubscriber(subscriber) {
    insertSubscriberStmt.run({ ...subscriber, id: crypto.randomUUID() });
    return subscriber;
}

function findSubscriberByEmail(email) {
    return findSubscriberStmt.get(email) || null;
}

function countLeads() {
    return db.prepare('SELECT COUNT(*) AS total FROM leads').get().total;
}

function countSubscribers() {
    return db.prepare('SELECT COUNT(*) AS total FROM subscribers').get().total;
}

module.exports = {
    db,
    createLead,
    createSubscriber,
    findSubscriberByEmail,
    countLeads,
    countSubscribers
};
