// Required: npm install @netlify/blobs busboy --save
// (run this in your project root, then git add/commit/push)

import { getStore } from '@netlify/blobs';
import Busboy from 'busboy';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const store = getStore({ name: 'choir-songs', consistency: 'strong' });

  return new Promise((resolve) => {
    const bb = Busboy({ headers: req.headers });
    let month = '';
    const uploadedFiles = [];

    bb.on('field', (name, value) => {
      if (name === 'month') month = value.trim();
    });

    bb.on('file', (fieldname, file, filename) => {
      if (!filename || !filename.toLowerCase().endsWith('.mp3')) {
        file.resume(); // ignore non-mp3
        return;
      }

      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const key = `${month}/${fieldname}.mp3`;

          await store.set(key, buffer, {
            contentType: 'audio/mpeg',
          });

          uploadedFiles.push({ fieldname, key });
        } catch (e) {
          console.error('Blob upload error:', e);
        }
      });
    });

    bb.on('finish', () => {
      if (!month || uploadedFiles.length === 0) {
        return resolve(
          new Response(JSON.stringify({ error: 'No valid files or month provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }

      resolve(
        new Response(
          JSON.stringify({
            success: true,
            uploaded: uploadedFiles.map(f => f.fieldname),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    });

    bb.on('error', (err) => {
      console.error('Busboy error:', err);
      resolve(
        new Response(JSON.stringify({ error: 'Upload processing failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    req.pipe(bb);
  });
};

export const config = { path: '/upload-song' };
