require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

// configure multer to accept only PDFs and keep original filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/') },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname) }
})
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true)
  else cb(new Error('Only PDF files are allowed'), false)
}
const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } })
const app = express()
app.use(cors())
app.use(express.json())

const AI_URL = process.env.AI_URL || 'http://127.0.0.1:8000'

app.get('/health', (_, res) => {
  res.json({ ok: true })
})

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  console.log('[Server] /api/analyze called')
  if (!req.file) {
    console.log('[Server] No file in request')
    return res.status(400).json({ error: 'No file uploaded' })
  }

  console.log('[Server] Received file:', { originalname: req.file.originalname, path: req.file.path, size: req.file.size })
  if (req.body && req.body.job_role) {
    console.log('[Server] Job role received:', req.body.job_role)
  }

  try {
    const form = new FormData()
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname)
    if (req.body && req.body.job_role) {
      form.append('job_role', req.body.job_role)
    }

    const headers = form.getHeaders()
    console.log('[Server] Forwarding file to AI service at', `${AI_URL}/analyze`)
    const resp = await axios.post(`${AI_URL}/analyze`, form, { headers: headers, timeout: 120000 })

    console.log('[Server] AI service responded with status', resp.status)
    // cleanup uploaded file
    try { fs.unlinkSync(req.file.path); console.log('[Server] cleaned up uploaded file') } catch (e) { console.warn('[Server] cleanup failed', e.message) }

    // If AI returned an error structure, forward it with proper status
    if (resp.status >= 400) {
      console.log('[Server] AI responded with error', resp.data)
      return res.status(resp.status).json(resp.data)
    }

    // Ensure we send JSON
    return res.json(resp.data)
  } catch (err) {
    // Provide detailed error info for debugging
    const aiErr = err.response && err.response.data ? err.response.data : null
    console.error('[Server] /api/analyze error:', err.message)
    if (aiErr) console.error('[Server] AI response body:', aiErr)

    // cleanup uploaded file on error
    try { if (req.file && req.file.path) fs.unlinkSync(req.file.path) } catch (e) { console.warn('[Server] cleanup failed', e.message) }

    // choose appropriate status code
    const status = err.response && err.response.status ? err.response.status : 500
    return res.status(status).json({
      error: aiErr?.error || 'Failed to analyze file',
      details: aiErr?.details || aiErr || err.message,
      upstream: aiErr ? 'ai-service' : 'server'
    })
  }
})

const PORT = process.env.PORT || process.env.SERVER_PORT || 5000
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))
