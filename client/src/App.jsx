import React, { useEffect, useMemo, useRef, useState } from 'react'
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

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '') || ''

function FooterGitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 18 4.77 5.07 5.07 0 0 0 17.91 1S16.73.65 14 2.48a13.38 13.38 0 0 0-7 0C4.27.65 3.09 1 3.09 1A5.07 5.07 0 0 0 3 4.77a5.44 5.44 0 0 0-1.5 3.75c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 7 18.13V22" />
    </svg>
  )
}

function FooterLinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 8a6 6 0 0 1 6 6v6h-4v-6a2 2 0 0 0-4 0v6h-4V8h4v2a4 4 0 0 1 2-2Z" />
      <rect x="2" y="8" width="4" height="12" rx="1" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function FooterMailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const resultsRef = useRef(null)
  const fakeProgressTimerRef = useRef(null)

  const hasResult = Boolean(result)

  const headline = useMemo(() => {
    if (hasResult) return 'Your resume analysis is ready.'
    return 'Turn a PDF resume into a polished, recruiter-friendly analysis.'
  }, [hasResult])

  useEffect(() => {
    if (hasResult && resultsRef.current) {
      window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [hasResult])

  useEffect(() => {
    if (!loading) {
      if (fakeProgressTimerRef.current) {
        window.clearInterval(fakeProgressTimerRef.current)
        fakeProgressTimerRef.current = null
      }
      return undefined
    }

    setUploadProgress(12)
    fakeProgressTimerRef.current = window.setInterval(() => {
      setUploadProgress((current) => {
        if (current >= 94) {
          window.clearInterval(fakeProgressTimerRef.current)
          fakeProgressTimerRef.current = null
          return current
        }
        return current + (current < 35 ? 8 : current < 70 ? 4 : 2)
      })
    }, 280)

    return () => {
      if (fakeProgressTimerRef.current) {
        window.clearInterval(fakeProgressTimerRef.current)
        fakeProgressTimerRef.current = null
      }
    }
  }, [loading])

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please upload a PDF resume before analyzing.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setUploadProgress(8)

    try {
      const form = new FormData()
      form.append('file', selectedFile, selectedFile.name)
      if (jobRole.trim()) {
        form.append('job_role', jobRole.trim())
      }

      const response = await axios.post(`${apiBaseUrl}/api/analyze`, form, {
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
    } catch (error) {
      setError(error?.message || error?.error || 'Failed to analyze resume. Please try again.')
    } finally {
      setLoading(false)
      window.setTimeout(() => setUploadProgress((current) => (current >= 100 ? 0 : current)), 800)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setResult(null)
    setError('')
    setUploadProgress(0)
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white page-enter">
      <div className="hero-orb hero-orb-left" />
      <div className="hero-orb hero-orb-right" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.12] bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:52px_52px]" />
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
          <section ref={resultsRef} className="animate-fade-up scroll-mt-8">
            <Results
              data={result}
              jobRole={jobRole}
              onAnalyzeAnother={handleReset}
            />
          </section>
        )}

        <footer className="mt-2 overflow-hidden rounded-[1.75rem] border border-white/10 border-t-emerald-400/30 bg-slate-950/95 px-6 py-8 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl sm:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">About</p>
              <h3 className="mt-3 text-lg font-semibold text-white">Vishnu Yadav</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">B.Tech CSE (AI &amp; ML) — RKGIT, AKTU</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">Full Stack Developer &amp; AI Enthusiast</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Ghaziabad, Uttar Pradesh, India</p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Connect</p>
              <div className="mt-4 space-y-3 text-sm">
                <a
                  href="https://github.com/vishnu2927"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:text-emerald-300"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-emerald-300">
                    <FooterGitHubIcon />
                  </span>
                  <span>GitHub</span>
                </a>
                <a
                  href="https://linkedin.com/in/vishnu-yadav-4476352ab"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:text-emerald-300"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-emerald-300">
                    <FooterLinkedInIcon />
                  </span>
                  <span>LinkedIn</span>
                </a>
                <a
                  href="mailto:vishnu29sep@gmail.com"
                  className="flex items-center gap-3 text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:text-emerald-300"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-emerald-300">
                    <FooterMailIcon />
                  </span>
                  <span>Email</span>
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Project</p>
              <h3 className="mt-3 text-lg font-semibold text-white">About This Project</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Smart Resume Analyzer — AI powered ATS analysis tool</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">Built with React • Node.js • Python • Groq AI</p>
              <a
                href="https://github.com/vishnu2927/resume-analyzer"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-emerald-400/15 hover:text-emerald-100"
              >
                View Source Code
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5 text-center text-sm text-slate-400">
            © 2025 Vishnu Yadav • Built with ❤️ for job seekers
          </div>
        </footer>
      </main>
    </div>
  )
}
