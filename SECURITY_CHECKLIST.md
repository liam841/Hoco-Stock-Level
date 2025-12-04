# 🔒 Security Checklist - Quick Reference

Use this checklist before committing code to ensure no sensitive information is exposed.

## Before Every Commit

- [ ] No `.env` files in staging area
- [ ] No hardcoded Dropbox tokens or API keys
- [ ] No real credentials in config files
- [ ] All sensitive values use environment variables
- [ ] Example files contain placeholders only

## Files That Should NEVER Be Committed

```
❌ .env
❌ .env.local
❌ .env.*.local
❌ config.js (with real values)
❌ secrets.json
❌ credentials.json
❌ any file with "token", "key", "secret", "password" in name
```

## Files Safe to Commit

```
✅ config.example.js
✅ env.example
✅ index.html (no secrets, only API endpoint URL)
✅ api/upload-dropbox-node.js (uses env vars)
✅ README.md, SECURITY.md, etc.
```

## How to Check Before Committing

```bash
# Check what files are staged
git status

# Search for common secret patterns (be careful with this)
git diff --cached | grep -i "token\|key\|secret\|password"

# Verify .gitignore is working
git status --ignored
```

## If You Find Secrets

1. **Remove from staging:**
   ```bash
   git reset HEAD <file>
   ```

2. **Add to .gitignore:**
   ```bash
   echo "<file>" >> .gitignore
   ```

3. **Revoke the secret** (if already committed):
   - Generate new Dropbox token
   - Update environment variables

4. **Remove from Git history** (see SECURITY.md)

## Quick Commands

```bash
# Check for sensitive files
git ls-files | grep -E "\.env|config\.js|secrets"

# Verify .gitignore patterns
git check-ignore -v <file>

# View what will be committed
git diff --cached
```

## Remember

- **Environment variables = Safe** ✅
- **Hardcoded values = Unsafe** ❌
- **When in doubt, use env vars!**

