import React, { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis
} from 'recharts'
import { jsPDF } from 'jspdf'

const HISTORY_KEY = 'smart-resume-history'

const priorityStyles = {
  High: 'border-red-400/30 bg-red-500/10 text-red-100',
  Medium: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
  Low: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
}

const badgeTone = {
  green: 'border-emerald-400/20 bg-emerald-500/12 text-emerald-100',
  red: 'border-red-400/20 bg-red-500/12 text-red-100',
  neutral: 'border-white/10 bg-white/5 text-slate-200'
}

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

const staggerStyle = (index) => ({ animationDelay: `${index * 90}ms` })

const checklistItems = [
  { key: 'contact', label: 'Contact information is visible' },
  { key: 'summary', label: 'Resume has a concise professional summary' },
  { key: 'actionVerbs', label: 'Uses strong action verbs' },
  { key: 'metrics', label: 'Includes measurable metrics and outcomes' },
  { key: 'links', label: 'Includes portfolio / GitHub / LinkedIn links' },
  { key: 'pdf', label: 'Saved as a clean PDF without formatting issues' }
]

function normalizeWord(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenizeRole(role) {
  return normalizeWord(role)
    .split(' ')
    .filter((term) => term.length > 2)
}

function clampScore(value) {
  return Math.max(0, Math.min(100, value))
}

function sectionColor(score) {
  if (score >= 85) return '#10b981'
  if (score >= 75) return '#f59e0b'
  return '#ef4444'
}

function priorityOrder(priority) {
  if (priority === 'High') return 3
  if (priority === 'Medium') return 2
  return 1
}

function BadgePill({ text, tone = 'neutral', size = 'md', icon, onClick }) {
  const sizeClasses = size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border text-left transition hover:-translate-y-0.5 hover:shadow-lg ${badgeTone[tone] || badgeTone.neutral} ${sizeClasses}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  )
}

function RoleAvatar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 21a8 8 0 1 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

function ShieldCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
      <path d="m20 6-11 11-5-5" />
    </svg>
  )
}

function AlertTriangle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.2">
      <path d="m20 6-11 11-5-5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.2">
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v6h6" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function normalizeHistoryEntry(entry) {
  return {
    ats_score: Number(entry?.ats_score || 0),
    summary: entry?.summary || '',
    createdAt: entry?.createdAt || new Date().toISOString(),
    jobRole: entry?.jobRole || '',
    score_breakdown: entry?.score_breakdown || {}
  }
}

function getHistory() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(HISTORY_KEY) || '[]').slice(0, 3).map(normalizeHistoryEntry)
  } catch {
    return []
  }
}

function persistHistory(entry) {
  if (typeof window === 'undefined') return
  const next = [normalizeHistoryEntry(entry), ...getHistory()].slice(0, 3)
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
}

function buildRoleMatch(jobRole, data) {
  const roleTokens = tokenizeRole(jobRole)
  if (!roleTokens.length) {
    return {
      score: null,
      label: 'Add a job title to see role fit',
      matched: [],
      missing: [],
      detail: 'The role matcher uses the resume keywords and title suggestions to estimate fit.'
    }
  }

  const pool = new Set(
    [
      ...(data.keywords_found || []),
      ...(data.strengths || []),
      ...(data.job_titles_suggested || []),
      ...(data.missing_skills || [])
    ].flatMap((entry) => normalizeWord(entry).split(' ').filter(Boolean))
  )

  const matched = roleTokens.filter((token) => pool.has(token) || roleTokens.join(' ').includes(token))
  const missing = roleTokens.filter((token) => !matched.includes(token))
  const base = data.ats_score || 0
  const score = clampScore(Math.round(42 + matched.length * 11 + base * 0.35 - missing.length * 7))

  let label = 'Needs tailoring'
  if (score >= 85) label = 'Excellent fit'
  else if (score >= 70) label = 'Good fit'
  else if (score >= 55) label = 'Moderate fit'

  return {
    score,
    label,
    matched,
    missing,
    detail: matched.length
      ? `Matched terms: ${matched.join(', ')}`
      : 'No direct overlaps detected yet. Try a more specific role title.'
  }
}

function buildQuickTips(score, data) {
  const missingCount = (data.missing_skills || []).length
  const foundCount = (data.keywords_found || []).length

  if (score >= 85) {
    return [
      'Add one quantified achievement to make the resume feel more credible.',
      'Keep the layout clean and avoid dense paragraphs.',
      'Attach a portfolio or GitHub link to strengthen your application.'
    ]
  }

  if (score >= 75) {
    return [
      `Target the ${Math.max(1, missingCount)} most important missing skills first.`,
      'Use stronger action verbs like built, led, optimized, and shipped.',
      `Add more role keywords from the ${Math.max(1, foundCount)} keywords already detected.`
    ]
  }

  return [
    'Rewrite the summary to match the target role and emphasize strengths.',
    'Add measurable impact for every major project or job entry.',
    'Remove clutter and make the resume easier for ATS to scan.'
  ]
}

function buildChecklist(data) {
  const text = `${data.summary || ''} ${(data.strengths || []).join(' ')} ${(data.keywords_found || []).join(' ')} ${(data.job_titles_suggested || []).join(' ')}`.toLowerCase()
  const urlTerms = ['github', 'linkedin', 'portfolio', 'behance', 'website']
  const contactTerms = ['@', 'contact', 'phone', 'email']
  const metricTerms = ['%', 'impact', 'optimized', 'reduced', 'improved', 'increased', 'decreased', 'delivered']
  const summaryTerms = ['summary', 'profile', 'objective']
  const verbTerms = ['built', 'led', 'created', 'designed', 'implemented', 'developed', 'shipped']

  return [
    { key: 'contact', label: 'Contact information is visible', checked: contactTerms.some((term) => text.includes(term)) },
    { key: 'summary', label: 'Resume has a concise professional summary', checked: summaryTerms.some((term) => text.includes(term)) },
    { key: 'actionVerbs', label: 'Uses strong action verbs', checked: verbTerms.some((term) => text.includes(term)) },
    { key: 'metrics', label: 'Includes measurable metrics and outcomes', checked: metricTerms.some((term) => text.includes(term)) },
    { key: 'links', label: 'Includes portfolio / GitHub / LinkedIn links', checked: urlTerms.some((term) => text.includes(term)) },
    { key: 'pdf', label: 'Saved as a clean PDF without formatting issues', checked: true }
  ]
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return 'Today'
  }
}

export default function Results({ data, jobRole, onAnalyzeAnother }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState(() => getHistory())
  const [checklistState, setChecklistState] = useState(() => buildChecklist(data))

  useEffect(() => {
    setChecklistState(buildChecklist(data))
  }, [data])

  useEffect(() => {
    const target = Number(data?.ats_score || 0)
    let frame
    const start = performance.now()
    const duration = 900

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const current = Math.round(target * progress)
      setAnimatedScore(current)
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    setAnimatedScore(0)
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [data?.ats_score])

  useEffect(() => {
    const nextHistory = [...getHistory()]
    const current = normalizeHistoryEntry({ ...data, jobRole })
    const last = nextHistory[0]
    const same = last && last.ats_score === current.ats_score && last.summary === current.summary && last.jobRole === current.jobRole
    if (!same) {
      persistHistory(current)
      setHistory(getHistory())
    }
  }, [data, jobRole])

  const score = Number(data?.ats_score || 0)
  const scoreTone = useMemo(() => sectionColor(score), [score])
  const scoreBand = useMemo(() => {
    if (score >= 85) return 'Strong'
    if (score >= 75) return 'Promising'
    return 'Needs refinement'
  }, [score])

  const breakdown = useMemo(() => {
    const raw = data?.score_breakdown || {}
    const categories = [
      { key: 'keywords', label: 'Keywords' },
      { key: 'formatting', label: 'Formatting' },
      { key: 'experience', label: 'Experience' },
      { key: 'education', label: 'Education' },
      { key: 'skills', label: 'Skills' }
    ]
    return categories.map((entry) => ({
      ...entry,
      value: Number(raw[entry.key] || 0)
    }))
  }, [data])

  const cloudKeywords = useMemo(() => {
    const found = (data?.keywords_found || []).map((item) => ({ text: item, tone: 'green', weight: 4 }))
    const missing = (data?.keywords_missing || data?.missing_skills || []).map((item) => ({ text: item, tone: 'red', weight: 3 }))
    return [...found, ...missing].sort((a, b) => b.weight - a.weight)
  }, [data])

  const suggestions = useMemo(() => data?.job_titles_suggested || [], [data])
  const improvements = useMemo(() => {
    const items = Array.isArray(data?.improvements) ? data.improvements : []
    return [...items].sort((a, b) => priorityOrder(b.priority) - priorityOrder(a.priority))
  }, [data])

  const roleMatch = useMemo(() => buildRoleMatch(jobRole, data || {}), [jobRole, data])
  const quickTips = useMemo(() => buildQuickTips(score, data || {}), [score, data])

  const handleShareResults = async () => {
    const summary = [
      `ATS Score: ${score}/100`,
      `Role: ${jobRole || 'Not set'}`,
      `Summary: ${data?.summary || 'No summary available.'}`
    ].join('\n')

    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  const generatePdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 44
    const width = pageWidth - margin * 2
    let y = 52

    doc.setFillColor(8, 15, 32)
    doc.rect(0, 0, pageWidth, 74, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('Smart Resume Analyzer Report', margin, 42)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated ${new Date().toLocaleString()}`, margin, 60)

    doc.setTextColor('#0f172a')
    y = 108
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    y = wrapForPdf(doc, `ATS Score: ${score}/100 (${scoreBand})`, margin, y, width, 18, '#0f172a') + 4
    y = wrapForPdf(doc, `Role Match: ${roleMatch.score === null ? 'Not evaluated' : `${roleMatch.score}/100`} ${jobRole ? `for ${jobRole}` : ''}`, margin, y, width, 16, '#0f172a') + 8

    y = addSection(doc, 'Score Breakdown', breakdown.map((entry) => `${entry.label}: ${entry.value}`), margin, y, width)
    y = addSection(doc, 'Missing Skills', (data?.missing_skills || []).map((item) => item), margin, y, width)
    y = addSection(doc, 'Strengths', data?.strengths || [], margin, y, width)
    y = addSection(doc, 'Improvements', improvements.map((item) => `${item.priority || 'Medium'} - ${item.text || item}`), margin, y, width)
    y = addSection(doc, 'Keywords Found', data?.keywords_found || [], margin, y, width)
    y = addSection(doc, 'Keywords Missing', data?.keywords_missing || [], margin, y, width)
    y = addSection(doc, 'Suggested Job Titles', suggestions, margin, y, width)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    y = wrapForPdf(doc, 'Summary', margin, y + 8, width, 16, '#0f172a')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    y = wrapForPdf(doc, data?.summary || 'No summary available.', margin, y + 2, width, 15, '#334155')

    doc.save(`resume-analysis-${Date.now()}.pdf`)
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
      <div className="border-b border-white/10 px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Analysis complete</p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Your resume dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Review your ATS score, keyword coverage, role fit, strengths, prioritized actions, and history before exporting a report.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleShareResults}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              {copied ? 'Copied Summary' : 'Share Results'}
            </button>
            <button
              type="button"
              onClick={generatePdf}
              className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-400/15"
            >
              Download Report
            </button>
            <button
              type="button"
              onClick={onAnalyzeAnother}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Analyze Another Resume
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 sm:px-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="card-hover animate-fade-up rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-950 to-slate-900 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20" style={staggerStyle(0)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">ATS Score</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">Overall readiness</h3>
                </div>
                <span
                  className="rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{ borderColor: `${scoreTone}33`, color: scoreTone, backgroundColor: `${scoreTone}12` }}
                >
                  {scoreBand}
                </span>
              </div>

              <div className="relative mx-auto mt-5 h-[270px] max-w-[270px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    data={[{ name: 'ATS', value: animatedScore, fill: scoreTone }]}
                    innerRadius="72%"
                    outerRadius="100%"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                      dataKey="value"
                      cornerRadius={999}
                      background={{ fill: 'rgba(255,255,255,0.08)' }}
                      clockWise
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-5xl font-black tracking-tight text-white">{animatedScore}</span>
                  <span className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-400">ATS Score</span>
                </div>
              </div>
            </div>

            <div className="card-hover animate-fade-up rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20" style={staggerStyle(1)}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Job role matcher</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{jobRole || 'Type a role above'}</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Live fit signal
                </span>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
                {roleMatch.score === null ? (
                  <div className="space-y-3 text-sm text-slate-300">
                    <p>Enter a job title in the upload card to see how this resume aligns with that role.</p>
                    <p className="text-xs text-slate-500">The score uses your requested role along with the extracted keywords, strengths, and title suggestions.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-4xl font-black text-white">{roleMatch.score}</p>
                        <p className="mt-1 text-sm text-slate-300">{roleMatch.label}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right text-xs text-slate-300">
                        <div className="text-slate-500">Matched terms</div>
                        <div className="mt-1 text-white">{roleMatch.matched.length || 0}</div>
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-300" style={{ width: `${roleMatch.score}%` }} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{roleMatch.detail}</p>
                    {roleMatch.missing.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {roleMatch.missing.map((term) => (
                          <BadgePill key={term} text={`Missing: ${term}`} tone="red" />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Experience</p>
                  <p className="mt-2 text-2xl font-bold text-white">{data?.experience_years ?? 0} yrs</p>
                  <p className="mt-1 text-sm text-slate-300">Estimated resume experience signal</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Suggested roles</p>
                  <p className="mt-2 text-2xl font-bold text-white">{suggestions.length}</p>
                  <p className="mt-1 text-sm text-slate-300">Potential job titles to pursue next</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-hover animate-fade-up rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20" style={staggerStyle(2)}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Score breakdown</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Category-level scoring</h3>
              </div>
              <span className="text-sm text-slate-400">Keywords, formatting, experience, education, skills</span>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '16px',
                      color: '#fff'
                    }}
                    cursor={{ fill: 'rgba(16,185,129,0.08)' }}
                  />
                  <Bar dataKey="value" radius={[14, 14, 0, 0]}>
                    {breakdown.map((entry, index) => (
                      <Cell key={`cell-${entry.key}`} fill={index % 2 === 0 ? '#10b981' : '#34d399'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-hover animate-fade-up rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20" style={staggerStyle(3)}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Keyword cloud</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Found vs missing keywords</h3>
              </div>
              <span className="text-sm text-slate-400">Visual coverage map</span>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
              <div className="flex flex-wrap items-center gap-3">
                {cloudKeywords.map((keyword) => (
                  <span
                    key={keyword.text}
                    className={`rounded-full border px-3 py-1.5 font-medium transition-transform hover:-translate-y-0.5 ${
                      keyword.tone === 'green'
                        ? 'border-emerald-400/20 bg-emerald-500/12 text-emerald-100'
                        : 'border-red-400/20 bg-red-500/12 text-red-100'
                    }`}
                    style={{
                      fontSize: `${Math.min(22, 13 + keyword.weight * 1.8)}px`
                    }}
                  >
                    {keyword.text}
                  </span>
                ))}
                {!cloudKeywords.length && <p className="text-sm text-slate-400">No keyword data was returned.</p>}
              </div>
            </div>
          </div>

          <div className="card-hover animate-fade-up rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20" style={staggerStyle(4)}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Resume score history</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Last 3 analyses</h3>
              </div>
              <HistoryIcon />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {history.length ? (
                history.map((item, index) => {
                  const delta = index === 0 || !history[index + 1] ? 0 : item.ats_score - history[index + 1].ats_score
                  return (
                    <div key={`${item.createdAt}-${index}`} className="rounded-[1.25rem] border border-white/10 bg-slate-950/55 p-4">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
                        <span>{formatDate(item.createdAt)}</span>
                        <span>{item.jobRole || 'Resume'}</span>
                      </div>
                      <p className="mt-3 text-3xl font-black text-white">{item.ats_score}</p>
                      <p className={`mt-2 text-sm font-medium ${delta >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                        {delta === 0 ? 'Latest snapshot' : `${delta > 0 ? '+' : ''}${delta} vs previous`}
                      </p>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-slate-400">History will appear here after you analyze a few resumes.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-hover animate-fade-up rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20" style={staggerStyle(5)}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Summary</p>
                <h3 className="mt-1 text-xl font-semibold text-white">What the AI thinks</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300">
                <RoleAvatar />
              </div>
            </div>
            <p className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-5 text-sm leading-7 text-slate-300">
              {data?.summary || 'No summary returned.'}
            </p>
          </div>

          <div className="card-hover animate-fade-up rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20" style={staggerStyle(6)}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Missing skills</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Priority gaps</h3>
              </div>
              <AlertTriangle />
            </div>
            <div className="flex flex-wrap gap-2">
              {(data?.missing_skills || []).length ? (
                data.missing_skills.map((skill) => (
                  <BadgePill key={skill} text={skill} tone="red" size="lg" icon={<XIcon />} />
                ))
              ) : (
                <p className="text-sm text-slate-400">No missing skills returned.</p>
              )}
            </div>
          </div>

          <div className="card-hover animate-fade-up rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20" style={staggerStyle(7)}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Strengths</p>
                <h3 className="mt-1 text-xl font-semibold text-white">What is working well</h3>
              </div>
              <ShieldCheck />
            </div>
            <div className="flex flex-wrap gap-2">
              {(data?.strengths || []).length ? (
                data.strengths.map((strength) => (
                  <BadgePill key={strength} text={strength} tone="green" size="lg" icon={<CheckIcon />} />
                ))
              ) : (
                <p className="text-sm text-slate-400">No strengths returned.</p>
              )}
            </div>
          </div>

          <div className="card-hover animate-fade-up rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20" style={staggerStyle(8)}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Improvements</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Prioritized actions</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">3 levels</span>
            </div>
            <div className="space-y-3">
              {improvements.length ? (
                improvements.map((item, index) => (
                  <div
                    key={`${item.text}-${index}`}
                    className={`rounded-[1.25rem] border p-4 transition hover:-translate-y-0.5 ${priorityStyles[item.priority] || priorityStyles.Medium}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current/20 bg-white/10 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">{item.text || item}</p>
                          <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-white/90">
                            {item.priority || 'Medium'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No improvements returned.</p>
              )}
            </div>
          </div>

          <div className="card-hover animate-fade-up rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20" style={staggerStyle(9)}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Suggested job titles</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Clickable career chips</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Career direction</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.length ? (
                suggestions.map((title) => (
                  <BadgePill key={title} text={title} tone="neutral" size="lg" onClick={() => navigator.clipboard.writeText(title)} />
                ))
              ) : (
                <p className="text-sm text-slate-400">No suggested job titles returned.</p>
              )}
            </div>
          </div>

          <div className="card-hover animate-fade-up rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20" style={staggerStyle(10)}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Quick tips</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Improve your next pass</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Based on score</span>
            </div>
            <div className="space-y-3">
              {quickTips.map((tip, index) => (
                <div key={tip} className="rounded-[1.25rem] border border-white/10 bg-slate-950/55 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/12 text-sm font-semibold text-emerald-300">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-hover rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Resume checklist</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Common mistakes to check</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Self-review</span>
            </div>
            <div className="space-y-3">
              {checklistState.map((item) => (
                <label key={item.key} className="flex cursor-pointer items-start gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/55 p-4 transition hover:border-emerald-400/25">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() =>
                      setChecklistState((current) =>
                        current.map((entry) => (entry.key === item.key ? { ...entry, checked: !entry.checked } : entry))
                      )
                    }
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-emerald-400 focus:ring-emerald-400"
                  />
                  <span className={`text-sm leading-6 ${item.checked ? 'text-slate-200 line-through decoration-emerald-400/50' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="card-hover animate-fade-up rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-emerald-500/12 to-cyan-500/10 p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20" style={staggerStyle(11)}>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-300">Quick verdict</p>
            <h3 className="mt-2 text-2xl font-bold text-white">{roleMatch.label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200/90">
              {score >= 85
                ? 'This resume presents a strong profile for the current market target. Focus on proof, links, and measurable impact.'
                : score >= 75
                  ? 'This resume is close to a polished submission. A few targeted edits can significantly improve its recruiter appeal.'
                  : 'This resume needs tailored adjustments to improve ATS visibility and align with competitive job descriptions.'}
            </p>
          </div>

            <footer className="overflow-hidden rounded-[1.75rem] border border-white/10 border-t-emerald-400/30 bg-slate-950/95 px-6 py-8 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl">
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
        </div>
      </div>
    </div>
  )
}

function wrapForPdf(doc, text, x, y, width, lineHeight, color = '#0f172a') {
  doc.setTextColor(color)
  const lines = doc.splitTextToSize(String(text || ''), width)
  lines.forEach((line) => {
    if (y > 760) {
      doc.addPage()
      y = 48
    }
    doc.text(line, x, y)
    y += lineHeight
  })
  return y
}

function addSection(doc, title, items, x, y, width, color = '#0f172a') {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  y = wrapForPdf(doc, title, x, y, width, 16, color)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  items.forEach((item) => {
    const content = typeof item === 'string' ? item : item.text || ''
    y = wrapForPdf(doc, `• ${content}`, x + 4, y + 4, width - 10, 14, '#334155')
  })
  return y + 4
}
