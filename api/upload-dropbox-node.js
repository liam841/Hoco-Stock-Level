// More complete example for Node.js serverless function
// Works with Netlify Functions or Vercel Serverless Functions
//
// SECURITY: This file is safe to commit because it uses environment variables.
// Never hardcode your DROPBOX_ACCESS_TOKEN - always use process.env.DROPBOX_ACCESS_TOKEN
// Set the token in your hosting platform's environment variables settings.

const Dropbox = require('dropbox').Dropbox;
const { parse } = require('lambda-multipart-parser');

exports.handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;
        
        if (!DROPBOX_ACCESS_TOKEN) {
            throw new Error('DROPBOX_ACCESS_TOKEN environment variable is not set');
        }

        // Parse multipart form data
        const parsed = await parse(event, true);
        const file = parsed.files && parsed.files[0];
        
        if (!file) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'No file provided' })
            };
        }

        // Initialize Dropbox client
        const dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN });
        
        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `TestStock_${timestamp}.csv`;
        const filePath = `/TestStock/${fileName}`;
        
        // Upload to Dropbox
        const response = await dbx.filesUpload({
            path: filePath,
            contents: file.content,
            mode: { '.tag': 'add' },
            autorename: true,
            mute: false
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                message: 'File uploaded to Dropbox successfully',
                path: response.path_display,
                fileName: fileName
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Failed to upload file',
                message: error.message
            })
        };
    }
};

