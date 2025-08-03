# Email Configuration Guide for ri.gym.pro

## How to Set Up Email Credentials

You need to configure SMTP settings in your `.env` file. Here are the most common providers:

### 1. Gmail (Recommended for Development)

**Step 1: Enable 2-Factor Authentication**
1. Go to your Google Account settings
2. Security → 2-Step Verification → Turn on

**Step 2: Generate App Password**
1. Go to Google Account → Security
2. 2-Step Verification → App passwords
3. Select "Mail" and generate password
4. Copy the 16-character password

**Step 3: Update .env file:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
FROM_EMAIL=noreply@ri.gym.pro
```

### 2. Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
FROM_EMAIL=noreply@ri.gym.pro
```

### 3. Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@ri.gym.pro
```

### 4. Professional Email Providers

#### SendGrid (Production Recommended)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
FROM_EMAIL=noreply@ri.gym.pro
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your_mailgun_password
FROM_EMAIL=noreply@ri.gym.pro
```

#### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_access_key
SMTP_PASS=your_ses_secret_key
FROM_EMAIL=noreply@ri.gym.pro
```

## Quick Setup for Testing (Gmail)

1. **Use a dedicated Gmail account for your app** (don't use your personal email)
2. **Enable 2FA** on that Gmail account
3. **Generate an App Password**:
   - Go to https://myaccount.google.com/
   - Security → 2-Step Verification → App passwords
   - Select "Mail" → Generate
   - Copy the 16-character password (like: `abcd efgh ijkl mnop`)

4. **Update your .env file**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_test_email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
FROM_EMAIL=noreply@ri.gym.pro
```

## Testing Your Configuration

After setting up your credentials, restart your server and run:

```bash
# Test the email configuration
curl http://localhost:3001/api/test/email-config-public
```

Or create a test user and place an order to see if emails are sent.

## Production Recommendations

### For Production, Use Professional Services:

1. **SendGrid** - Easy setup, good free tier
2. **Mailgun** - Reliable for transactional emails
3. **Amazon SES** - Cost-effective for high volume

### Security Best Practices:

1. **Never commit email credentials to Git**
2. **Use different credentials for development/production**
3. **Monitor email sending limits and usage**
4. **Set up proper SPF, DKIM, and DMARC records for your domain**

## Troubleshooting

### Common Issues:

1. **"Missing credentials for PLAIN"**
   - Solution: Make sure SMTP_USER and SMTP_PASS are set correctly

2. **"Invalid login"**
   - Solution: For Gmail, make sure you're using App Password, not your regular password

3. **"Connection timeout"**
   - Solution: Check if your firewall/network allows outbound connections on port 587

4. **"Daily sending limit exceeded"**
   - Solution: Gmail has daily limits (500 emails/day for free accounts)

### Testing Commands:

```bash
# Test email configuration
curl http://localhost:3001/api/test/email-config-public

# Check server logs for email errors
npm start
# Look for email-related errors in the console
```

## Current Status

Your `.env` file has been updated with the correct SMTP variables. You now need to:

1. Choose an email provider (Gmail recommended for testing)
2. Get the credentials (App Password for Gmail)
3. Update the SMTP_USER and SMTP_PASS values in your `.env` file
4. Restart your server
5. Test the configuration

The email system is fully implemented and ready to work once you provide valid credentials!
