import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { BookIcon, GraduationCapIcon, PackageIcon, PinIcon, StarIcon, CalendarIcon, CheckCircleIcon, FileTextIcon, ArrowUpCircleIcon, ClockIcon, XCircleIcon, EyeIcon, FileIcon } from '../../assets/icons/Icons'

const STATUS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  pending: {
    bg: 'rgba(234,179,8,0.10)',
    text: '#eab308',
    border: 'rgba(234,179,8,0.18)',
  },
  approved: {
    bg: 'rgba(34,197,94,0.10)',
    text: '#22c55e',
    border: 'rgba(34,197,94,0.18)',
  },
  rejected: {
    bg: 'rgba(239,68,68,0.10)',
    text: '#ef4444',
    border: 'rgba(239,68,68,0.18)',
  },
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Needs correction',
}

export default function TeacherAssignments() {
  const { c, theme } = useTheme()

  const [assignments, setAssignments] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [studentRows, setStudentRows] = useState<any[]>([])
  const [reviewTarget, setReviewTarget] = useState<any>(null)
  const [reviewForm, setReviewForm] = useState({
    status: 'approved',
    grade: '',
    feedback: '',
  })

  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<any>(null)

  const [form, setForm] = useState({
    title: '',
    instructions: '',
    description: '',
    points: '10',
    due_date: '',
    topic: '',
  })

  const [editForm, setEditForm] = useState({
    title: '',
    instructions: '',
    description: '',
    points: '10',
    due_date: '',
    topic: '',
  })

  const [taskFile, setTaskFile] = useState<File | null>(null)
  const [editTaskFile, setEditTaskFile] = useState<File | null>(null)
  const taskFileRef = useRef<HTMLInputElement>(null)
  const editTaskFileRef = useRef<HTMLInputElement>(null)

  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  const load = async () => {
    const r = await api.get('/assignments/assignments/')
    setAssignments(r.data.results ?? r.data)
  }

  useEffect(() => {
    load()
    api.get('/courses/topics/').then((r) => setTopics(r.data.results ?? r.data))
  }, [])

  const openAssignment = async (a: any) => {
    setSelected(a)
    const { data } = await api.get(`/assignments/assignments/${a.id}/students/`)
    setStudentRows(data)
  }

  const createAssignment = async () => {
    setErr('')
    setOk('')

    if (!form.title.trim() || !form.topic) {
      setErr('Title and topic are required.')
      return
    }

    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('instructions', form.instructions)
      fd.append('description', form.description)
      fd.append('points', String(Number(form.points) || 10))
      if (form.due_date) fd.append('due_date', form.due_date)
      fd.append('topic', form.topic)
      if (taskFile) fd.append('task_file', taskFile)

      await api.post('/assignments/assignments/', fd)

      setOk('Assignment created!')
      setForm({
        title: '',
        instructions: '',
        description: '',
        points: '10',
        due_date: '',
        topic: '',
      })
      setTaskFile(null)
      setShowCreate(false)
      load()
      setTimeout(() => setOk(''), 3000)
    } catch (e: any) {
      setErr(JSON.stringify(e.response?.data))
    }
  }

  const openEditAssignment = (a: any) => {
    setEditingAssignment(a)
    setEditForm({
      title: a.title || '',
      instructions: a.instructions || '',
      description: a.description || '',
      points: String(a.points || 10),
      due_date: a.due_date ? new Date(a.due_date).toISOString().slice(0, 16) : '',
      topic: String(a.topic || a.topic_id || ''),
    })
    setEditTaskFile(null)
    setErr('')
    setOk('')
    setShowEdit(true)
  }

  const saveEditedAssignment = async () => {
    if (!editingAssignment) return

    setErr('')
    setOk('')

    if (!editForm.title.trim() || !editForm.topic) {
      setErr('Title and topic are required.')
      return
    }

    try {
      const fd = new FormData()
      fd.append('title', editForm.title)
      fd.append('instructions', editForm.instructions)
      fd.append('description', editForm.description)
      fd.append('points', String(Number(editForm.points) || 10))
      if (editForm.due_date) {
        fd.append('due_date', editForm.due_date)
      } else {
        fd.append('due_date', '')
      }
      fd.append('topic', editForm.topic)
      if (editTaskFile) fd.append('task_file', editTaskFile)

      const { data } = await api.patch(
        `/assignments/assignments/${editingAssignment.id}/`,
        fd
      )

      setAssignments((prev) =>
        prev.map((a) => (a.id === editingAssignment.id ? (data ?? { ...a, ...editForm }) : a))
      )

      if (selected?.id === editingAssignment.id) {
        setSelected((prev: any) => (prev ? { ...prev, ...(data ?? editForm) } : prev))
      }

      setOk('Assignment updated!')
      setShowEdit(false)
      setEditingAssignment(null)
      setEditTaskFile(null)
      load()
      setTimeout(() => setOk(''), 3000)
    } catch (e: any) {
      setErr(JSON.stringify(e.response?.data))
    }
  }

  const deleteAssignment = async (id: number) => {
    if (!confirm('Delete assignment?')) return
    await api.delete(`/assignments/assignments/${id}/`)
    setAssignments((p) => p.filter((a) => a.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const submitReview = async () => {
    if (!reviewTarget || !selected) return
    await api.patch(`/assignments/submissions/${reviewTarget.submission_id}/review/`, reviewForm)
    setReviewTarget(null)
    const { data } = await api.get(`/assignments/assignments/${selected.id}/students/`)
    setStudentRows(data)
  }

  const sf = (k: string) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }))
  const ef = (k: string) => (e: any) => setEditForm((p) => ({ ...p, [k]: e.target.value }))

  const inputStyle = {
    padding: '14px 16px',
    borderRadius: 16,
    border: `1px solid ${c.inputBorder}`,
    background: c.input,
    color: c.text,
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  const primaryBtn = {
    padding: '13px 22px',
    borderRadius: 16,
    background: '#2563eb',
    color: 'white',
    fontWeight: 700,
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 14px 30px -10px rgba(37,99,235,0.65)',
  }

  const softBtn = {
    padding: '12px 18px',
    borderRadius: 14,
    background: c.input,
    color: c.text,
    fontWeight: 600,
    fontSize: 14,
    border: `1px solid ${c.border}`,
    cursor: 'pointer',
  }

  const deleteBtn = {
    padding: '10px 16px',
    borderRadius: 14,
    background: 'rgba(239,68,68,0.10)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.18)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
  }

  const ghostBlueBtn = {
    padding: '10px 16px',
    borderRadius: 14,
    background: 'rgba(37,99,235,0.10)',
    color: '#2563eb',
    border: '1px solid rgba(37,99,235,0.16)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
  }

  const panelStyle = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    padding: '28px',
    borderRadius: 30,
    background: c.card,
    border: `1px solid ${c.border}`,
    boxShadow: '0 22px 50px rgba(0,0,0,0.06)',
  }

  const badge = (text: string, color = c.input, textColor = c.textMuted) => (
    <span
      style={{
        padding: '6px 12px',
        borderRadius: 999,
        background: color,
        color: textColor,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {text}
    </span>
  )

  if (selected) {
    return (
      <div style={{ padding: '4px 2px 20px' }}>
        <motion.button
          whileHover={{ x: -2 }}
          onClick={() => setSelected(null)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 22,
            padding: 0,
          }}
        >
          ← Back to assignments
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...panelStyle,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -70,
              right: -70,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'rgba(37,99,235,0.08)',
              filter: 'blur(24px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 999,
                  background: 'rgba(37,99,235,0.10)',
                  border: '1px solid rgba(37,99,235,0.18)',
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#2563eb',
                    boxShadow: '0 0 12px rgba(37,99,235,0.45)',
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>
                  Assignment Details
                </span>
              </div>

              <h2
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: c.text,
                  margin: '0 0 12px',
                  lineHeight: 1.1,
                }}
              >
                {selected.title}
              </h2>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selected.subject_name && <span style={{ padding: '6px 12px', borderRadius: 999, background: c.input, color: c.textMuted, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><BookIcon size={12} />{selected.subject_name}</span>}
                {selected.grade_name && <span style={{ padding: '6px 12px', borderRadius: 999, background: c.input, color: c.textMuted, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><GraduationCapIcon size={12} />{selected.grade_name}</span>}
                {selected.module_title && <span style={{ padding: '6px 12px', borderRadius: 999, background: c.input, color: c.textMuted, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><PackageIcon size={12} />{selected.module_title}</span>}
                {selected.topic_title && <span style={{ padding: '6px 12px', borderRadius: 999, background: c.input, color: c.textMuted, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><PinIcon size={12} />{selected.topic_title}</span>}
                <span style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(245,158,11,0.10)', color: '#f59e0b', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><StarIcon size={12} />{selected.points} pts</span>
                {selected.due_date && <span style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CalendarIcon size={12} />Due: {new Date(selected.due_date).toLocaleString()}</span>}
                {selected.task_file && (
                  <a
                    href={selected.task_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: 'rgba(34,197,94,0.10)',
                      color: '#22c55e',
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none',
                      border: '1px solid rgba(34,197,94,0.16)',
                    }}
                  >
                    <FileIcon size={13} style={{ marginRight: 4 }} />Task file
                  </a>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => openEditAssignment(selected)} style={softBtn}>
                Edit Assignment
              </button>
              <button onClick={() => deleteAssignment(selected.id)} style={deleteBtn}>
                Delete Assignment
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          style={{
            ...panelStyle,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: c.text,
              marginBottom: 18,
            }}
          >
            Assignment content
          </div>

          {selected.instructions && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.textFaint,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}
              >
                Instructions
              </div>

              <div
                style={{
                  padding: '18px 20px',
                  borderRadius: 20,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  color: c.text,
                  fontSize: 15,
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selected.instructions}
              </div>
            </div>
          )}

          {selected.description && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.textFaint,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}
              >
                Example / Description
              </div>

              <div
                style={{
                  padding: '18px 20px',
                  borderRadius: 20,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  color: c.text,
                  fontSize: 15,
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selected.description}
              </div>
            </div>
          )}

          {!selected.instructions && !selected.description && (
            <div
              style={{
                padding: '22px',
                borderRadius: 20,
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: c.textMuted,
                fontSize: 14,
              }}
            >
              No instructions or example added yet.
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={panelStyle}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              flexWrap: 'wrap',
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: c.text,
                  marginBottom: 4,
                }}
              >
                Student progress
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: c.textMuted,
                }}
              >
                {studentRows.length} students connected to this assignment
              </div>
            </div>

            <div
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(37,99,235,0.08)',
                border: '1px solid rgba(37,99,235,0.16)',
                color: '#2563eb',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Review workspace
            </div>
          </div>

          {studentRows.length === 0 ? (
            <div
              style={{
                padding: '60px 24px',
                textAlign: 'center',
                borderRadius: 24,
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: c.textFaint,
                fontSize: 14,
              }}
            >
              No students in this grade yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {studentRows.map((row, i) => (
                <motion.div
                  key={row.student_id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -2, scale: 1.003 }}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 22,
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: c.text,
                        marginBottom: 8,
                      }}
                    >
                      {row.student_name}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '6px 10px',
                          borderRadius: 999,
                          background: row.viewed ? 'rgba(34,197,94,0.10)' : c.input,
                          color: row.viewed ? '#22c55e' : c.textFaint,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {row.viewed ? <><CheckCircleIcon size={12} color="#22c55e" /> Viewed</> : '— Not viewed'}
                      </span>

                      <span
                        style={{
                          padding: '6px 10px',
                          borderRadius: 999,
                          background: row.submitted ? 'rgba(34,197,94,0.10)' : c.input,
                          color: row.submitted ? '#22c55e' : c.textFaint,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {row.submitted ? <><CheckCircleIcon size={12} color="#22c55e" /> Submitted</> : '— Not submitted'}
                      </span>

                      {row.status ? (
                        <span
                          style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            background: STATUS_COLOR[row.status]?.bg,
                            color: STATUS_COLOR[row.status]?.text,
                            border: `1px solid ${STATUS_COLOR[row.status]?.border}`,
                          }}
                        >
                          {STATUS_LABEL[row.status] ?? row.status}
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            background: c.input,
                            color: c.textFaint,
                          }}
                        >
                          — No status
                        </span>
                      )}

                      <span
                        style={{
                          padding: '6px 10px',
                          borderRadius: 999,
                          background: c.input,
                          color: c.textMuted,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        Grade: {row.grade || '—'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {row.submitted && (
                      <button
                        onClick={() => {
                          setReviewTarget(row)
                          setReviewForm({
                            status: row.status || 'approved',
                            grade: row.grade || '',
                            feedback: row.feedback || '',
                          })
                        }}
                        style={ghostBlueBtn}
                      >
                        Review
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {showEdit && editingAssignment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.56)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 24,
                backdropFilter: 'blur(6px)',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                style={{
                  background: c.card,
                  borderRadius: 30,
                  padding: '30px',
                  width: 700,
                  maxWidth: '95vw',
                  border: `1px solid ${c.border}`,
                  boxShadow: '0 35px 90px rgba(0,0,0,0.22)',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
              >
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: c.text,
                      fontSize: 24,
                      marginBottom: 6,
                    }}
                  >
                    Edit Assignment
                  </div>
                  <div style={{ fontSize: 13, color: c.textMuted }}>
                    Update title, instructions, file, deadline, and points.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Title *
                    </label>
                    <input
                      value={editForm.title}
                      onChange={ef('title')}
                      placeholder="Assignment title"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Topic *
                    </label>
                    <select value={editForm.topic} onChange={ef('topic')} style={inputStyle}>
                      <option value="">Select topic</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Points
                    </label>
                    <input
                      type="number"
                      value={editForm.points}
                      onChange={ef('points')}
                      placeholder="10"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={editForm.due_date}
                      onChange={ef('due_date')}
                      style={{ ...inputStyle, colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Instructions
                    </label>
                    <textarea
                      value={editForm.instructions}
                      onChange={ef('instructions')}
                      rows={4}
                      style={{ ...inputStyle, resize: 'vertical' as const }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={ef('description')}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' as const }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Replace task file (optional)
                    </label>

                    <div
                      onClick={() => editTaskFileRef.current?.click()}
                      style={{
                        padding: '16px 18px',
                        borderRadius: 18,
                        border: `2px dashed ${c.inputBorder}`,
                        cursor: 'pointer',
                        fontSize: 14,
                        color: c.textMuted,
                        background: c.input,
                      }}
                    >
                      {editTaskFile ? <><FileIcon size={13} /> {editTaskFile.name}</> : 'Click to attach a new file'}
                    </div>

                    <input
                      ref={editTaskFileRef}
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => setEditTaskFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <button onClick={saveEditedAssignment} style={primaryBtn}>
                    Save Changes
                  </button>

                  <button
                    onClick={() => {
                      setShowEdit(false)
                      setEditingAssignment(null)
                      setEditTaskFile(null)
                    }}
                    style={softBtn}
                  >
                    Cancel
                  </button>

                  {ok && (
                    <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>
                      {ok}
                    </span>
                  )}

                  {err && <span style={{ fontSize: 13, color: '#ef4444' }}>{err}</span>}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {reviewTarget && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.56)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 24,
                backdropFilter: 'blur(6px)',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                style={{
                  background: c.card,
                  borderRadius: 30,
                  padding: '30px',
                  width: 520,
                  maxWidth: '95vw',
                  border: `1px solid ${c.border}`,
                  boxShadow: '0 35px 90px rgba(0,0,0,0.22)',
                }}
              >
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: c.text,
                      fontSize: 24,
                      marginBottom: 6,
                    }}
                  >
                    Review submission
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: c.textMuted,
                      margin: 0,
                    }}
                  >
                    {reviewTarget.student_name}
                  </p>
                </div>

                {reviewTarget.image && (
                  <div style={{ marginBottom: 16 }}>
                    <a
                      href={reviewTarget.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '10px 16px',
                        borderRadius: 14,
                        background: 'rgba(37,99,235,0.10)',
                        color: '#2563eb',
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: 'none',
                        border: '1px solid rgba(37,99,235,0.16)',
                      }}
                    >
                      <><FileIcon size={13} /> View submitted file</>
                    </a>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Status
                    </label>
                    <select
                      value={reviewForm.status}
                      onChange={(e) =>
                        setReviewForm((p) => ({ ...p, status: e.target.value }))
                      }
                      style={inputStyle}
                    >
                      <option value="approved">Approved</option>
                      <option value="rejected">Needs correction</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Grade
                    </label>
                    <input
                      value={reviewForm.grade}
                      onChange={(e) =>
                        setReviewForm((p) => ({ ...p, grade: e.target.value }))
                      }
                      placeholder="e.g. 95/100 or A+"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Feedback
                    </label>
                    <textarea
                      value={reviewForm.feedback}
                      onChange={(e) =>
                        setReviewForm((p) => ({ ...p, feedback: e.target.value }))
                      }
                      placeholder="Write feedback to student..."
                      rows={4}
                      style={{ ...inputStyle, resize: 'vertical' as const }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
                  <button onClick={submitReview} style={{ ...primaryBtn, flex: 1 }}>
                    Save review
                  </button>
                  <button onClick={() => setReviewTarget(null)} style={softBtn}>
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div style={{ padding: '4px 2px 20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 26 }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 999,
            background: 'rgba(37,99,235,0.10)',
            border: '1px solid rgba(37,99,235,0.22)',
            marginBottom: 14,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#2563eb',
              boxShadow: '0 0 12px rgba(37,99,235,0.45)',
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>
            Teacher Panel
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: c.text,
                margin: '0 0 8px',
                lineHeight: 1.08,
              }}
            >
              Assignments
            </h1>
            <p
              style={{
                fontSize: 15,
                color: c.textMuted,
                margin: 0,
                lineHeight: 1.7,
                maxWidth: 720,
              }}
            >
              Create premium assignment experiences, manage due dates, attach task files,
              and review student submissions in one workspace.
            </p>
          </div>

          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreate((p) => !p)}
            style={primaryBtn}
          >
            {showCreate ? '✕ Close' : '+ New Assignment'}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            style={{
              ...panelStyle,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -70,
                right: -70,
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'rgba(37,99,235,0.08)',
                filter: 'blur(24px)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontWeight: 800,
                    color: c.text,
                    fontSize: 22,
                    marginBottom: 6,
                  }}
                >
                  Create Assignment
                </div>
                <div style={{ fontSize: 13, color: c.textMuted }}>
                  Build a polished task with instructions, file attachments, and deadlines.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Title *
                  </label>
                  <input
                    value={form.title}
                    onChange={sf('title')}
                    placeholder="Assignment title"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Topic *
                  </label>
                  <select value={form.topic} onChange={sf('topic')} style={inputStyle}>
                    <option value="">Select topic</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Points
                  </label>
                  <input
                    type="number"
                    value={form.points}
                    onChange={sf('points')}
                    placeholder="10"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Due Date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={form.due_date}
                    onChange={sf('due_date')}
                    style={{ ...inputStyle, colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Instructions
                  </label>
                  <textarea
                    value={form.instructions}
                    onChange={sf('instructions')}
                    placeholder="What should students do?"
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Description (optional)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={sf('description')}
                    placeholder="Additional context..."
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Task File (optional)
                  </label>

                  <div
                    onClick={() => taskFileRef.current?.click()}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 18,
                      border: `2px dashed ${c.inputBorder}`,
                      cursor: 'pointer',
                      fontSize: 14,
                      color: c.textMuted,
                      background: c.input,
                    }}
                  >
                    {taskFile ? <><FileIcon size={13} /> {taskFile.name}</> : 'Click to attach a file (PDF, Word, etc.)'}
                  </div>

                  <input
                    ref={taskFileRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => setTaskFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <button onClick={createAssignment} style={primaryBtn}>
                  Create Assignment
                </button>

                {ok && (
                  <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>
                    {ok}
                  </span>
                )}

                {err && <span style={{ fontSize: 13, color: '#ef4444' }}>{err}</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {assignments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '68px 24px',
            textAlign: 'center',
            borderRadius: 28,
            background: c.card,
            border: `1px solid ${c.border}`,
            color: c.textFaint,
            boxShadow: '0 18px 40px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}><FileTextIcon size={42} color={c.textFaint} /></div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: c.text,
              marginBottom: 8,
            }}
          >
            No assignments yet
          </div>
          <div style={{ fontSize: 14, color: c.textMuted, lineHeight: 1.7 }}>
            Create your first premium assignment to start tracking student progress.
          </div>
        </motion.div>
      )}

      {assignments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {assignments.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3, scale: 1.004 }}
              style={{
                ...panelStyle,
                padding: '22px 24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 18,
                      background: 'rgba(37,99,235,0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    <FileTextIcon size={16} color="currentColor" />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: c.text,
                        fontSize: 18,
                        marginBottom: 8,
                      }}
                    >
                      {a.title}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {a.grade_name && <span style={{ padding: '6px 12px', borderRadius: 999, background: c.input, color: c.textMuted, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><GraduationCapIcon size={12} />{a.grade_name}</span>}
                      {a.topic_title && <span style={{ padding: '6px 12px', borderRadius: 999, background: c.input, color: c.textMuted, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><PinIcon size={12} />{a.topic_title}</span>}
                      <span style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(245,158,11,0.10)', color: '#f59e0b', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><StarIcon size={12} />{a.points} pts</span>
                      {a.due_date && <span style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CalendarIcon size={12} />{new Date(a.due_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => openAssignment(a)} style={ghostBlueBtn}>
                    View students
                  </button>
                  <button onClick={() => openEditAssignment(a)} style={softBtn}>
                    Edit
                  </button>
                  <button onClick={() => deleteAssignment(a.id)} style={deleteBtn}>
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showEdit && editingAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.56)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 24,
              backdropFilter: 'blur(6px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              style={{
                background: c.card,
                borderRadius: 30,
                padding: '30px',
                width: 700,
                maxWidth: '95vw',
                border: `1px solid ${c.border}`,
                boxShadow: '0 35px 90px rgba(0,0,0,0.22)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontWeight: 800,
                    color: c.text,
                    fontSize: 24,
                    marginBottom: 6,
                  }}
                >
                  Edit Assignment
                </div>
                <div style={{ fontSize: 13, color: c.textMuted }}>
                  Update title, instructions, file, deadline, and points.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Title *
                  </label>
                  <input
                    value={editForm.title}
                    onChange={ef('title')}
                    placeholder="Assignment title"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Topic *
                  </label>
                  <select value={editForm.topic} onChange={ef('topic')} style={inputStyle}>
                    <option value="">Select topic</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Points
                  </label>
                  <input
                    type="number"
                    value={editForm.points}
                    onChange={ef('points')}
                    placeholder="10"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.due_date}
                    onChange={ef('due_date')}
                    style={{ ...inputStyle, colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Instructions
                  </label>
                  <textarea
                    value={editForm.instructions}
                    onChange={ef('instructions')}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={ef('description')}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Replace task file (optional)
                  </label>

                  <div
                    onClick={() => editTaskFileRef.current?.click()}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 18,
                      border: `2px dashed ${c.inputBorder}`,
                      cursor: 'pointer',
                      fontSize: 14,
                      color: c.textMuted,
                      background: c.input,
                    }}
                  >
                    {editTaskFile ? <><FileIcon size={13} /> {editTaskFile.name}</> : 'Click to attach a new file'}
                  </div>

                  <input
                    ref={editTaskFileRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => setEditTaskFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <button onClick={saveEditedAssignment} style={primaryBtn}>
                  Save Changes
                </button>

                <button
                  onClick={() => {
                    setShowEdit(false)
                    setEditingAssignment(null)
                    setEditTaskFile(null)
                  }}
                  style={softBtn}
                >
                  Cancel
                </button>

                {ok && (
                  <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>
                    {ok}
                  </span>
                )}

                {err && <span style={{ fontSize: 13, color: '#ef4444' }}>{err}</span>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}