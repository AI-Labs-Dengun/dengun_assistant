# AI Assistant Application

A modern web application with authentication and chat functionality powered by OpenAI.

## Project Structure

```
├── frontend/           # React + Tailwind frontend
├── backend/           # Python backend
├── instructions/      # Instructions for the AI
├── knowledge/         # Knowledge base files
└── functions/         # Cloud functions for additional features
```

## Setup Instructions

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

### Backend Setup
1. Navigate to the backend directory
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Start the server: `python main.py`

### Cloud Functions Setup
1. Navigate to the functions/sendEmail directory
2. Follow the deployment instructions in the README.md file
3. Update the function URL in the frontend code

## Features
- Passwordless authentication
- OpenAI-powered chat interface
- Customizable instructions and knowledge base
- Modern UI with Tailwind CSS
- Voice interaction with OpenAI Text-to-Speech and Whisper transcription
- Contact information detection and notification system
- Comment and feedback features for improving responses

## Contact Information Detection

The application includes a feature that:
1. Detects when users share their contact information (email or phone) in the chat
2. Securely captures this information for follow-up
3. Sends an email notification with the user details and conversation history
4. Allows Dengun team members to quickly respond to interested customers

This feature is implemented using:
- Regular expression pattern matching for contact detection
- OpenAI API for formatting the conversation data
- Cloud function for sending email notifications securely
- Privacy-focused approach that only processes provided information 