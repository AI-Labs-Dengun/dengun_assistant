# Manual Deployment Guide for sendEmail Cloud Function

Since there are execution policy restrictions on your system, here's how to manually deploy the updated sendEmail function with CORS support.

## Option 1: Using Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to Cloud Functions
3. Find the `sendEmail` function and click on it
4. Click the "Edit" button
5. In the "Source code" section, select "Inline editor"
6. Replace the content of `index.js` with the code from your local `index.js` file
7. Set the following environment variables:
   - `SMTP_HOST`: smtp.gmail.com
   - `SMTP_PORT`: 587
   - `SMTP_SECURE`: false
   - `SMTP_USER`: ai@dengun.com
   - `SMTP_PASS`: hrnpphkmdsftwpbz
   - `EMAIL_FROM`: Dengun Assistant <ai@dengun.com>
8. Click "Deploy" to update the function

## Option 2: Using gcloud CLI without PowerShell Script

If you have the Google Cloud SDK installed, you can run the following commands in PowerShell or Command Prompt:

```
cd functions/sendEmail

gcloud functions deploy sendEmail ^
  --runtime nodejs18 ^
  --trigger-http ^
  --allow-unauthenticated ^
  --region=us-central1 ^
  --set-env-vars SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_SECURE=false,SMTP_USER=ai@dengun.com,SMTP_PASS=hrnpphkmdsftwpbz,EMAIL_FROM="Dengun Assistant <ai@dengun.com>"
```

## Option 3: Using PowerShell Script with Bypass

If you want to run the PowerShell script, you can bypass the execution policy for just this script:

```
cd functions/sendEmail
powershell -ExecutionPolicy Bypass -File .\deploy.ps1
```

## Testing After Deployment

After deploying, you can test the function by running:

```
cd functions/sendEmail
powershell -ExecutionPolicy Bypass -File .\test.ps1
```

## Alternative Solution: Update Frontend Code

If you can't deploy the function right now, you can modify the frontend code to use a temporary workaround:

1. Edit the `sendContactEmail` function in `frontend/src/pages/Chat.jsx`
2. Set `mode: 'no-cors'` in the fetch options
3. Note that with 'no-cors' mode, you won't be able to read the response, but it might still work for sending the email

```javascript
const response = await fetch(sendEmailFunctionURL, {
  method: 'POST',
  mode: 'no-cors', // Use no-cors as a temporary workaround
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    // ...request data...
  }),
});
``` 