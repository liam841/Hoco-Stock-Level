// Netlify Function: upload-dropbox.js
// Handles upload of processed CSV to Dropbox using Dropbox HTTP API

const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;
    if (!DROPBOX_ACCESS_TOKEN) {
      throw new Error('DROPBOX_ACCESS_TOKEN environment variable is not set');
    }

    // Parse JSON body (Netlify may send base64-encoded body)
    const isBase64 = event.isBase64Encoded;
    const rawBody = isBase64
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : event.body || '';

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      throw new Error('Invalid JSON body');
    }

    const csvContent = data.csv;
    const originalName = data.originalName || 'TestStock.csv';

    if (!csvContent) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Missing csv field in request body' }),
      };
    }

    // Normalise original name: keep safe chars, strip existing extension
    let safeName =
      (originalName && originalName.replace(/[^a-zA-Z0-9_.-]/g, '_')) ||
      'TestStock';
    // Remove any existing extension, then force .csv
    safeName = safeName.replace(/\.[^/.]+$/, '');
    const fileName = `${safeName}.csv`;
    const dropboxPath = `/TestStock/${fileName}`;

    const fileBuffer = Buffer.from(csvContent, 'utf8');

    const uploadResponse = await fetch(
      'https://content.dropboxapi.com/2/files/upload',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DROPBOX_ACCESS_TOKEN}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: dropboxPath,
            // Overwrite the same file on each upload
            mode: 'overwrite',
            autorename: false,
            mute: false,
            strict_conflict: false,
          }),
        },
        body: fileBuffer,
      },
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(
        `Dropbox API error: ${uploadResponse.status} ${errorText}`,
      );
    }

    const result = await uploadResponse.json();

    // Try to send notification email (do not fail the upload if email fails)
    try {
      await sendNotificationEmail({
        fileName,
        dropboxPath,
      });
    } catch (notifyError) {
      console.error('Failed to send notification email:', notifyError);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        path: result.path_display,
        name: result.name,
      }),
    };
  } catch (error) {
    console.error('Error in upload-dropbox function:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        error: 'Failed to upload file to Dropbox',
        message: error.message,
      }),
    };
  }
};

/**
 * Send notification email when a file is uploaded.
 *
 * This uses Gmail SMTP via Nodemailer.
 * Recommended: create a Gmail App Password and use that, not your real password.
 *
 * Required env vars (set in Netlify):
 * - SMTP_HOST      (e.g. smtp.gmail.com)
 * - SMTP_PORT      (e.g. 587)
 * - SMTP_USER      (your Gmail address)
 * - SMTP_PASS      (Gmail App Password)
 * - EMAIL_TO       (your email address)
 * - EMAIL_FROM     (sender address – usually same as SMTP_USER)
 */
async function sendNotificationEmail({ fileName, dropboxPath }) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.EMAIL_TO;
  const from = process.env.EMAIL_FROM || user;

  if (!host || !port || !user || !pass || !to || !from) {
    // Email not configured; skip silently
    console.warn(
      'Email notification not configured (missing SMTP_* or EMAIL_* env vars).',
    );
    return;
  }

  const subject = 'New TestStock CSV uploaded';
  const text =
    `A new TestStock CSV file has been uploaded.\n\n` +
    `File name: ${fileName}\n` +
    `Dropbox path: ${dropboxPath}\n` +
    `Time: ${new Date().toISOString()}\n`;

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
  });
}
