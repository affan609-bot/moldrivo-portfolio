const nodemailer = require('nodemailer');

const { log } = require('./utils');

function buildMailer() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const to = process.env.EMAIL_TO;

    if (!host || !user || !pass || !to) {
        log('WARN', 'SMTP_* / EMAIL_TO not fully configured. Email notifications disabled.');
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass }
    });
}

const mailer = buildMailer();

function sendLeadEmail(lead) {
    if (!mailer) return;

    const to = process.env.EMAIL_TO;
    const company = lead.company || '—';
    const budgetText = lead.budget || '—';

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
      <div style="background:#0A0A0A;padding:20px 24px">
        <span style="color:#fff;font-size:20px;font-weight:bold">Moldrivo</span>
        <span style="color:#A7FF3C;float:right;font-size:12px">NEW LEAD</span>
      </div>
      <div style="padding:24px">
        <h2 style="margin:0 0 8px;color:#111">${escapeHtml(lead.name)}</h2>
        <p style="margin:0 0 20px;color:#666"><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#888">Service</td><td style="padding:8px 0;text-align:right"><b>${escapeHtml(lead.service)}</b></td></tr>
          <tr><td style="padding:8px 0;color:#888">Company</td><td style="padding:8px 0;text-align:right"><b>${escapeHtml(company)}</b></td></tr>
          <tr><td style="padding:8px 0;color:#888">Budget</td><td style="padding:8px 0;text-align:right"><b>${escapeHtml(budgetText)}</b></td></tr>
          <tr><td style="padding:8px 0;color:#888">Sent</td><td style="padding:8px 0;text-align:right"><b>${new Date(lead.createdAt).toLocaleString()}</b></td></tr>
        </table>
        <div style="margin-top:20px;background:#f7f7f7;border-radius:8px;padding:16px">
          <b style="color:#888;font-size:12px;text-transform:uppercase">Project details</b>
          <p style="margin:8px 0 0;color:#333;line-height:1.5">${escapeHtml(lead.message)}</p>
        </div>
      </div>
    </div>`;

    mailer.sendMail({
        from: `"Moldrivo Form" <${process.env.SMTP_USER}>`,
        to,
        subject: `New Lead: ${lead.service} — ${lead.name}`,
        replyTo: lead.email,
        text: `New lead from ${lead.name} (${lead.email}).\nService: ${lead.service}\nCompany: ${company}\nBudget: ${budgetText}\n\n${lead.message}`,
        html
    }, (err, info) => {
        if (err) {
            log('ERROR', `Failed to send lead email from ${lead.email}`, { error: err.message });
        } else {
            log('INFO', `Lead email sent to ${to} (${info.messageId})`);
        }
    });
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

module.exports = { sendLeadEmail };