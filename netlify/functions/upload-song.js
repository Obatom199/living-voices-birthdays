// netlify/functions/upload-song.js
// Required: npm install @netlify/blobs busboy --save-dev (run in project root)

import { getStore } from '@netlify/blobs';
import Busboy from 'busboy';

export default async (request) => {
  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const store = getStore({ name: 'choir-songs', consistency: 'strong' });

    return new Promise((resolve) => {
      const bb = Busboy({ headers: request.headers });
      let month = '';
      const uploaded = [];

      bb.on('field', (name, value) => {
        if (name === 'month') {
          month = value.trim();
        }
      });

      bb.on('file', (fieldname, file, filename) => {
        // Skip if no filename or not MP3
        if (!filename || !filename.toLowerCase().endsWith('.mp3')) {
          file.resume();
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

            uploaded.push(fieldname);
          } catch (uploadErr) {
            console.error('Upload error for', fieldname, uploadErr);
          }
        });
      });

      bb.on('finish', () => {
        if (!month || uploaded.length === 0) {
          return resolve(
            new Response(
              JSON.stringify({ error: 'No month or valid MP3 files provided' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
          );
        }

        resolve(
          new Response(
            JSON.stringify({
              success: true,
              message: 'Upload successful',
              uploadedFiles: uploaded,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        );
      });

      bb.on('error', (err) => {
        console.error('Busboy error:', err);
        resolve(
          new Response(
            JSON.stringify({ error: 'Upload processing failed' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        );
      });

      request.pipe(bb);
    });
  } catch (globalErr) {
    console.error('Global function error:', globalErr);
    return new Response(
      JSON.stringify({ error: 'Server error during upload' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config = { path: '/upload-song' };
