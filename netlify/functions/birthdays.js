const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const store = getStore({ name: "birthdays", consistency: "strong" });

  try {
    if (event.httpMethod === "GET") {
      const data = await store.getJSON("list") || [];
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      let list = await store.getJSON("list") || [];

      list.push({
        id: Date.now().toString(),
        name: body.name.trim(),
        birthday: body.birthday,
        posted: false,
        createdAt: new Date().toISOString()
      });

      await store.setJSON("list", list);
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    if (event.httpMethod === "PATCH") {
      const body = JSON.parse(event.body);
      let list = await store.getJSON("list") || [];
      const idx = list.findIndex(item => item.id === body.id);

      if (idx === -1) return { statusCode: 404 };

      if (body.action === "togglePosted") {
        list[idx].posted = !list[idx].posted;
      }

      await store.setJSON("list", list);
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    if (event.httpMethod === "DELETE") {
      const body = JSON.parse(event.body);
      let list = await store.getJSON("list") || [];
      list = list.filter(item => item.id !== body.id);
      await store.setJSON("list", list);
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
  }
};
