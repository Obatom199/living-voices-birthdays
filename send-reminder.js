const nodemailer = require("nodemailer");
const { getStore } = require("@netlify/blobs");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function getDaysUntilBirthday(birthday) {
  const today = new Date();
  const birth = new Date(birthday);
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  const diff = next - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

exports.handler = async () => {
  try {
    const birthdaysStore = getStore({ name: "birthdays", consistency: "strong" });
    const settingsStore = getStore({ name: "settings", consistency: "strong" });

    const birthdays = await birthdaysStore.getJSON("list") || [];
    const settings  = await settingsStore.getJSON("config")  || { adminEmail: "", reminderDays: "2" };

    const reminderDays = parseInt(settings.reminderDays, 10);
    const adminEmail   = settings.adminEmail;

    if (!adminEmail) {
      return { statusCode: 400, body: JSON.stringify({ error: "Admin email not configured" }) };
    }

    const upcoming = birthdays.filter(b => getDaysUntilBirthday(b.birthday) === reminderDays && !b.posted);

    if (upcoming.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ message: "No birthdays need reminding today" }) };
    }

    // ──────────────────────────────────────────────
    // Paste your beautiful HTML email template here
    // (from your original send-reminder.js file)
    // Example short version:
    const html = `
      <h1>🎂 Living Voices Birthday Reminder</h1>
      <p>${upcoming.length} upcoming birthday${upcoming.length > 1 ? 's' : ''}:</p>
      <ul>
        ${upcoming.map(b => `<li>${b.name} – ${new Date(b.birthday).toLocaleDateString()} (${getDaysUntilBirthday(b.birthday)} days)</li>`).join('')}
      </ul>
      <p>Don't forget to celebrate!</p>
      <p>Blessings,<br>The Living Voices Birthday Tracker</p>
    `;
    // ──────────────────────────────────────────────

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `🎂 Living Voices Reminder: ${upcoming.length} birthday${upcoming.length > 1 ? 's' : ''}`,
      html
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, sent: upcoming.length })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to send reminder" }) };
  }
};
