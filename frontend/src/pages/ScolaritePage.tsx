import { useEffect, useState, type FormEvent } from 'react'
import { api, type AcademicConfig, type ImportJob, type Student } from '../lib/api'

export function ScolaritePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [config, setConfig] = useState<AcademicConfig | null>(null)
  const [studentNumber, setStudentNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [enrollStudentId, setEnrollStudentId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [csv, setCsv] = useState('numero,prenom,nom\nELV-010,Aïcha,Diallo')
  const [importResult, setImportResult] = useState<ImportJob | null>(null)

  async function refresh() {
    const [s, c] = await Promise.all([
      api<Student[]>('/api/v1/students'),
      api<AcademicConfig>('/api/v1/academic/config'),
    ])
    setStudents(s)
    setConfig(c)
    if (!sectionId && c.sections[0]) setSectionId(c.sections[0].id)
  }

  useEffect(() => {
    refresh().catch(console.error)
  }, [])

  async function addStudent(e: FormEvent) {
    e.preventDefault()
    await api('/api/v1/students', {
      method: 'POST',
      body: JSON.stringify({ studentNumber, firstName, lastName }),
    })
    setStudentNumber('')
    setFirstName('')
    setLastName('')
    await refresh()
  }

  async function enroll(e: FormEvent) {
    e.preventDefault()
    await api('/api/v1/enrollments', {
      method: 'POST',
      body: JSON.stringify({
        studentId: enrollStudentId,
        sectionId,
        startDate: new Date().toISOString().slice(0, 10),
      }),
    })
    await refresh()
  }

  async function runImport(e: FormEvent) {
    e.preventDefault()
    const job = await api<ImportJob>('/api/v1/import-jobs', {
      method: 'POST',
      body: JSON.stringify({ csvContent: csv }),
    })
    setImportResult(job)
    await refresh()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Scolarité</h1>
      <p className="text-slate-600 text-sm mt-1">Élèves, inscriptions et import CSV.</p>

      <div className="mt-6 grid xl:grid-cols-2 gap-6">
        <form onSubmit={addStudent} className="rounded-xl bg-white p-5 border shadow-sm space-y-3">
          <h2 className="font-semibold">Nouvel élève</h2>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Numéro" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} required />
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          <button type="submit" className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm">Enregistrer</button>
        </form>

        <form onSubmit={enroll} className="rounded-xl bg-white p-5 border shadow-sm space-y-3">
          <h2 className="font-semibold">Inscription à une section</h2>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={enrollStudentId} onChange={(e) => setEnrollStudentId(e.target.value)} required>
            <option value="">Choisir un élève</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.lastName}, {s.firstName} ({s.studentNumber})</option>
            ))}
          </select>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={sectionId} onChange={(e) => setSectionId(e.target.value)} required>
            {config?.sections.map((sec) => (
              <option key={sec.id} value={sec.id}>Section {sec.name}</option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm">Inscrire</button>
        </form>
      </div>

      <form onSubmit={runImport} className="mt-6 rounded-xl bg-white p-5 border shadow-sm space-y-3">
        <h2 className="font-semibold">Import CSV élèves</h2>
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm font-mono h-28" value={csv} onChange={(e) => setCsv(e.target.value)} />
        <button type="submit" className="rounded-lg bg-slate-800 text-white px-4 py-2 text-sm">Lancer l&apos;import</button>
        {importResult && (
          <p className="text-sm text-slate-600">
            {importResult.status} — {importResult.successRows}/{importResult.totalRows} lignes OK
            {importResult.errorsJson && <span className="block text-red-600 whitespace-pre-wrap">{importResult.errorsJson}</span>}
          </p>
        )}
      </form>

      <div className="mt-6 rounded-xl bg-white p-5 border shadow-sm">
        <h2 className="font-semibold mb-3">Liste des élèves</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">Numéro</th>
              <th>Nom</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="py-2">{s.studentNumber}</td>
                <td>{s.lastName}, {s.firstName}</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
