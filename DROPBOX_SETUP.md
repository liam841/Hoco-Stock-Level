# Dropbox Upload Setup Instructions

This guide will help you set up automatic file uploads to Dropbox when users process their CSV files.

## 🔒 Security Warning

**IMPORTANT:** This repository is public. Never commit your Dropbox access token or any secrets to Git!

- ✅ Use environment variables for all sensitive data
- ✅ See [SECURITY.md](SECURITY.md) for detailed security guidelines
- ❌ Never hardcode tokens in code files
- ❌ Never commit `.env` files or files containing secrets

## Option 1: Using Netlify Functions (Recommended for GitHub Pages)

### Step 1: Get Dropbox Access Token

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click "Create app"
3. Choose:
   - **API**: Dropbox API
   - **Access level**: Full Dropbox or App folder
   - **App name**: Your app name (e.g., "CSV Uploader")
4. Click "Create app"
5. Go to the "Permissions" tab and ensure "files.content.write" is enabled
6. Go to the "Settings" tab and generate an access token (or use OAuth flow)
7. Copy the access token - you'll need it for environment variables

### Step 2: Set Up Netlify Function

1. Create a `netlify/functions/upload-dropbox.js` file (create the directories if needed)
2. Copy the content from `api/upload-dropbox-node.js`
3. Install required packages:

```bash
npm install dropbox lambda-multipart-parser
```

### Step 3: Configure Environment Variables

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add:
   - Key: `DROPBOX_ACCESS_TOKEN`
   - Value: Your Dropbox access token from Step 1

### Step 4: Update API Endpoint in index.html

In `index.html`, update the `DROPBOX_UPLOAD_API` constant:

```javascript
const DROPBOX_UPLOAD_API = '/.netlify/functions/upload-dropbox';
```

### Step 5: Deploy to Netlify

1. Push your code to GitHub
2. Connect your GitHub repo to Netlify
3. Set build command: (leave empty or use your build command)
4. Set publish directory: (leave as root or set to your dist folder)
5. Deploy!

## Option 2: Using Vercel Serverless Functions

### Step 1: Get Dropbox Access Token

Follow Step 1 from Option 1 above.

### Step 2: Set Up Vercel Function

1. Create an `api/upload-dropbox.js` file
2. Copy the content from `api/upload-dropbox-node.js`
3. Create `package.json` if you don't have one:

```json
{
  "dependencies": {
    "dropbox": "^10.0.0",
    "lambda-multipart-parser": "^2.0.1"
  }
}
```

### Step 3: Configure Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - Key: `DROPBOX_ACCESS_TOKEN`
   - Value: Your Dropbox access token

### Step 4: Update API Endpoint

In `index.html`, update:

```javascript
const DROPBOX_UPLOAD_API = '/api/upload-dropbox';
```

### Step 5: Deploy

```bash
vercel
```

## Option 3: Using AWS Lambda + API Gateway

1. Create a Lambda function
2. Upload the code from `api/upload-dropbox-node.js`
3. Set environment variable `DROPBOX_ACCESS_TOKEN`
4. Create an API Gateway endpoint
5. Update `DROPBOX_UPLOAD_API` in `index.html` to your API Gateway URL

## Option 4: Using a Simple Express Server

Create a `server.js` file:

```javascript
const express = require('express');
const multer = require('multer');
const Dropbox = require('dropbox').Dropbox;
const app = express();

const upload = multer({ storage: multer.memoryStorage() });
const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });

app.post('/api/upload-dropbox', upload.single('file'), async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `TestStock_${timestamp}.csv`;
        
        const response = await dbx.filesUpload({
            path: `/TestStock/${fileName}`,
            contents: req.file.buffer,
            mode: { '.tag': 'add' },
            autorename: true
        });
        
        res.json({ success: true, path: response.path_display });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
```

## Security Notes

- **Never commit your Dropbox access token to Git**
- Always use environment variables
- Consider using OAuth flow for better security
- Rate limit your API endpoints
- Validate file sizes and types

## Testing

1. Upload a file through the website
2. Check your Dropbox folder at `/TestStock/` for the uploaded file
3. Files will be named like: `TestStock_2024-01-15T10-30-00-000Z.csv`

## Troubleshooting

- **CORS errors**: Ensure your API returns proper CORS headers
- **401 Unauthorized**: Check that your Dropbox token is valid
- **File not uploading**: Check server logs for errors
- **Multipart parsing errors**: Ensure you're using the correct parser for your platform

