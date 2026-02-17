const https = require("https");

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};

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

function writeBin(binId, apiKey, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: "api.jsonbin.io",
      path: `/v3/b/${binId}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "X-Master-Key": apiKey
      }
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: HEADERS, body: "" };
  }

  const API_KEY = process.env.JSONBIN_API_KEY;
  const BIN_ID  = process.env.JSONBIN_BIN_ID;

  if (!API_KEY || !BIN_ID) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: "Missing JSONBIN_API_KEY or JSONBIN_BIN_ID environment variables" })
    };
  }

  try {
    const store = await readBin(BIN_ID, API_KEY);

    if (event.httpMethod === "GET") {
      const settings = store.settings || { adminEmail: "", reminderDays: "2" };
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(settings) };
    }

    if (event.httpMethod === "POST") {
      const config = JSON.parse(event.body);
      store.settings = {
        adminEmail: config.adminEmail.trim(),
        reminderDays: String(config.reminderDays)
      };
      await writeBin(BIN_ID, API_KEY, store);
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: "Method Not Allowed" }) };

  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
