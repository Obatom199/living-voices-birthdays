const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const store = getStore({ name: "settings", consistency: "strong" });

  try {
    if (event.httpMethod === "GET") {
      const config = await store.getJSON("config") || { adminEmail: "", reminderDays: "2" };
      return {
        statusCode: 200,
        body: JSON.stringify(config)
      };
    }

    if (event.httpMethod === "POST") {
      const config = JSON.parse(event.body);
      await store.setJSON("config", {
        adminEmail: config.adminEmail.trim(),
        reminderDays: String(config.reminderDays)
      });
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405 };
  } catch (err) {
    console.error(err);
    return { statusCode: 500 };
  }
};
