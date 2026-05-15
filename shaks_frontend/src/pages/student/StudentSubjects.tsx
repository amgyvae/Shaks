import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { SearchIcon, BookIcon, GraduationCapIcon } from '../../assets/icons/Icons'

const ILLUS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#0ea5e9', '#f97316', '#84cc16']
const CARD_COLORS = ['#1e3a5f', '#1a3a2a', '#3a1a2e', '#2a1f3a', '#1a2a3a', '#2e2a1a', '#1f2d1a', '#2a1a1a']
const CARD_COLORS_LIGHT = ['#dbeafe', '#dcfce7', '#fce7f3', '#ede9fe', '#cffafe', '#fef9c3', '#d1fae5', '#fee2e2']

export default function StudentSubjects() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')
  const { c, isDark } = useTheme()
  const nav = useNavigate()

  useEffect(() => {
    api.get('/courses/subjects/')
      .then((r) => setSubjects(r.data.results ?? r.data))
      .catch(() => setSubjects([]))

    api.get('/courses/grades/')
      .then((r) => setGrades(r.data.results ?? r.data))
      .catch(() => setGrades([]))
  }, [])

  const filtered = useMemo(
    () =>
      subjects.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [subjects, search]
  )

  const cardStyle = {
    borderRadius: 28,
    border: `1px solid ${c.border}`,
    background: c.card,
    boxShadow: '0 24px 70px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px 14px 42px',
    borderRadius: 18,
    border: `1.5px solid ${c.inputBorder}`,
    background: c.input,
    color: c.text,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  if (!selected) {
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
                SUBJECT DISCOVERY
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
                  Explore Your Subjects
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
                  Choose a subject, find the right grade, and enter a learning space designed to feel premium, organized, and inspiring.
                </p>

                <div style={{ position: 'relative', maxWidth: 360, marginTop: 22 }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: c.textFaint,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <SearchIcon size={14} color={c.textFaint} />
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search subjects..."
                    style={inputStyle}
                  />
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
                    Available Subjects
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: c.text,
                      marginBottom: 4,
                      lineHeight: 1,
                    }}
                  >
                    {subjects.length}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: c.textMuted,
                      lineHeight: 1.7,
                    }}
                  >
                    Browse your learning categories and open the one you want to study.
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
                    Learning Flow
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: c.text,
                      marginBottom: 4,
                    }}
                  >
                    Subject → Grade → Modules
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: c.textMuted,
                      lineHeight: 1.7,
                    }}
                  >
                    Everything is structured clearly so students can move through lessons with less confusion.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SUBJECT GRID */}
        <div style={{ marginBottom: 18 }}>
          <h2
            style={{
              margin: '0 0 6px',
              fontSize: 24,
              fontWeight: 900,
              color: c.text,
              letterSpacing: '-0.02em',
            }}
          >
            All Subjects
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: c.textMuted,
            }}
          >
            Pick a subject to continue your learning journey.
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            {filtered.map((s, i) => (
              <motion.button
                key={s.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => setSelected(s)}
                style={{
                  ...cardStyle,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 60,
                    background: isDark
                      ? CARD_COLORS[i % CARD_COLORS.length]
                      : CARD_COLORS_LIGHT[i % CARD_COLORS_LIGHT.length],
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.12))',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      fontSize: 11,
                      padding: '5px 10px',
                      borderRadius: 999,
                      background: 'rgba(0,0,0,0.28)',
                      color: 'white',
                      fontWeight: 800,
                      letterSpacing: '0.03em',
                    }}
                  >
                    SUBJECT
                  </span>
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    <BookIcon size={52} color={ILLUS[i % ILLUS.length]} />
                  </span>
                </div>

                <div
                  style={{
                    height: 4,
                    background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                  }}
                />

                <div style={{ padding: '18px 18px 20px' }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: c.text,
                      fontSize: 17,
                      marginBottom: 8,
                      lineHeight: 1.3,
                    }}
                  >
                    {s.name}
                  </div>

                  {s.description ? (
                    <div
                      style={{
                        fontSize: 13,
                        color: c.textMuted,
                        lineHeight: 1.7,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical' as any,
                        marginBottom: 14,
                      }}
                    >
                      {s.description}
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: 13,
                        color: c.textFaint,
                        lineHeight: 1.7,
                        marginBottom: 14,
                      }}
                    >
                      Open this subject to choose your grade and start studying modules.
                    </div>
                  )}

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#2563eb',
                    }}
                  >
                    Open Subject
                    <span style={{ fontSize: 14 }}>→</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...cardStyle,
              marginTop: 18,
              padding: '56px 24px',
              textAlign: 'center',
              color: c.textFaint,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><BookIcon size={44} color={c.textFaint} /></div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: c.text,
                marginBottom: 8,
              }}
            >
              No subjects found
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: c.textMuted,
                lineHeight: 1.7,
              }}
            >
              Try a different search term to find the subject you need.
            </p>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '2px 0 10px' }}>
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelected(null)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: '#2563eb',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 800,
          marginBottom: 22,
          padding: 0,
        }}
      >
        ← Back to Subjects
      </motion.button>

      {/* SUBJECT HERO */}
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
              SUBJECT SPACE
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 0.9fr',
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
                {selected.name}
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
                {selected.description ||
                  'Choose your grade below to open the correct module path and start learning inside this subject.'}
              </p>
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
                Next Step
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: c.text,
                  marginBottom: 4,
                }}
              >
                Select your grade
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: c.textMuted,
                  lineHeight: 1.7,
                }}
              >
                Your modules and lessons will open based on the grade you choose.
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* GRADE CARDS */}
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
          Choose Grade
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: c.textMuted,
          }}
        >
          Open the subject content for the class level you need.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {grades.map((g, index) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => nav(`/student/modules/${selected.id}/${g.id}`)}
            style={{
              ...cardStyle,
              padding: '22px 20px',
              textAlign: 'left',
              cursor: 'pointer',
              background: `
                radial-gradient(circle at top right, rgba(37,99,235,0.08), transparent 30%),
                ${c.card}
              `,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                background: 'rgba(37,99,235,0.10)',
                border: '1px solid rgba(37,99,235,0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                marginBottom: 14,
              }}
            >
              <GraduationCapIcon size={24} color="#2563eb" />
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: c.text,
                marginBottom: 6,
              }}
            >
              {g.name}
            </div>

            <div
              style={{
                fontSize: 13,
                color: c.textMuted,
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              Open modules and lessons for this grade in {selected.name}.
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                fontWeight: 800,
                color: '#2563eb',
              }}
            >
              View Modules
              <span style={{ fontSize: 14 }}>→</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}