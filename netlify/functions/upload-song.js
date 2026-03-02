// netlify/functions/upload-song.js
import { getStore } from '@netlify/blobs';
import Busboy from 'busboy';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const store = getStore({ name: 'choir-songs', consistency: 'strong' });

  return new Promise((resolve) => {
    const bb = Busboy({ headers: req.headers });
    let month = '';
    const uploads = [];

    bb.on('field', (fieldname, val) => {
      if (fieldname === 'month') month = val;
    });

    bb.on('file', async (fieldname, file, filename, encoding, mimetype) => {
      if (!mimetype.startsWith('audio/mpeg')) {
        file.resume(); // drain and ignore invalid
        return;
      }

      const chunks = [];
      file.on('data', chunk => chunks.push(chunk));
      file.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        const key = `${month}/${fieldname}.mp3`;
        await store.set(key, buffer, {
          contentType: 'audio/mpeg'
        });
        uploads.push({ sunday: fieldname, key });
      });
    });

    bb.on('finish', async () => {
      if (!month || uploads.length === 0) {
        return resolve(new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 }));
      }
      // Optional: return list of public URLs
      const urls = {};
      for (const u of uploads) {
        const { url } = await store.getPublicUrl(u.key); // or use signed if private
        urls[u.sunday] = url;
      }
      resolve(new Response(JSON.stringify({ success: true, urls }), { status: 200 }));
    });

    bb.on('error', err => {
      resolve(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
    });

    req.pipe(bb);
  });
};

export const config = { path: "/upload-song" };
