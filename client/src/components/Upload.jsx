import React, { useMemo, useRef, useState } from 'react'

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </svg>
  )
}

export default function Upload({
  file,
  setFile,
  jobRole,
  setJobRole,
  onAnalyze,
  loading,
  uploadProgress,
  error
}) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  const canAnalyze = useMemo(() => Boolean(file && !loading), [file, loading])

  const validateAndSet = (selectedFile) => {
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf') {
      return
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      return
    }
    setFile(selectedFile)
    setDragActive(false)
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragActive(false)
    validateAndSet(event.dataTransfer.files?.[0])
  }

  const openPicker = () => inputRef.current?.click()

  const loadingBadge = loading ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-100">
      <span className="spinner-ring inline-block h-3.5 w-3.5" />
      {uploadProgress}%
    </span>
  ) : null

  return (
    <div className="glass-card card-hover overflow-hidden rounded-[2rem] border border-white/10 p-6 shadow-2xl shadow-emerald-950/15 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/90">Resume upload</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Upload your PDF and let the analysis run.</h2>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          ATS + role-fit analysis, keyword cloud, PDF report export
        </div>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`relative rounded-[1.75rem] border-2 border-dashed p-6 transition-all duration-300 sm:p-8 ${
          dragActive ? 'border-emerald-300 bg-emerald-400/12 shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_0_50px_rgba(16,185,129,0.18)]' : 'border-white/15 bg-white/[0.03]'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_35%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
              <UploadIcon />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Drag and drop your resume PDF here</h3>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                The AI service extracts text from the PDF, scores it across ATS dimensions, suggests missing skills,
                and prepares a downloadable report.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">PDF only</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Secure upload</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Animated progress</span>
              </div>
            </div>
          </div>

          <div className="min-w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:min-w-[320px]">
            <label className="mb-2 block text-sm font-medium text-slate-200">Target job role</label>
            <input
              value={jobRole}
              onChange={(event) => setJobRole(event.target.value)}
              placeholder="e.g. Full Stack Developer"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:bg-white/10"
            />
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Optional, but it improves the role matcher and suggested title output.
            </p>
          </div>
        </div>

        <div className="relative mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div className="group flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4 transition hover:border-emerald-400/40 hover:bg-slate-950/70">
            <span className="text-sm font-medium text-slate-200">Choose resume PDF</span>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              onChange={(event) => validateAndSet(event.target.files?.[0])}
              className="hidden"
            />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-300">{file ? file.name : 'No file selected yet'}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {file ? `${Math.max(1, Math.round(file.size / 1024))} KB selected` : 'Supported format: PDF only'}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {file ? 'Ready' : 'Browse'}
              </span>
            </div>
            <button
              type="button"
              onClick={openPicker}
              className="self-start rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Pick PDF
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              disabled={!canAnalyze}
              onClick={onAnalyze}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:from-emerald-300 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Analyzing Resume...' : 'Analyze Resume'}
            </button>
            <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              {loading ? (
                <>
                  <span className="spinner-ring inline-block h-3.5 w-3.5" />
                  <span>Parsing, scoring, and generating insights...</span>
                </>
              ) : (
                <span>Start the analysis when your resume is ready.</span>
              )}
            </div>
            <div className="flex justify-center">{loadingBadge}</div>
          </div>
        </div>

        <div className="relative mt-6">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Upload progress</span>
            <span>{loading || uploadProgress > 0 ? `${uploadProgress}%` : '0%'}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className={`progress-bar h-full rounded-full ${loading ? 'animate-pulse' : ''}`}
              style={{ width: `${loading || uploadProgress > 0 ? uploadProgress : 0}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="relative mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-inner shadow-red-950/20">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
