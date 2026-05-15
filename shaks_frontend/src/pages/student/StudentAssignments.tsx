import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { BookIcon, GraduationCapIcon, PuzzleIcon, PinIcon, StarIcon, CalendarIcon, LockIcon, ArrowUpCircleIcon, CheckCircleIcon, UnlockIcon, FileTextIcon, ClockIcon, XCircleIcon, FileIcon } from '../../assets/icons/Icons'

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
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Needs correction',
}

export default function StudentAssignments() {
  const { c } = useTheme()

  const [assignments, setAssignments] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [ok, setOk] = useState('')
  const [error, setError] = useState('')
  const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set())

  const submissionFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get('/assignments/assignments/')
      .then((r) => setAssignments(r.data.results ?? r.data))
      .catch(() => setAssignments([]))

    api.get('/courses/watched/')
      .then((r) => setWatchedIds(new Set(r.data.watched_topic_ids ?? [])))
      .catch(() => {})
  }, [])

  const topicWatched = (topicId: number) => watchedIds.has(topicId)

  const showMsg = (msg: string, isError = false) => {
    if (isError) {
      setError(msg)
      setTimeout(() => setError(''), 4000)
    } else {
      setOk(msg)
      setTimeout(() => setOk(''), 3000)
    }
  }

  const openAssignment = async (a: any) => {
    try {
      const { data } = await api.get(`/assignments/assignments/${a.id}/`)
      setSelected(data)
      setSubmissionFile(null)
      setOk('')
      setError('')

      const subs = await api.get('/assignments/submissions/')
      const all: any[] = subs.data.results ?? subs.data
      setSubmission(all.find((s) => s.assignment === a.id) ?? null)
    } catch {
      showMsg('Could not open assignment', true)
    }
  }

  const upload = async () => {
    if (!submissionFile || !selected) return
    setUploading(true)
    setError('')
    setOk('')

    try {
      const fd = new FormData()
      fd.append('assignment', String(selected.id))
      fd.append('file', submissionFile)

      const { data } = await api.post('/assignments/submissions/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setSubmission(data)
      setSubmissionFile(null)
      showMsg('Submitted successfully!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Upload failed'), true)
    } finally {
      setUploading(false)
    }
  }

  const stats = useMemo(() => {
    const total = assignments.length
    const unlocked = assignments.filter((a) => !a.topic || topicWatched(a.topic)).length
    const locked = total - unlocked
    return { total, unlocked, locked }
  }, [assignments, watchedIds])

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 16,
    border: `1px solid ${c.inputBorder}`,
    background: c.input,
    color: c.text,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'all 0.25s ease',
  }

  const primaryBtn = {
    width: '100%',
    padding: '13px 18px',
    borderRadius: 16,
    background: '#2563eb',
    color: 'white',
    fontWeight: 700,
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 14px 30px -10px rgba(37,99,235,0.65)',
  }

  const ghostBtn = {
    padding: '12px 16px',
    borderRadius: 14,
    background: c.input,
    color: c.textMuted,
    fontWeight: 600,
    fontSize: 13,
    border: `1px solid ${c.border}`,
    cursor: 'pointer',
  }

  const panelStyle = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    padding: '28px',
    borderRadius: 28,
    background: c.card,
    border: `1px solid ${c.border}`,
    boxShadow: '0 20px 45px rgba(0,0,0,0.06)',
    marginBottom: 24,
  }

  const cardStyle = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    padding: '22px 24px',
    borderRadius: 24,
    background: c.card,
    border: `1px solid ${c.border}`,
    boxShadow: '0 14px 32px rgba(0,0,0,0.05)',
  }

  const badge = (_text: string, bg = c.input, color = c.textFaint, border = 'transparent') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 999,
    background: bg,
    color,
    border: `1px solid ${border}`,
    fontSize: 12,
    fontWeight: 700,
  })

  const renderEmpty = () => (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '64px 24px',
        borderRadius: 28,
        background: c.card,
        border: `1px solid ${c.border}`,
        textAlign: 'center',
        boxShadow: '0 16px 36px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><FileTextIcon size={44} color={c.textFaint} /></div>
      <div style={{ fontSize: 20, fontWeight: 700, color: c.text, marginBottom: 8 }}>
        No assignments yet
      </div>
      <p style={{ margin: 0, color: c.textMuted, fontSize: 14, lineHeight: 1.7 }}>
        Your teacher assignments will appear here. Watch the topic video first and then upload your solution.
      </p>
    </motion.div>
  )

  if (selected) {
    const locked = selected.topic && !topicWatched(selected.topic)

    return (
      <div style={{ padding: '4px 2px 20px' }}>
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSelected(null)
            setSubmissionFile(null)
            setOk('')
            setError('')
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
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
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ marginBottom: 24 }}
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
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', letterSpacing: '0.02em' }}>
              Student Workspace
            </span>
          </div>

          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: c.text,
              margin: '0 0 10px',
              lineHeight: 1.08,
            }}
          >
            Assignment Details
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: c.textMuted,
              lineHeight: 1.7,
              maxWidth: 760,
            }}
          >
            Read the task carefully, check the material from your teacher, and upload your solution when ready.
          </p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              style={{
                padding: '12px 16px',
                borderRadius: 16,
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.22)',
                color: '#ef4444',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ok && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              style={{
                padding: '12px 16px',
                borderRadius: 16,
                background: 'rgba(34,197,94,0.10)',
                border: '1px solid rgba(34,197,94,0.22)',
                color: '#22c55e',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {ok}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 720px', minWidth: 0 }}>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              style={panelStyle}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -60,
                  right: -60,
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  background: 'rgba(37,99,235,0.08)',
                  filter: 'blur(20px)',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 16,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: c.text,
                        lineHeight: 1.15,
                        marginBottom: 10,
                      }}
                    >
                      {selected.title}
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {selected.subject_name && <span style={badge(selected.subject_name)}><BookIcon size={12} color={c.textFaint} style={{ flexShrink: 0 }} />{selected.subject_name}</span>}
                      {selected.grade_name && <span style={badge(selected.grade_name)}><GraduationCapIcon size={12} color={c.textFaint} style={{ flexShrink: 0 }} />{selected.grade_name}</span>}
                      {selected.module_title && <span style={badge(selected.module_title)}><PuzzleIcon size={12} color={c.textFaint} style={{ flexShrink: 0 }} />{selected.module_title}</span>}
                      {selected.topic_title && <span style={badge(selected.topic_title)}><PinIcon size={12} color={c.textFaint} style={{ flexShrink: 0 }} />{selected.topic_title}</span>}
                      <span
                        style={badge(
                          `${selected.points} pts`,
                          'rgba(245,158,11,0.10)',
                          '#f59e0b',
                          'rgba(245,158,11,0.16)'
                        )}
                      >
                        <StarIcon size={12} color="#f59e0b" style={{ flexShrink: 0 }} /> {selected.points} pts
                      </span>
                      {selected.due_date && (
                        <span
                          style={badge(
                            `Due: ${new Date(selected.due_date).toLocaleString()}`,
                            'rgba(239,68,68,0.08)',
                            '#ef4444',
                            'rgba(239,68,68,0.14)'
                          )}
                        >
                          <CalendarIcon size={12} color="#ef4444" style={{ flexShrink: 0 }} /> Due: {new Date(selected.due_date).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selected.instructions && (
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 8,
                      }}
                    >
                      Instructions
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: c.text,
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {selected.instructions}
                    </div>
                  </div>
                )}

                {selected.description && (
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 8,
                      }}
                    >
                      Description
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: c.textMuted,
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {selected.description}
                    </div>
                  </div>
                )}

                {selected.task_file && (
                  <div
                    style={{
                      marginTop: 22,
                      padding: '18px 20px',
                      background: c.input,
                      borderRadius: 18,
                      border: `1px solid ${c.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: c.text,
                        marginBottom: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <FileIcon size={13} color={c.text} style={{ flexShrink: 0 }} /> Teacher attachment
                    </div>

                    <a
                      href={selected.task_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#60a5fa',
                        textDecoration: 'underline',
                        fontSize: 14.5,
                        fontWeight: 600,
                        wordBreak: 'break-all',
                      }}
                    >
                      {selected.task_file.split('/').pop() || 'Download assignment file'}
                    </a>

                    <p
                      style={{
                        fontSize: 12.5,
                        color: c.textFaint,
                        marginTop: 8,
                        marginBottom: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      Open or download the teacher’s file before preparing your answer.
                    </p>
                  </div>
                )}

                <div style={{ marginTop: 22, fontSize: 12, color: c.textFaint }}>
                  Posted by {selected.created_by_name} · {new Date(selected.created_at).toLocaleDateString()}
                </div>
              </div>
            </motion.div>

            {submission && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                style={cardStyle}
              >
                <div
                  style={{
                    fontWeight: 800,
                    color: c.text,
                    fontSize: 18,
                    marginBottom: 16,
                  }}
                >
                  My Submission
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 14,
                    flexWrap: 'wrap',
                    marginBottom: 14,
                  }}
                >
                  <span style={{ fontSize: 13, color: c.textMuted }}>Review status</span>
                  <span
                    style={{
                      padding: '7px 14px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      background: STATUS_COLOR[submission.status]?.bg,
                      color: STATUS_COLOR[submission.status]?.text,
                      border: `1px solid ${STATUS_COLOR[submission.status]?.border}`,
                    }}
                  >
                    {STATUS_LABEL[submission.status] ?? submission.status}
                  </span>
                </div>

                {submission.file && (
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: 16,
                      background: c.input,
                      border: `1px solid ${c.border}`,
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ fontSize: 12, color: c.textFaint, marginBottom: 6 }}>
                      Submitted file
                    </div>
                    <a
                      href={submission.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#2563eb',
                        textDecoration: 'underline',
                        wordBreak: 'break-all',
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {submission.file.split('/').pop() || 'View file'}
                    </a>
                  </div>
                )}

                {submission.grade && (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: c.input,
                      border: `1px solid ${c.border}`,
                      fontSize: 13,
                      color: c.textMuted,
                      marginBottom: 10,
                    }}
                  >
                    <strong style={{ color: c.text }}>Grade:</strong> {submission.grade}
                  </div>
                )}

                {submission.feedback && (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: c.input,
                      border: `1px solid ${c.border}`,
                      fontSize: 13,
                      color: c.textMuted,
                      lineHeight: 1.7,
                    }}
                  >
                    <strong style={{ color: c.text }}>Feedback:</strong> {submission.feedback}
                  </div>
                )}

                <div style={{ fontSize: 11, color: c.textFaint, marginTop: 12 }}>
                  Submitted: {new Date(submission.submitted_at).toLocaleString()}
                </div>
              </motion.div>
            )}
          </div>

          <div style={{ flex: '0 0 340px', width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              style={panelStyle}
            >
              {locked ? (
                <div style={{ textAlign: 'center', padding: '18px 4px' }}>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><LockIcon size={64} color={c.textFaint} /></div>
                  <div style={{ fontWeight: 800, color: c.text, fontSize: 18, marginBottom: 8 }}>
                    Assignment Locked
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: c.textMuted,
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    You need to watch the topic video{' '}
                    <strong style={{ color: c.text }}>"{selected.topic_title}"</strong> first before
                    submitting this assignment.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 6 }}>
                      {submission ? 'Resubmit solution' : 'Upload solution'}
                    </div>
                    <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.6 }}>
                      Upload your file in PDF, Word, or TXT format.
                    </div>
                  </div>

                  <div
                    onClick={() => submissionFileRef.current?.click()}
                    style={{
                      padding: '28px 18px',
                      borderRadius: 20,
                      border: `2px dashed ${c.inputBorder}`,
                      background: c.input,
                      textAlign: 'center',
                      cursor: 'pointer',
                      marginBottom: 14,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                      {submissionFile ? <CheckCircleIcon size={34} color="#22c55e" /> : <ArrowUpCircleIcon size={34} color={c.textMuted} />}
                    </div>
                    <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.7 }}>
                      {submissionFile
                        ? submissionFile.name
                        : 'Click here to choose your solution file'}
                    </div>
                  </div>

                  <input
                    ref={submissionFileRef}
                    type="file"
                    accept=".txt,.doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => setSubmissionFile(e.target.files?.[0] ?? null)}
                  />

                  <motion.button
                    whileHover={!submissionFile || uploading ? {} : { y: -2 }}
                    whileTap={!submissionFile || uploading ? {} : { scale: 0.98 }}
                    onClick={upload}
                    disabled={!submissionFile || uploading}
                    style={{
                      ...primaryBtn,
                      opacity: !submissionFile || uploading ? 0.5 : 1,
                    }}
                  >
                    {uploading ? 'Uploading...' : submission ? 'Resubmit Assignment' : 'Submit Assignment'}
                  </motion.button>

                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => submissionFileRef.current?.click()}
                      style={ghostBtn}
                    >
                      Choose file
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '4px 2px 20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 28 }}
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
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', letterSpacing: '0.02em' }}>
            Student Panel
          </span>
        </div>

        <h1
          style={{
            fontSize: 34,
            fontWeight: 800,
            color: c.text,
            margin: '0 0 10px',
            lineHeight: 1.08,
          }}
        >
          Assignments
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 15,
            color: c.textMuted,
            lineHeight: 1.7,
            maxWidth: 760,
          }}
        >
          Review your tasks, open assignment details, and upload your work after watching the required lesson.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 26,
        }}
      >
        {[
          { label: 'All Assignments', value: stats.total, icon: <FileTextIcon size={16} color={c.textMuted} /> },
          { label: 'Unlocked', value: stats.unlocked, icon: <UnlockIcon size={16} color={c.textMuted} /> },
          { label: 'Locked', value: stats.locked, icon: <LockIcon size={16} color={c.textMuted} /> },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              ...cardStyle,
              padding: '18px 20px',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 10 }}>{item.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: c.text, marginBottom: 4 }}>
              {item.value}
            </div>
            <div style={{ fontSize: 13, color: c.textMuted }}>{item.label}</div>
          </div>
        ))}
      </motion.div>

      {assignments.length === 0 && renderEmpty()}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {assignments.map((a, i) => {
          const locked = a.topic && !topicWatched(a.topic)

          return (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              viewport={{ once: true }}
              whileHover={{ y: -3, scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => openAssignment(a)}
              style={{
                ...cardStyle,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 18,
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: 16, flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: locked
                        ? 'rgba(107,114,128,0.10)'
                        : 'rgba(37,99,235,0.10)',
                      color: locked ? c.textFaint : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      flexShrink: 0,
                      border: locked
                        ? `1px solid ${c.border}`
                        : '1px solid rgba(37,99,235,0.15)',
                    }}
                  >
                    {locked ? <LockIcon size={20} color={c.textFaint} /> : <FileTextIcon size={20} color="#2563eb" />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: c.text,
                        fontSize: 17,
                        marginBottom: 8,
                        lineHeight: 1.35,
                      }}
                    >
                      {a.title}
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                      {a.topic_title && <span style={badge(a.topic_title)}><PinIcon size={12} /> {a.topic_title}</span>}
                      <span
                        style={badge(
                          `${a.points} pts`,
                          'rgba(245,158,11,0.10)',
                          '#f59e0b',
                          'rgba(245,158,11,0.16)'
                        )}
                      >
                        <StarIcon size={12} color="#f59e0b" /> {a.points} pts
                      </span>
                      {a.due_date && (
                        <span
                          style={badge(
                            `${new Date(a.due_date).toLocaleDateString()}`,
                            'rgba(239,68,68,0.08)',
                            '#ef4444',
                            'rgba(239,68,68,0.14)'
                          )}
                        >
                          <CalendarIcon size={12} color="#ef4444" /> {new Date(a.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {locked && (
                        <span style={badge('Watch topic first')}>
                          Watch topic first
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.7 }}>
                      {locked
                        ? 'Complete the lesson video first to unlock submission.'
                        : 'Open the assignment to read full details and upload your work.'}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    alignSelf: 'center',
                    fontSize: 20,
                    color: c.textFaint,
                    paddingTop: 4,
                  }}
                >
                  ›
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}