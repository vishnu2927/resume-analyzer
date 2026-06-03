require('dotenv').config()
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const pdfParse = require('pdf-parse')
const Groq = require('groq-sdk')

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const data = await pdfParse(req.file.buffer)
    const text = data.text
    const jobRole = req.body.job_role || ''

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a resume analyzer. Return ONLY valid JSON, no extra text.' },
        {
          role: 'user',
          content: `Analyze this resume${jobRole ? ' for the role of ' + jobRole : ''}. Return JSON with: ats_score (0-100), score_breakdown (object with keywords, formatting, experience, education, skills as numbers), missing_skills (array), strengths (array), improvements (array of objects with text and priority), keywords_found (array), keywords_missing (array), job_titles_suggested (array), summary (string).\n\nResume:\n${text}`
        }
      ]
    })

    const content = completion.choices[0].message.content.trim()
    const match = content.match(/\{[\s\S]*\}/)
    const result = JSON.parse(match ? match[0] : content)
    res.json(result)
  } catch (err) {
    console.error('Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
