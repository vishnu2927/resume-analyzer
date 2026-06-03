require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const pdf = require('pdf-parse');
    const data = await pdf(req.file.buffer);
    const text = data.text;
    const jobRole = req.body.job_role || '';
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a resume analyzer. Return ONLY valid JSON.' },
        { role: 'user', content: `Analyze this resume${jobRole ? ' for ' + jobRole : ''}. Return JSON: ats_score, score_breakdown, missing_skills, strengths, improvements, keywords_found, keywords_missing, job_titles_suggested, summary.\n\n${text}` }
      ]
    });
    const content = completion.choices[0].message.content.trim();
    const match = content.match(/\{[\s\S]*\}/);
    res.json(JSON.parse(match ? match[0] : content));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 5000, () => console.log('Server running'));