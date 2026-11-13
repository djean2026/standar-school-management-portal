import { useState, type FormEvent } from 'react'
import { api, type AttendanceReportRow } from '../lib/api'

export function RapportsPage() {
  const [from, setFrom] = useState('2025-09-01')
  const [to, setTo] = useState('2025-12-31')
  const [rows, setRows] = useState<AttendanceReportRow[]>([])

  async function load(e: FormEvent) {
    e.preventDefault()
    const data = await api<AttendanceReportRow[]>(
      `/api/v1/reports/attendance?from=${from}&to=${to}`,
    )
    setRows(data)
  }

  function exportCsv() {
    const header = 'date,seance,eleve,section,statut\n'
    const body = rows
      .map((r) => `${r.date},${r.session},"${r.studentName}",${r.sectionName},${r.status}`)
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `presences_${from}_${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Rapports</h1>
      <p className="text-slate-600 text-sm mt-1">Export des présences sur une période.</p>

      <form onSubmit={load} className="mt-6 flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          Du
          <input type="date" className="block mt-1 border rounded-lg px-3 py-2" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="text-sm">
          Au
          <input type="date" className="block mt-1 border rounded-lg px-3 py-2" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <button type="submit" className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm h-[42px]">Générer</button>
        {rows.length > 0 && (
          <button type="button" onClick={exportCsv} className="rounded-lg bg-slate-800 text-white px-4 py-2 text-sm h-[42px]">
            Exporter CSV
          </button>
        )}
      </form>

      <div className="mt-6 rounded-xl bg-white border shadow-sm overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b bg-slate-50">
              <th className="p-3">Date</th>
              <th>Séance</th>
              <th>Élève</th>
              <th>Section</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="p-3">{r.date}</td>
                <td>{r.session}</td>
                <td>{r.studentName}</td>
                <td>{r.sectionName}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-4 text-slate-500 text-sm">Aucune donnée pour cette période.</p>}
      </div>
    </div>
  )
}
