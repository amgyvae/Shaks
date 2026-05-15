import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { ClockIcon, CheckCircleIcon, XCircleIcon, GraduationCapIcon, PinIcon, StarIcon, ArrowUpCircleIcon, EyeIcon, SleepIcon, InboxIcon, ClipboardIcon } from '../../assets/icons/Icons'

const SC = (s: string) =>
  s === 'approved'
    ? { bg: 'rgba(34,197,94,0.12)', text: '#22c55e', border: 'rgba(34,197,94,0.18)' }
    : s === 'rejected'
      ? { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.18)' }
      : s === 'pending'
        ? { bg: 'rgba(234,179,8,0.12)', text: '#eab308', border: 'rgba(234,179,8,0.18)' }
        : { bg: 'transparent', text: '#9ca3af', border: 'transparent' }

const SL: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  '': '— Not submitted',
}

export default function TeacherSubmissions() {
  const { c, theme } = useTheme()

  const [assignments, setAssignments] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loadingRows, setLoadingRows] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [reviewForm, setReviewForm] = useState<
    Record<number, { grade: string; feedback: string }>
  >({})
  const [saving, setSaving] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'viewed' | 'not_started'>('all')

  useEffect(() => {
    api.get('/assignments/assignments/').then((r) => setAssignments(r.data.results ?? r.data))
  }, [])

  const openAssignment = async (a: any) => {
    setSelected(a)
    setPreview(null)
    setSearch('')
    setStatusFilter('all')
    setLoadingRows(true)

    const { data } = await api.get(`/assignments/assignments/${a.id}/students/`)
    setRows(data)

    const rf: Record<number, { grade: string; feedback: string }> = {}
    data.forEach((r: any) => {
      rf[r.student_id] = { grade: r.grade || '', feedback: r.feedback || '' }
    })
    setReviewForm(rf)
    setLoadingRows(false)
  }

  const review = async (row: any, status: string) => {
    if (!row.submission_id) return
    setSaving(row.student_id)

    await api.patch(`/assignments/submissions/${row.submission_id}/review/`, {
      status,
      grade: reviewForm[row.student_id]?.grade || '',
      feedback: reviewForm[row.student_id]?.feedback || '',
    })

    setRows((p) =>
      p.map((r) =>
        r.student_id === row.student_id
          ? {
              ...r,
              status,
              grade: reviewForm[row.student_id]?.grade || r.grade,
              feedback: reviewForm[row.student_id]?.feedback || r.feedback,
            }
          : r
      )
    )
    setSaving(null)
  }

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

  const panelStyle = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderRadius: 30,
    background: c.card,
    border: `1px solid ${c.border}`,
    boxShadow: '0 22px 50px rgba(0,0,0,0.06)',
  }

  const primaryBtn = {
    padding: '12px 18px',
    borderRadius: 14,
    background: '#2563eb',
    color: 'white',
    fontWeight: 700,
    fontSize: 13,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 14px 30px -10px rgba(37,99,235,0.65)',
  }

  const passBtn = {
    padding: '10px 14px',
    borderRadius: 12,
    background: 'rgba(34,197,94,0.12)',
    color: '#22c55e',
    border: '1px solid rgba(34,197,94,0.18)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  }

  const rejectBtn = {
    padding: '10px 14px',
    borderRadius: 12,
    background: 'rgba(239,68,68,0.10)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.16)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  }

  const softBtn = {
    padding: '10px 14px',
    borderRadius: 12,
    background: 'rgba(37,99,235,0.10)',
    color: '#2563eb',
    border: '1px solid rgba(37,99,235,0.16)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  }

  const submitted = rows.filter((r) => r.submitted)
  const viewed = rows.filter((r) => r.viewed && !r.submitted)
  const notStarted = rows.filter((r) => !r.viewed && !r.submitted)
  const approved = rows.filter((r) => r.status === 'approved')
  const rejected = rows.filter((r) => r.status === 'rejected')
  const pending = rows.filter((r) => r.status === 'pending')

  const filteredRows = useMemo(() => {
    let list = rows

    if (search.trim()) {
      list = list.filter((r) =>
        r.student_name?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (statusFilter === 'submitted') list = list.filter((r) => r.submitted)
    if (statusFilter === 'pending') list = list.filter((r) => r.status === 'pending')
    if (statusFilter === 'approved') list = list.filter((r) => r.status === 'approved')
    if (statusFilter === 'rejected') list = list.filter((r) => r.status === 'rejected')
    if (statusFilter === 'viewed') list = list.filter((r) => r.viewed && !r.submitted)
    if (statusFilter === 'not_started') list = list.filter((r) => !r.viewed && !r.submitted)

    return list
  }, [rows, search, statusFilter])

  const Badge = ({
    text,
    bg,
    color,
    border,
  }: {
    text: string
    bg?: string
    color?: string
    border?: string
  }) => (
    <span
      style={{
        padding: '6px 12px',
        borderRadius: 999,
        background: bg || c.input,
        color: color || c.textMuted,
        fontSize: 12,
        fontWeight: 700,
        border: border ? `1px solid ${border}` : 'none',
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

        {/* header */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...panelStyle,
            padding: '30px',
            marginBottom: 22,
            background:
              theme === 'dark'
                ? `
                  radial-gradient(circle at 12% 20%, rgba(37,99,235,0.18), transparent 28%),
                  linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.96))
                `
                : `
                  radial-gradient(circle at 12% 20%, rgba(37,99,235,0.10), transparent 28%),
                  linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.98))
                `,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ maxWidth: 760 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: 'rgba(37,99,235,0.10)',
                  border: '1px solid rgba(37,99,235,0.20)',
                  marginBottom: 16,
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
                  Submission Review
                </span>
              </div>

              <h2
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: c.text,
                  margin: '0 0 10px',
                  lineHeight: 1.08,
                }}
              >
                {selected.title}
              </h2>

              {selected.description && (
                <p
                  style={{
                    fontSize: 14,
                    color: c.textMuted,
                    lineHeight: 1.8,
                    margin: 0,
                    maxWidth: 620,
                  }}
                >
                  {selected.description}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selected.grade_name && <Badge text={selected.grade_name} />}
              {selected.topic_title && <Badge text={selected.topic_title} />}
              {selected.points && (
                <Badge
                  text={`${selected.points} pts`}
                  bg="rgba(245,158,11,0.10)"
                  color="#f59e0b"
                />
              )}
            </div>
          </div>
        </motion.section>

        {/* summary cards */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            marginBottom: 22,
          }}
        >
          {[
            [<ArrowUpCircleIcon size={22} color="#2563eb" />, submitted.length, 'Submitted', '#2563eb'],
            [<EyeIcon size={22} color="#64748b" />, viewed.length, 'Viewed only', '#64748b'],
            [<SleepIcon size={22} color="#94a3b8" />, notStarted.length, 'Not started', '#94a3b8'],
            [<CheckCircleIcon size={22} color="#22c55e" />, approved.length, 'Approved', '#22c55e'],
            [<XCircleIcon size={22} color="#ef4444" />, rejected.length, 'Rejected', '#ef4444'],
            [<ClockIcon size={22} color="#eab308" />, pending.length, 'Pending', '#eab308'],
          ].map(([icon, count, label, color], i) => (
            <motion.div
              key={label as string}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3, scale: 1.01 }}
              style={{
                ...panelStyle,
                padding: '20px',
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  background: `${color}16`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  marginBottom: 14,
                }}
              >
                {icon}
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: color as string,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {count}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: c.text,
                }}
              >
                {label}
              </div>
            </motion.div>
          ))}
        </section>

        {/* preview modal */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreview(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 32,
                backdropFilter: 'blur(6px)',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: 760,
                  width: '100%',
                  borderRadius: 28,
                  overflow: 'hidden',
                  background: c.card,
                  border: `1px solid ${c.border}`,
                  boxShadow: '0 35px 90px rgba(0,0,0,0.25)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '18px 20px',
                    borderBottom: `1px solid ${c.border}`,
                  }}
                >
                  <span style={{ fontWeight: 800, color: c.text, fontSize: 16 }}>
                    {preview.student_name}'s submission
                  </span>
                  <button
                    onClick={() => setPreview(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: c.textFaint,
                      cursor: 'pointer',
                      fontSize: 20,
                    }}
                  >
                    ✕
                  </button>
                </div>
                <img
                  src={preview.image}
                  alt="submission"
                  style={{ width: '100%', maxHeight: 560, objectFit: 'contain', background: c.bg }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* filters */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...panelStyle,
            padding: '20px',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              style={{ ...inputStyle, flex: 1, minWidth: 240 }}
            />

            {[
              ['all', 'All'],
              ['submitted', 'Submitted'],
              ['pending', 'Pending'],
              ['approved', 'Approved'],
              ['rejected', 'Rejected'],
              ['viewed', 'Viewed'],
              ['not_started', 'Not started'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key as any)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background:
                    statusFilter === key ? 'rgba(37,99,235,0.10)' : c.input,
                  color: statusFilter === key ? '#2563eb' : c.textMuted,
                  border:
                    statusFilter === key
                      ? '1px solid rgba(37,99,235,0.18)'
                      : `1px solid ${c.border}`,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* rows */}
        {loadingRows ? (
          <div style={{ padding: '48px', textAlign: 'center', color: c.textFaint }}>
            Loading students...
          </div>
        ) : filteredRows.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...panelStyle,
              padding: '64px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><InboxIcon size={42} color={c.textFaint} /></div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: c.text,
                marginBottom: 8,
              }}
            >
              No matching submissions
            </div>
            <div style={{ fontSize: 14, color: c.textMuted, lineHeight: 1.7 }}>
              Try changing the filter or search query.
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredRows.map((row, index) => {
              const statusStyle = SC(row.status)
              const isSubmitted = row.submitted

              return (
                <motion.div
                  key={row.student_id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -2, scale: 1.002 }}
                  style={{
                    ...panelStyle,
                    padding: '18px 20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 18,
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background: 'rgba(37,99,235,0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 800,
                            color: '#2563eb',
                            flexShrink: 0,
                          }}
                        >
                          {row.student_name?.[0]}
                        </div>

                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: c.text,
                              fontSize: 15,
                              marginBottom: 4,
                            }}
                          >
                            {row.student_name}
                          </div>

                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <Badge
                              text={SL[row.status] ?? row.status}
                              bg={statusStyle.bg}
                              color={statusStyle.text}
                              border={statusStyle.border}
                            />
                            <Badge
                              text={row.viewed ? 'Viewed' : '— Not viewed'}
                              bg={row.viewed ? 'rgba(37,99,235,0.10)' : c.input}
                              color={row.viewed ? '#2563eb' : c.textFaint}
                            />
                            <Badge
                              text={row.submitted ? 'Submitted' : '— Not submitted'}
                              bg={row.submitted ? 'rgba(34,197,94,0.10)' : c.input}
                              color={row.submitted ? '#22c55e' : c.textFaint}
                            />
                          </div>
                        </div>
                      </div>

                      {isSubmitted ? (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '140px 1fr',
                            gap: 12,
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: 11,
                                fontWeight: 700,
                                color: c.textFaint,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: 6,
                              }}
                            >
                              Grade
                            </label>
                            <input
                              value={reviewForm[row.student_id]?.grade ?? ''}
                              onChange={(e) =>
                                setReviewForm((p) => ({
                                  ...p,
                                  [row.student_id]: {
                                    ...p[row.student_id],
                                    grade: e.target.value,
                                  },
                                }))
                              }
                              placeholder="A / 90"
                              style={inputStyle}
                            />
                          </div>

                          <div>
                            <label
                              style={{
                                display: 'block',
                                fontSize: 11,
                                fontWeight: 700,
                                color: c.textFaint,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: 6,
                              }}
                            >
                              Feedback
                            </label>
                            <input
                              value={reviewForm[row.student_id]?.feedback ?? ''}
                              onChange={(e) =>
                                setReviewForm((p) => ({
                                  ...p,
                                  [row.student_id]: {
                                    ...p[row.student_id],
                                    feedback: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Add feedback..."
                              style={inputStyle}
                            />
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: 13,
                            color: c.textFaint,
                            paddingTop: 4,
                          }}
                        >
                          This student has not submitted work yet.
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end',
                      }}
                    >
                      {row.image && (
                        <button onClick={() => setPreview(row)} style={softBtn}>
                          View
                        </button>
                      )}

                      {isSubmitted && row.status !== 'approved' && (
                        <button
                          onClick={() => review(row, 'approved')}
                          disabled={saving === row.student_id}
                          style={{
                            ...passBtn,
                            opacity: saving === row.student_id ? 0.5 : 1,
                          }}
                        >
                          ✓ Pass
                        </button>
                      )}

                      {isSubmitted && row.status !== 'rejected' && (
                        <button
                          onClick={() => review(row, 'rejected')}
                          disabled={saving === row.student_id}
                          style={{
                            ...rejectBtn,
                            opacity: saving === row.student_id ? 0.5 : 1,
                          }}
                        >
                          ✗ Reject
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '4px 2px 20px' }}>
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          ...panelStyle,
          padding: '34px 32px',
          marginBottom: 24,
          background:
            theme === 'dark'
              ? `
                radial-gradient(circle at 12% 20%, rgba(37,99,235,0.18), transparent 28%),
                radial-gradient(circle at 88% 24%, rgba(34,197,94,0.10), transparent 24%),
                linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.96))
              `
              : `
                radial-gradient(circle at 12% 20%, rgba(37,99,235,0.10), transparent 28%),
                radial-gradient(circle at 88% 24%, rgba(34,197,94,0.08), transparent 24%),
                linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.98))
              `,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ maxWidth: 760 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 999,
                background: 'rgba(37,99,235,0.10)',
                border: '1px solid rgba(37,99,235,0.20)',
                marginBottom: 16,
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

            <h1
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: c.text,
                margin: '0 0 10px',
                lineHeight: 1.05,
              }}
            >
              Submissions
            </h1>

            <p
              style={{
                color: c.textMuted,
                fontSize: 15,
                margin: 0,
                lineHeight: 1.8,
                maxWidth: 640,
              }}
            >
              Review assignment progress, inspect student work, and approve or reject submissions with feedback.
            </p>
          </div>

          <div
            style={{
              padding: '10px 14px',
              borderRadius: 16,
              background: c.input,
              border: `1px solid ${c.border}`,
              color: c.textMuted,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {assignments.length} assignments
          </div>
        </div>
      </motion.section>

      {assignments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...panelStyle,
            padding: '68px 24px',
            textAlign: 'center',
            color: c.textFaint,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><ClipboardIcon size={42} color={c.textFaint} /></div>
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
            Create assignments first to start receiving submissions.
          </div>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {assignments.map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3, scale: 1.004 }}
              onClick={() => openAssignment(a)}
              style={{
                ...panelStyle,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '22px 24px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 18,
                  background: 'rgba(37,99,235,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                <ClipboardIcon size={24} color="#2563eb" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 800,
                    color: c.text,
                    fontSize: 17,
                    marginBottom: 6,
                  }}
                >
                  {a.title}
                </div>

                {a.description && (
                  <div
                    style={{
                      fontSize: 13,
                      color: c.textMuted,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.description}
                  </div>
                )}
              </div>

              <span style={{ fontSize: 22, color: c.textFaint }}>›</span>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}