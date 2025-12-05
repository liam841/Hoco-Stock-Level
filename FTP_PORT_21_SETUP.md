# Quick Setup for FTP Port 21

Since you're using **port 21 (FTP)**, here's what you need to configure in Netlify:

## Netlify Environment Variables

Go to **Netlify Dashboard** → Your Site → **Site settings** → **Environment variables**

Add these variables:

```
FTP_HOST = your-server-ip-or-domain.com
FTP_PORT = 21
FTP_USER = your-ftp-username
FTP_PASSWORD = your-ftp-password
FTP_REMOTE_PATH = /
FTP_PROTOCOL = ftp
```

## Important Notes

1. **Port 21 = FTP** (unencrypted)
   - Less secure than SFTP (port 22)
   - Works with standard FileZilla Server FTP configuration

2. **Protocol Auto-Detection**
   - The function will auto-detect FTP if port 21 is used
   - But it's best to explicitly set `FTP_PROTOCOL = ftp`

3. **FileZilla Server Configuration**
   - Make sure FileZilla Server is listening on port 21
   - Check firewall allows port 21 connections
   - If using passive mode, you may also need to open passive port range (e.g., 50000-51000)

4. **After Setting Variables**
   - **Redeploy** your Netlify site for changes to take effect
   - Go to **Deploys** → **Trigger deploy** → **Deploy site**

## Testing

1. Upload a test file through your website
2. Check your FileZilla Server upload directory
3. File should appear as `TestStockCSV.csv`

## Troubleshooting

**Connection fails?**
- Verify FTP_HOST is correct (IP or domain)
- Check FileZilla Server is running
- Check firewall allows port 21
- If server is local network, you need port forwarding or VPN

**Authentication fails?**
- Verify FTP_USER and FTP_PASSWORD match FileZilla Server
- Check user account is enabled

**File not appearing?**
- Check FTP_REMOTE_PATH is correct
- Verify user has write permissions in the directory
- Check FileZilla Server logs

