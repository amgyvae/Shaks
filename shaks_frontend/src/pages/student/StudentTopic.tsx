import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { CheckCircleIcon, VideoIcon, LockIcon, XCircleIcon, FileTextIcon, ArrowUpCircleIcon, ClockIcon, BrainIcon, BookIcon, SparklesIcon, CheckIcon, FileIcon } from '../../assets/icons/Icons'

interface Quiz {
  id: number
  question: string
  option_a: string
  option_b: string
  option_c?: string
  option_d?: string
  topic: number
}

interface SavedResult {
  correct: number
  total: number
  passed: boolean
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

function getVideoId(url: string) {
  if (!url) return ''
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : ''
}

function storageKey(userId: number, topicId: string) {
  return `quiz_result_${userId}_${topicId}`
}

export default function StudentTopic() {
  const { topicId } = useParams()
  const nav = useNavigate()
  const { c } = useTheme()
  const { user } = useAuth()

  const [topic, setTopic] = useState<any>(null)
  const [moduleTopics, setModuleTopics] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [results, setResults] = useState<Record<number, { is_correct: boolean; correct_answer: string }>>({})
  const [submitted, setSubmitted] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [videoWatched, setVideoWatched] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [savedResult, setSavedResult] = useState<SavedResult | null>(null)
  const [redoing, setRedoing] = useState(false)

  const [topicAssignment, setTopicAssignment] = useState<any>(null)
  const [topicSubmission, setTopicSubmission] = useState<any>(null)
  const [topicSubFile, setTopicSubFile] = useState<File | null>(null)
  const [topicSubUploading, setTopicSubUploading] = useState(false)
  const [topicSubOk, setTopicSubOk] = useState('')

  const topicSubRef = useRef<HTMLInputElement>(null)
  const playerRef = useRef<any>(null)
  const apiReadyRef = useRef(false)

  const playerDivId = `yt-player-${topicId}`

  const markWatched = async () => {
    if (videoWatched || !topicId) return
    setVideoWatched(true)

    try {
      await api.post(`/courses/topics/${topicId}/watched/`)
    } catch {}

    if (user) {
      localStorage.setItem(`video_watched_${user.id}_${topicId}`, '1')
    }
  }

  useEffect(() => {
    if (!topicId || !user) return

    setSubmitted(false)
    setAnswers({})
    setResults({})
    setShowQuiz(false)
    setCorrectCount(0)
    setRedoing(false)
    setVideoWatched(false)
    setTopicSubOk('')

    const key = storageKey(user.id, topicId)
    const saved = localStorage.getItem(key)
    setSavedResult(saved ? JSON.parse(saved) : null)

    api.get('/courses/watched/')
      .then((r) => {
        const ids: number[] = r.data.watched_topic_ids ?? []
        const alreadyWatched = ids.includes(Number(topicId))
        setVideoWatched(alreadyWatched)
        if (alreadyWatched) {
          localStorage.setItem(`video_watched_${user.id}_${topicId}`, '1')
        }
      })
      .catch(() => {
        const local = !!localStorage.getItem(`video_watched_${user.id}_${topicId}`)
        setVideoWatched(local)
      })

    api.get(`/courses/topics/${topicId}/`)
      .then((r) => {
        setTopic(r.data)
        if (r.data.module) {
          api.get('/courses/topics/', { params: { module: r.data.module } })
            .then((rr) => setModuleTopics(rr.data.results ?? rr.data))
            .catch(() => setModuleTopics([]))
        }
      })

    api.get('/quizzes/', { params: { topic: topicId } })
      .then((r) => setQuizzes(r.data.results ?? r.data))
      .catch(() => setQuizzes([]))

    api.get('/assignments/assignments/', { params: { topic: topicId } })
      .then(async (r) => {
        const list: any[] = r.data.results ?? r.data
        const asgn =
          list.find((a: any) => String(a.topic) === String(topicId)) ??
          list[0] ??
          null

        setTopicAssignment(asgn)

        if (asgn) {
          const subs = await api.get('/assignments/submissions/')
          const all: any[] = subs.data.results ?? subs.data
          setTopicSubmission(all.find((s) => s.assignment === asgn.id) ?? null)
        }
      })
      .catch(() => {
        setTopicAssignment(null)
        setTopicSubmission(null)
      })
  }, [topicId, user])

  useEffect(() => {
    if (!topic?.video_url) return
    const videoId = getVideoId(topic.video_url)
    if (!videoId) return

    const createPlayer = () => {
      if (!window.YT || !window.YT.Player) return

      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }

      playerRef.current = new window.YT.Player(playerDivId, {
        videoId,
        width: '100%',
        height: '460',
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              markWatched()
            }
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      createPlayer()
      apiReadyRef.current = true
    } else if (!apiReadyRef.current) {
      apiReadyRef.current = true
      window.onYouTubeIframeAPIReady = createPlayer
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    } else {
      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval)
          createPlayer()
        }
      }, 100)
      return () => clearInterval(interval)
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [topic])

  const opts = (q: Quiz) => {
    const o = [
      { k: 'A', v: q.option_a },
      { k: 'B', v: q.option_b },
    ]
    if (q.option_c) o.push({ k: 'C', v: q.option_c })
    if (q.option_d) o.push({ k: 'D', v: q.option_d })
    return o
  }

  const submitQuiz = async () => {
    let correct = 0
    const res: Record<number, { is_correct: boolean; correct_answer: string }> = {}

    for (const q of quizzes) {
      try {
        const { data } = await api.post('/quizzes/submit/', {
          quiz: q.id,
          answer: answers[q.id],
        })
        res[q.id] = data
        if (data.is_correct) correct++
      } catch {
        res[q.id] = { is_correct: false, correct_answer: '' }
      }
    }

    setResults(res)
    setCorrectCount(correct)
    setSubmitted(true)

    const passed = quizzes.length > 0 ? correct / quizzes.length >= 0.5 : false
    const result: SavedResult = { correct, total: quizzes.length, passed }

    if (user && topicId) {
      localStorage.setItem(storageKey(user.id, topicId), JSON.stringify(result))
      setSavedResult(result)
    }
  }

  const startRedo = () => {
    setRedoing(true)
    setSubmitted(false)
    setAnswers({})
    setResults({})
    setCorrectCount(0)
    setShowQuiz(false)
  }

  const uploadTopicSub = async () => {
    if (!topicSubFile || !topicAssignment) return
    setTopicSubUploading(true)

    try {
      const fd = new FormData()
      fd.append('assignment', String(topicAssignment.id))
      fd.append('file', topicSubFile)

      const { data } = await api.post('/assignments/submissions/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setTopicSubmission(data)
      setTopicSubFile(null)
      setTopicSubOk('Submitted successfully!')
      setTimeout(() => setTopicSubOk(''), 3000)
    } finally {
      setTopicSubUploading(false)
    }
  }

  const hasQuizzes = quizzes.length > 0
  const isPassed = savedResult?.passed ?? false
  const videoId = getVideoId(topic?.video_url ?? '')

  const totalAnswered = useMemo(
    () => Object.keys(answers).length,
    [answers]
  )

  const scorePercent =
    quizzes.length > 0 ? Math.round((correctCount / quizzes.length) * 100) : 0

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
    padding: '14px 16px',
    borderRadius: 18,
    border: `1.5px solid ${c.inputBorder}`,
    background: c.input,
    color: c.text,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  if (!topic) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '90px 20px',
          color: c.textFaint,
          fontSize: 15,
        }}
      >
        Loading topic...
      </div>
    )
  }

  return (
    <div style={{ padding: '2px 0 10px' }}>
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => nav(-1)}
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
        ← Back
      </motion.button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px minmax(0, 1fr)',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* LEFT SIDEBAR */}
        <motion.aside
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            ...cardStyle,
            padding: 18,
            position: 'sticky',
            top: 16,
          }}
        >
          <div
            style={{
              marginBottom: 14,
              padding: '16px 16px',
              borderRadius: 22,
              background: 'linear-gradient(135deg, rgba(37,99,235,0.10), rgba(99,102,241,0.08))',
              border: '1px solid rgba(37,99,235,0.16)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#2563eb',
                marginBottom: 8,
              }}
            >
              Current Lesson
            </div>

            <div
              style={{
                fontWeight: 900,
                color: c.text,
                fontSize: 18,
                lineHeight: 1.3,
                marginBottom: 10,
              }}
            >
              {topic.title}
            </div>

            {hasQuizzes && (
              <div
                style={{
                  fontSize: 13,
                  color: c.textMuted,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <BrainIcon size={14} style={{ marginRight: 6 }} />{quizzes.length} quiz question{quizzes.length > 1 ? 's' : ''}
              </div>
            )}

            {isPassed && (
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 14,
                  background: 'rgba(34,197,94,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid rgba(34,197,94,0.18)',
                }}
              >
                <span style={{ fontSize: 15 }}><CheckCircleIcon size={15} color="#22c55e" /></span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#22c55e',
                  }}
                >
                  Completed · {savedResult!.correct}/{savedResult!.total} correct
                </span>
              </div>
            )}
          </div>

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
              Progress
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: c.text,
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              {videoWatched ? 'Unlocked' : 'Locked'}
            </div>

            <div
              style={{
                fontSize: 13,
                color: c.textMuted,
                lineHeight: 1.7,
              }}
            >
              {videoWatched
                ? 'Video completed. Quiz and assignment are available.'
                : 'Watch the lesson video fully to unlock the quiz.'}
            </div>
          </div>

          {moduleTopics.filter((t) => t.id !== topic.id).length > 0 && (
            <div
              style={{
                borderRadius: 22,
                overflow: 'hidden',
                background: c.input,
                border: `1px solid ${c.border}`,
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: c.textFaint,
                  borderBottom: `1px solid ${c.border}`,
                }}
              >
                More in this module
              </div>

              {moduleTopics
                .filter((t) => t.id !== topic.id)
                .map((t, idx, arr) => (
                  <button
                    key={t.id}
                    onClick={() => nav(`/student/topic/${t.id}`)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderBottom:
                        idx !== arr.length - 1 ? `1px solid ${c.navBorder}` : 'none',
                    }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0 }}><VideoIcon size={14} color="currentColor" style={{ flexShrink: 0 }} /></span>
                    <span
                      style={{
                        fontSize: 13,
                        color: c.textMuted,
                        lineHeight: 1.5,
                      }}
                    >
                      {t.title}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </motion.aside>

        {/* MAIN CONTENT */}
        <motion.main
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ minWidth: 0 }}
        >
          {/* HERO */}
          <div
            style={{
              ...cardStyle,
              padding: 28,
              marginBottom: 22,
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
                  fontSize: 12,
                  color: c.textFaint,
                  marginBottom: 10,
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <span>Module</span>
                <span>›</span>
                <span style={{ color: c.text }}>{topic.title}</span>
              </div>

              <h1
                style={{
                  margin: '0 0 10px',
                  fontSize: 36,
                  fontWeight: 900,
                  color: c.text,
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                }}
              >
                {topic.title}
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: 14.5,
                  color: c.textMuted,
                  lineHeight: 1.8,
                  maxWidth: 760,
                }}
              >
                Watch the lesson, review the explanation, complete the quiz, and submit the assignment if available.
              </p>
            </div>
          </div>

          {/* COMPLETED BANNER */}
          {isPassed && !redoing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                ...cardStyle,
                padding: '20px 22px',
                marginBottom: 20,
                background: 'rgba(34,197,94,0.08)',
                border: '1.5px solid rgba(34,197,94,0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 18,
                    color: '#22c55e',
                    marginBottom: 5,
                  }}
                >
                  You completed this topic!
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: c.textMuted,
                  }}
                >
                  Score:{' '}
                  <strong style={{ color: c.text }}>
                    {savedResult!.correct} out of {savedResult!.total}
                  </strong>{' '}
                  correct ({Math.round((savedResult!.correct / savedResult!.total) * 100)}%)
                </div>
              </div>

              <button
                onClick={startRedo}
                style={{
                  padding: '11px 20px',
                  borderRadius: 16,
                  border: '1.5px solid #22c55e',
                  background: 'transparent',
                  color: '#22c55e',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Redo quiz
              </button>
            </motion.div>
          )}

          {/* VIDEO */}
          {(topic.video_url && videoId) || topic.video_file ? (
            <div
              style={{
                ...cardStyle,
                overflow: 'hidden',
                marginBottom: 22,
                background: '#000',
                position: 'relative',
              }}
            >
              {topic.video_url && videoId && (
                <div
                  id={playerDivId}
                  style={{
                    width: '100%',
                    height: 460,
                    display: 'block',
                    background: '#000',
                  }}
                />
              )}

              {topic.video_file && (
                <video
                  controls
                  style={{
                    width: '100%',
                    maxHeight: 500,
                    display: 'block',
                    background: '#000',
                  }}
                  onEnded={() => {
                    markWatched()
                  }}
                >
                  <source src={topic.video_file} />
                  Your browser does not support video playback.
                </video>
              )}

              {!videoWatched && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '14px 20px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.82))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    pointerEvents: 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.86)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <LockIcon size={16} color="currentColor" style={{ marginRight: 6 }} />Watch the full video to unlock the quiz
                  </span>
                </div>
              )}

              {videoWatched && hasQuizzes && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '14px 20px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.82))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    pointerEvents: 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: '#86efac',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <CheckCircleIcon size={16} color="#22c55e" style={{ marginRight: 6 }} />Video complete — quiz unlocked below
                  </span>
                </div>
              )}
            </div>
          ) : (
            !videoWatched && (
              <div
                style={{
                  ...cardStyle,
                  padding: '20px 22px',
                  marginBottom: 22,
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: c.textMuted,
                    marginBottom: 12,
                  }}
                >
                  No video is attached to this topic.
                </p>

                <button
                  onClick={() => setVideoWatched(true)}
                  style={{
                    padding: '11px 20px',
                    borderRadius: 16,
                    background: '#2563eb',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: 13,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Proceed to quiz →
                </button>
              </div>
            )
          )}

          {/* EXPLANATION + EXAMPLE */}
          {(topic.explanation || topic.example) && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  topic.explanation && topic.example ? '1fr 1fr' : '1fr',
                gap: 16,
                marginBottom: 22,
              }}
            >
              {topic.explanation && (
                <div style={{ ...cardStyle, padding: '22px 22px' }}>
                  <div
                    style={{
                      fontWeight: 900,
                      color: c.text,
                      fontSize: 16,
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <BookIcon size={14} style={{ marginRight: 6 }} />Explanation
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: c.textMuted,
                      lineHeight: 1.9,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {topic.explanation}
                  </div>
                </div>
              )}

              {topic.example && (
                <div style={{ ...cardStyle, padding: '22px 22px' }}>
                  <div
                    style={{
                      fontWeight: 900,
                      color: c.text,
                      fontSize: 16,
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <SparklesIcon size={14} style={{ marginRight: 6 }} />Example
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: c.textMuted,
                      lineHeight: 1.9,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {topic.example}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QUIZ */}
          {hasQuizzes && (
            <>
              {!videoWatched && (topic.video_url || topic.video_file) && (
                <div
                  style={{
                    ...cardStyle,
                    padding: '20px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    marginBottom: 22,
                    borderStyle: 'dashed',
                  }}
                >
                  <LockIcon size={30} color={c.textFaint} />
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        color: c.text,
                        fontSize: 15,
                        marginBottom: 5,
                      }}
                    >
                      Quiz is locked
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: c.textMuted,
                      }}
                    >
                      Watch the full video above to unlock the quiz.
                    </div>
                  </div>
                </div>
              )}

              {videoWatched && !showQuiz && !submitted && (
                <button
                  onClick={() => setShowQuiz(true)}
                  style={{
                    padding: '13px 24px',
                    borderRadius: 16,
                    border: '1.5px solid #2563eb',
                    background: 'rgba(37,99,235,0.08)',
                    color: '#2563eb',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    marginBottom: 22,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <BrainIcon size={14} style={{ marginRight: 6 }} />Start quiz ({quizzes.length} question{quizzes.length > 1 ? 's' : ''})
                </button>
              )}

              {videoWatched && showQuiz && !submitted && (
                <div style={{ ...cardStyle, overflow: 'hidden', marginBottom: 22 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 20px',
                      borderBottom: `1px solid ${c.border}`,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 900,
                        color: c.text,
                        fontSize: 18,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <BrainIcon size={14} style={{ marginRight: 6 }} />Quiz
                    </span>

                    <span
                      style={{
                        fontSize: 13,
                        color: c.textFaint,
                        fontWeight: 700,
                      }}
                    >
                      {totalAnswered} / {quizzes.length} answered
                    </span>
                  </div>

                  <div style={{ padding: '22px 20px' }}>
                    {quizzes.map((q, i) => (
                      <div key={q.id} style={{ marginBottom: 30 }}>
                        <p
                          style={{
                            fontWeight: 800,
                            color: c.text,
                            fontSize: 15,
                            marginBottom: 14,
                            lineHeight: 1.6,
                          }}
                        >
                          <span style={{ color: c.textFaint, marginRight: 6 }}>
                            {i + 1}.
                          </span>
                          {q.question}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {opts(q).map((o) => {
                            const sel = answers[q.id] === o.k

                            return (
                              <motion.button
                                key={o.k}
                                whileTap={{ scale: 0.985 }}
                                onClick={() =>
                                  setAnswers((p) => ({ ...p, [q.id]: o.k }))
                                }
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 12,
                                  padding: '13px 16px',
                                  borderRadius: 16,
                                  border: `1.5px solid ${sel ? '#2563eb' : c.inputBorder}`,
                                  background: sel ? 'rgba(37,99,235,0.10)' : c.input,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                }}
                              >
                                <span
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 900,
                                    flexShrink: 0,
                                    background: sel ? '#2563eb' : c.border,
                                    color: sel ? 'white' : c.textMuted,
                                  }}
                                >
                                  {o.k}
                                </span>

                                <span
                                  style={{
                                    fontSize: 13.5,
                                    color: sel ? c.text : c.textMuted,
                                    fontWeight: sel ? 700 : 500,
                                    lineHeight: 1.6,
                                  }}
                                >
                                  {o.v}
                                </span>
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={submitQuiz}
                      disabled={quizzes.some((q) => !answers[q.id])}
                      style={{
                        padding: '12px 26px',
                        borderRadius: 16,
                        background: '#2563eb',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: 14,
                        border: 'none',
                        cursor: 'pointer',
                        opacity: quizzes.some((q) => !answers[q.id]) ? 0.45 : 1,
                        boxShadow: '0 16px 32px rgba(37,99,235,0.24)',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <CheckIcon size={14} style={{ marginRight: 6 }} />Submit answers
                    </button>
                  </div>
                </div>
              )}

              {submitted && (
                <div style={{ ...cardStyle, overflow: 'hidden', marginBottom: 22 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 20px',
                      borderBottom: `1px solid ${c.border}`,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 900,
                        color: c.text,
                        fontSize: 18,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <BrainIcon size={14} style={{ marginRight: 6 }} />Quiz Results
                    </span>
                  </div>

                  <div style={{ padding: '24px 20px' }}>
                    <div style={{ marginBottom: 20 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                          gap: 10,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: c.text,
                          }}
                        >
                          {correctCount} out of {quizzes.length} correct
                        </span>

                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 900,
                            color: scorePercent >= 50 ? '#22c55e' : '#ef4444',
                          }}
                        >
                          {scorePercent}%
                        </span>
                      </div>

                      <div
                        style={{
                          height: 10,
                          borderRadius: 999,
                          background: c.border,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${scorePercent}%`,
                            borderRadius: 999,
                            background:
                              scorePercent >= 50
                                ? '#22c55e'
                                : '#ef4444',
                            transition: 'width 0.6s ease',
                          }}
                        />
                      </div>
                    </div>

                    {scorePercent >= 50 ? (
                      <div
                        style={{
                          padding: '18px 20px',
                          borderRadius: 18,
                          background: 'rgba(34,197,94,0.08)',
                          border: '1px solid rgba(34,197,94,0.28)',
                          marginBottom: 18,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: 18,
                            color: '#22c55e',
                            marginBottom: 5,
                          }}
                        >
                          {correctCount === quizzes.length ? 'Perfect score!' : 'Passed!'}
                        </div>

                        <p
                          style={{
                            fontSize: 13,
                            color: c.textMuted,
                            margin: 0,
                            lineHeight: 1.7,
                          }}
                        >
                          {correctCount === quizzes.length
                            ? 'Outstanding work. You answered every question correctly.'
                            : 'Great job. You passed this topic successfully.'}
                        </p>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '18px 20px',
                          borderRadius: 18,
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.28)',
                          marginBottom: 18,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: 18,
                            color: '#ef4444',
                            marginBottom: 5,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <XCircleIcon size={16} color="#ef4444" style={{ marginRight: 6 }} />Not passed
                        </div>

                        <p
                          style={{
                            fontSize: 13,
                            color: c.textMuted,
                            margin: 0,
                            lineHeight: 1.7,
                          }}
                        >
                          You need at least 50% to pass. Review the material and try the quiz again.
                        </p>

                        <button
                          onClick={startRedo}
                          style={{
                            marginTop: 14,
                            padding: '10px 18px',
                            borderRadius: 14,
                            background: '#2563eb',
                            color: 'white',
                            fontWeight: 800,
                            fontSize: 13,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Try again
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {quizzes.map((q, i) => {
                        const r = results[q.id]
                        const chosen = answers[q.id]

                        return (
                          <div
                            key={q.id}
                            style={{
                              padding: '15px 16px',
                              borderRadius: 16,
                              background: r?.is_correct
                                ? 'rgba(34,197,94,0.06)'
                                : 'rgba(239,68,68,0.06)',
                              border: `1px solid ${
                                r?.is_correct
                                  ? 'rgba(34,197,94,0.24)'
                                  : 'rgba(239,68,68,0.24)'
                              }`,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 13.5,
                                fontWeight: 800,
                                color: c.text,
                                marginBottom: 7,
                                lineHeight: 1.6,
                              }}
                            >
                              <span style={{ color: c.textFaint, marginRight: 6 }}>
                                {i + 1}.
                              </span>
                              {q.question}
                            </div>

                            <div
                              style={{
                                fontSize: 12.5,
                                color: c.textMuted,
                                lineHeight: 1.7,
                              }}
                            >
                              Your answer:{' '}
                              <strong style={{ color: chosen ? c.text : '#ef4444' }}>
                                {chosen || 'not answered'}
                              </strong>
                              {!r?.is_correct && r?.correct_answer && (
                                <>
                                  {' '}· Correct:{' '}
                                  <strong style={{ color: '#22c55e' }}>
                                    {r.correct_answer}
                                  </strong>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ASSIGNMENT */}
          {topicAssignment && videoWatched && (
            <div
              style={{
                ...cardStyle,
                overflow: 'hidden',
                marginTop: 24,
              }}
            >
              <div
                style={{
                  padding: '18px 20px',
                  borderBottom: `1px solid ${c.border}`,
                  fontWeight: 900,
                  color: c.text,
                  fontSize: 17,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <FileTextIcon size={14} color="currentColor" style={{ marginRight: 6 }} />Assignment: {topicAssignment.title}
              </div>

              <div
                style={{
                  padding: 20,
                  display: 'grid',
                  gridTemplateColumns: '1fr 280px',
                  gap: 20,
                  alignItems: 'start',
                }}
              >
                {/* LEFT */}
                <div>
                  {topicAssignment.instructions && (
                    <p
                      style={{
                        fontSize: 13.5,
                        color: c.textMuted,
                        marginBottom: 14,
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {topicAssignment.instructions}
                    </p>
                  )}

                  {topicAssignment.task_file && (
                    <a
                      href={topicAssignment.task_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '11px 18px',
                        borderRadius: 16,
                        background: 'rgba(37,99,235,0.10)',
                        color: '#2563eb',
                        fontWeight: 800,
                        fontSize: 13,
                        textDecoration: 'none',
                        marginBottom: 14,
                        border: '1px solid rgba(37,99,235,0.16)',
                      }}
                    >
                      <FileIcon size={14} style={{ marginRight: 6 }} />Download task file
                    </a>
                  )}

                  {topicSubmission && (
                    <div
                      style={{
                        padding: '14px 16px',
                        borderRadius: 18,
                        background: c.input,
                        border: `1px solid ${c.border}`,
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          color: c.textFaint,
                          marginBottom: 6,
                          fontSize: 12,
                        }}
                      >
                        Your submission status
                      </div>

                      <span
                        style={{
                          fontWeight: 800,
                          color:
                            topicSubmission.status === 'approved'
                              ? '#22c55e'
                              : topicSubmission.status === 'rejected'
                              ? '#ef4444'
                              : '#eab308',
                        }}
                      >
                        {topicSubmission.status === 'approved'
                          ? 'Approved'
                          : topicSubmission.status === 'rejected'
                          ? 'Needs correction'
                          : 'Pending review'}
                      </span>

                      {topicSubmission.grade && (
                        <div
                          style={{
                            marginTop: 8,
                            color: c.textMuted,
                          }}
                        >
                          Grade:{' '}
                          <strong style={{ color: c.text }}>
                            {topicSubmission.grade}
                          </strong>
                        </div>
                      )}

                      {topicSubmission.feedback && (
                        <div
                          style={{
                            marginTop: 8,
                            color: c.textMuted,
                            lineHeight: 1.7,
                          }}
                        >
                          Feedback: {topicSubmission.feedback}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT */}
                <div>
                  <div
                    onClick={() => topicSubRef.current?.click()}
                    style={{
                      padding: '24px 18px',
                      borderRadius: 18,
                      border: `2px dashed ${c.inputBorder}`,
                      background: c.input,
                      textAlign: 'center',
                      cursor: 'pointer',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><ArrowUpCircleIcon size={28} color={c.textMuted} /></div>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: c.textMuted,
                        margin: 0,
                        lineHeight: 1.7,
                      }}
                    >
                      {topicSubFile
                        ? `✓ ${topicSubFile.name}`
                        : topicSubmission
                        ? 'Choose a new file to resubmit'
                        : 'Upload your answer file'}
                    </p>
                  </div>

                  <input
                    ref={topicSubRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => setTopicSubFile(e.target.files?.[0] ?? null)}
                  />

                  <button
                    onClick={uploadTopicSub}
                    disabled={!topicSubFile || topicSubUploading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 16,
                      background: '#2563eb',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: 13,
                      border: 'none',
                      cursor: 'pointer',
                      opacity: !topicSubFile || topicSubUploading ? 0.5 : 1,
                      boxShadow: '0 16px 32px rgba(37,99,235,0.24)',
                    }}
                  >
                    {topicSubUploading ? 'Uploading...' : 'Submit answer'}
                  </button>

                  {topicSubOk && (
                    <p
                      style={{
                        fontSize: 12,
                        color: '#22c55e',
                        marginTop: 10,
                        fontWeight: 700,
                      }}
                    >
                      {topicSubOk}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.main>
      </div>
    </div>
  )
}