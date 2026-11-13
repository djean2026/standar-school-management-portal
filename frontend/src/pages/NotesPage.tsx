import { useEffect, useState, type FormEvent } from 'react'
import { api, type AcademicConfig, type Assessment, type Student } from '../lib/api'

const DEMO_TERM = '33333333-3333-3333-3333-333333333331'
const DEMO_SECTION = '66666666-6666-6666-6666-666666666661'
const DEMO_SUBJECT = '55555555-5555-5555-5555-555555555551'

export function NotesPage() {
  const [config, setConfig] = useState<AcademicConfig | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [title, setTitle] = useState('Contrôle 1 — Français')
  const [maxScore, setMaxScore] = useState('20')
  const [selectedAssessment, setSelectedAssessment] = useState('')
  const [scores, setScores] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)

  async function refresh() {
    const [c, a, s] = await Promise.all([
      api<AcademicConfig>('/api/v1/academic/config'),
      api<Assessment[]>(`/api/v1/assessments?sectionId=${DEMO_SECTION}`),
      api<Student[]>(`/api/v1/students?sectionId=${DEMO_SECTION}`),
    ])
    setConfig(c)
    setAssessments(a)
    setStudents(s)
    if (!selectedAssessment && a[0]) setSelectedAssessment(a[0].id)
  }

  useEffect(() => {
    refresh().catch(console.error)
  }, [])

  async function createAssessment(e: FormEvent) {
    e.preventDefault()
    await api('/api/v1/assessments', {
      method: 'POST',
      body: JSON.stringify({
        sectionId: DEMO_SECTION,
        subjectId: DEMO_SUBJECT,
        termId: DEMO_TERM,
        title,
        maxScore: Number(maxScore),
      }),
    })
    await refresh()
  }

  async function saveGrades(e: FormEvent) {
    e.preventDefault()
    if (!selectedAssessment) return
    await api('/api/v1/grades/batches', {
      method: 'POST',
      body: JSON.stringify({
        assessmentId: selectedAssessment,
        entries: students.map((s) => ({
          studentId: s.id,
          score: scores[s.id] ? Number(scores[s.id]) : null,
        })),
      }),
    })
    setMessage('Notes enregistrées (brouillon).')
  }

  async function publish() {
    if (!selectedAssessment) return
    await api(`/api/v1/assessments/${selectedAssessment}/publish`, { method: 'POST' })
    setMessage('Résultats publiés.')
    await refresh()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Notes et évaluations</h1>
      <p className="text-slate-600 text-sm mt-1">Créer une évaluation, saisir les notes et publier.</p>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <form onSubmit={createAssessment} className="rounded-xl bg-white p-5 border shadow-sm space-y-3">
          <h2 className="font-semibold">Nouvelle évaluation</h2>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="w-full border rounded-lg px-3 py-2 text-sm" type="number" step="0.5" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
          <p className="text-xs text-slate-500">Section démo : {config?.sections.find((s) => s.id === DEMO_SECTION)?.name ?? '1A'}</p>
          <button type="submit" className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm">Créer</button>
        </form>

        <div className="rounded-xl bg-white p-5 border shadow-sm space-y-3">
          <h2 className="font-semibold">Évaluations existantes</h2>
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)}>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>{a.title} ({a.publicationState})</option>
            ))}
          </select>
          <button type="button" onClick={publish} className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm">Publier les résultats</button>
        </div>
      </div>

      <form onSubmit={saveGrades} className="mt-6 rounded-xl bg-white p-5 border shadow-sm">
        <h2 className="font-semibold mb-3">Saisie des notes</h2>
        <div className="space-y-2">
          {students.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm gap-4">
              <span>{s.lastName}, {s.firstName}</span>
              <input
                className="border rounded-lg px-2 py-1 w-24"
                type="number"
                step="0.5"
                placeholder="—"
                value={scores[s.id] ?? ''}
                onChange={(e) => setScores((prev) => ({ ...prev, [s.id]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <button type="submit" className="mt-4 rounded-lg bg-sky-600 text-white px-4 py-2 text-sm">Enregistrer</button>
        {message && <p className="text-sm text-green-700 mt-2">{message}</p>}
      </form>
    </div>
  )
}
