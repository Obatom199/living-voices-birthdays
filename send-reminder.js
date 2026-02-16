// Serverless function for email reminders
// Works with Netlify Functions or Vercel

const nodemailer = require('nodemailer');

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

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { birthdays, adminEmail, reminderDays } = JSON.parse(event.body);

        // Find upcoming birthdays
        const upcomingBirthdays = birthdays.filter(b => {
            const days = getDaysUntilBirthday(b.birthday);
            return days === parseInt(reminderDays) && !b.posted;
        });

        if (upcomingBirthdays.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'No birthdays to remind' })
            };
        }

        // Create email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Prepare birthday list
        const birthdayList = upcomingBirthdays.map(b => {
            const birthDate = new Date(b.birthday);
            const formattedDate = birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            const days = getDaysUntilBirthday(b.birthday);
            return `
                <div style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
                    <strong style="font-size: 18px; color: #333;">${b.name}</strong>
                    <div style="color: #666; margin-top: 5px;">${formattedDate} (${days} days away)</div>
                </div>
            `;
        }).join('');

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: adminEmail,
            subject: `🎂 The Living Voices Birthday Reminder: ${upcomingBirthdays.length} upcoming birthday${upcomingBirthdays.length > 1 ? 's' : ''}`,
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
                            ${birthdayList}
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
                </div>
            `
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Reminder sent successfully',
                count: upcomingBirthdays.length 
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send reminder' })
        };
    }
};
