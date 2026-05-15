import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { RocketIcon, VideoIcon, CalendarIcon, ClockIcon } from '../../assets/icons/Icons'

export default function StudentMeetings() {
  const { c } = useTheme()
  const [meetings, setMeetings] = useState<any[]>([])

  useEffect(() => {
    api.get('/meetings/')
      .then((r) => setMeetings(r.data.results ?? r.data))
      .catch(() => setMeetings([]))
  }, [])

  const now = new Date()

  const upcoming = useMemo(
    () =>
      meetings
        .filter((m) => new Date(m.scheduled_at) >= now)
        .sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        ),
    [meetings]
  )

  const past = useMemo(
    () =>
      meetings
        .filter((m) => new Date(m.scheduled_at) < now)
        .sort(
          (a, b) =>
            new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
        ),
    [meetings]
  )

  const nextMeeting = upcoming[0]

  const cardStyle = {
    borderRadius: 28,
    border: `1px solid ${c.border}`,
    background: c.card,
    boxShadow: '0 24px 70px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  }

  const stats: { label: string; value: number; icon: ReactNode }[] = [
    { label: 'Upcoming', value: upcoming.length, icon: <RocketIcon size={20} color="currentColor" /> },
    { label: 'Past', value: past.length, icon: <ClockIcon size={20} color="currentColor" /> },
    { label: 'All Meetings', value: meetings.length, icon: <VideoIcon size={20} color="currentColor" /> },
  ]

  const formatDate = (value: string) =>
    new Date(value).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div style={{ padding: '2px 0 10px' }}>
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          ...cardStyle,
          padding: 28,
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
          background: `
            radial-gradient(circle at top right, rgba(37,99,235,0.14), transparent 30%),
            radial-gradient(circle at bottom left, rgba(168,85,247,0.10), transparent 26%),
            ${c.card}
          `,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -20,
            width: 170,
            height: 170,
            borderRadius: '50%',
            background: 'rgba(37,99,235,0.10)',
            filter: 'blur(28px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -50,
            left: -20,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(168,85,247,0.10)',
            filter: 'blur(28px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 999,
              background: 'rgba(37,99,235,0.10)',
              border: '1px solid rgba(37,99,235,0.22)',
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
            <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', letterSpacing: '0.03em' }}>
              LIVE CLASSES
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.15fr 0.85fr',
              gap: 20,
              alignItems: 'center',
            }}
          >
            <div>
              <h1
                style={{
                  margin: '0 0 12px',
                  fontSize: 38,
                  fontWeight: 900,
                  color: c.text,
                  lineHeight: 1.05,
                  letterSpacing: '-0.04em',
                }}
              >
                Meetings & Online Lessons
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: c.textMuted,
                  lineHeight: 1.8,
                  maxWidth: 720,
                }}
              >
                Join upcoming lessons, check your session schedule, and keep all teacher meetings in one polished space.
              </p>

              {nextMeeting && (
                <div
                  style={{
                    marginTop: 22,
                    padding: '16px 18px',
                    borderRadius: 20,
                    background: 'rgba(37,99,235,0.10)',
                    border: '1px solid rgba(37,99,235,0.18)',
                    maxWidth: 540,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: '#2563eb',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 800,
                      marginBottom: 6,
                    }}
                  >
                    Next Session
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: c.text,
                      marginBottom: 6,
                    }}
                  >
                    {nextMeeting.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: c.textMuted,
                    }}
                  >
                    {formatDate(nextMeeting.scheduled_at)}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: '18px 18px',
                  borderRadius: 22,
                  background: c.input,
                  border: `1px solid ${c.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: c.textFaint,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  Session Mode
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: c.text,
                    marginBottom: 4,
                  }}
                >
                  Online Learning
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: c.textMuted,
                    lineHeight: 1.7,
                  }}
                >
                  Join teacher meetings, online lessons, and live discussions without missing your schedule.
                </div>
              </div>

              <div
                style={{
                  padding: '18px 18px',
                  borderRadius: 22,
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.10), rgba(99,102,241,0.08))',
                  border: '1px solid rgba(37,99,235,0.16)',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: '#2563eb',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: c.text,
                    marginBottom: 4,
                  }}
                >
                  Ready to Join
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: c.textMuted,
                    lineHeight: 1.7,
                  }}
                >
                  Open upcoming sessions on time and stay synchronized with your class schedule.
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {stats.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + index * 0.05 }}
            style={{
              ...cardStyle,
              padding: '20px 20px',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: c.text,
                marginBottom: 4,
                lineHeight: 1,
              }}
            >
              {item.value}
            </div>
            <div
              style={{
                fontSize: 13,
                color: c.textMuted,
              }}
            >
              {item.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {meetings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...cardStyle,
            padding: '64px 24px',
            textAlign: 'center',
            color: c.textFaint,
          }}
        >
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><VideoIcon size={44} color={c.textFaint} /></div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: c.text,
              marginBottom: 8,
            }}
          >
            No meetings scheduled yet
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: c.textMuted,
              lineHeight: 1.7,
            }}
          >
            When teachers create online lessons or live meetings, they will appear here.
          </p>
        </motion.div>
      )}

      {/* UPCOMING */}
      {upcoming.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{ marginBottom: 30 }}
        >
          <div style={{ marginBottom: 16 }}>
            <h2
              style={{
                margin: '0 0 6px',
                fontSize: 24,
                fontWeight: 900,
                color: c.text,
                letterSpacing: '-0.02em',
              }}
            >
              Upcoming Meetings
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: c.textMuted,
              }}
            >
              Your upcoming classes and live sessions from teachers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {upcoming.map((m, index) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.04 }}
                style={{
                  ...cardStyle,
                  padding: '22px 22px',
                  border: '1.5px solid rgba(37,99,235,0.18)',
                  background: `
                    radial-gradient(circle at top right, rgba(37,99,235,0.08), transparent 25%),
                    ${c.card}
                  `,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 18,
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 20,
                      background: 'rgba(37,99,235,0.10)',
                      border: '1px solid rgba(37,99,235,0.16)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <VideoIcon size={16} color="currentColor" />
                  </div>

                  <div style={{ minWidth: 0 }}>
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
                          background: 'rgba(37,99,235,0.10)',
                          border: '1px solid rgba(37,99,235,0.16)',
                          color: '#2563eb',
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        Upcoming
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 13.5,
                        color: '#2563eb',
                        marginBottom: 6,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <CalendarIcon size={12} color="currentColor" style={{ marginRight: 4, flexShrink: 0 }} />{formatDate(m.scheduled_at)}
                    </div>

                    {m.description && (
                      <div
                        style={{
                          fontSize: 13,
                          color: c.textMuted,
                          lineHeight: 1.8,
                          marginBottom: 6,
                        }}
                      >
                        {m.description}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: 12,
                        color: c.textFaint,
                      }}
                    >
                      Created by {m.created_by_name}
                    </div>
                  </div>

                  <a
                    href={m.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '13px 22px',
                      borderRadius: 16,
                      background: '#2563eb',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: 13,
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 16px 32px rgba(37,99,235,0.24)',
                    }}
                  >
                    Join Meeting
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* PAST */}
      {past.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <div style={{ marginBottom: 16 }}>
            <h2
              style={{
                margin: '0 0 6px',
                fontSize: 24,
                fontWeight: 900,
                color: c.text,
                letterSpacing: '-0.02em',
              }}
            >
              Past Meetings
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: c.textMuted,
              }}
            >
              Previous sessions that have already finished.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {past.map((m, index) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 + index * 0.03 }}
                style={{
                  ...cardStyle,
                  padding: '18px 20px',
                  opacity: 0.72,
                  boxShadow: '0 18px 36px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 16,
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      background: c.input,
                      border: `1px solid ${c.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <VideoIcon size={16} color="currentColor" />
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: c.text,
                        fontSize: 15,
                        marginBottom: 5,
                      }}
                    >
                      {m.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: c.textFaint,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <CalendarIcon size={12} color="currentColor" style={{ marginRight: 4, flexShrink: 0 }} />{formatDate(m.scheduled_at)}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '7px 10px',
                      borderRadius: 999,
                      background: c.input,
                      border: `1px solid ${c.border}`,
                      color: c.textFaint,
                      fontSize: 11,
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Finished
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}