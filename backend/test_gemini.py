"""
test_gemini.py — smoke test for Gemini integration.
Run from the backend directory with GEMINI_API_KEY set in the environment:
    Gemini_API_key=<your_key> python test_gemini.py
Never hardcode API keys in this file.
"""
import os
import sys

import google.generativeai as genai

api_key = os.environ.get("Gemini_API_key", "").strip()
if not api_key:
    print("ERROR: Gemini_API_key environment variable is not set.", file=sys.stderr)
    sys.exit(1)

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.5-flash")

response = model.generate_content(
    "Give one traffic management recommendation for a vehicle breakdown."
)

print(response.text)
