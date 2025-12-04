# TestStock CSV Converter

A web application that automatically processes CSV files and uploads them to Dropbox. Users upload files that are processed in the background and saved directly to your Dropbox without displaying any data.

## 🔒 Security Notice

**This is a public repository.** All sensitive information (tokens, API keys, secrets) must be stored in environment variables, never in code. See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## ✨ Features

- 📤 **File Upload**: Upload TestStockCSV files directly on the website
- 🔄 **Automatic Processing**: Processes files automatically (no user interaction needed)
- 🗑️ **Column Removal**: Automatically removes: `sales_price`, `Item_Vendor_No`, `ean`, `ad_id`
- 🔄 **Column Renaming**: Renames `sku` → `SKU`, `free_stock` → `Stock Level`
- 🔢 **Value Replacement**: Replaces `++` values (like `5++`) with `10` in Stock Level column
- ☁️ **Dropbox Upload**: Automatically uploads processed files to your Dropbox
- 🔒 **Privacy**: Users don't see the processed data - files go directly to Dropbox
- 🎨 **Professional UI**: Clean, business-appropriate interface

## 🚀 Quick Start

### 🪄 Easy Setup: Use the Setup Wizard!

**NEW:** Open `setup-wizard.html` in your browser for an interactive setup guide that walks you through:
- Getting your Dropbox access token
- Choosing your hosting platform
- Configuring environment variables
- Testing your connection
- Generating setup instructions

Or follow the manual steps below.

### Step 1: Deploy the Frontend

1. **Push to GitHub and deploy to GitHub Pages:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Your site will be available at: `https://YOUR_USERNAME.github.io/REPO_NAME/`

### Step 2: Set Up Dropbox Upload Backend

**Important:** You need to set up a backend API endpoint to handle Dropbox uploads. See **[DROPBOX_SETUP.md](DROPBOX_SETUP.md)** for detailed instructions.

Quick options:
- **Netlify Functions** (easiest for GitHub Pages)
- **Vercel Serverless Functions**
- **AWS Lambda**
- **Custom Express Server**

### Step 3: Configure API Endpoint

In `index.html`, update the API endpoint:

```javascript
const DROPBOX_UPLOAD_API = '/.netlify/functions/upload-dropbox'; // For Netlify
// OR
const DROPBOX_UPLOAD_API = '/api/upload-dropbox'; // For Vercel
// OR  
const DROPBOX_UPLOAD_API = 'https://your-api-endpoint.com/upload'; // For custom server
```

## 📝 How It Works

1. **User uploads file** → File is processed in the browser
2. **CSV processing** → Columns are removed/renamed, values are replaced
3. **Automatic upload** → Processed file is sent to your backend API
4. **Backend uploads to Dropbox** → File is saved to your Dropbox account
5. **User sees success message** → No data is displayed to the user

## 🔧 Configuration

### Column Processing

The following happens automatically to every uploaded file:

- **Removed columns:** `sales_price`, `Item_Vendor_No`, `ean`, `ad_id`
- **Renamed columns:** 
  - `sku` → `SKU`
  - `free_stock` → `Stock Level`
- **Value replacements:** Any value ending with `++` in Stock Level column becomes `10`

### Dropbox Settings

Files are uploaded to: `/TestStock/TestStock_[timestamp].csv`

You can modify this in your backend API code.

## 📁 Project Structure

```
.
├── index.html              # Main website file
├── setup-wizard.html       # Interactive setup wizard (open in browser)
├── api/                    # Backend API examples
│   ├── upload-dropbox.js          # Basic example
│   └── upload-dropbox-node.js     # Complete Node.js example
├── DROPBOX_SETUP.md       # Detailed setup instructions
├── SECURITY.md            # Security guidelines
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## 🔐 Security Notes

- **Never commit Dropbox access tokens to Git**
- Use environment variables for all sensitive data
- Files are processed client-side but uploaded server-side
- Users cannot access or download the processed files

## 🔐 Security

**Critical:** This repository is public. Follow these security guidelines:

- ✅ **Use environment variables** for all sensitive data (Dropbox tokens, API keys)
- ✅ **Read [SECURITY.md](SECURITY.md)** for complete security guidelines
- ✅ **Use example files** (`env.example`, `config.example.js`) as templates
- ❌ **Never commit** `.env` files, tokens, or secrets
- ❌ **Never hardcode** credentials in code

### Quick Security Checklist:
- [ ] All tokens stored in environment variables (not in code)
- [ ] `.env` files added to `.gitignore`
- [ ] No real credentials in example files
- [ ] Backend API uses environment variables
- [ ] Dropbox token is set in hosting platform (Netlify/Vercel/etc.)

## 📚 Documentation

- **[DROPBOX_SETUP.md](DROPBOX_SETUP.md)** - Detailed backend setup instructions
- **[SECURITY.md](SECURITY.md)** - Complete security guidelines and best practices

## 📄 License

This project is open source and available for personal use.
