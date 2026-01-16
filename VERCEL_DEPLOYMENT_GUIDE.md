# Complete Vercel Deployment Guide

**From Registration to Production Deployment**

This guide walks you through the entire process of deploying your Rasna application to Vercel, from creating an account to going live.

---

## Table of Contents

1. [Account Registration](#1-account-registration)
2. [Plan Selection](#2-plan-selection)
3. [Payment Setup](#3-payment-setup)
4. [Connecting Git Repository](#4-connecting-git-repository)
5. [Importing Your Project](#5-importing-your-project)
6. [Configuring Environment Variables](#6-configuring-environment-variables)
7. [Deployment Settings](#7-deployment-settings)
8. [First Deployment](#8-first-deployment)
9. [Post-Deployment Verification](#9-post-deployment-verification)
10. [Custom Domain Setup (Optional)](#10-custom-domain-setup-optional)
11. [Team Management (Optional)](#11-team-management-optional)

---

## 1. Account Registration

### Step 1.1: Visit Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** in the top right corner

### Step 1.2: Choose Sign-Up Method

You can sign up with:

- **GitHub** (Recommended) - Best for seamless Git integration
- **GitLab** - If your code is on GitLab
- **Bitbucket** - If your code is on Bitbucket
- **Email** - Traditional email signup

**Recommendation:** Use GitHub if your code is on GitHub, as it provides the smoothest integration.

### Step 1.3: Complete Registration

1. **If using GitHub/GitLab/Bitbucket:**
   - Click the respective button
   - Authorize Vercel to access your repositories
   - Grant necessary permissions

2. **If using Email:**
   - Enter your email address
   - Create a password
   - Verify your email address
   - Complete your profile

### Step 1.4: Welcome Screen

After registration, you'll see:
- Welcome message
- Option to create a team or continue as individual
- Dashboard overview

---

## 2. Plan Selection

### Step 2.1: Choose Your Plan

Vercel offers three main plans:

#### **Hobby Plan (Free)**
- ✅ **Cost:** Free forever
- ✅ **Perfect for:** Personal projects, learning, small family apps
- ✅ **Features:**
  - Unlimited personal projects
  - Automatic HTTPS
  - Global CDN
  - Preview deployments
  - Basic analytics
  - 100GB bandwidth/month
  - 100 serverless function executions/day
- ❌ **Limitations:**
  - No team collaboration
  - No password protection
  - No advanced analytics
  - Limited support

#### **Pro Plan ($20/month per user)**
- ✅ **Cost:** $20/month per team member
- ✅ **Perfect for:** Professional projects, small teams
- ✅ **Features:**
  - Everything in Hobby
  - Team collaboration
  - Password protection
  - Advanced analytics
  - Priority support
  - 1TB bandwidth/month
  - Unlimited serverless functions
  - Preview comments
  - 14-day trial with $20 credit

#### **Enterprise Plan (Custom Pricing)**
- ✅ **Cost:** Custom pricing
- ✅ **Perfect for:** Large organizations
- ✅ **Features:**
  - Everything in Pro
  - Dedicated support
  - SLA guarantees
  - Custom contracts
  - Advanced security

### Step 2.2: Select Plan for Your Project

**For Rasna (Family Dashboard):**

**Recommended: Hobby Plan (Free)**
- ✅ Personal/family project
- ✅ No team collaboration needed initially
- ✅ All features you need are included
- ✅ Can upgrade later if needed

**If you need team features:**
- Choose Pro Plan
- 14-day free trial
- $20 credit included
- Can cancel anytime

### Step 2.3: Plan Selection Process

1. **During Sign-Up:**
   - You'll be asked: "I'm working on commercial projects" or "I'm working on personal projects"
   - **Personal projects** → Hobby Plan (Free)
   - **Commercial projects** → Pro Plan (with trial)

2. **If Choosing Pro:**
   - Enter team name
   - Review trial details (14 days, $20 credit)
   - Click "Continue"

---

## 3. Payment Setup

### Step 3.1: Payment Required Only for Pro/Enterprise

**Hobby Plan:**
- ✅ No payment required
- ✅ No credit card needed
- ✅ Start deploying immediately

**Pro Plan:**
- 💳 Credit card required
- 💳 Payment method added during signup
- 💳 Not charged during 14-day trial
- 💳 Charged after trial ends (if you continue)

### Step 3.2: Adding Payment Method (Pro Plan Only)

1. **During Sign-Up:**
   - After selecting Pro plan
   - Enter payment information:
     - Credit card number
     - Expiration date
     - CVV
     - Billing address

2. **Payment Security:**
   - Vercel uses Stripe for secure payment processing
   - Your card is not charged during trial
   - You can cancel before trial ends

3. **Billing:**
   - Go to **Settings → Billing** to:
     - Update payment method
     - View invoices
     - Change plan
     - Cancel subscription

### Step 3.3: Trial Period (Pro Plan)

- **Duration:** 14 days
- **Credit:** $20 included
- **Charges:** None during trial
- **Cancellation:** Cancel anytime before trial ends
- **After Trial:** Automatically continues at $20/month

---

## 4. Connecting Git Repository

### Step 4.1: Repository Requirements

Your code should be in one of these:
- ✅ **GitHub** (most common)
- ✅ **GitLab**
- ✅ **Bitbucket**
- ✅ **Self-hosted Git** (Enterprise only)

### Step 4.2: Connect Repository

1. **If you signed up with GitHub/GitLab/Bitbucket:**
   - Repositories are automatically connected
   - Skip to Step 5

2. **If you signed up with Email:**
   - Go to **Settings → Git**
   - Click **"Connect Git Provider"**
   - Choose your provider (GitHub/GitLab/Bitbucket)
   - Authorize Vercel
   - Grant repository access

### Step 4.3: Repository Access

Choose access level:
- **All repositories** - Full access (recommended for personal)
- **Selected repositories** - Choose specific repos (more secure)

**For Rasna:** "All repositories" is fine for personal projects.

---

## 5. Importing Your Project

### Step 5.1: Start Import

1. **From Dashboard:**
   - Click **"Add New..."** button (top right)
   - Select **"Project"**

2. **Or:**
   - Click **"Import Project"** if shown

### Step 5.2: Select Repository

1. **Repository List:**
   - You'll see all your repositories
   - Search for "rasna" or your project name
   - Click on your repository

2. **If Repository Not Visible:**
   - Check repository is pushed to remote
   - Verify Git provider connection
   - Refresh the page

### Step 5.3: Configure Project

Vercel will auto-detect your framework (Next.js), but you can verify:

**Project Settings:**
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (default - your project root)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

**For Rasna:** All defaults should work perfectly!

### Step 5.4: Environment Variables (Important!)

**DO NOT deploy yet!** First, add environment variables:

1. **Expand "Environment Variables" section**

2. **Add these variables:**

   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```
   - Value: Your Supabase project URL
   - Example: `https://abcdefghijklmnop.supabase.co`
   - Add to: Production, Preview, Development (all three)

   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   - Value: Your Supabase anon/public key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Add to: Production, Preview, Development (all three)

3. **How to Add:**
   - Click **"Add"** or **"Add Another"**
   - Enter variable name
   - Enter variable value
   - Select environments (check all three boxes)
   - Click **"Save"**

4. **Where to Get Values:**
   - Go to Supabase Dashboard
   - Project Settings → API
   - Copy "Project URL" and "anon public" key

### Step 5.5: Review Settings

Before deploying, verify:
- ✅ Repository selected correctly
- ✅ Framework: Next.js
- ✅ Environment variables added
- ✅ All three environments selected for env vars

---

## 6. Configuring Environment Variables

### Step 6.1: Add Environment Variables

**Required Variables:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### Step 6.2: Environment Selection

For each variable, select:
- ✅ **Production** - Live site
- ✅ **Preview** - Branch deployments
- ✅ **Development** - Local development (if using Vercel CLI)

### Step 6.3: Adding Variables After Deployment

If you forgot to add variables:

1. Go to **Project Settings → Environment Variables**
2. Add variables
3. **Redeploy** (variables only apply to new deployments)

### Step 6.4: Secure Variables

- ✅ Never commit `.env.local` to Git
- ✅ Use Vercel dashboard for production secrets
- ✅ Variables are encrypted at rest
- ✅ Only accessible during build/runtime

---

## 7. Deployment Settings

### Step 7.1: Build Settings (Auto-Configured)

Vercel automatically detects Next.js and sets:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**For Rasna:** No changes needed!

### Step 7.2: Advanced Settings (Optional)

**Node.js Version:**
- Default: Latest LTS
- Can specify in `package.json`:
  ```json
  {
    "engines": {
      "node": "18.x"
    }
  }
  ```

**Build Command Override:**
- Usually not needed
- Only if you have custom build steps

**Root Directory:**
- Default: `./` (project root)
- Only change if project is in subdirectory

### Step 7.3: Domain Settings (Later)

- Custom domains can be added after deployment
- Default: `your-project.vercel.app`

---

## 8. First Deployment

### Step 8.1: Deploy

1. **Click "Deploy" button**
   - Bottom of import screen
   - Or in project settings

2. **Deployment Process:**
   - Vercel will:
     - Clone your repository
     - Install dependencies (`npm install`)
     - Build your project (`npm run build`)
     - Deploy to production

3. **Build Time:**
   - First deployment: ~3-5 minutes
   - Subsequent deployments: ~1-2 minutes

### Step 8.2: Monitor Deployment

**Build Logs:**
- Real-time build output
- Shows installation progress
- Shows build progress
- Shows any errors

**What to Watch For:**
- ✅ Dependencies installing
- ✅ TypeScript compilation
- ✅ Build completing successfully
- ❌ Any error messages

### Step 8.3: Deployment Status

**Status Indicators:**
- 🟡 **Building** - In progress
- ✅ **Ready** - Successfully deployed
- ❌ **Error** - Build failed (check logs)

### Step 8.4: First Deployment URL

After successful deployment:
- **Production URL:** `https://your-project-name.vercel.app`
- **Example:** `https://rasna.vercel.app`

**Note:** URL format: `[project-name].vercel.app`

---

## 9. Post-Deployment Verification

### Step 9.1: Test Your Application

1. **Visit Production URL:**
   - Open the deployment URL
   - Should see your landing page

2. **Test Authentication:**
   - Try signing up
   - Try logging in
   - Verify Supabase connection works

3. **Test Features:**
   - Calendar
   - Tasks
   - Notes
   - Announcements
   - Memories
   - Family Profiles

### Step 9.2: Check Build Logs

1. **Go to Deployments:**
   - Click on your project
   - Click on the deployment
   - View "Build Logs"

2. **Verify:**
   - ✅ No errors
   - ✅ Environment variables loaded
   - ✅ Build completed successfully

### Step 9.3: Verify Environment Variables

**If something doesn't work:**

1. **Check Variables:**
   - Project Settings → Environment Variables
   - Verify values are correct
   - No extra spaces or quotes

2. **Redeploy:**
   - Variables only apply to new deployments
   - Go to Deployments → Redeploy

### Step 9.4: Common Issues

**Issue: Images Not Loading**
- ✅ Check `next.config.ts` has Supabase remote patterns
- ✅ Verify storage bucket is public
- ✅ Check image URLs in database

**Issue: Database Connection Fails**
- ✅ Verify environment variables are set
- ✅ Check Supabase project is active
- ✅ Verify API keys are correct

**Issue: Build Fails**
- ✅ Check build logs for specific error
- ✅ Test build locally: `npm run build`
- ✅ Fix errors and push to Git

---

## 10. Custom Domain Setup (Optional)

### Step 10.1: Add Custom Domain

1. **Go to Project Settings → Domains**

2. **Add Domain:**
   - Enter domain: `rasna.com`
   - Click "Add"

3. **DNS Configuration:**
   - Vercel will show DNS records to add
   - Usually a CNAME record

### Step 10.2: Configure DNS

1. **Go to Your Domain Registrar:**
   - (e.g., GoDaddy, Namecheap, Cloudflare)

2. **Add DNS Record:**
   - Type: CNAME
   - Name: `@` or `www`
   - Value: `cname.vercel-dns.com` (Vercel provides exact value)

3. **Wait for Propagation:**
   - Usually 5-30 minutes
   - Can take up to 24 hours

### Step 10.3: SSL Certificate

- ✅ Vercel automatically provisions SSL
- ✅ HTTPS enabled automatically
- ✅ No additional configuration needed

---

## 11. Team Management (Optional)

### Step 11.1: Invite Team Members (Pro Plan)

1. **Go to Team Settings → Members**

2. **Invite Members:**
   - Enter email addresses
   - Select role (Member/Admin)
   - Send invitations

3. **Member Roles:**
   - **Admin:** Full access
   - **Member:** Can deploy, limited settings

### Step 11.2: Team Billing

- **Pro Plan:** $20 per team member/month
- **Billing:** Charged per active member
- **Management:** Settings → Billing

---

## Quick Reference Checklist

### Before Deployment
- [ ] Code pushed to Git repository
- [ ] Supabase project created
- [ ] Database migrations run
- [ ] Storage bucket configured
- [ ] Environment variables ready

### During Deployment
- [ ] Vercel account created
- [ ] Plan selected (Hobby recommended)
- [ ] Repository connected
- [ ] Project imported
- [ ] Environment variables added
- [ ] Deployment started

### After Deployment
- [ ] Build completed successfully
- [ ] Application accessible
- [ ] Authentication works
- [ ] All features tested
- [ ] Custom domain configured (optional)

---

## Cost Summary

### Hobby Plan (Recommended for Rasna)
- **Cost:** $0/month
- **Perfect for:** Personal/family projects
- **Limits:** None that affect a family dashboard

### Pro Plan (If Needed)
- **Cost:** $20/month per user
- **Trial:** 14 days free with $20 credit
- **When to Use:** Need team collaboration

### Estimated Monthly Cost
- **Hobby:** $0
- **Pro (1 user):** $20
- **Pro (2 users):** $40

**Recommendation:** Start with Hobby, upgrade if needed.

---

## Support Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## Troubleshooting

### Build Fails
1. Check build logs for specific error
2. Test locally: `npm run build`
3. Verify all dependencies in `package.json`
4. Check Node.js version compatibility

### Environment Variables Not Working
1. Verify variables are added in Vercel dashboard
2. Check all three environments selected
3. Redeploy after adding variables
4. Verify no extra spaces/quotes in values

### Images Not Loading
1. Check `next.config.ts` configuration
2. Verify Supabase storage bucket is public
3. Check image URLs in database
4. Verify remote patterns include Supabase domain

### Database Connection Issues
1. Verify Supabase project is active
2. Check environment variables are correct
3. Verify API keys haven't been rotated
4. Check Supabase project settings

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** Current Session  
**Status:** Complete and Ready to Use



