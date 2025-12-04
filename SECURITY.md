# Security Guidelines

**IMPORTANT:** This repository is public. Never commit sensitive information!

## 🔒 What Should NEVER Be Committed

### ❌ Never Commit These:

- Dropbox access tokens
- API keys or secrets
- Environment variables (`.env` files)
- Configuration files with real credentials (`config.js`)
- Personal tokens or passwords
- Database connection strings
- Any sensitive user data

### ✅ Safe to Commit:

- Example configuration files (`config.example.js`)
- Template/example code
- Documentation
- Public code without secrets

## 🔐 Setting Up Your Environment

### Step 1: Create Environment Variables

Create a `.env` file (this is in `.gitignore` and won't be committed):

```bash
DROPBOX_ACCESS_TOKEN=your_actual_token_here
```

### Step 2: Use Environment Variables in Your Backend

In your serverless function (Netlify/Vercel/AWS Lambda), set environment variables:

**Netlify:**
- Go to Site Settings → Environment Variables
- Add: `DROPBOX_ACCESS_TOKEN` = your token

**Vercel:**
- Go to Project Settings → Environment Variables
- Add: `DROPBOX_ACCESS_TOKEN` = your token

**AWS Lambda:**
- Go to Function Configuration → Environment Variables
- Add: `DROPBOX_ACCESS_TOKEN` = your token

### Step 3: Configure API Endpoint

The API endpoint in `index.html` should point to your backend. Options:

1. **Use a relative path** (if same domain):
   ```javascript
   const DROPBOX_UPLOAD_API = '/.netlify/functions/upload-dropbox';
   ```

2. **Use environment variable** (if you have a build process):
   ```javascript
   const DROPBOX_UPLOAD_API = process.env.API_ENDPOINT || '/api/upload-dropbox';
   ```

3. **Set after deployment** (manual edit):
   - Deploy your site
   - Edit `index.html` directly in your hosting platform
   - Or use a config service

## 🛡️ Security Best Practices

### Backend API Security

1. **Validate all inputs** - Check file size, type, content
2. **Rate limiting** - Prevent abuse
3. **CORS configuration** - Only allow your domain
4. **Error handling** - Don't expose internal errors to users
5. **Logging** - Log errors server-side, not in responses

### Frontend Security

1. **No secrets in frontend code** - Everything is visible to users
2. **Validate files client-side** - Before uploading
3. **File size limits** - Prevent huge uploads
4. **Content validation** - Check file is actually CSV

### Dropbox Token Security

1. **Use App Folder access** (not Full Dropbox) - Limits scope
2. **Rotate tokens regularly** - Generate new tokens periodically
3. **Monitor usage** - Check Dropbox for unexpected uploads
4. **Use OAuth flow** (advanced) - More secure than static tokens

## 📋 Checklist Before Committing

- [ ] No `.env` files in repository
- [ ] No real tokens or API keys in code
- [ ] All sensitive values are in environment variables
- [ ] `.gitignore` includes `.env*`, `config.js`, `secrets.*`
- [ ] Example files use placeholder values
- [ ] Documentation explains security setup

## 🚨 If You Accidentally Committed Secrets

1. **Immediately revoke the token/key** - Go to Dropbox and generate new token
2. **Remove from Git history**:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/secret-file" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (if safe to do so, or contact repository admin)
4. **Update all environment variables** with new values

## 📚 Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Dropbox API Security](https://www.dropbox.com/developers/reference/security-guide)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## 🔍 Current Security Status

✅ `.gitignore` configured to exclude sensitive files
✅ Example files use placeholders
✅ Backend code uses environment variables
✅ No hardcoded secrets in repository

