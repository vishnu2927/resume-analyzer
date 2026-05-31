import React, { useState } from 'react'
import axios from 'axios'
import Upload from './components/Upload'
import Results from './components/Results'

export default function App(){
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFile = async (file) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try{
      const form = new FormData()
      form.append('file', file, file.name)
      const resp = await axios.post('/api/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 })
      setResult(resp.data)
    }catch(err){
      setError(err?.response?.data?.error || err.message || 'Upload failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="py-6">
          <h1 className="text-3xl font-bold">Smart Resume Analyzer</h1>
          <p className="text-gray-600 mt-1">Upload a PDF resume to get ATS score, missing skills, strengths and improvements.</p>
        </header>

        <Upload onFile={handleFile} loading={loading} />

        {loading && (
          <div className="mt-6 flex items-center justify-center">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16" />
          </div>
        )}

        {error && (
          <div className="mt-6 text-red-600">{error}</div>
        )}

        {result && <Results data={result} />}
      </div>
    </div>
  )
}
