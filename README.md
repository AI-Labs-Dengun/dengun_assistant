# AI Assistant Application

A modern web application with authentication and chat functionality powered by OpenAI.

## Project Structure

```
├── frontend/           # React + Tailwind frontend
├── backend/           # Python backend
├── instructions/      # Instructions for the AI
└── knowledge/         # Knowledge base files
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

## Features
- Passwordless authentication
- OpenAI-powered chat interface
- Customizable instructions and knowledge base
- Modern UI with Tailwind CSS 