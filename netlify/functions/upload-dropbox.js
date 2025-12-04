// Netlify Function: upload-dropbox.js
// Handles upload of processed CSV to Dropbox using Dropbox HTTP API

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

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName =
      originalName.replace(/[^a-zA-Z0-9_.-]/g, '_') || 'TestStock.csv';
    const fileName = `TestStock_${timestamp}_${safeName}`;
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
            mode: 'add',
            autorename: true,
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
