# Setting Up Email Notifications in Dengun Assistant

This guide provides detailed instructions on how to set up the email notification system for the Dengun Assistant application.

## Overview

The Dengun Assistant has a feature that detects when users share their contact information (email or phone) and can send a notification email to your team with the user's information and conversation history.

## Prerequisites

1. Node.js and npm installed
2. Google Cloud account (for Cloud Functions)
3. Gmail account with 2-factor authentication enabled (for sending emails)

## Step 1: Create a Gmail App Password

1. Sign in to your Google Account
2. Go to [Security settings](https://myaccount.google.com/security)
3. Under "Signing in to Google," select "App passwords"
   - Note: This option is only available if 2-Step Verification is enabled
4. At the bottom, select "Select app" and choose "Mail"
5. Select "Other" and enter a name (e.g., "Dengun Assistant")
6. Click "Generate"
7. Copy the 16-character password (it will be displayed without spaces)
8. Store this password securely - you will need it for the environment configuration

## Step 2: Configure Environment Variables

1. Create or update the `.env` file in the project root with these settings:

```
# SMTP Configuration for Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Dengun Assistant <your-email@gmail.com>
```

2. Update the frontend environment by creating or editing `frontend/.env`:

```
# Email Function URL
VITE_EMAIL_FUNCTION_URL=https://us-central1-your-project-id.cloudfunctions.net/sendEmail
```

## Step 3: Deploy the Cloud Function

### Option 1: Using Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to Cloud Functions
3. Click "Create Function"
4. Configure the function:
   - Name: `sendEmail`
   - Region: `us-central1` (or your preferred region)
   - Trigger type: HTTP
   - Allow unauthenticated invocations: Yes (or No with proper authentication)
5. In the next step, select "Node.js 18" as the runtime
6. Copy the code from `functions/sendEmail/index.js` into the inline editor
7. Create `package.json` with the following content:
   ```json
   {
     "name": "send-email",
     "version": "1.0.0",
     "description": "Cloud function to send email notifications",
     "main": "index.js",
     "dependencies": {
       "nodemailer": "^6.9.7",
       "cors": "^2.8.5"
     }
   }
   ```
8. Add the environment variables from Step 2
9. Click "Deploy"

### Option 2: Using Google Cloud CLI

1. Navigate to the `functions/sendEmail` directory:
   ```
   cd functions/sendEmail
   ```

2. Deploy the function:
   ```
   gcloud functions deploy sendEmail \
     --runtime nodejs18 \
     --trigger-http \
     --allow-unauthenticated \
     --region=us-central1 \
     --set-env-vars SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_SECURE=false,SMTP_USER=your-email@gmail.com,SMTP_PASS=your-app-password,EMAIL_FROM="Dengun Assistant <your-email@gmail.com>"
   ```

3. Note the function URL from the output

## Step 4: Configure the Frontend

1. Update `frontend/.env` with the function URL:
   ```
   VITE_EMAIL_FUNCTION_URL=https://us-central1-your-project-id.cloudfunctions.net/sendEmail
   ```

2. Restart the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

## Step 5: Test the Email Functionality

1. Run the test script:
   ```
   cd functions/sendEmail
   node test.js
   ```

2. Or test directly in the application by entering a message with an email or phone number

## Troubleshooting

### CORS Issues

If you encounter CORS (Cross-Origin Resource Sharing) errors:

1. Ensure the Cloud Function has proper CORS headers
2. The `index.js` file already includes CORS configuration, but verify it's deployed correctly
3. Check the browser console for specific CORS error messages

### Email Not Sending

If emails are not being sent:

1. Verify the SMTP settings
2. Check if the App Password is correct
3. Look at the Cloud Function logs in Google Cloud Console
4. Test sending an email directly using a script

## Security Considerations

1. Keep your App Password secure and never commit it to version control
2. Consider adding authentication to the Cloud Function
3. Implement rate limiting to prevent abuse
4. Store sensitive information in environment variables, not in code

## Further Improvements

1. Add email templates for better formatting
2. Implement email verification
3. Add support for attachments
4. Set up monitoring and alerts for failed email deliveries 