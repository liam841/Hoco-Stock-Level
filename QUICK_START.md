# Quick Start Guide - FileZilla Server Upload

This guide will help you quickly switch from Dropbox to FileZilla Server uploads.

## Changes Made

✅ **Replaced Dropbox API with FTP/SFTP upload**
- New function: `netlify/functions/upload-ftp.js`
- Supports both SFTP (secure) and FTP protocols
- Uses `ssh2-sftp-client` for SFTP and `basic-ftp` for FTP

✅ **Updated frontend**
- Changed API endpoint from `/upload-dropbox` to `/upload-ftp`
- Updated UI text to mention "FileZilla Server" instead of "Dropbox"

✅ **Added dependencies**
- `ssh2-sftp-client` - for SFTP uploads
- `basic-ftp` - for FTP uploads

---

## What You Need to Do

### 1. Configure FileZilla Server

See **[FILEZILLA_SETUP.md](FILEZILLA_SETUP.md)** for detailed instructions.

Quick steps:
1. Install FileZilla Server
2. Create a user account with upload permissions
3. Configure the server (ports, firewall)
4. Test connection locally

### 2. Set Netlify Environment Variables

Go to **Netlify Dashboard** → Your Site → **Site settings** → **Environment variables**

Add these **required** variables:

```
FTP_HOST = your-server-ip-or-domain.com
FTP_PORT = 22
FTP_USER = your-ftp-username
FTP_PASSWORD = your-ftp-password
FTP_REMOTE_PATH = /
FTP_PROTOCOL = sftp
```

**Quick Reference**: See **[NETLIFY_ENV_VARS.md](NETLIFY_ENV_VARS.md)** for all available options.

### 3. Remove Old Dropbox Variables (Optional)

You can remove these old Dropbox variables from Netlify:
- `DROPBOX_ACCESS_TOKEN`
- `DROPBOX_APP_KEY`
- `DROPBOX_APP_SECRET`
- `DROPBOX_REFRESH_TOKEN`

### 4. Keep Email Variables (Optional)

If you want email notifications, keep these:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_TO`
- `EMAIL_FROM`

### 5. Redeploy Your Site

After setting the environment variables:
1. Go to Netlify Dashboard → Your Site → **Deploys**
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete

### 6. Test the Upload

1. Go to your website
2. Upload a test CSV file
3. Check your FileZilla Server upload directory
4. File should appear as `TestStockCSV.csv`

---

## Configuration Examples

### Example 1: SFTP (Recommended - Secure)

```
FTP_HOST = ftp.yourdomain.com
FTP_PORT = 22
FTP_USER = csvuploader
FTP_PASSWORD = SecurePass123!
FTP_REMOTE_PATH = /
FTP_PROTOCOL = sftp
```

### Example 2: FTP (Simple - Less Secure)

```
FTP_HOST = 192.168.1.100
FTP_PORT = 21
FTP_USER = csvuploader
FTP_PASSWORD = SecurePass123!
FTP_REMOTE_PATH = /uploads
FTP_PROTOCOL = ftp
```

---

## Troubleshooting

**Connection fails?**
- Check if FileZilla Server is running
- Verify FTP_HOST is correct (IP or domain)
- Check firewall allows connections on the port
- If server is local network only, you need port forwarding or VPN

**Authentication fails?**
- Verify FTP_USER and FTP_PASSWORD match FileZilla Server
- Check user account is enabled in FileZilla Server

**File not appearing?**
- Check FileZilla Server logs
- Verify FTP_REMOTE_PATH is correct
- Check user has write permissions

---

## Need Help?

- **FileZilla Server setup**: See [FILEZILLA_SETUP.md](FILEZILLA_SETUP.md)
- **Environment variables**: See [NETLIFY_ENV_VARS.md](NETLIFY_ENV_VARS.md)
- **Netlify Functions logs**: Go to Netlify Dashboard → Functions → View logs

---

## File Details

- **Filename**: `TestStockCSV.csv` (fixed name, overwrites on each upload)
- **Location**: `[FTP_REMOTE_PATH]/TestStockCSV.csv`
- **Example**: If `FTP_REMOTE_PATH = /uploads`, file will be at `/uploads/TestStockCSV.csv`

