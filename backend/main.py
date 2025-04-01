from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import openai

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get OpenAI API key from environment variable
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key not found. Please set OPENAI_API_KEY in .env file")

# Configure OpenAI
openai.api_key = OPENAI_API_KEY

@app.route('/')
def root():
    return jsonify({"message": "AI Assistant API is running"})

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        response = openai.ChatCompletion.create(
            model=data.get('model', 'gpt-3.5-turbo'),
            messages=data.get('messages', []),
            temperature=data.get('temperature', 0.7),
            max_tokens=data.get('max_tokens', 1000)
        )
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True) 