@echo off
echo Starting AI Assistant Application...

:: Start Backend
start cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python main.py"

:: Start Frontend
start cmd /k "cd frontend && npm install && npm run dev"

echo Application is starting...
echo Frontend will be available at http://localhost:5173
echo Backend will be available at http://localhost:8000 