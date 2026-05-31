import React, { useRef } from 'react'

export default function Upload({ onFile, loading }){
  const ref = useRef()

  const handleChange = (e) => {
    const f = e.target.files[0]
    if (f && f.type === 'application/pdf') onFile(f)
    else alert('Please upload a PDF file')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type === 'application/pdf') onFile(f)
    else alert('Please drop a PDF file')
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e)=>e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded p-6 bg-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-medium">Drag & drop your resume (PDF)</p>
            <p className="text-sm text-gray-500">Or click to select a file</p>
          </div>
          <div>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded"
              onClick={()=>ref.current.click()}
              disabled={loading}
            >
              Choose File
            </button>
          </div>
        </div>
        <input ref={ref} type="file" accept="application/pdf" onChange={handleChange} className="hidden" />
      </div>
    </div>
  )
}
