import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { PuzzleIcon, BookIcon, CheckCircleIcon, PlayCircleIcon } from '../../assets/icons/Icons'

export default function StudentModules() {
  const { subjectId, gradeId } = useParams()
  const [modules, setModules] = useState<any[]>([])
  const [subject, setSubject] = useState<any>(null)
  const [grade, setGrade] = useState<any>(null)
  const [expanded, setExpanded] = useState<number | null>(0)
  const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set())
  const { c } = useTheme()
  const nav = useNavigate()

  useEffect(() => {
    api.get('/courses/subjects/')
      .then((r) => {
        const all = r.data.results ?? r.data
        setSubject(all.find((s: any) => s.id === Number(subjectId)) ?? null)
      })
      .catch(() => setSubject(null))

    api.get('/courses/grades/')
      .then((r) => {
        const all = r.data.results ?? r.data
        setGrade(all.find((g: any) => g.id === Number(gradeId)) ?? null)
      })
      .catch(() => setGrade(null))

    api.get('/courses/modules/', { params: { subject: subjectId, grade: gradeId } })
      .then((r) => {
        const mods = r.data.results ?? r.data
        setModules(mods)
        if (mods.length > 0) setExpanded(0)
      })
      .catch(() => setModules([]))

    api.get('/courses/watched/')
      .then((r) => {
        setWatchedIds(new Set(r.data.watched_topic_ids ?? []))
      })
      .catch(() => {})
  }, [subjectId, gradeId])

  const allTopics = useMemo(
    () => modules.flatMap((m: any) => m.topics || []),
    [modules]
  )

  const watchedCount = useMemo(
    () => allTopics.filter((t: any) => watchedIds.has(t.id)).length,
    [allTopics, watchedIds]
  )

  const completion =
    allTopics.length > 0 ? Math.round((watchedCount / allTopics.length) * 100) : 0

  const cardStyle = {
    borderRadius: 28,
    border: `1px solid ${c.border}`,
    background: c.card,
    boxShadow: '0 24px 70px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  }

  const stats: { label: string; value: number; icon: ReactNode }[] = [
    { label: 'Modules', value: modules.length, icon: <PuzzleIcon size={20} color="currentColor" /> },
    { label: 'Topics', value: allTopics.length, icon: <BookIcon size={20} color="currentColor" /> },
    { label: 'Watched', value: watchedCount, icon: <CheckCircleIcon size={20} color="currentColor" /> },
  ]

  return (
    <div style={{ padding: '2px 0 10px' }}>
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => nav('/student/subjects')}
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
          marginBottom: 20,
          padding: 0,
        }}
      >
        ← Back to Subjects
      </motion.button>

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
              MODULE SPACE
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: c.input,
                    border: `1px solid ${c.border}`,
                    fontSize: 12,
                    color: c.textMuted,
                    fontWeight: 700,
                  }}
                >
                  {subject?.name || 'Subject'}
                </span>

                {grade && (
                  <span
                    style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      background: 'rgba(37,99,235,0.10)',
                      border: '1px solid rgba(37,99,235,0.16)',
                      fontSize: 12,
                      color: '#2563eb',
                      fontWeight: 800,
                    }}
                  >
                    {grade.name}
                  </span>
                )}
              </div>

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
                {subject?.name || 'Modules'}
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
                Browse modules, open topics, and move through the subject with a clearer, more focused learning flow.
              </p>
            </div>

            <div
              style={{
                padding: '20px 20px',
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
                Progress
              </div>

              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: c.text,
                  lineHeight: 1,
                  marginBottom: 10,
                }}
              >
                {completion}%
              </div>

              <div
                style={{
                  width: '100%',
                  height: 10,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: `${completion}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: c.textMuted,
                  lineHeight: 1.7,
                }}
              >
                {watchedCount} of {allTopics.length} topics completed in this subject path.
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '380px minmax(0, 1fr)',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* LEFT SIDEBAR */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            ...cardStyle,
            padding: 18,
            position: 'sticky',
            top: 16,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: c.text,
                marginBottom: 6,
                letterSpacing: '-0.02em',
              }}
            >
              Modules
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: c.textMuted,
                lineHeight: 1.7,
              }}
            >
              Open a module and choose a topic to start learning.
            </p>
          </div>

          {subject?.description && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 18,
                background: c.input,
                border: `1px solid ${c.border}`,
                marginBottom: 14,
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
                Subject Description
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: c.textMuted,
                  lineHeight: 1.7,
                }}
              >
                {subject.description}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {modules.map((m, i) => {
              const topicCount = m.topics?.length || 0
              const moduleWatchedCount =
                m.topics?.filter((t: any) => watchedIds.has(t.id)).length || 0
              const allDone = topicCount > 0 && moduleWatchedCount === topicCount
              const open = expanded === i
              const percent =
                topicCount > 0 ? Math.round((moduleWatchedCount / topicCount) * 100) : 0

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    borderRadius: 22,
                    overflow: 'hidden',
                    background: open ? 'rgba(37,99,235,0.06)' : c.input,
                    border: open
                      ? '1px solid rgba(37,99,235,0.18)'
                      : `1px solid ${c.border}`,
                  }}
                >
                  <button
                    onClick={() => setExpanded(open ? null : i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '16px 16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 900,
                        flexShrink: 0,
                        background: allDone
                          ? '#22c55e'
                          : open
                          ? '#2563eb'
                          : c.border,
                        color: allDone || open ? 'white' : c.textMuted,
                      }}
                    >
                      {allDone ? '✓' : i + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          color: c.text,
                          fontSize: 14,
                          marginBottom: 5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {m.title}
                      </div>

                      <div
                        style={{
                          fontSize: 11.5,
                          color: c.textFaint,
                          marginBottom: 8,
                        }}
                      >
                        {topicCount} topic{topicCount !== 1 ? 's' : ''} · {moduleWatchedCount}/{topicCount} watched
                      </div>

                      <div
                        style={{
                          width: '100%',
                          height: 6,
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.06)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            borderRadius: 999,
                            background: allDone
                              ? '#22c55e'
                              : 'linear-gradient(90deg, #2563eb, #60a5fa)',
                          }}
                        />
                      </div>
                    </div>

                    <span style={{ color: c.textFaint, fontSize: 12 }}>
                      {open ? '▲' : '▼'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {open && topicCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          overflow: 'hidden',
                          borderTop: `1px solid ${c.border}`,
                        }}
                      >
                        {m.topics.map((t: any, topicIndex: number) => {
                          const watched = watchedIds.has(t.id)

                          return (
                            <motion.button
                              key={t.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: topicIndex * 0.03 }}
                              onClick={() => nav(`/student/topic/${t.id}`)}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '13px 16px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                borderBottom:
                                  topicIndex !== m.topics.length - 1
                                    ? `1px solid ${c.navBorder}`
                                    : 'none',
                              }}
                            >
                              <span style={{ fontSize: 15, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                {watched ? <CheckCircleIcon size={15} color="#22c55e" /> : <PlayCircleIcon size={15} color="currentColor" />}
                              </span>

                              <span
                                style={{
                                  fontSize: 13.5,
                                  color: watched ? c.text : c.textMuted,
                                  flex: 1,
                                  fontWeight: watched ? 700 : 500,
                                }}
                              >
                                {t.title}
                              </span>

                              {watched && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    padding: '4px 9px',
                                    borderRadius: 999,
                                    background: 'rgba(34,197,94,0.10)',
                                    color: '#22c55e',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap',
                                    border: '1px solid rgba(34,197,94,0.16)',
                                  }}
                                >
                                  Watched
                                </span>
                              )}
                            </motion.button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {modules.length === 0 && (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                borderRadius: 22,
                background: c.input,
                border: `1px solid ${c.border}`,
                color: c.textFaint,
                marginTop: 4,
              }}
            >
              No modules yet.
            </div>
          )}
        </motion.div>

        {/* RIGHT PANEL */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            ...cardStyle,
            minHeight: 560,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: `
              radial-gradient(circle at top right, rgba(37,99,235,0.08), transparent 25%),
              radial-gradient(circle at bottom left, rgba(168,85,247,0.08), transparent 22%),
              ${c.card}
            `,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -50,
              right: -20,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'rgba(37,99,235,0.10)',
              filter: 'blur(28px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: 28,
                margin: '0 auto 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(37,99,235,0.10)',
                border: '1px solid rgba(37,99,235,0.16)',
                boxShadow: '0 20px 40px rgba(37,99,235,0.10)',
              }}
            >
              <BookIcon size={44} color={c.textFaint} />
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: c.text,
                marginBottom: 10,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              Select a topic
            </div>

            <p
              style={{
                margin: '0 auto 20px',
                fontSize: 14,
                color: c.textMuted,
                lineHeight: 1.8,
                maxWidth: 500,
              }}
            >
              Choose a topic from the left sidebar to start learning. Your watched topics and progress are tracked automatically.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
                maxWidth: 620,
                margin: '0 auto',
              }}
            >
              {stats.map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '16px 14px',
                    borderRadius: 20,
                    background: c.input,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
                  <div
                    style={{
                      fontSize: 22,
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
                      fontSize: 12,
                      color: c.textMuted,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}