const nodemailer = require("nodemailer");
const https = require("https");

function readBin(binId, apiKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.jsonbin.io",
      path: `/v3/b/${binId}/latest`,
      method: "GET",
      headers: { "X-Master-Key": apiKey, "X-Bin-Meta": "false" }
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve({}); }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function getDaysUntilBirthday(birthday) {
  const today = new Date();
  const birth = new Date(birthday);
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  const diff = next - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

exports.handler = async () => {
  const API_KEY = process.env.JSONBIN_API_KEY;
  const BIN_ID  = process.env.JSONBIN_BIN_ID;

  if (!API_KEY || !BIN_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing JSONBIN_API_KEY or JSONBIN_BIN_ID environment variables" })
    };
  }

  try {
    const store = await readBin(BIN_ID, API_KEY);
    const birthdays = Array.isArray(store.birthdays) ? store.birthdays : [];
    const settings  = store.settings || { adminEmail: "", reminderDays: "2" };

    const reminderDays = parseInt(settings.reminderDays, 10);
    const adminEmail   = settings.adminEmail;

    if (!adminEmail) {
      return { statusCode: 400, body: JSON.stringify({ error: "Admin email not configured. Please save your email in Settings first." }) };
    }

    const upcoming = birthdays.filter(b =>
      getDaysUntilBirthday(b.birthday) === reminderDays && !b.posted
    );

    if (upcoming.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ success: false, message: "No birthdays need reminding today" }) };
    }

    const birthdayRows = upcoming.map(b => {
      const date = new Date(b.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      const days = getDaysUntilBirthday(b.birthday);
      return `
        <div style="padding:15px;border-bottom:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong style="font-size:17px;color:#1a1a2e;">${b.name}</strong>
            <div style="color:#666;margin-top:4px;">${date}</div>
          </div>
          <div style="background:#c94545;color:white;padding:8px 16px;border-radius:20px;font-weight:600;">
            ${days} day${days !== 1 ? 's' : ''}
          </div>
        </div>`;
    }).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#c94545 0%,#8b1e1e 100%);padding:30px;text-align:center;color:white;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;font-size:1.8em;">🎂 The Living Voices</h1>
          <p style="margin:8px 0 4px;font-size:1em;">Birthday Reminder</p>
          <p style="margin:0;font-size:0.85em;opacity:0.9;font-style:italic;">RCCG Living Water Parish, Kano</p>
        </div>
        <div style="padding:30px;background:#f8f9fa;">
          <p style="font-size:16px;color:#333;">Hello,</p>
          <p style="font-size:16px;color:#333;">
            The following Living Voices choir member${upcoming.length > 1 ? 's have' : ' has'}
            ${upcoming.length > 1 ? 'birthdays' : 'a birthday'} coming up in <strong>${reminderDays} day${reminderDays !== 1 ? 's' : ''}</strong>:
          </p>
          <div style="background:white;border-radius:10px;margin:20px 0;overflow:hidden;">
            ${birthdayRows}
          </div>
          <p style="font-size:16px;color:#333;">
            Don't forget to prepare and post their birthday celebration${upcoming.length > 1 ? 's' : ''}!
          </p>
          <p style="font-size:16px;color:#333;margin-top:30px;">
            Blessings,<br>
            <strong>The Living Voices Birthday Tracker</strong><br>
            <span style="font-size:14px;color:#666;">RCCG Living Water Parish, Kano</span><br>
            <em style="font-size:14px;color:#c94545;">"Praise is our weapon"</em>
          </p>
        </div>
        <div style="padding:15px;text-align:center;color:#999;font-size:13px;background:white;border-radius:0 0 12px 12px;">
          You are receiving this because you set up birthday reminders for The Living Voices choir.
        </div>
      </div>`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `🎂 Living Voices Reminder: ${upcoming.length} birthday${upcoming.length > 1 ? 's' : ''} coming up`,
      html
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, sent: upcoming.length })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to send reminder", detail: err.message }) };
  }
};
