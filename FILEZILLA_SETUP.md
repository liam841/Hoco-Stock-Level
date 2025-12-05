# FileZilla Server Setup Guide

This guide will help you configure your FileZilla Server and set up the Netlify function to upload files via FTP/SFTP.

## Step 1: Configure FileZilla Server

### Install FileZilla Server (if not already installed)

1. Download FileZilla Server from: https://filezilla-project.org/download.php?type=server
2. Install and start the FileZilla Server service

### Create a User Account

1. Open **FileZilla Server Interface**
2. Go to **Edit** → **Users** (or press `Ctrl+U`)
3. Click **Add** to create a new user
4. Set:
   - **User name**: e.g., `csvuploader`
   - **Password**: Create a strong password
   - **Account status**: Enabled
5. Click **OK**

### Set Up Home Directory

1. In the **Users** dialog, select your user
2. Go to **Shared folders** section
3. Click **Add** to add a directory
4. Choose your upload directory (e.g., `C:\FTP\Uploads` or `C:\FileZilla\Uploads`)
5. Set permissions:
   - ✅ **Read** - Allow reading files
   - ✅ **Write** - Allow uploading files
   - ✅ **Delete** - Allow deleting files (for overwriting)
   - ✅ **Append** - Allow appending to files
   - ✅ **Create** - Allow creating files/directories
   - ✅ **List** - Allow listing directory contents
6. Click **OK** to save

### Configure Server Settings

1. Go to **Edit** → **Settings** (or press `F4`)
2. **General Settings**:
   - Set **Listen on these ports**: 
     - **FTP**: 21 (if using FTP)
     - **SFTP**: 22 (if using SFTP - recommended for security)
3. **Passive mode settings** (if using FTP):
   - Enable **Use custom port range**: e.g., 50000-51000
   - Note: You may need to open these ports in your firewall
4. Click **OK**

### Firewall Configuration

Make sure these ports are open in your firewall:
- **FTP**: Port 21 (control) + passive port range (e.g., 50000-51000)
- **SFTP**: Port 22

## Step 2: Configure Netlify Environment Variables

Go to **Netlify Dashboard** → Your Site → **Site settings** → **Environment variables** and add:

### Required Variables:

```
FTP_HOST = your-ftp-server-ip-or-domain.com
FTP_PORT = 22
FTP_USER = csvuploader
FTP_PASSWORD = your_secure_password_here
FTP_REMOTE_PATH = /
FTP_PROTOCOL = sftp
```

### Configuration Details:

- **FTP_HOST**: 
  - Your server's IP address (e.g., `192.168.1.100`)
  - Or domain name (e.g., `ftp.yourdomain.com`)
  - **Note**: If your FileZilla server is on your local network, you'll need to use port forwarding or a VPN

- **FTP_PORT**:
  - `22` for SFTP (recommended - more secure)
  - `21` for FTP (less secure, but works)

- **FTP_USER**: The username you created in FileZilla Server

- **FTP_PASSWORD**: The password for that user

- **FTP_REMOTE_PATH**: 
  - The folder path on the server where files will be uploaded
  - Examples:
    - `/` (root/home directory)
    - `/uploads` (uploads folder)
    - `/TestStock` (TestStock folder)
  - **Note**: This is relative to the user's home directory set in FileZilla Server

- **FTP_PROTOCOL**:
  - `sftp` (recommended - encrypted, more secure)
  - `ftp` (unencrypted, less secure but simpler)

### Optional: Email Notifications

If you want email notifications when files are uploaded:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your_email@gmail.com
SMTP_PASS = your_gmail_app_password
EMAIL_TO = you@example.com
EMAIL_FROM = your_email@gmail.com
```

## Step 3: Testing

1. **Test FileZilla Server locally**:
   - Use FileZilla Client to connect:
     - Host: `localhost` or your server IP
     - Port: `22` (SFTP) or `21` (FTP)
     - Username: Your FTP user
     - Password: Your FTP password
   - Try uploading a test file

2. **Test from Netlify**:
   - Upload a file through your website
   - Check your FileZilla Server upload directory
   - File should appear as `TestStockCSV.csv`

## Troubleshooting

### Connection Errors

- **"Connection refused"**: 
  - Check if FileZilla Server is running
  - Verify port is correct (22 for SFTP, 21 for FTP)
  - Check firewall settings

- **"Timeout"**:
  - If server is on local network, use port forwarding or VPN
  - Check if server is accessible from the internet
  - Verify firewall allows connections

- **"Authentication failed"**:
  - Verify username and password are correct
  - Check user account is enabled in FileZilla Server
  - Ensure user has write permissions to the directory

### File Upload Issues

- **"Permission denied"**:
  - Check user permissions in FileZilla Server
  - Ensure user has write/delete permissions on the directory
  - Verify the directory path exists

- **File not appearing**:
  - Check FileZilla Server logs (View → Logging)
  - Verify FTP_REMOTE_PATH is correct
  - Check if file is being uploaded to a different location

### Network Configuration

If your FileZilla Server is behind a router:

1. **Set up port forwarding** on your router:
   - Forward port 22 (SFTP) or 21 (FTP) to your server's local IP
   - If using FTP, also forward passive port range (50000-51000)

2. **Get your public IP**:
   - Use `FTP_HOST = your-public-ip` or set up a dynamic DNS service

3. **For local network only**:
   - Use your local IP (e.g., `192.168.1.100`)
   - Note: Netlify functions run in the cloud, so they can't access local IPs
   - You'll need to make your server accessible from the internet or use a VPN

## Security Best Practices

1. **Use SFTP instead of FTP** (encrypted connection)
2. **Use strong passwords** for FTP users
3. **Limit user permissions** to only what's needed
4. **Consider using key-based authentication** (more advanced)
5. **Keep FileZilla Server updated**
6. **Use firewall rules** to restrict access

## File Location

Files will be uploaded to:
- **Filename**: `TestStockCSV.csv` (fixed name, overwrites on each upload)
- **Location**: `[FTP_REMOTE_PATH]/TestStockCSV.csv`
- **Example**: If `FTP_REMOTE_PATH = /uploads`, file will be at `/uploads/TestStockCSV.csv`

