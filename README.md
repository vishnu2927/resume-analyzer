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

Environment Variables
- `GROQ_API_KEY`: Groq API key used by the Flask AI service
- `VITE_API_BASE_URL`: Base URL for the deployed backend. Use `http://localhost:5000` locally, and your Railway URL in production
- `AI_URL`: Internal AI service URL used by the Node server. Defaults to `http://127.0.0.1:8000`
- `PORT`: Railway assigns this automatically to the Node server

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

Deployment

1. Vercel frontend

- Connect the repository to Vercel.
- Vercel uses the root [vercel.json](vercel.json) to build `client` and serve the static app.
- Set `VITE_API_BASE_URL` in Vercel to your Railway backend URL, for example `https://your-backend.up.railway.app`.

2. Railway backend

- Connect the same repository to Railway.
- Railway uses the root [railway.json](railway.json) to install the Node and Python dependencies and start both backend processes.
- Add `GROQ_API_KEY` in Railway variables.
- `AI_URL` can stay unset because the Node server talks to the Flask service running locally inside the same Railway container.

3. Local development

- Copy [.env.example](.env.example) to `.env`.
- Set `GROQ_API_KEY` and, if needed, `VITE_API_BASE_URL`.
- The Vite dev server proxies `/api` to the Node server on port 5000.

Notes
- Ask for Groq API key when ready to integrate.
 - A PowerShell setup script `setup.ps1` is included to install dependencies and start all services on Windows.
 - Run PowerShell as Administrator and execute:

```powershell
.\setup.ps1
```

The app will be available at `http://localhost:5173` once the client finishes building.
