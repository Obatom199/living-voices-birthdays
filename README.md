# The Living Voices Birthday Tracker

A web application to help track The Living Voices choir members' birthdays and get automatic email reminders 2 days before each birthday.

**RCCG Living Water Parish, Kano**  
*"Praise is our weapon"*

## Features

✅ **Public Form** - Share a link for members to submit their birthdays
✅ **Admin Dashboard** - View all birthdays, upcoming reminders, and statistics
✅ **Email Reminders** - Automatic email notifications before birthdays
✅ **Track Posted Birthdays** - Mark birthdays as posted to stay organized
✅ **Persistent Storage** - All data is saved across sessions
✅ **Mobile Friendly** - Works perfectly on phones and tablets

## Setup Instructions

### 1. Deploy the Web App

#### Option A: GitHub Pages (Recommended for Frontend)

1. Create a new GitHub repository
2. Upload these files to your repository:
   - `index.html`
   - `README.md`

3. Go to your repository Settings → Pages
4. Under "Source", select your main branch
5. Click Save
6. Your app will be live at: `https://yourusername.github.io/your-repo-name/`

#### Option B: Netlify (Alternative)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `index.html` file
3. Your app will be instantly deployed with a live URL

### 2. Set Up Email Notifications

The email reminder system requires a backend service. Here are your options:

#### Option A: Gmail with App Password (Easiest)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Create an App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Generate a new app password for "Mail"
   - Save this password securely

3. **Deploy the Reminder Service**:

   You can host the reminder service on:
   
   **Heroku** (Free tier available):
   ```bash
   # Install Heroku CLI first
   heroku login
   heroku create your-birthday-reminder
   
   # Set environment variables
   heroku config:set EMAIL_USER="your-email@gmail.com"
   heroku config:set EMAIL_PASS="your-app-password"
   heroku config:set ADMIN_EMAIL="your-church-email@gmail.com"
   
   # Deploy
   git push heroku main
   ```

   **Railway** (Simple deployment):
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repo
   - Add environment variables in the dashboard
   - Deploy automatically

   **Render** (Free hosting):
   - Go to [render.com](https://render.com)
   - Create a new Web Service
   - Connect your GitHub repo
   - Add environment variables
   - Deploy

#### Option B: Alternative Email Services

Instead of Gmail, you can use:
- **SendGrid** - Free tier: 100 emails/day
- **Mailgun** - Free tier: 5,000 emails/month
- **AWS SES** - Very affordable for low volume

### 3. Connect Storage to Email Service

Since the web app uses browser-based persistent storage, you'll need to integrate the reminder service with Claude's storage API:

1. The web app stores data using `window.storage` (Claude's persistent storage)
2. The reminder service needs to read this data to send emails
3. You'll need to create an API endpoint that bridges these two

**Simple Solution**: Use a service like **n8n** or **Zapier** to:
- Check the storage daily
- Trigger email sends when birthdays are approaching

### 4. Share the Form Link

Once deployed, share your app URL with The Living Voices choir members:
- They can submit birthdays via the "Submit Birthday" tab
- You can manage everything from the "Admin Dashboard" tab

## How to Use

### For Choir Members:
1. Open the shared link
2. Click "Submit Birthday" tab
3. Enter name and birthday
4. Submit!

### For Welfare Coordinator (You):
1. Open the app
2. Click "Admin Dashboard" tab
3. Enter your email address
4. Set reminder days (default: 2 days before)
5. Save settings
6. View all birthdays and upcoming reminders
7. Mark birthdays as "Posted" after you've posted them

## Environment Variables

For the email service, set these variables:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
ADMIN_EMAIL=email-to-receive-reminders@gmail.com
```

## Files Included

- `index.html` - Main web application (frontend) with The Living Voices branding
- `logo.png` - The Living Voices choir logo
- `reminder-service.js` - Email notification service (backend)
- `package.json` - Node.js dependencies
- `README.md` - This file

## Troubleshooting

**Emails not sending?**
- Check your Gmail app password is correct
- Ensure 2FA is enabled on your Gmail account
- Check spam folder
- Verify environment variables are set correctly

**Birthdays not saving?**
- Make sure you're using a browser that supports persistent storage
- Check browser console for errors
- Try clearing cache and reloading

**Can't access admin dashboard?**
- There's no password protection by default
- Consider adding authentication if needed
- Keep the URL private

## Future Enhancements

Consider adding:
- SMS reminders (via Twilio)
- WhatsApp notifications
- Image upload for birthday posts
- Template messages for birthday posts
- Integration with The Living Voices social media accounts
- Choir member directory integration

## Support

For questions or issues, create an issue in the GitHub repository.

## License

MIT License - Made with ❤️ for The Living Voices, RCCG Living Water Parish, Kano
