// Configuration Example File
// Copy this file to config.js and fill in your actual values
// DO NOT commit config.js to git - it's in .gitignore

// This file shows the structure but contains no real secrets
// Your actual config.js should never be committed to the repository

const config = {
    // Backend API endpoint for Dropbox uploads
    // Examples:
    // - Netlify: '/.netlify/functions/upload-dropbox'
    // - Vercel: '/api/upload-dropbox'
    // - Custom: 'https://your-api-domain.com/upload'
    DROPBOX_UPLOAD_API: '/api/upload-dropbox',
    
    // You can add other configuration here
    // For example, allowed file types, max file size, etc.
};

// For use in browser (if you want to load config from a file)
if (typeof window !== 'undefined') {
    window.CONFIG = config;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}

