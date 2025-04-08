# Send Email Cloud Function

This Cloud Function sends emails with user contact information and conversation history from the Dengun Assistant chat application.

## Overview

When a user shares their contact information (email or phone number) in the chat, the application detects this and triggers this function to send an email notification to the specified recipient with the user's details and the full conversation history.

## Configuration

### Environment Variables

The function requires the following environment variables:

- `SMTP_HOST`: SMTP server hostname (default: 'smtp.gmail.com')
- `SMTP_PORT`: SMTP server port (default: 587)
- `SMTP_SECURE`: Whether to use SSL (true/false)
- `SMTP_USER`: SMTP server username/email
- `SMTP_PASS`: SMTP server password or app password
- `EMAIL_FROM`: Sender email address (default: 'Dengun Assistant <noreply@dengun.com>')

### Deployment

#### Gmail App Password Setup (Recommended for Gmail users)

If using Gmail as your email service:

1. Make sure 2-Step Verification is enabled on your Google account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Under "Signing in to Google," select "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Enter a name (e.g., "Dengun Assistant") and click "Generate"
6. Use the 16-character password (without spaces) as your `SMTP_PASS`

#### Google Cloud Functions

1. Navigate to the `functions/sendEmail` directory:
   ```
   cd functions/sendEmail
   ```

2. Deploy the function to Google Cloud:
   ```
   gcloud functions deploy sendEmail \
     --runtime nodejs18 \
     --trigger-http \
     --allow-unauthenticated \
     --region=europe-west1 \
     --set-env-vars SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_SECURE=false,SMTP_USER=your-email@gmail.com,SMTP_PASS=your-app-password,EMAIL_FROM="Dengun Assistant <your-email@gmail.com>"
   ```

3. After deployment, note the function URL for use in the frontend application.

#### Firebase Functions

1. Initialize Firebase in the project root (if not already done):
   ```
   firebase init functions
   ```

2. Add the function to your Firebase functions index.js:
   ```javascript
   const sendEmailFunction = require('./sendEmail');
   exports.sendEmail = sendEmailFunction.sendEmail;
   ```

3. Set environment variables:
   ```
   firebase functions:config:set smtp.host="smtp.example.com" smtp.port="587" smtp.secure="false" smtp.user="your-email@example.com" smtp.pass="your-password" email.from="Dengun Assistant <noreply@dengun.com>"
   ```

4. Deploy:
   ```
   firebase deploy --only functions
   ```

## Usage

The function expects a POST request with the following JSON body:

```json
{
  "to": "recipient@example.com",
  "subject": "New Contact from Chat: User Name",
  "content": "Formatted conversation content",
  "userName": "User Name",
  "userEmail": "user@example.com",
  "userPhone": "+1234567890"
}
```

## Security Considerations

- Protect SMTP credentials using environment variables
- Consider adding authentication to the function endpoint
- Implement rate limiting to prevent abuse
- Validate input data before processing 