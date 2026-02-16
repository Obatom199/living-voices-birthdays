const nodemailer = require('nodemailer');
const cron = require('node-cron');
const https = require('https');

// Configuration - Set these as environment variables
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-app-password';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@church.com';
const STORAGE_API_URL = process.env.STORAGE_API_URL || 'your-storage-api-endpoint';

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// Calculate days until next birthday
function getDaysUntilBirthday(birthday) {
    const today = new Date();
    const birthDate = new Date(birthday);
    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = nextBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
    });
}

// Send reminder email
async function sendReminderEmail(adminEmail, upcomingBirthdays, reminderDays) {
    const birthdayList = upcomingBirthdays.map(b => {
        const birthDate = new Date(b.birthday);
        const formattedDate = birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        const days = getDaysUntilBirthday(b.birthday);
        return `- ${b.name} - ${formattedDate} (${days} day${days > 1 ? 's' : ''} away)`;
    }).join('\n');

    const mailOptions = {
        from: EMAIL_USER,
        to: adminEmail,
        subject: `🎂 The Living Voices Birthday Reminder: ${upcomingBirthdays.length} upcoming birthday${upcomingBirthdays.length > 1 ? 's' : ''}`,
        text: `Hello,

This is your reminder that the following Living Voices choir member${upcomingBirthdays.length > 1 ? 's have' : ' has'} ${upcomingBirthdays.length > 1 ? 'birthdays' : 'a birthday'} coming up:

${birthdayList}

Don't forget to prepare and post their birthday celebration${upcomingBirthdays.length > 1 ? 's' : ''}!

Blessings,
The Living Voices Birthday Tracker
RCCG Living Water Parish, Kano`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #c94545 0%, #8b1e1e 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 2em;">🎂 The Living Voices</h1>
                    <p style="margin: 10px 0 5px 0; font-size: 1.1em;">Birthday Reminder</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em; opacity: 0.9; font-style: italic;">RCCG Living Water Parish, Kano</p>
                </div>
                
                <div style="padding: 30px; background: #f8f9fa;">
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    
                    <p style="font-size: 16px; color: #333;">
                        This is your reminder that the following Living Voices choir member${upcomingBirthdays.length > 1 ? 's have' : ' has'} 
                        ${upcomingBirthdays.length > 1 ? 'birthdays' : 'a birthday'} coming up:
                    </p>
                    
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        ${upcomingBirthdays.map(b => {
                            const birthDate = new Date(b.birthday);
                            const formattedDate = birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                            const days = getDaysUntilBirthday(b.birthday);
                            return `
                                <div style="padding: 15px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong style="font-size: 18px; color: #333;">${b.name}</strong>
                                        <div style="color: #666; margin-top: 5px;">${formattedDate}</div>
                                    </div>
                                    <div style="background: #c94545; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600;">
                                        ${days} day${days > 1 ? 's' : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <p style="font-size: 16px; color: #333;">
                        Don't forget to prepare and post their birthday celebration${upcomingBirthdays.length > 1 ? 's' : ''}!
                    </p>
                    
                    <p style="font-size: 16px; color: #333; margin-top: 30px;">
                        Blessings,<br>
                        <strong>The Living Voices Birthday Tracker</strong><br>
                        <span style="font-size: 14px; color: #666;">RCCG Living Water Parish, Kano</span><br>
                        <em style="font-size: 14px; color: #c94545;">"Praise is our weapon"</em>
                    </p>
                </div>
                
                <div style="padding: 20px; text-align: center; color: #666; font-size: 14px;">
                    <p>You're receiving this because you set up birthday reminders for The Living Voices choir.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✓ Reminder email sent to ${adminEmail} for ${upcomingBirthdays.length} upcoming birthday(s)`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// Check birthdays and send reminders
async function checkBirthdaysAndSendReminders() {
    console.log('Checking for upcoming birthdays...');
    
    try {
        // In a real implementation, you'd fetch data from your storage API
        // For now, this is a template that would need to be connected to your storage
        
        // Example: Fetch birthdays from storage
        // const birthdays = await fetchBirthdaysFromStorage();
        // const settings = await fetchSettingsFromStorage();
        
        // For demonstration, here's the structure:
        const birthdays = []; // Would come from storage
        const reminderDays = 2; // Would come from settings
        const adminEmail = ADMIN_EMAIL; // Would come from settings
        
        if (!birthdays || birthdays.length === 0) {
            console.log('No birthdays in database');
            return;
        }
        
        // Find birthdays matching the reminder threshold
        const upcomingBirthdays = birthdays.filter(b => {
            const days = getDaysUntilBirthday(b.birthday);
            return days === reminderDays && !b.posted;
        });
        
        if (upcomingBirthdays.length > 0) {
            console.log(`Found ${upcomingBirthdays.length} upcoming birthday(s)`);
            await sendReminderEmail(adminEmail, upcomingBirthdays, reminderDays);
        } else {
            console.log('No birthdays matching reminder threshold');
        }
        
    } catch (error) {
        console.error('Error checking birthdays:', error);
    }
}

// Schedule the cron job to run daily at 9 AM
console.log('Birthday Reminder Service started');
console.log('Scheduled to check birthdays daily at 9:00 AM');

// Run every day at 9:00 AM
cron.schedule('0 9 * * *', () => {
    console.log('Running daily birthday check...');
    checkBirthdaysAndSendReminders();
});

// Also run immediately on startup for testing
console.log('Running initial check...');
checkBirthdaysAndSendReminders();

// Keep the process running
process.on('SIGINT', () => {
    console.log('Birthday Reminder Service stopped');
    process.exit(0);
});
