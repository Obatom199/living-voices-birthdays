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

function buildEmailHtml(upcoming, daysLabel) {
  const birthdayRows = upcoming.map(b => {
    const date = new Date(b.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const days = getDaysUntilBirthday(b.birthday);
    return `
      <div style="padding:15px;border-bottom:1px solid #e0e0e0;">
        <strong style="font-size:17px;color:#1a1a2e;">${b.name}</strong>
        <div style="color:#666;margin-top:4px;">${date} — in ${days} day${days !== 1 ? 's' : ''}</div>
      </div>`;
  }).join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#c94545 0%,#8b1e1e 100%);padding:30px;text-align:center;color:white;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;font-size:1.8em;">🎂 The Living Voices</h1>
        <p style="margin:8px 0 4px;font-size:1em;">Birthday Reminder — ${daysLabel}</p>
        <p style="margin:0;font-size:0.85em;opacity:0.9;font-style:italic;">RCCG Living Water Parish, Kano</p>
      </div>
      <div style="padding:30px;background:#f8f9fa;">
        <p style="font-size:16px;color:#333;">Hello,</p>
        <p style="font-size:16px;color:#333;">
          The following choir member${upcoming.length > 1 ? 's have' : ' has'}
          ${upcoming.length > 1 ? 'birthdays' : 'a birthday'} coming up <strong>${daysLabel}</strong>:
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
        This is an automatic daily reminder from The Living Voices Birthday Tracker.
      </div>
    </div>`;
}

// Runs every day at 8:00 AM Nigeria time (7:00 AM UTC)
exports.handler = async () => {
  const API_KEY = process.env.JSONBIN_API_KEY;
  const BIN_ID  = process.env.JSONBIN_BIN_ID;

  if (!API_KEY || !BIN_ID) {
    console.error("Missing JSONBIN environment variables");
    return { statusCode: 500, body: "Missing environment variables" };
  }

  try {
    const store = await readBin(BIN_ID, API_KEY);
    const birthdays = Array.isArray(store.birthdays) ? store.birthdays : [];
    const settings  = store.settings || { adminEmail: "" };
    const adminEmail = settings.adminEmail;

    if (!adminEmail) {
      console.log("No admin email configured, skipping reminder.");
      return { statusCode: 200, body: "No admin email set" };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Check for birthdays exactly 2 days away
    const twoDays = birthdays.filter(b => getDaysUntilBirthday(b.birthday) === 2 && !b.posted);

    // Check for birthdays exactly 1 day away
    const oneDay = birthdays.filter(b => getDaysUntilBirthday(b.birthday) === 1 && !b.posted);

    let totalSent = 0;

    if (twoDays.length > 0) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: `🎂 Living Voices: ${twoDays.length} birthday${twoDays.length > 1 ? 's' : ''} in 2 days!`,
        html: buildEmailHtml(twoDays, "in 2 days")
      });
      totalSent += twoDays.length;
      console.log(`2-day reminder sent for ${twoDays.length} birthday(s)`);
    }

    if (oneDay.length > 0) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: `🎂 Living Voices: ${oneDay.length} birthday${oneDay.length > 1 ? 's' : ''} TOMORROW!`,
        html: buildEmailHtml(oneDay, "TOMORROW")
      });
      totalSent += oneDay.length;
      console.log(`1-day reminder sent for ${oneDay.length} birthday(s)`);
    }

    if (totalSent === 0) {
      console.log("No birthdays to remind today.");
      return { statusCode: 200, body: "No reminders needed today" };
    }

    return { statusCode: 200, body: `Sent reminders for ${totalSent} birthday(s)` };

  } catch (err) {
    console.error("Scheduled reminder error:", err);
    return { statusCode: 500, body: err.message };
  }
};
