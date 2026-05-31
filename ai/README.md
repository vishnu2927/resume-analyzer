AI microservice (Flask) - handles PDF text extraction with `pdfplumber` and calls to Groq API.

Quick start:

```bash
cd ai
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Endpoints:
- POST /extract — form-data `file` (pdf) -> returns extracted `text`
- POST /analyze — JSON `{ text }` -> returns analysis (Groq integration placeholder)
