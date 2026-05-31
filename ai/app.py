import os, json, tempfile, logging, re
import pdfplumber
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
MODEL = "llama-3.3-70b-versatile"


def default_result(summary_text=""):
    return {
        "ats_score": 70,
        "score_breakdown": {
            "keywords": 70,
            "formatting": 70,
            "experience": 70,
            "education": 70,
            "skills": 70
        },
        "missing_skills": [],
        "strengths": [],
        "improvements": [],
        "keywords_found": [],
        "keywords_missing": [],
        "experience_years": 0,
        "experience_label": "",
        "job_titles_suggested": [],
        "summary": summary_text
    }


def normalize_result(result, raw_content=""):
    output = default_result(raw_content)
    if isinstance(result, dict):
        output.update({k: v for k, v in result.items() if k in output or k == "score_breakdown"})

        score_breakdown = output.get("score_breakdown") or {}
        if not isinstance(score_breakdown, dict):
            score_breakdown = {}
        output["score_breakdown"] = {
            "keywords": int(score_breakdown.get("keywords", 70)),
            "formatting": int(score_breakdown.get("formatting", 70)),
            "experience": int(score_breakdown.get("experience", 70)),
            "education": int(score_breakdown.get("education", 70)),
            "skills": int(score_breakdown.get("skills", 70))
        }

        output["missing_skills"] = output.get("missing_skills") if isinstance(output.get("missing_skills"), list) else []
        output["strengths"] = output.get("strengths") if isinstance(output.get("strengths"), list) else []
        output["keywords_found"] = output.get("keywords_found") if isinstance(output.get("keywords_found"), list) else []
        output["keywords_missing"] = output.get("keywords_missing") if isinstance(output.get("keywords_missing"), list) else []
        output["job_titles_suggested"] = output.get("job_titles_suggested") if isinstance(output.get("job_titles_suggested"), list) else []
        output["experience_years"] = int(output.get("experience_years", 0) or 0)
        output["experience_label"] = str(output.get("experience_label", "") or "")

        improvements = output.get("improvements")
        if isinstance(improvements, list):
            normalized_improvements = []
            for item in improvements:
                if isinstance(item, dict):
                    normalized_improvements.append({
                        "text": str(item.get("text", "")),
                        "priority": item.get("priority", "Medium")
                    })
                else:
                    normalized_improvements.append({"text": str(item), "priority": "Medium"})
            output["improvements"] = normalized_improvements
        else:
            output["improvements"] = []

        if not isinstance(output.get("summary"), str):
            output["summary"] = raw_content

        score = int(output.get("ats_score", 70) or 70)
        output["ats_score"] = max(0, min(100, score))

    return output


@app.route("/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400

    file = request.files["file"]
    job_role = (request.form.get("job_role") or "").strip()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    text = ""
    with pdfplumber.open(tmp_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    os.unlink(tmp_path)
    print(f"Extracted text length: {len(text)}")
    if job_role:
        print(f"Job role context: {job_role}")

    client = Groq(api_key=GROQ_API_KEY)
    schema_example = json.dumps(
        {
            "ats_score": 85,
            "score_breakdown": {
                "keywords": 90,
                "formatting": 80,
                "experience": 85,
                "education": 90,
                "skills": 80
            },
            "missing_skills": ["Docker", "AWS", "Kubernetes"],
            "strengths": ["Strong AI/ML background", "Full stack experience"],
            "improvements": [
                {"text": "Add cloud certifications", "priority": "High"},
                {"text": "Include GitHub links", "priority": "Medium"},
                {"text": "Add metrics to achievements", "priority": "Low"}
            ],
            "keywords_found": ["React", "Node.js", "Python", "MongoDB"],
            "keywords_missing": ["Docker", "AWS", "CI/CD"],
            "experience_years": 1,
            "experience_label": "6 months",
            "job_titles_suggested": ["Software Engineer", "Full Stack Developer", "AI Engineer"],
            "summary": "Strong candidate with AI/ML focus..."
        },
        indent=2
    )
    user_prompt = f"""Analyze this resume for ATS and hiring quality. Return ONLY valid JSON with this exact structure:
{schema_example}

Resume:
{text}
"""
    if job_role:
        user_prompt += f"\nTarget job role: {job_role}\n"

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a resume analyzer. Return ONLY valid JSON, no extra text."},
            {"role": "user", "content": user_prompt}
        ]
    )

    content = response.choices[0].message.content.strip()
    print(f"Groq response: {content[:200]}")
    json_match = re.search(r'\{.*\}', content, re.DOTALL)
    if json_match:
        result = json.loads(json_match.group())
    else:
        result = default_result(content)

    result = normalize_result(result, content)
    print(f"Result: {result}")
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
