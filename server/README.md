# Simple Email Server for Dengun Assistant

This is a simple Express server that handles sending emails from the Dengun Assistant chat application.

## Setup

1. Make sure you have Node.js installed on your system
2. Install dependencies:
   ```
   cd server
   npm install
   ```

## Running the Server

Start the server with:
```
npm start
```

Or for development with auto-restart:
```
npm run dev
```

The server will run on http://localhost:3000 by default.

## Usage

Send an email by making a POST request to `/send-email` with the following JSON body:

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

## Environment Variables

The server uses the following environment variables from the root `.env` file:

- `SMTP_HOST`: SMTP server hostname (default: 'smtp.gmail.com')
- `SMTP_PORT`: SMTP server port (default: 587)
- `SMTP_SECURE`: Whether to use SSL (true/false)
- `SMTP_USER`: SMTP server username/email
- `SMTP_PASS`: SMTP server password or app password
- `EMAIL_FROM`: Sender email address
- `PORT`: Port to run the server on (default: 3000)

## Testing

You can test the server is running by opening http://localhost:3000 in your browser.

To test email sending, you can use a tool like Postman or curl:

```
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "content": "This is a test email",
    "userName": "Test User",
    "userEmail": "test@example.com",
    "userPhone": "+1234567890"
  }'
``` 