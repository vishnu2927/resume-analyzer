import os, json, tempfile, logging
import pdfplumber
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
MODEL = "llama-3.3-70b-versatile"

@app.route("/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files["file"]
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name
    text = ""
    with pdfplumber.open(tmp_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    os.unlink(tmp_path)
    print(f"Extracted text length: {len(text)}")
    client = Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a resume analyzer. Return ONLY valid JSON, no extra text."},
            {"role": "user", "content": f"Analyze this resume. Return JSON with: ats_score (number 0-100), missing_skills (array of strings), strengths (array of strings), improvements (array of strings), summary (string).\n\nResume:\n{text}"}
        ]
    )
    content = response.choices[0].message.content.strip()
    print(f"Result: {result}")
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
