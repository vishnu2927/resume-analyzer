import React from 'react'
import { RadialBarChart, RadialBar, Legend } from 'recharts'

function Badges({ items, color }){
  return (
    <div className="flex flex-wrap gap-2">
      {items && items.length ? items.map((s,i)=> (
        <span key={i} className={`px-3 py-1 rounded-full text-sm text-white`} style={{background: color}}>{s}</span>
      )) : <span className="text-gray-500">None</span>}
    </div>
  )
}

export default function Results({ data }){
  const ats = Number(data.ats_score) || Number(data.ats) || 0
  const missing = data.missing_skills || []
  const strengths = data.strengths || []
  const improvements = data.improvements || []
  const summary = data.summary || data.overview || data.raw || ''

  const chartData = [{ name: 'ATS', value: Math.min(Math.max(ats,0),100), fill: '#4f46e5' }]

  return (
    <div className="mt-6 bg-white p-6 rounded shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 flex flex-col items-center justify-center">
          <RadialBarChart width={180} height={180} cx={90} cy={90} innerRadius={20} outerRadius={80} barSize={15} data={chartData} startAngle={90} endAngle={-270}>
            <RadialBar minAngle={15} background clockWise={true} dataKey="value" />
            <Legend verticalAlign="bottom" height={36} />
          </RadialBarChart>
          <div className="mt-2 text-center">
            <div className="text-2xl font-bold">{chartData[0].value}</div>
            <div className="text-sm text-gray-500">ATS Score</div>
          </div>
        </div>

        <div className="col-span-2">
          <h3 className="text-lg font-semibold">Missing Skills</h3>
          <Badges items={missing} color="#dc2626" />

          <h3 className="text-lg font-semibold mt-4">Strengths</h3>
          <Badges items={strengths} color="#16a34a" />

          <h3 className="text-lg font-semibold mt-4">Improvements</h3>
          <ol className="list-decimal ml-6 mt-2">
            {improvements && improvements.length ? improvements.map((it,i)=> <li key={i} className="mb-1">{it}</li>) : <li className="text-gray-500">No improvements suggested.</li>}
          </ol>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Summary</h3>
        <p className="text-gray-700 mt-2">{summary}</p>
      </div>
    </div>
  )
}
