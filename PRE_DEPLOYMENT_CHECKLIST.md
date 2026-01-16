# Pre-Deployment Security Checklist

**Before pushing to remote repository and deploying to Vercel**

---

## ✅ Security Checklist

### 1. Environment Variables Protection

- [x] **`.env.local` is in `.gitignore`** ✅ (Already configured)
- [ ] **Verify `.env.local` is NOT tracked by Git:**
  ```bash
  git ls-files | grep .env
  ```
  Should return nothing. If it shows `.env.local`, remove it:
  ```bash
  git rm --cached .env.local
  ```

- [ ] **Create `.env.example` file** (template without secrets)
  - ✅ Already created - see `.env.example`
  - This file CAN be committed (no secrets)

### 2. Verify No Secrets in Code

- [ ] **Search codebase for hardcoded secrets:**
  ```bash
  # Search for potential API keys
  grep -r "supabase.co" --exclude-dir=node_modules --exclude=".env*"
  grep -r "eyJ" --exclude-dir=node_modules --exclude=".env*"
  ```
  Should only find references, not actual keys

- [ ] **Check these files don't contain secrets:**
  - `lib/supabase/client.ts` - Should use `process.env.NEXT_PUBLIC_SUPABASE_URL`
  - `lib/supabase/server.ts` - Should use `process.env.NEXT_PUBLIC_SUPABASE_URL`
  - Any config files - Should reference env vars, not hardcode values

### 3. Git Status Check

- [ ] **Check what will be committed:**
  ```bash
  git status
  ```

- [ ] **Verify `.env.local` is NOT in the list:**
  - Should see: `nothing to commit` or files that are safe to commit
  - Should NOT see: `.env.local` or any `.env*` files

### 4. Repository Security

- [ ] **If `.env.local` was ever committed (check history):**
  ```bash
  git log --all --full-history -- .env.local
  ```
  If it shows commits, the secrets are in Git history and should be rotated:
  - Generate new Supabase API keys
  - Update `.env.local` with new keys
  - Add new keys to Vercel environment variables

### 5. Vercel Environment Variables

- [ ] **Prepare environment variables for Vercel:**
  - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
  - **DO NOT** add these to Git - only in Vercel dashboard

### 6. Final Verification

- [ ] **Test build locally:**
  ```bash
  npm run build
  ```
  Should complete successfully

- [ ] **Verify `.env.local` exists locally but is ignored:**
  ```bash
  git check-ignore .env.local
  ```
  Should return: `.env.local`

---

## 🚨 Critical: If `.env.local` Was Ever Committed

If `.env.local` was committed to Git in the past:

1. **Rotate Your Secrets:**
   - Go to Supabase Dashboard → Project Settings → API
   - Generate new API keys
   - Update your `.env.local` with new keys

2. **Remove from Git History (if needed):**
   ```bash
   # Remove file from Git tracking
   git rm --cached .env.local
   git commit -m "Remove .env.local from tracking"
   ```

3. **Update Vercel:**
   - Add new keys to Vercel environment variables
   - Redeploy after updating

---

## ✅ Current Status

**Your `.gitignore` is correctly configured:**
- ✅ `.env*` pattern is in `.gitignore` (line 34)
- ✅ `.env.local` is being ignored by Git
- ✅ No `.env` files are currently tracked in Git

**You're safe to push!** 🎉

---

## Next Steps

1. ✅ Verify `.env.local` is not in `git status`
2. ✅ Push your code to remote repository
3. ✅ Deploy to Vercel (see `VERCEL_DEPLOYMENT_GUIDE.md`)
4. ✅ Add environment variables in Vercel dashboard (NOT in Git)

---

**Security Status:** ✅ Ready for Deployment  
**Last Updated:** Current Session



