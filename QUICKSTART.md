# Quick Start Guide - The Living Voices Birthday Tracker

## 🎵 Get Your Birthday Tracker Running in 10 Minutes

**RCCG Living Water Parish, Kano**

### Step 1: Deploy the Web App (5 minutes)

**Using GitHub Pages:**

1. Create a new repository on GitHub (suggested name: `living-voices-birthdays`)
2. Upload `index.html` and `logo.png` to your repository
3. Go to Settings → Pages
4. Select your main branch and Save
5. Copy your live URL: `https://yourusername.github.io/living-voices-birthdays/`

**Done!** Share this URL with The Living Voices choir members.

### Step 2: Test the App

1. Open your deployed URL
2. Submit a test birthday
3. Switch to "Admin Dashboard" tab
4. Enter your email address
5. Save settings

### Step 3: Set Up Email Reminders (5 minutes)

**Quick Email Setup with Gmail:**

1. **Get Gmail App Password:**
   - Go to myaccount.google.com
   - Security → 2-Step Verification
   - App passwords → Generate new password
   - Copy the 16-character password

2. **Deploy Reminder Service (Choose One):**

   **Option A - Railway (Easiest):**
   - Go to railway.app
   - Click "Start a New Project" → "Deploy from GitHub repo"
   - Connect your GitHub repo
   - Add these variables:
     ```
     EMAIL_USER = your-email@gmail.com
     EMAIL_PASS = your-app-password-here
     ADMIN_EMAIL = your-email@gmail.com
     ```
   - Click Deploy

   **Option B - Render:**
   - Go to render.com
   - New → Web Service
   - Connect GitHub repo
   - Add environment variables
   - Deploy

   **Option C - Heroku:**
   ```bash
   heroku create your-app-name
   heroku config:set EMAIL_USER="your-email@gmail.com"
   heroku config:set EMAIL_PASS="your-app-password"
   heroku config:set ADMIN_EMAIL="your-email@gmail.com"
   git push heroku main
   ```

### Step 4: Share with The Living Voices Choir

Send this message to your choir members:

```
Hello Living Voices family! 🎵

To help us celebrate everyone's birthday, please submit your 
birthday using this form: [YOUR-URL-HERE]

It only takes 30 seconds! Thank you! 🎂

"Praise is our weapon" 
- The Living Voices, RCCG Living Water Parish
```

---

## 📧 How Email Reminders Work

- The service checks daily at 9:00 AM
- You get an email 2 days before each birthday
- Email includes person's name and date
- You can adjust reminder days in the dashboard

---

## ⚙️ Advanced Setup (Optional)

### Add Password Protection to Admin Dashboard

Add this to the top of the "Admin Dashboard" section in index.html:

```javascript
// Simple password protection
const adminPassword = "your-password-here";
const entered = prompt("Enter admin password:");
if (entered !== adminPassword) {
    alert("Incorrect password");
    switchTab('submit');
}
```

### Customize Email Template

Edit `reminder-service.js` lines 50-120 to customize the email design.

### Change Reminder Time

Edit `reminder-service.js` line 155:
```javascript
// Change from 9 AM to 7 AM
cron.schedule('0 7 * * *', () => {
```

---

## 🆘 Common Issues

**Issue: Emails not arriving**
- Solution: Check spam folder, verify app password, check environment variables

**Issue: Birthdays not saving**
- Solution: Use Chrome, Firefox, or Safari (not IE), clear browser cache

**Issue: Can't deploy to GitHub Pages**
- Solution: Make sure repository is public and index.html is in root folder

---

## 📱 Next Steps

1. ✅ Test with a few birthdays first
2. ✅ Verify you receive email reminders
3. ✅ Share the link with a small group first
4. ✅ Once confirmed working, share with everyone

**Need help?** Create an issue on GitHub or refer to the full README.md

---

Made with ❤️ for The Living Voices  
RCCG Living Water Parish, Kano  
*"Praise is our weapon"*
