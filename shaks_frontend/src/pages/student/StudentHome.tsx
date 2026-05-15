import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { BookIcon, ClipboardIcon, SparklesIcon, ChatIcon, MegaphoneIcon, BarChartIcon } from '../../assets/icons/Icons'

export default function StudentHome() {
  const { user } = useAuth()
  const { c } = useTheme()

  const [announcements, setAnnouncements] = useState<any[]>([])
  const [assignmentsCount, setAssignmentsCount] = useState(0)
  const [subjectsCount, setSubjectsCount] = useState(0)

  useEffect(() => {
    api.get('/courses/announcements/')
      .then((r) => setAnnouncements(r.data.results ?? r.data))
      .catch(() => setAnnouncements([]))

    api.get('/assignments/assignments/')
      .then((r) => {
        const arr = r.data.results ?? r.data
        setAssignmentsCount(arr.length)
      })
      .catch(() => setAssignmentsCount(0))

    api.get('/courses/subjects/')
      .then((r) => {
        const arr = r.data.results ?? r.data
        setSubjectsCount(arr.length)
      })
      .catch(() => setSubjectsCount(0))
  }, [])

  const quickActions = [
    {
      to: '/student/subjects',
      icon: <BookIcon size={20} color="#2563eb" />,
      label: 'Browse Subjects',
      desc: 'Explore all available subjects and learning paths',
      color: '#2563eb',
    },
    {
      to: '/student/assignments',
      icon: <ClipboardIcon size={20} color="#16a34a" />,
      label: 'My Assignments',
      desc: 'Open tasks, check deadlines, and submit work',
      color: '#16a34a',
    },
    {
      to: '/student/feed',
      icon: <SparklesIcon size={20} color="#9333ea" />,
      label: 'Community Feed',
      desc: 'Post updates, share ideas, and connect with classmates',
      color: '#9333ea',
    },
    {
      to: '/student/chat',
      icon: <ChatIcon size={20} color="#f59e0b" />,
      label: 'Student Chat',
      desc: 'Talk to teachers and ask questions instantly',
      color: '#f59e0b',
    },
  ]

  const stats = useMemo(
    () => [
      { label: 'Subjects', value: subjectsCount, icon: <BookIcon size={18} color={c.textMuted} /> },
      { label: 'Assignments', value: assignmentsCount, icon: <ClipboardIcon size={18} color={c.textMuted} /> },
      { label: 'Announcements', value: announcements.length, icon: <MegaphoneIcon size={18} color={c.textMuted} /> },
    ],
    [subjectsCount, assignmentsCount, announcements.length]
  )

  const cardStyle = {
    borderRadius: 28,
    border: `1px solid ${c.border}`,
    background: c.card,
    boxShadow: '0 24px 70px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  }

  const firstName = user?.full_name?.split(' ')?.[0] || 'Student'

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

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
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#2563eb',
                letterSpacing: '0.03em',
              }}
            >
              STUDENT DASHBOARD
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              gap: 20,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: c.textMuted,
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                {greeting}
              </div>

              <h1
                style={{
                  margin: '0 0 12px',
                  fontSize: 40,
                  fontWeight: 900,
                  color: c.text,
                  lineHeight: 1.05,
                  letterSpacing: '-0.04em',
                }}
              >
                Welcome back, {firstName}
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: c.textMuted,
                  lineHeight: 1.8,
                  maxWidth: 700,
                }}
              >
                Stay focused, continue your learning journey, and keep everything in one beautiful, organized workspace.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginTop: 22,
                }}
              >
                <Link
                  to="/student/assignments"
                  style={{
                    textDecoration: 'none',
                    padding: '13px 18px',
                    borderRadius: 16,
                    background: '#2563eb',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: 13,
                    boxShadow: '0 16px 32px rgba(37,99,235,0.24)',
                  }}
                >
                  Open Assignments
                </Link>

                <Link
                  to="/student/feed"
                  style={{
                    textDecoration: 'none',
                    padding: '13px 18px',
                    borderRadius: 16,
                    background: c.input,
                    color: c.text,
                    fontWeight: 700,
                    fontSize: 13,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  Visit Feed
                </Link>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
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
                  Today’s Focus
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: c.text,
                    marginBottom: 6,
                  }}
                >
                  Learn. Build. Grow.
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: c.textMuted,
                    lineHeight: 1.7,
                  }}
                >
                  Keep moving forward with your lessons, assignments, and class community.
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
                  Learning Mode
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: c.text,
                    marginBottom: 4,
                  }}
                >
                  Premium Student Space
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: c.textMuted,
                    lineHeight: 1.7,
                  }}
                >
                  Your academic hub for subjects, assignments, messages, meetings, and updates.
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

      {/* QUICK ACTIONS */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{ marginBottom: 28 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 6px',
                fontSize: 24,
                fontWeight: 900,
                color: c.text,
                letterSpacing: '-0.02em',
              }}
            >
              Quick Actions
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: c.textMuted,
              }}
            >
              Jump directly into the most important parts of your student workspace.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          {quickActions.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link
                to={item.to}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: '20px 20px',
                  borderRadius: 24,
                  background: c.card,
                  border: `1px solid ${c.border}`,
                  boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
                  minHeight: 120,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    background: `${item.color}18`,
                    color: item.color,
                    flexShrink: 0,
                    border: `1px solid ${item.color}22`,
                  }}
                >
                  {item.icon}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: c.text,
                      marginBottom: 6,
                      fontSize: 16,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: c.textMuted,
                      lineHeight: 1.7,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ANNOUNCEMENTS */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 6px',
                fontSize: 24,
                fontWeight: 900,
                color: c.text,
                letterSpacing: '-0.02em',
              }}
            >
              Announcements
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: c.textMuted,
              }}
            >
              Stay updated with new information from your school and teachers.
            </p>
          </div>
        </div>

        {announcements.length === 0 && (
          <div
            style={{
              ...cardStyle,
              padding: '56px 24px',
              textAlign: 'center',
              color: c.textFaint,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><MegaphoneIcon size={42} color={c.textFaint} /></div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: c.text,
                marginBottom: 8,
              }}
            >
              No announcements yet
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: c.textMuted,
                lineHeight: 1.7,
              }}
            >
              When teachers publish important updates, they will appear here.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {announcements.map((a, index) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 + index * 0.04 }}
              style={{
                ...cardStyle,
                padding: '22px 22px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -30,
                  right: -20,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(37,99,235,0.08)',
                  filter: 'blur(24px)',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      color: c.text,
                      fontSize: 18,
                      lineHeight: 1.3,
                    }}
                  >
                    {a.title}
                  </div>

                  <div
                    style={{
                      padding: '7px 12px',
                      borderRadius: 999,
                      background: 'rgba(37,99,235,0.10)',
                      border: '1px solid rgba(37,99,235,0.16)',
                      color: '#2563eb',
                      fontSize: 12,
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Announcement
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 14,
                    color: c.textMuted,
                    lineHeight: 1.8,
                    marginBottom: 12,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {a.body}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: c.textFaint,
                  }}
                >
                  {a.author_name} · {new Date(a.created_at).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}