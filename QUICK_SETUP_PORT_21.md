# Quick Setup for FTP Port 21

## ✅ Netlify Environment Variables

Set these in **Netlify Dashboard** → Your Site → **Site settings** → **Environment variables**:

```
FTP_HOST = your-server-ip-or-domain.com
FTP_PORT = 21
FTP_USER = your-ftp-username
FTP_PASSWORD = your-ftp-password
FTP_REMOTE_PATH = /
FTP_PROTOCOL = ftp
```

## 🔧 What Changed

- Default port changed to **21** (FTP)
- Protocol auto-detects FTP when port 21 is used
- Fixed FTP close() method (it's synchronous, not async)

## 📝 After Setting Variables

1. **Redeploy** your Netlify site
   - Go to **Deploys** → **Trigger deploy** → **Deploy site**

2. **Test the upload**
   - Upload a file through your website
   - Check FileZilla Server for `TestStockCSV.csv`

## ⚠️ Important Notes

- Port 21 = FTP (unencrypted, less secure than SFTP)
- Make sure FileZilla Server is configured for FTP on port 21
- Firewall must allow connections on port 21
- If using passive mode, also open passive port range (50000-51000)

## 🐛 If You Still Get Errors

1. Check Netlify Function logs:
   - Netlify Dashboard → Functions → upload-ftp → View logs

2. Verify FileZilla Server:
   - Server is running
   - User account is enabled
   - User has write permissions

3. Check connection:
   - FTP_HOST is correct (IP or domain)
   - Port 21 is accessible from internet (if server is public)

