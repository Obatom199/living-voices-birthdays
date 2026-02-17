const https = require("https");

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Content-Type": "application/json"
  };
}

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
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  const API_KEY = process.env.JSONBIN_API_KEY;
  const BIN_ID  = process.env.JSONBIN_BIN_ID;

  if (!API_KEY || !BIN_ID) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Missing JSONBIN_API_KEY or JSONBIN_BIN_ID environment variables" })
    };
  }

  try {
    const store = await readBin(BIN_ID, API_KEY);
    const list = Array.isArray(store.birthdays) ? store.birthdays : [];

    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify(list)
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      list.push({
        id: Date.now().toString(),
        name: body.name.trim(),
        gender: body.gender || '',
        contact: body.contact ? body.contact.trim() : '',
        email: body.email ? body.email.trim() : '',
        birthday: body.birthday,
        posted: false,
        createdAt: new Date().toISOString()
      });
      store.birthdays = list;
      await writeBin(BIN_ID, API_KEY, store);
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ success: true })
      };
    }

    if (event.httpMethod === "PATCH") {
      const body = JSON.parse(event.body);
      const idx = list.findIndex(item => item.id === body.id);
      if (idx === -1) {
        return { statusCode: 404, headers: corsHeaders(), body: JSON.stringify({ error: "Not found" }) };
      }
      if (body.action === "togglePosted") {
        list[idx].posted = !list[idx].posted;
      }
      store.birthdays = list;
      await writeBin(BIN_ID, API_KEY, store);
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ success: true })
      };
    }

    if (event.httpMethod === "DELETE") {
      const body = JSON.parse(event.body);
      store.birthdays = list.filter(item => item.id !== body.id);
      await writeBin(BIN_ID, API_KEY, store);
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ success: true })
      };
    }

    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Method Not Allowed" })
    };

  } catch (err) {
    console.error("Handler error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Internal error", detail: err.message })
    };
  }
};
