# Deployment Guide - The Living Voices Birthday Tracker

**RCCG Living Water Parish, Kano**  
*"Praise is our weapon"*

## Overview

You'll be deploying:
1. **Frontend (Web App)** → GitHub Pages (Free, Easy)
2. **Backend (Email Service)** → Railway or Render (Free tier available)

---

## Part 1: Deploy the Web App to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to github.com and sign in
2. Click the "+" icon → "New repository"
3. Name it: `living-voices-birthdays`
4. Make it **Public**
5. Click "Create repository"

### Step 2: Upload Files

**Option A - Using GitHub Website:**
1. Click "uploading an existing file"
2. Drag and drop `index.html` and `logo.png`
3. Click "Commit changes"

**Option B - Using Git Command Line:**
```bash
cd birthday-reminder-app
git init
git add index.html logo.png
git commit -m "Initial commit - The Living Voices Birthday Tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/living-voices-birthdays.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. In your repository, click "Settings"
2. Scroll down to "Pages" (in left sidebar)
3. Under "Source", select "main" branch
4. Click "Save"
5. Wait 1-2 minutes, then your site will be live at:
   `https://YOUR-USERNAME.github.io/living-voices-birthdays/`

### Step 4: Test the Web App

1. Visit your live URL
2. Submit a test birthday
3. Check the admin dashboard
4. Verify data persists when you refresh

✅ **Your web app is now live and ready to share!**

---

## Part 2: Set Up Email Reminders

### Option 1: Railway (Recommended - Easiest)

**Step 1: Prepare Your Gmail**
1. Go to myaccount.google.com
2. Security → Enable 2-Step Verification
3. Security → App passwords
4. Generate password for "Mail"
5. Copy the 16-character password

**Step 2: Deploy to Railway**
1. Go to railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `living-voices-birthdays` repository
5. Railway will detect Node.js automatically

**Step 3: Add Environment Variables**
1. Click on your deployment
2. Click "Variables" tab
3. Add these variables:
   ```
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASS = your-16-character-app-password
   ADMIN_EMAIL = your-email@gmail.com
   ```
4. Click "Deploy"

**Step 4: Keep Service Running**
Railway may sleep your free service. To keep it active:
1. Go to Settings → Change plan to "Hobby" (Still free with $5/month credit)
2. Or use a service like UptimeRobot to ping your service every 5 minutes

### Option 2: Render (Alternative)

**Step 1: Deploy to Render**
1. Go to render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Fill in:
   - Name: `birthday-reminder`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

**Step 2: Add Environment Variables**
In the "Environment" section, add:
```
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-app-password
ADMIN_EMAIL = your-email@gmail.com
```

**Step 3: Deploy**
Click "Create Web Service" and wait for deployment.

---

## Part 3: Integrate Email Service with Web App

Currently, the web app and email service are separate. Here's how to connect them:

### Simple Daily Check Method

Since your web app uses Claude's persistent storage, you have two options:

**Option A: Manual Trigger (Simplest)**
- Check your admin dashboard daily
- The upcoming birthdays section shows who's coming up
- Email reminders are a backup, not the primary method

**Option B: Automated Integration**
- Use a service like **n8n.io** or **Zapier** to:
  1. Check your storage daily
  2. Call your email service endpoint
  3. Send reminders automatically

**Option C: Add API Endpoint to Web App**
- Modify the web app to expose a `/check-reminders` endpoint
- Set up a cron job (via GitHub Actions or external service) to call it daily

---

## Simplified Workflow (Recommended for You)

Since you want email reminders but the setup is complex, here's the simplest approach:

### Use the Dashboard as Your Primary Tool

1. **Deploy just the web app to GitHub Pages** ✅ Done
2. **Check the dashboard daily** (takes 10 seconds)
   - The "Upcoming Birthdays" section shows everyone in the next 7 days
   - You'll see exactly who needs a post soon
3. **Optional: Set a daily phone reminder** to check the dashboard

This way:
- ✅ No complex backend setup needed
- ✅ No email configuration
- ✅ No server costs
- ✅ Just open the dashboard once a day
- ✅ All data is still tracked and organized

### If You Still Want Email Reminders

Follow Part 2 above to deploy the email service. Then:

1. Set up a daily scheduled task using:
   - **GitHub Actions** (free cron jobs)
   - **EasyCron** (free tier: 1 job)
   - **Cron-job.org** (completely free)

2. Configure it to check your birthdays daily and trigger emails

---

## What I Recommend

**Start Simple:**
1. ✅ Deploy web app to GitHub Pages
2. ✅ Share link with church members
3. ✅ Check dashboard daily for upcoming birthdays
4. ✅ Set a daily alarm on your phone: "Check birthdays"

**Later, If Needed:**
- Add email reminders using Railway + GitHub Actions
- Takes about 30 more minutes to set up

This approach gets you 90% of the benefit with 10% of the complexity!

---

## Files You Need for GitHub

Minimum files for GitHub repository:
```
your-repository/
├── index.html          (Main app - REQUIRED)
├── logo.png            (The Living Voices logo - REQUIRED)
├── README.md           (Documentation - Optional)
└── .gitignore          (Git config - Optional)
```

For email service, also add:
```
├── package.json
├── reminder-service.js
└── netlify/functions/send-reminder.js
```

---

## Support

If you run into issues:
1. Check the QUICKSTART.md file
2. Review error messages in browser console (F12)
3. For Gmail issues, verify app password is correct
4. Make sure repository is public for GitHub Pages

---

**Ready to deploy?** Start with Part 1, test it thoroughly, then decide if you need Part 2!
