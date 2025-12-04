// Serverless function for Netlify (netlify/functions/upload-dropbox.js)
// Or for Vercel (api/upload-dropbox.js)
//
// SECURITY: This file is safe to commit because it uses environment variables.
// Never hardcode your DROPBOX_ACCESS_TOKEN - always use process.env.DROPBOX_ACCESS_TOKEN
// Set the token in your hosting platform's environment variables settings.

const Dropbox = require('dropbox').Dropbox;

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Get Dropbox access token from environment variable
        const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;
        
        if (!DROPBOX_ACCESS_TOKEN) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Dropbox access token not configured' })
            };
        }

        // Parse the multipart form data
        const formData = event.body;
        
        // Extract file from form data (you may need to parse multipart/form-data)
        // This is a simplified example - you'll need to properly parse multipart/form-data
        const dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN });
        
        // Parse the file from the request
        // Note: You'll need to use a library like 'formidable' or 'multer' to parse multipart/form-data
        // For now, this is a template structure
        
        const fileName = `TestStock_${Date.now()}.csv`;
        const filePath = `/TestStock/${fileName}`;
        
        // Upload file to Dropbox
        // You'll need to properly extract the file buffer from the multipart form data
        const response = await dbx.filesUpload({
            path: filePath,
            contents: event.body, // This needs to be the actual file buffer
            mode: { '.tag': 'add' },
            autorename: true,
            mute: false
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message: 'File uploaded to Dropbox successfully',
                path: response.path_display
            })
        };

    } catch (error) {
        console.error('Error uploading to Dropbox:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Failed to upload file',
                message: error.message
            })
        };
    }
};

