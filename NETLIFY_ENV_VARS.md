# Netlify Environment Variables Reference

This document lists all the environment variables you need to set in Netlify for the FileZilla Server upload functionality.

## Setting Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable** for each variable below
5. After adding variables, **redeploy your site** for changes to take effect

---

## Required Variables for FTP/SFTP Upload

### FTP Connection Settings

| Variable | Example Value | Description |
|----------|--------------|-------------|
| `FTP_HOST` | `ftp.yourdomain.com` or `192.168.1.100` | Your FileZilla Server IP address or domain name |
| `FTP_PORT` | `22` | Port number: `22` for SFTP (recommended) or `21` for FTP |
| `FTP_USER` | `csvuploader` | Username configured in FileZilla Server |
| `FTP_PASSWORD` | `your_secure_password` | Password for the FTP user |
| `FTP_REMOTE_PATH` | `/` or `/uploads` | Remote directory path (relative to user's home directory) |
| `FTP_PROTOCOL` | `sftp` | Protocol: `sftp` (recommended) or `ftp` |

### Example Configuration (SFTP - Recommended)

```
FTP_HOST = ftp.yourdomain.com
FTP_PORT = 22
FTP_USER = csvuploader
FTP_PASSWORD = MySecurePassword123!
FTP_REMOTE_PATH = /
FTP_PROTOCOL = sftp
```

### Example Configuration (FTP)

```
FTP_HOST = 192.168.1.100
FTP_PORT = 21
FTP_USER = csvuploader
FTP_PASSWORD = MySecurePassword123!
FTP_REMOTE_PATH = /uploads
FTP_PROTOCOL = ftp
```

---

## Optional: Email Notifications

If you want to receive email notifications when files are uploaded:

| Variable | Example Value | Description |
|----------|--------------|-------------|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | `587` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | `your_email@gmail.com` | SMTP username (your email) |
| `SMTP_PASS` | `your_app_password` | SMTP password (Gmail App Password recommended) |
| `EMAIL_TO` | `you@example.com` | Email address to receive notifications |
| `EMAIL_FROM` | `your_email@gmail.com` | Sender email address |

### Gmail SMTP Setup

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password
3. **Use the App Password** as `SMTP_PASS` (not your regular Gmail password)

### Example Email Configuration

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your_email@gmail.com
SMTP_PASS = xxxx xxxx xxxx xxxx
EMAIL_TO = notifications@yourcompany.com
EMAIL_FROM = your_email@gmail.com
```

---

## Quick Setup Checklist

- [ ] Set `FTP_HOST` (your server IP or domain)
- [ ] Set `FTP_PORT` (22 for SFTP, 21 for FTP)
- [ ] Set `FTP_USER` (FileZilla Server username)
- [ ] Set `FTP_PASSWORD` (FileZilla Server password)
- [ ] Set `FTP_REMOTE_PATH` (upload directory path)
- [ ] Set `FTP_PROTOCOL` (`sftp` or `ftp`)
- [ ] (Optional) Set email notification variables
- [ ] Redeploy your Netlify site

---

## Testing Your Configuration

After setting the variables:

1. **Redeploy your site** in Netlify
2. **Upload a test file** through your website
3. **Check FileZilla Server** - file should appear as `TestStockCSV.csv`
4. **Check your email** (if configured) - you should receive a notification

---

## Troubleshooting

### "FTP configuration incomplete" error
- Make sure all required FTP variables are set (`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`)

### Connection timeout
- Verify `FTP_HOST` is correct and accessible from the internet
- Check firewall rules allow connections on the specified port
- If using a local IP, you need port forwarding or VPN

### Authentication failed
- Verify `FTP_USER` and `FTP_PASSWORD` match FileZilla Server settings
- Check that the user account is enabled in FileZilla Server

### File upload failed
- Verify user has write permissions in the directory
- Check `FTP_REMOTE_PATH` is correct
- Review FileZilla Server logs for details

---

## Security Notes

- **Never commit** these environment variables to Git
- Use **SFTP** instead of FTP when possible (encrypted)
- Use **strong passwords** for FTP accounts
- Consider restricting FTP user permissions to the minimum needed
- Regularly rotate passwords

