import React, { useMemo, useState } from 'react'
import axios from 'axios'
import Upload from './components/Upload'
import Results from './components/Results'

const features = [
  {
    title: 'ATS Intelligence',
    description: 'See how recruiters and ATS systems will read your resume with a polished score breakdown and keyword analysis.'
  },
  {
    title: 'Role Matching',
    description: 'Type a target job title and instantly gauge how well your resume aligns with that role.'
  },
  {
    title: 'Actionable Feedback',
    description: 'Get strengths, gaps, improvements, suggested titles, and report-ready insights in one flow.'
  }
]

const heroMetrics = [
  { label: 'ATS-ready insights', value: '01' },
  { label: 'Detailed scoring', value: '05' },
  { label: 'Role match signal', value: '100%' }
]

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  const hasResult = Boolean(result)

  const headline = useMemo(() => {
    if (hasResult) return 'Your resume analysis is ready.'
    return 'Turn a PDF resume into a polished, recruiter-friendly analysis.'
  }, [hasResult])

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Upload a PDF resume before analyzing.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setUploadProgress(0)

    try {
      const form = new FormData()
      form.append('file', selectedFile, selectedFile.name)
      if (jobRole.trim()) {
        form.append('job_role', jobRole.trim())
      }

      const response = await axios.post('/api/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
        onUploadProgress: (event) => {
          if (event.total) {
            const progress = Math.round((event.loaded * 100) / event.total)
            setUploadProgress(progress)
          }
        }
      })

      setUploadProgress(100)
      setResult(response.data)
    } catch (err) {
      const detail = err?.response?.data?.details
      const message = err?.response?.data?.error || err.message || 'Upload failed'
      setError(detail ? `${message}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` : message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setResult(null)
    setError('')
    setUploadProgress(0)
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="hero-orb hero-orb-left" />
      <div className="hero-orb hero-orb-right" />
      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl sm:px-8 lg:px-12 lg:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_38%),linear-gradient(135deg,rgba(8,15,32,0.94),rgba(3,7,18,0.98))]" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
                Production-grade resume intelligence
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {headline}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Upload a resume PDF, compare it against a target role, and generate an ATS-style report with score breakdowns,
                  keyword gaps, strengths, improvements, and suggested next-step job titles.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur">
                    <div className="text-2xl font-bold text-emerald-300">{metric.value}</div>
                    <div className="mt-1 text-sm text-slate-300">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-emerald-950/20">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/20 blur-3xl" />
              <div className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="relative space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
                      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                      <path d="M14 3v5h5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">What you get</p>
                    <h2 className="text-xl font-semibold text-white">Readable, recruiter-ready output</h2>
                  </div>
                </div>
                <div className="grid gap-3">
                  {features.map((feature, index) => (
                    <div key={feature.title} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-semibold text-emerald-300">
                          0{index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{feature.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="glass-card animate-fade-up rounded-[1.5rem] border border-white/10 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 15.8 6.6 18.8l1-6.1L3.2 8.4l6.1-.9L12 2Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{feature.description}</p>
            </div>
          ))}
        </section>

        <section>
          <Upload
            file={selectedFile}
            setFile={setSelectedFile}
            jobRole={jobRole}
            setJobRole={setJobRole}
            onAnalyze={handleAnalyze}
            loading={loading}
            uploadProgress={uploadProgress}
            error={error}
          />
        </section>

        {hasResult && (
          <section className="animate-fade-up">
            <Results
              data={result}
              jobRole={jobRole}
              onAnalyzeAnother={handleReset}
            />
          </section>
        )}
      </main>
    </div>
  )
}
