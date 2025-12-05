# Fix for "503 Use AUTH first" Error

This error means your FileZilla Server requires **TLS/SSL encryption** (FTPS).

## Solution: Enable TLS/SSL

Add this environment variable in Netlify:

```
FTP_SECURE = true
```

## Complete Configuration for FTPS (FTP over TLS)

Go to **Netlify Dashboard** → Your Site → **Site settings** → **Environment variables** and set:

```
FTP_HOST = your-server-ip-or-domain.com
FTP_PORT = 21
FTP_USER = your-ftp-username
FTP_PASSWORD = your-ftp-password
FTP_REMOTE_PATH = /
FTP_PROTOCOL = ftp
FTP_SECURE = true
```

## What Changed

- Added `FTP_SECURE` environment variable support
- When `FTP_SECURE = true`, the FTP connection uses TLS/SSL encryption (FTPS)
- This is required when FileZilla Server is configured to require secure connections

## FileZilla Server Configuration

If you're getting "503 Use AUTH first", your FileZilla Server is configured to require TLS. You have two options:

### Option 1: Enable TLS in Netlify (Recommended)
- Add `FTP_SECURE = true` to Netlify environment variables
- Keep your server secure

### Option 2: Disable TLS Requirement in FileZilla Server
1. Open FileZilla Server Interface
2. Go to **Edit** → **Settings** → **SSL/TLS Settings**
3. Uncheck **Require explicit FTP over TLS**
4. Click **OK**

**Note:** Option 1 is more secure (recommended).

## After Setting FTP_SECURE

1. **Redeploy** your Netlify site
2. **Test the upload** again

## Alternative: Use SFTP Instead

If you continue having issues with FTPS, consider switching to SFTP (port 22):

```
FTP_HOST = your-server-ip-or-domain.com
FTP_PORT = 22
FTP_USER = your-ftp-username
FTP_PASSWORD = your-ftp-password
FTP_REMOTE_PATH = /
FTP_PROTOCOL = sftp
```

SFTP doesn't require the `FTP_SECURE` option as it's always encrypted.

