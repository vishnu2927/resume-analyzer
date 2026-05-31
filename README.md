# Resume Analyzer

Smart Resume Analyzer — React + Node + Flask + Groq (Llama3-70b)

Badges
- Build: TBD
- License: MIT

Features
- PDF resume upload
- Text extraction (pdfplumber)
- AI analysis via Groq API: ATS Score, Missing Skills, Strengths, Improvements
- React dashboard with charts (recharts)
- Tailwind CSS professional UI

Tech Stack
- Frontend: React.js, Tailwind CSS, Recharts
- Backend: Node.js + Express
- AI service: Python Flask (pdfplumber) + Groq API

Screenshots
- Add screenshots here (client/src/assets/screenshots)

Setup
1. Copy `.env.example` to `.env` and fill values.
2. Run servers:

- Server

```bash
cd server
npm install
npm start
```

- Client

```bash
cd client
npm install
npm start
```

- AI microservice

```bash
cd ai
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Notes
- Ask for Groq API key when ready to integrate.
 - A PowerShell setup script `setup.ps1` is included to install dependencies and start all services on Windows.
 - Run PowerShell as Administrator and execute:

```powershell
.\setup.ps1
```

The app will be available at `http://localhost:5173` once the client finishes building.
