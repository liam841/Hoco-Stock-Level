# Dependencies for Netlify Functions

This document explains where to put dependencies when you add serverless functions.

## Current Setup

- **Root `package.json`**: No dependencies (static site doesn't need them)
- **Netlify Functions**: Will have their own dependencies when added

## When Adding Netlify Functions

When you create a Netlify Function at `netlify/functions/upload-dropbox.js`, you have two options:

### Option 1: Root package.json (Recommended)

Create/update the root `package.json` with dependencies:

```json
{
  "name": "teststock-csv-converter",
  "version": "1.0.0",
  "dependencies": {
    "dropbox": "^10.34.0",
    "lambda-multipart-parser": "^2.0.1"
  }
}
```

Netlify will automatically install these for your functions.

### Option 2: Function-specific package.json

Create a `package.json` in `netlify/functions/`:

```json
{
  "name": "netlify-functions",
  "version": "1.0.0",
  "dependencies": {
    "dropbox": "^10.34.0",
    "lambda-multipart-parser": "^2.0.1"
  }
}
```

## Required Dependencies for Dropbox Upload

When you set up the Dropbox upload function, you'll need:

```bash
npm install dropbox lambda-multipart-parser
```

These are currently listed in the API example files but not in package.json since we don't have functions yet.

## Testing Locally

To test Netlify Functions locally:

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run: `netlify dev`
3. This will install dependencies automatically

