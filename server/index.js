require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Groq = require('groq-sdk');
const { PDFParse } = require('pdf-parse');

const pdfParse = async (buffer) => {
  const parser = new PDFParse({ data: buffer });
  try {
    return await parser.getText();
  } finally {
    await parser.destroy();
  }
};

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const clientOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

console.log('GROQ KEY EXISTS:', !!process.env.GROQ_API_KEY);
if (!process.env.GROQ_API_KEY) {
  console.error('GROQ_API_KEY missing');
}

console.log('PORT:', process.env.PORT || process.env.SERVER_PORT || 5000);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

app.use(cors({
  origin: clientOrigins.length > 0 ? clientOrigins : true,
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Resume Analyzer API Running'
  });
});

app.post('/api/analyze', (req, res, next) => {
  console.log('[ANALYZE] Before multer upload.single(file)');
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('[ANALYZE] Multer error:', err);
      console.error(err.stack);
      return res.status(400).json({ error: err.message });
    }

    console.log('[ANALYZE] After multer upload.single(file)');
    console.log('[ANALYZE] Upload field name:', req.file ? req.file.fieldname : 'no file');
    console.log('[ANALYZE] File present:', !!req.file);
    console.log('[ANALYZE] File name:', req.file ? req.file.originalname : 'no file');
    console.log('[ANALYZE] File size:', req.file ? req.file.size : 0);
    console.log('[ANALYZE] Body keys:', Object.keys(req.body || {}));
    next();
  });
}, async (req, res) => {
  try {
    console.log('[ANALYZE] Enter handler');
    if (!req.file) {
      console.error('[ANALYZE] No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('[ANALYZE] Starting PDF parsing');
    console.log(typeof pdfParse);
    console.log('[ANALYZE] Buffer length:', req.file.buffer ? req.file.buffer.length : 0);
    const data = await pdfParse(req.file.buffer);
    console.log('[ANALYZE] PDF parsing complete');
    console.log('[ANALYZE] Parsed text length:', data.text ? data.text.length : 0);

    const text = data.text;
    const jobRole = req.body.job_role || '';
    console.log('[ANALYZE] Job role:', jobRole || '(empty)');

    console.log('[ANALYZE] Creating Groq client');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    console.log('[ANALYZE] Starting Groq API call');
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a resume analyzer. Return ONLY valid JSON.' },
        { role: 'user', content: `Analyze this resume${jobRole ? ' for ' + jobRole : ''}. Return JSON: ats_score, score_breakdown, missing_skills, strengths, improvements, keywords_found, keywords_missing, job_titles_suggested, summary.\n\n${text}` }
      ]
    });
    console.log('[ANALYZE] Groq API call complete');

    const content = completion.choices[0].message.content.trim();
    console.log('[ANALYZE] Groq raw content length:', content.length);

    console.log('[ANALYZE] Starting JSON parsing');
    const match = content.match(/\{[\s\S]*\}/);
    const parsedResponse = JSON.parse(match ? match[0] : content);
    console.log('[ANALYZE] JSON parsing complete');
    console.log('[ANALYZE] Generating response');
    res.json(parsedResponse);
    console.log('[ANALYZE] Response sent successfully');
  } catch (err) {
    console.error('FULL ERROR:', err);
    console.error(err.stack);
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

app.use((err, req, res, next) => {
  console.error('FULL ERROR:', err);
  console.error(err.stack);
  res.status(500).json({
    error: err.message,
    stack: err.stack
  });
});

app.listen(process.env.PORT || process.env.SERVER_PORT || 5000, () => console.log('Server running'));