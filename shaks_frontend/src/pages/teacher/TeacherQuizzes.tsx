import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { BookIcon, PackageIcon, VideoIcon, BrainIcon } from '../../assets/icons/Icons'

type QuizForm = {
  topic: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
}

const EMPTY_FORM: QuizForm = {
  topic: '',
  question: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'A',
}

export default function TeacherQuizzes() {
  const { c, theme } = useTheme()

  const [subjects, setSubjects] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])

  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [selectedTopic, setSelectedTopic] = useState<any>(null)

  const [form, setForm] = useState<QuizForm>(EMPTY_FORM)
  const [editingQuiz, setEditingQuiz] = useState<any>(null)
  const [editForm, setEditForm] = useState<QuizForm>(EMPTY_FORM)

  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(true)

  useEffect(() => {
    api.get('/courses/subjects/').then((r) => setSubjects(r.data.results ?? r.data))
    api.get('/courses/modules/').then((r) => setModules(r.data.results ?? r.data))
    api.get('/courses/topics/').then((r) => setTopics(r.data.results ?? r.data))
    api.get('/quizzes/').then((r) => setQuizzes(r.data.results ?? r.data))
  }, [])

  useEffect(() => {
    if (selectedTopic) {
      setForm((p) => ({ ...p, topic: String(selectedTopic.id) }))
    }
  }, [selectedTopic])

  const sf = (k: keyof QuizForm) => (e: any) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const sef = (k: keyof QuizForm) => (e: any) =>
    setEditForm((p) => ({ ...p, [k]: e.target.value }))

  const showMsg = (msg: string, isErr = false) => {
    if (isErr) {
      setErr(msg)
      setTimeout(() => setErr(''), 4000)
    } else {
      setSuccess(msg)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const add = async () => {
    if (
      !form.topic ||
      !form.question.trim() ||
      !form.option_a.trim() ||
      !form.option_b.trim()
    ) {
      showMsg('Topic, question, and at least options A & B are required', true)
      return
    }

    try {
      const { data } = await api.post('/quizzes/', form)
      setQuizzes((p) => [data, ...p])
      setForm((p) => ({ ...EMPTY_FORM, topic: p.topic }))
      showMsg('Question added!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Error'), true)
    }
  }

  const startEdit = (q: any) => {
    setEditingQuiz(q)
    setEditForm({
      topic: String(q.topic),
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_answer: q.correct_answer,
    })
  }

  const saveEdit = async () => {
    if (!editForm.question.trim() || !editForm.option_a.trim() || !editForm.option_b.trim()) {
      showMsg('Question and options A & B are required', true)
      return
    }

    try {
      const { data } = await api.patch(`/quizzes/${editingQuiz.id}/`, editForm)
      setQuizzes((p) => p.map((q) => (q.id === editingQuiz.id ? { ...q, ...data } : q)))
      setEditingQuiz(null)
      showMsg('Question updated!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Error'), true)
    }
  }

  const del = async (id: number) => {
    if (!confirm('Delete this question?')) return
    try {
      await api.delete(`/quizzes/${id}/`)
      setQuizzes((p) => p.filter((q) => q.id !== id))
      showMsg('Question deleted!')
    } catch {
      showMsg('Cannot delete', true)
    }
  }

  const panelStyle = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderRadius: 30,
    background: c.card,
    border: `1px solid ${c.border}`,
    boxShadow: '0 22px 50px rgba(0,0,0,0.06)',
  }

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

  const editBtn = {
    padding: '9px 14px',
    borderRadius: 12,
    background: 'rgba(37,99,235,0.10)',
    color: '#2563eb',
    border: '1px solid rgba(37,99,235,0.16)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  }

  const deleteBtn = {
    padding: '9px 14px',
    borderRadius: 12,
    background: 'rgba(239,68,68,0.10)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.16)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  }

  const filteredSubjects = useMemo(() => {
    if (!search.trim()) return subjects
    return subjects.filter((s) =>
      s.name?.toLowerCase().includes(search.toLowerCase())
    )
  }, [subjects, search])

  const modulesForSelectedSubject = useMemo(() => {
    if (!selectedSubject) return []
    return modules.filter((m) => String(m.subject) === String(selectedSubject.id))
  }, [modules, selectedSubject])

  const topicsForSelectedModule = useMemo(() => {
    if (!selectedModule) return []
    return topics.filter((t) => String(t.module) === String(selectedModule.id))
  }, [topics, selectedModule])

  const quizzesForSelectedTopic = useMemo(() => {
    if (!selectedTopic) return []
    return quizzes.filter((q) => String(q.topic) === String(selectedTopic.id))
  }, [quizzes, selectedTopic])

  const topicQuizCount = (topicId: number | string) =>
    quizzes.filter((q) => String(q.topic) === String(topicId)).length

  const moduleTopicCount = (moduleId: number | string) =>
    topics.filter((t) => String(t.module) === String(moduleId)).length

  const subjectModuleCount = (subjectId: number | string) =>
    modules.filter((m) => String(m.subject) === String(subjectId)).length

  const QuizFormFields = ({
    values,
    onChange,
    topicDisabled,
  }: {
    values: QuizForm
    onChange: (k: keyof QuizForm) => (e: any) => void
    topicDisabled?: boolean
  }) => (
    <>
      {!topicDisabled && (
        <select
          value={values.topic}
          onChange={onChange('topic')}
          style={{ ...inputStyle, marginBottom: 12, color: values.topic ? c.text : c.textFaint }}
        >
          <option value="">Select Topic *</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      )}

      <textarea
        value={values.question}
        onChange={onChange('question')}
        placeholder="Question *"
        rows={3}
        style={{ ...inputStyle, resize: 'none', marginBottom: 12 }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 12,
        }}
      >
        {(['option_a', 'option_b', 'option_c', 'option_d'] as const).map((k, i) => (
          <input
            key={k}
            value={values[k]}
            onChange={onChange(k)}
            placeholder={`Option ${String.fromCharCode(65 + i)}${i > 1 ? ' (optional)' : ' *'}`}
            style={inputStyle}
          />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: c.text,
            whiteSpace: 'nowrap',
          }}
        >
          Correct answer:
        </label>
        <select
          value={values.correct_answer}
          onChange={onChange('correct_answer')}
          style={{ ...inputStyle, width: 100 }}
        >
          {['A', 'B', 'C', 'D'].map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>
    </>
  )

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
              Quiz Workspace
            </h1>

            <p
              style={{
                fontSize: 15,
                color: c.textMuted,
                lineHeight: 1.8,
                margin: 0,
                maxWidth: 680,
              }}
            >
              Navigate through subjects, modules, and lessons to manage quiz questions exactly
              where they belong.
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
              {quizzes.length} questions
            </div>

            <button
              onClick={() => setShowCreate((p) => !p)}
              style={primaryBtn}
            >
              {showCreate ? 'Hide Creator' : 'Add Question'}
            </button>
          </div>
        </div>
      </motion.section>

      {/* messages */}
      <AnimatePresence>
        {err && (
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
            {err}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
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
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: 18,
          alignItems: 'start',
        }}
      >
        {/* Left hierarchy */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            ...panelStyle,
            padding: '18px',
            position: 'sticky',
            top: 110,
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: c.text,
                marginBottom: 8,
              }}
            >
              Structure
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects..."
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>
            {filteredSubjects.map((subject) => {
              const isSelectedSubject = selectedSubject?.id === subject.id
              const subjectModules = modules.filter(
                (m) => String(m.subject) === String(subject.id)
              )

              return (
                <div
                  key={subject.id}
                  style={{
                    borderRadius: 22,
                    border: `1px solid ${isSelectedSubject ? 'rgba(37,99,235,0.20)' : c.border}`,
                    background: isSelectedSubject ? 'rgba(37,99,235,0.06)' : c.bg,
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => {
                      setSelectedSubject(subject)
                      setSelectedModule(null)
                      setSelectedTopic(null)
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: c.text,
                          marginBottom: 3,
                        }}
                      >
                        <BookIcon size={14} style={{ marginRight: 4 }} />{subject.name}
                      </div>
                      <div style={{ fontSize: 12, color: c.textFaint }}>
                        {subjectModuleCount(subject.id)} modules
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: 999,
                        background: c.input,
                        color: c.textMuted,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {subjectModules.length}
                    </div>
                  </button>

                  {isSelectedSubject && (
                    <div
                      style={{
                        padding: '0 10px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      {subjectModules.map((module) => {
                        const isSelectedModule = selectedModule?.id === module.id
                        const moduleTopics = topics.filter(
                          (t) => String(t.module) === String(module.id)
                        )

                        return (
                          <div
                            key={module.id}
                            style={{
                              borderRadius: 18,
                              border: `1px solid ${isSelectedModule ? 'rgba(37,99,235,0.20)' : c.border}`,
                              background: isSelectedModule ? 'rgba(37,99,235,0.06)' : c.card,
                              overflow: 'hidden',
                            }}
                          >
                            <button
                              onClick={() => {
                                setSelectedModule(module)
                                setSelectedTopic(null)
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 10,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: c.text,
                                    marginBottom: 2,
                                  }}
                                >
                                  <PackageIcon size={14} style={{ marginRight: 4 }} />{module.title}
                                </div>
                                <div style={{ fontSize: 11, color: c.textFaint }}>
                                  {moduleTopicCount(module.id)} lessons
                                </div>
                              </div>
                            </button>

                            {isSelectedModule && (
                              <div
                                style={{
                                  padding: '0 8px 8px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 6,
                                }}
                              >
                                {moduleTopics.map((topic) => {
                                  const isSelectedTopic = selectedTopic?.id === topic.id
                                  const count = topicQuizCount(topic.id)

                                  return (
                                    <button
                                      key={topic.id}
                                      onClick={() => setSelectedTopic(topic)}
                                      style={{
                                        width: '100%',
                                        padding: '11px 12px',
                                        borderRadius: 14,
                                        border: `1px solid ${isSelectedTopic ? 'rgba(37,99,235,0.20)' : c.border}`,
                                        background: isSelectedTopic ? 'rgba(37,99,235,0.10)' : c.bg,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 10,
                                      }}
                                    >
                                      <div>
                                        <div
                                          style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: isSelectedTopic ? '#2563eb' : c.text,
                                            marginBottom: 2,
                                          }}
                                        >
                                          <VideoIcon size={14} style={{ marginRight: 4 }} />{topic.title}
                                        </div>
                                        <div style={{ fontSize: 11, color: c.textFaint }}>
                                          {count} quiz questions
                                        </div>
                                      </div>

                                      <div
                                        style={{
                                          padding: '4px 8px',
                                          borderRadius: 999,
                                          background: isSelectedTopic ? 'rgba(37,99,235,0.12)' : c.input,
                                          color: isSelectedTopic ? '#2563eb' : c.textMuted,
                                          fontSize: 11,
                                          fontWeight: 700,
                                        }}
                                      >
                                        {count}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {filteredSubjects.length === 0 && (
              <div
                style={{
                  padding: '30px 18px',
                  borderRadius: 20,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  textAlign: 'center',
                  fontSize: 13,
                  color: c.textFaint,
                }}
              >
                No subjects found.
              </div>
            )}
          </div>
        </motion.div>

        {/* Right content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Edit modal */}
          <AnimatePresence>
            {editingQuiz && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.55)',
                  zIndex: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 24,
                  backdropFilter: 'blur(6px)',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  style={{
                    width: '100%',
                    maxWidth: 700,
                    borderRadius: 28,
                    background: c.card,
                    border: `1px solid ${c.border}`,
                    padding: '28px',
                    boxShadow: '0 35px 90px rgba(0,0,0,0.25)',
                  }}
                >
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: c.text,
                        marginBottom: 6,
                      }}
                    >
                      Edit Question
                    </div>
                    <div style={{ fontSize: 13, color: c.textMuted }}>
                      Update the selected quiz question.
                    </div>
                  </div>

                  <QuizFormFields values={editForm} onChange={sef} topicDisabled />

                  <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    <button onClick={saveEdit} style={{ ...primaryBtn, flex: 1 }}>
                      Save changes
                    </button>
                    <button onClick={() => setEditingQuiz(null)} style={{ ...softBtn, flex: 1 }}>
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedTopic ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                ...panelStyle,
                padding: '70px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><BrainIcon size={52} color={c.textFaint} /></div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: c.text,
                  marginBottom: 10,
                }}
              >
                Select a lesson
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: c.textMuted,
                  lineHeight: 1.8,
                  maxWidth: 520,
                  margin: '0 auto',
                }}
              >
                Choose a subject, then a module, then a lesson to manage its quiz questions.
              </div>
            </motion.div>
          ) : (
            <>
              {/* topic header */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  ...panelStyle,
                  padding: '28px',
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
                  <div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 14px',
                        borderRadius: 999,
                        background: 'rgba(37,99,235,0.10)',
                        border: '1px solid rgba(37,99,235,0.16)',
                        marginBottom: 14,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#2563eb',
                        }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>
                        Active Lesson
                      </span>
                    </div>

                    <h2
                      style={{
                        fontSize: 30,
                        fontWeight: 800,
                        color: c.text,
                        margin: '0 0 12px',
                        lineHeight: 1.08,
                      }}
                    >
                      {selectedTopic.title}
                    </h2>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {selectedSubject && (
                        <span
                          style={{
                            padding: '6px 12px',
                            borderRadius: 999,
                            background: c.input,
                            color: c.textMuted,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          <BookIcon size={14} style={{ marginRight: 4 }} />{selectedSubject.name}
                        </span>
                      )}
                      {selectedModule && (
                        <span
                          style={{
                            padding: '6px 12px',
                            borderRadius: 999,
                            background: c.input,
                            color: c.textMuted,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          <PackageIcon size={14} style={{ marginRight: 4 }} />{selectedModule.title}
                        </span>
                      )}
                      <span
                        style={{
                          padding: '6px 12px',
                          borderRadius: 999,
                          background: 'rgba(37,99,235,0.10)',
                          color: '#2563eb',
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        <BrainIcon size={14} style={{ marginRight: 6 }} />{quizzesForSelectedTopic.length} questions
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCreate((p) => !p)}
                    style={primaryBtn}
                  >
                    {showCreate ? 'Hide Creator' : 'Add Question'}
                  </button>
                </div>
              </motion.div>

              {/* add form */}
              <AnimatePresence>
                {showCreate && (
                  <motion.div
                    initial={{ opacity: 0, y: 14, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.99 }}
                    style={{
                      ...panelStyle,
                      padding: '26px',
                    }}
                  >
                    <div style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: c.text,
                          marginBottom: 6,
                        }}
                      >
                        Add Question
                      </div>
                      <div style={{ fontSize: 13, color: c.textMuted }}>
                        This question will be attached to the selected lesson.
                      </div>
                    </div>

                    <QuizFormFields values={form} onChange={sf} topicDisabled />

                    <button onClick={add} style={{ ...primaryBtn, marginTop: 18 }}>
                      Add Question
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* questions list */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  ...panelStyle,
                  padding: '24px',
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
                  Questions in this lesson
                </div>

                {quizzesForSelectedTopic.length === 0 ? (
                  <div
                    style={{
                      padding: '56px 20px',
                      textAlign: 'center',
                      borderRadius: 22,
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                    }}
                  >
                    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><BrainIcon size={40} color={c.textFaint} /></div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: c.text,
                        marginBottom: 8,
                      }}
                    >
                      No quiz questions yet
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: c.textMuted,
                        lineHeight: 1.7,
                      }}
                    >
                      Add the first question for this lesson.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {quizzesForSelectedTopic.map((q, index) => (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        whileHover={{ y: -2, scale: 1.002 }}
                        style={{
                          padding: '18px 18px',
                          borderRadius: 22,
                          background: c.bg,
                          border: `1px solid ${c.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: 14,
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                color: c.text,
                                fontSize: 16,
                                lineHeight: 1.5,
                                marginBottom: 10,
                              }}
                            >
                              {q.question}
                            </div>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 8,
                                marginBottom: 10,
                              }}
                            >
                              {[
                                { key: 'A', value: q.option_a },
                                { key: 'B', value: q.option_b },
                                { key: 'C', value: q.option_c },
                                { key: 'D', value: q.option_d },
                              ]
                                .filter((opt) => opt.value)
                                .map((opt) => (
                                  <div
                                    key={opt.key}
                                    style={{
                                      padding: '10px 12px',
                                      borderRadius: 14,
                                      background:
                                        q.correct_answer === opt.key
                                          ? 'rgba(34,197,94,0.10)'
                                          : c.card,
                                      border:
                                        q.correct_answer === opt.key
                                          ? '1px solid rgba(34,197,94,0.18)'
                                          : `1px solid ${c.border}`,
                                      fontSize: 13,
                                      color:
                                        q.correct_answer === opt.key ? '#22c55e' : c.textMuted,
                                      fontWeight: q.correct_answer === opt.key ? 700 : 600,
                                    }}
                                  >
                                    {opt.key}: {opt.value}
                                  </div>
                                ))}
                            </div>

                            <div
                              style={{
                                display: 'inline-flex',
                                padding: '6px 12px',
                                borderRadius: 999,
                                background: 'rgba(34,197,94,0.10)',
                                color: '#22c55e',
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              Correct answer: {q.correct_answer}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => startEdit(q)} style={editBtn}>
                              Edit
                            </button>
                            <button onClick={() => del(q.id)} style={deleteBtn}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}