import { useEffect, useState, type FormEvent } from 'react'
import { api, type AcademicConfig, type Student } from '../lib/api'

interface EnrollmentRow {
  enrollmentId: string
  label: string
}

interface EnrollmentDto {
  id: string
  studentId: string
}

export function PresencePage() {
  const [config, setConfig] = useState<AcademicConfig | null>(null)
  const [sectionId, setSectionId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([])

  useEffect(() => {
    api<AcademicConfig>('/api/v1/academic/config').then((c) => {
      setConfig(c)
      if (c.sections[0]) setSectionId(c.sections[0].id)
    })
  }, [])

  useEffect(() => {
    if (!sectionId) return
    Promise.all([
      api<Student[]>(`/api/v1/students?sectionId=${sectionId}`),
      api<EnrollmentDto[]>(`/api/v1/enrollments?sectionId=${sectionId}`),
    ]).then(([studentList, enrollmentList]) => {
      const byStudent = new Map(studentList.map((s) => [s.id, s]))
      const rows = enrollmentList
        .map((e) => {
          const s = byStudent.get(e.studentId)
          if (!s) return null
          return {
            enrollmentId: e.id,
            label: `${s.lastName}, ${s.firstName}`,
          }
        })
        .filter(Boolean) as EnrollmentRow[]
      setEnrollments(rows)
      const initial: Record<string, string> = {}
      rows.forEach((r) => {
        initial[r.enrollmentId] = 'PRESENT'
      })
      setStatuses(initial)
    })
  }, [sectionId])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    const entries = enrollments.map((row) => ({
      enrollmentId: row.enrollmentId,
      status: statuses[row.enrollmentId] ?? 'PRESENT',
    }))
    await api('/api/v1/attendance/batches', {
      method: 'POST',
      body: JSON.stringify({ date, session: 'AM', entries }),
    })
    setMessage('Présences enregistrées.')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Présences</h1>
      <p className="text-slate-600 text-sm mt-1">Saisie groupée par section et séance.</p>

      <form onSubmit={submit} className="mt-6 rounded-xl bg-white p-5 border shadow-sm space-y-4 max-w-xl">
        <label className="block text-sm">
          Section
          <select className="mt-1 w-full border rounded-lg px-3 py-2" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
            {config?.sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Date
          <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <div className="space-y-2">
          {enrollments.map((row) => (
            <div key={row.enrollmentId} className="flex items-center justify-between gap-3 text-sm">
              <span>{row.label}</span>
              <select
                className="border rounded-lg px-2 py-1"
                value={statuses[row.enrollmentId] ?? 'PRESENT'}
                onChange={(e) => setStatuses((prev) => ({ ...prev, [row.enrollmentId]: e.target.value }))}
              >
                <option value="PRESENT">Présent</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Retard</option>
                <option value="EXCUSED">Excusé</option>
              </select>
            </div>
          ))}
        </div>
        <button type="submit" className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm">Enregistrer la séance</button>
        {message && <p className="text-sm text-green-700">{message}</p>}
      </form>
    </div>
  )
}
