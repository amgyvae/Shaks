import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { RocketIcon, VideoIcon, CalendarIcon, ClockIcon } from '../../assets/icons/Icons'

export default function TeacherMeetings() {
  const { c, theme } = useTheme()
  const [meetings, setMeetings] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    meeting_link: '',
    scheduled_at: '',
  })
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  const load = () => api.get('/meetings/').then((r) => setMeetings(r.data.results ?? r.data))

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    setErr('')
    setOk('')

    if (!form.title.trim() || !form.meeting_link.trim() || !form.scheduled_at) {
      setErr('Title, link and date are required.')
      return
    }

    try {
      await api.post('/meetings/', { ...form })
      setOk('Meeting created!')
      setForm({ title: '', description: '', meeting_link: '', scheduled_at: '' })
      setShowCreate(false)
      load()
      setTimeout(() => setOk(''), 3000)
    } catch (e: any) {
      setErr(JSON.stringify(e.response?.data))
    }
  }

  const deleteMeeting = async (id: number) => {
    if (!confirm('Delete this meeting?')) return
    await api.delete(`/meetings/${id}/`)
    setMeetings((prev) => prev.filter((m) => m.id !== id))
  }

  const sf = (k: string) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }))

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

  const panelStyle = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderRadius: 30,
    background: c.card,
    border: `1px solid ${c.border}`,
    boxShadow: '0 22px 50px rgba(0,0,0,0.06)',
  }

  const summary = useMemo(() => {
    const now = new Date()
    const upcoming = meetings.filter((m) => new Date(m.scheduled_at) >= now).length
    const past = meetings.filter((m) => new Date(m.scheduled_at) < now).length
    return { upcoming, past, total: meetings.length }
  }, [meetings])

  return (
    <div style={{ padding: '4px 2px 20px' }}>
      {/* HERO */}
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
                radial-gradient(circle at 88% 24%, rgba(99,102,241,0.14), transparent 24%),
                linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.96))
              `
              : `
                radial-gradient(circle at 12% 20%, rgba(37,99,235,0.10), transparent 28%),
                radial-gradient(circle at 88% 24%, rgba(99,102,241,0.08), transparent 24%),
                linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.98))
              `,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 740 }}>
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
              Online Meetings
            </h1>

            <p
              style={{
                fontSize: 15,
                color: c.textMuted,
                lineHeight: 1.8,
                margin: 0,
                maxWidth: 620,
              }}
            >
              Create and manage live online lessons through Zoom, Google Meet, or Microsoft Teams
              in a polished premium workspace.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
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
              {summary.total} total
            </div>

            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreate((p) => !p)}
              style={primaryBtn}
            >
              {showCreate ? '✕ Close' : '+ New Meeting'}
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* STATS */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: 'Upcoming',
            value: summary.upcoming,
            icon: <RocketIcon size={20} color="currentColor" />,
            color: '#2563eb',
            desc: 'Scheduled ahead',
          },
          {
            label: 'Past',
            value: summary.past,
            icon: <ClockIcon size={20} color="currentColor" />,
            color: '#64748b',
            desc: 'Already finished',
          },
          {
            label: 'Live teaching flow',
            value: summary.total,
            icon: <VideoIcon size={20} color="currentColor" />,
            color: '#22c55e',
            desc: 'Total meeting records',
          },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -4, scale: 1.01 }}
            style={{
              ...panelStyle,
              padding: '22px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `${card.color}18`,
                filter: 'blur(16px)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  background: `${card.color}14`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  marginBottom: 16,
                }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: card.color,
                  marginBottom: 4,
                  lineHeight: 1,
                }}
              >
                {card.value}
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: c.text,
                  marginBottom: 5,
                }}
              >
                {card.label}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: c.textMuted,
                  lineHeight: 1.7,
                }}
              >
                {card.desc}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* CREATE */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            style={{
              ...panelStyle,
              padding: '28px',
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
                  Create Meeting
                </div>
                <div style={{ fontSize: 13, color: c.textMuted }}>
                  Schedule a new live lesson with link, time, and optional description.
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
                    placeholder="e.g. Math lesson — Chapter 5"
                    style={inputStyle}
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
                    Meeting Link *
                  </label>
                  <input
                    value={form.meeting_link}
                    onChange={sf('meeting_link')}
                    placeholder="https://meet.google.com/..."
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
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={sf('scheduled_at')}
                    style={{ ...inputStyle, colorScheme: theme === 'dark' ? 'dark' : 'light' }}
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
                    Description (optional)
                  </label>
                  <input
                    value={form.description}
                    onChange={sf('description')}
                    placeholder="Topic for this lesson..."
                    style={inputStyle}
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
                <button onClick={create} style={primaryBtn}>
                  Create Meeting
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

      {/* EMPTY */}
      {meetings.length === 0 && !showCreate && (
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
          <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}><VideoIcon size={42} color={c.textFaint} /></div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: c.text,
              marginBottom: 8,
            }}
          >
            No meetings yet
          </div>
          <div style={{ fontSize: 14, color: c.textMuted, lineHeight: 1.7 }}>
            Create your first online lesson to start managing live sessions.
          </div>
        </motion.div>
      )}

      {/* LIST */}
      {meetings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {meetings.map((m, i) => {
            const isPast = new Date(m.scheduled_at) < new Date()

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3, scale: 1.004 }}
                style={{
                  ...panelStyle,
                  padding: '22px 24px',
                  opacity: isPast ? 0.72 : 1,
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
                      <VideoIcon size={16} color="currentColor" />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          flexWrap: 'wrap',
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 800,
                            color: c.text,
                            fontSize: 18,
                          }}
                        >
                          {m.title}
                        </div>

                        <span
                          style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            background: isPast ? c.input : 'rgba(34,197,94,0.10)',
                            color: isPast ? c.textFaint : '#22c55e',
                            fontSize: 12,
                            fontWeight: 700,
                            border: isPast
                              ? `1px solid ${c.border}`
                              : '1px solid rgba(34,197,94,0.16)',
                          }}
                        >
                          {isPast ? 'Past' : 'Upcoming'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span
                          style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            background: 'rgba(37,99,235,0.08)',
                            color: '#2563eb',
                            fontSize: 12,
                            fontWeight: 700,
                            border: '1px solid rgba(37,99,235,0.14)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <CalendarIcon size={12} color="currentColor" style={{ marginRight: 4, flexShrink: 0 }} />{new Date(m.scheduled_at).toLocaleString()}
                        </span>

                        {m.description && (
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
                            {m.description}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: c.textFaint,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}
                      >
                        {m.meeting_link}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a
                      href={m.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...primaryBtn,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      Join
                    </a>

                    <button onClick={() => deleteMeeting(m.id)} style={deleteBtn}>
                      Delete
                    </button>
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