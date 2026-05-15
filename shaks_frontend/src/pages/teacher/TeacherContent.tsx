import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'
import { BookIcon, GraduationCapIcon, PuzzleIcon, VideoIcon, FileTextIcon, FolderIcon, LinkIcon, PinIcon, StarIcon, CalendarIcon } from '../../assets/icons/Icons'

type Tab = 'subjects' | 'grades' | 'modules' | 'topics' | 'assignments'

export default function TeacherContent() {
  const { c } = useTheme()

  const [tab, setTab] = useState<Tab>('subjects')
  const [subjects, setSubjects] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [form, setForm] = useState<any>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [editingSubject, setEditingSubject] = useState<any>(null)
  const [editingGrade, setEditingGrade] = useState<any>(null)
  const [editingModule, setEditingModule] = useState<any>(null)
  const [editingTopic, setEditingTopic] = useState<any>(null)
  const [editingAssignment, setEditingAssignment] = useState<any>(null)

  const [editForm, setEditForm] = useState<any>({})
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null)

  const [uploadingTopic, setUploadingTopic] = useState(false)
  const [uploadingTopicEdit, setUploadingTopicEdit] = useState(false)
  const [uploadingAssignment, setUploadingAssignment] = useState(false)
  const [uploadingAssignmentEdit, setUploadingAssignmentEdit] = useState(false)

  const videoRef = useRef<HTMLInputElement>(null)
  const editVideoRef = useRef<HTMLInputElement>(null)

  const [taskFile, setTaskFile] = useState<File | null>(null)
  const [editTaskFile, setEditTaskFile] = useState<File | null>(null)

  const taskFileRef = useRef<HTMLInputElement>(null)
  const editTaskFileRef = useRef<HTMLInputElement>(null)

  const fetchAllPages = async (url: string): Promise<any[]> => {
    let results: any[] = []
    let nextUrl: string | null = url
  
    while (nextUrl) {
      const response: any = await api.get(nextUrl)
      const data: any = response.data
  
      if (Array.isArray(data)) {
        results = [...results, ...data]
        nextUrl = null
      } else {
        results = [...results, ...(data.results || [])]
        nextUrl = data.next
      }
    }
  
    return results
  }

  useEffect(() => {
    const loadAll = async () => {
      const [subjectsData, gradesData, modulesData, topicsData, assignmentsData] = await Promise.all([
        fetchAllPages('/courses/subjects/'),
        fetchAllPages('/courses/grades/'),
        fetchAllPages('/courses/modules/'),
        fetchAllPages('/courses/topics/'),
        fetchAllPages('/assignments/assignments/'),
      ])
  
      setSubjects(subjectsData)
      setGrades(gradesData)
      setModules(modulesData)
      setTopics(topicsData)
      setAssignments(assignmentsData)
    }
  
    loadAll()
  }, [])

  const f = (k: string) => form[k] ?? ''
  const sf = (k: string) => (e: any) => setForm((p: any) => ({ ...p, [k]: e.target.value }))

  const ef = (k: string) => editForm[k] ?? ''
  const sef = (k: string) => (e: any) => setEditForm((p: any) => ({ ...p, [k]: e.target.value }))

  const showMsg = (msg: string, isErr = false) => {
    if (isErr) {
      setError(msg)
      setTimeout(() => setError(''), 4000)
    } else {
      setSuccess(msg)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const addSubject = async () => {
    if (!f('sname').trim()) return showMsg('Subject name is required', true)
    try {
      const { data } = await api.post('/courses/subjects/', {
        name: f('sname').trim(),
        description: f('sdesc') || '',
      })
      setSubjects((p) => [...p, data])
      setForm((p: any) => ({ ...p, sname: '', sdesc: '' }))
      showMsg('Subject added!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Error'), true)
    }
  }

  const startEditSubject = (s: any) => {
    setEditingSubject(s)
    setEditForm({
      sname: s.name || '',
      sdesc: s.description || '',
    })
  }

  const saveEditSubject = async () => {
    if (!ef('sname')?.trim()) return showMsg('Subject name is required', true)
    try {
      const { data } = await api.patch(`/courses/subjects/${editingSubject.id}/`, {
        name: ef('sname').trim(),
        description: ef('sdesc') || '',
      })
      setSubjects((p) => p.map((s) => (s.id === editingSubject.id ? { ...s, ...data } : s)))
      setEditingSubject(null)
      showMsg('Subject updated!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Error updating subject'), true)
    }
  }

  const delSubject = async (id: number) => {
    if (!confirm('Delete this subject?')) return
    try {
      await api.delete(`/courses/subjects/${id}/`)
      setSubjects((p) => p.filter((s) => s.id !== id))
    } catch {
      showMsg('Cannot delete', true)
    }
  }

  const addGrade = async () => {
    if (!f('gname').trim()) return showMsg('Grade name is required', true)
    try {
      const { data } = await api.post('/courses/grades/', { name: f('gname').trim() })
      setGrades((p) => [...p, data])
      setForm((p: any) => ({ ...p, gname: '' }))
      showMsg('Grade added!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Error'), true)
    }
  }

  const startEditGrade = (g: any) => {
    setEditingGrade(g)
    setEditForm({
      gname: g.name || '',
    })
  }

  const saveEditGrade = async () => {
    if (!ef('gname')?.trim()) return showMsg('Grade name is required', true)
    try {
      const { data } = await api.patch(`/courses/grades/${editingGrade.id}/`, {
        name: ef('gname').trim(),
      })
      setGrades((p) => p.map((g) => (g.id === editingGrade.id ? { ...g, ...data } : g)))
      setEditingGrade(null)
      showMsg('Grade updated!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Error updating grade'), true)
    }
  }

  const addModule = async () => {
    if (!f('mtitle').trim() || !f('msubject') || !f('mgrade')) {
      return showMsg('Title, subject and grade are required', true)
    }

    try {
      const { data } = await api.post('/courses/modules/', {
        title: f('mtitle').trim(),
        subject: f('msubject'),
        grade: f('mgrade'),
        order: 0,
      })
      setModules((p) => [...p, data])
      setForm((p: any) => ({ ...p, mtitle: '', msubject: '', mgrade: '' }))
      showMsg('Module added!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Error'), true)
    }
  }

  const startEditModule = (m: any) => {
    setEditingModule(m)
    setEditForm({
      mtitle: m.title || '',
      msubject: String(m.subject || ''),
      mgrade: String(m.grade || ''),
    })
  }

  const saveEditModule = async () => {
    if (!ef('mtitle')?.trim() || !ef('msubject') || !ef('mgrade')) {
      return showMsg('Title, subject and grade are required', true)
    }

    try {
      const { data } = await api.patch(`/courses/modules/${editingModule.id}/`, {
        title: ef('mtitle').trim(),
        subject: Number(ef('msubject')),
        grade: Number(ef('mgrade')),
      })
      setModules((p) => p.map((m) => (m.id === editingModule.id ? { ...m, ...data } : m)))
      setEditingModule(null)
      showMsg('Module updated!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Error updating module'), true)
    }
  }

  const delModule = async (id: number) => {
    if (!confirm('Delete this module and all its topics?')) return
    try {
      await api.delete(`/courses/modules/${id}/`)
      setModules((p) => p.filter((m) => m.id !== id))
    } catch {
      showMsg('Cannot delete', true)
    }
  }

  const addTopic = async () => {
    if (!f('ttitle').trim()) return showMsg('Topic title is required', true)
    if (!f('tmodule')) return showMsg('Please select a module', true)
  
    try {
      setUploadingTopic(true)
  
      const fd = new FormData()
      fd.append('title', f('ttitle').trim())
      fd.append('module', String(Number(f('tmodule'))))
      fd.append('video_url', f('tvideo') || '')
      if (videoFile) fd.append('video_file', videoFile)
      fd.append('explanation', f('texpl') || '')
      fd.append('example', f('texample') || '')
      fd.append('order', '0')
  
      const { data } = await api.post('/courses/topics/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
  
      setTopics((p) => [...p, data])
      setForm((p: any) => ({
        ...p,
        ttitle: '',
        tmodule: '',
        tvideo: '',
        texpl: '',
        texample: '',
      }))
      setVideoFile(null)
      showMsg('Topic added!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Error adding topic'), true)
    } finally {
      setUploadingTopic(false)
    }
  }

  const delTopic = async (id: number) => {
    if (!confirm('Delete this topic?')) return
    try {
      await api.delete(`/courses/topics/${id}/`)
      setTopics((p) => p.filter((t) => t.id !== id))
    } catch {
      showMsg('Cannot delete', true)
    }
  }

  const startEditTopic = (t: any) => {
    setEditingTopic(t)
    setEditVideoFile(null)
    setEditForm({
      ttitle: t.title,
      tmodule: String(t.module),
      tvideo: t.video_url || '',
      texpl: t.explanation || '',
      texample: t.example || '',
    })
  }

  const startEditAssignment = (a: any) => {
    setEditingAssignment(a)
    setEditTaskFile(null)
    setEditForm({
      atitle: a.title,
      atopic: String(a.topic),
      ainstr: a.instructions || '',
      adesc: a.description || '',
      apoints: String(a.points),
      adue: a.due_date ? new Date(a.due_date).toISOString().slice(0, 16) : '',
    })
  }

  const saveEditTopic = async () => {
    if (!editForm.ttitle?.trim()) return showMsg('Title is required', true)
  
    try {
      setUploadingTopicEdit(true)
  
      const fd = new FormData()
      fd.append('title', editForm.ttitle.trim())
      fd.append('module', String(Number(editForm.tmodule)))
      fd.append('video_url', editForm.tvideo || '')
      if (editVideoFile) fd.append('video_file', editVideoFile)
      fd.append('explanation', editForm.texpl || '')
      fd.append('example', editForm.texample || '')
  
      const { data } = await api.patch(`/courses/topics/${editingTopic.id}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
  
      setTopics((p) => p.map((t) => (t.id === editingTopic.id ? { ...t, ...data } : t)))
      setEditingTopic(null)
      showMsg('Topic updated!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Error'), true)
    } finally {
      setUploadingTopicEdit(false)
    }
  }

  const saveEditAssignment = async () => {
    if (!ef('atitle')?.trim()) return showMsg('Title is required', true)
    if (!ef('atopic')) return showMsg('Please select a topic', true)

    try {
      setUploadingAssignmentEdit(true)
      const payload: any = {
        title: ef('atitle').trim(),
        topic: Number(ef('atopic')),
        instructions: ef('ainstr') || '',
        description: ef('adesc') || '',
        points: Number(ef('apoints') || 100),
      }

      if (ef('adue')) payload.due_date = new Date(ef('adue')).toISOString()

      if (editTaskFile) {
        const fd = new FormData()
        fd.append('title', payload.title)
        fd.append('topic', String(payload.topic))
        fd.append('instructions', payload.instructions)
        fd.append('description', payload.description)
        fd.append('points', String(payload.points))
        if (payload.due_date) fd.append('due_date', payload.due_date)
        fd.append('task_file', editTaskFile)

        const { data } = await api.patch(
          `/assignments/assignments/${editingAssignment.id}/`,
          fd,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        setAssignments((p) =>
          p.map((item) => (item.id === editingAssignment.id ? { ...item, ...data } : item))
        )
      } else {
        const { data } = await api.patch(
          `/assignments/assignments/${editingAssignment.id}/`,
          payload
        )
        setAssignments((p) =>
          p.map((item) => (item.id === editingAssignment.id ? { ...item, ...data } : item))
        )
      } 

      setEditingAssignment(null)
      setEditTaskFile(null)
      showMsg('Assignment updated successfully!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Error updating assignment'), true)
    } finally {
      setUploadingAssignmentEdit(false)
    }
  }

  const addAssignment = async () => {
    if (!f('atitle').trim()) return showMsg('Title is required', true)
    if (!f('atopic')) return showMsg('Please select a topic', true)
  
    try {
      setUploadingAssignment(true)
  
      const fd = new FormData()
      fd.append('title', f('atitle').trim())
      fd.append('topic', String(f('atopic')))
      fd.append('instructions', f('ainstr') || '')
      fd.append('description', f('adesc') || '')
      fd.append('points', f('apoints') || '100')
  
      if (f('adue')) fd.append('due_date', new Date(f('adue')).toISOString())
      if (taskFile) fd.append('task_file', taskFile)
  
      const { data } = await api.post('/assignments/assignments/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
  
      setAssignments((p) => [data, ...p])
      setForm((p: any) => ({
        ...p,
        atitle: '',
        atopic: '',
        ainstr: '',
        adesc: '',
        apoints: '',
        adue: '',
      }))
      setTaskFile(null)
  
      showMsg('Assignment created!')
    } catch (e: any) {
      showMsg(JSON.stringify(e.response?.data || 'Error'), true)
    } finally {
      setUploadingAssignment(false)
    }
  }

  const delAssignment = async (id: number) => {
    if (!confirm('Delete this assignment?')) return
    try {
      await api.delete(`/assignments/assignments/${id}/`)
      setAssignments((p) => p.filter((a) => a.id !== id))
    } catch {
      showMsg('Cannot delete', true)
    }
  }

  const delGrade = async (id: number) => {
    if (!confirm('Delete this grade?')) return
    try {
      await api.delete(`/courses/grades/${id}/`)
      setGrades((p) => p.filter((g) => g.id !== id))
      showMsg('Grade deleted!')
    } catch {
      showMsg('Cannot delete', true)
    }
  }

  const TABS: {
    key: Tab
    label: string
    icon: React.ReactNode
    count: number
  }[] = [
    { key: 'subjects', label: 'Subjects', icon: <BookIcon size={16} />, count: subjects.length },
    { key: 'grades', label: 'Grades', icon: <GraduationCapIcon size={16} />, count: grades.length },
    { key: 'modules', label: 'Modules', icon: <PuzzleIcon size={16} />, count: modules.length },
    { key: 'topics', label: 'Topics', icon: <VideoIcon size={16} />, count: topics.length },
    { key: 'assignments', label: 'Assignments', icon: <FileTextIcon size={16} />, count: assignments.length },
  ]

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
    padding: '13px 22px',
    borderRadius: 16,
    background: '#2563eb',
    color: 'white',
    fontWeight: 700,
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 14px 30px -10px rgba(37,99,235,0.65)',
  }

  const ghostBtn = {
    padding: '12px 18px',
    borderRadius: 14,
    background: c.input,
    color: c.textMuted,
    fontWeight: 600,
    fontSize: 13,
    border: `1px solid ${c.border}`,
    cursor: 'pointer',
  }

  const deleteBtn = {
    padding: '8px 14px',
    borderRadius: 12,
    background: 'rgba(239,68,68,0.10)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.18)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  }

  const editBtn = {
    padding: '8px 14px',
    borderRadius: 12,
    background: 'rgba(37,99,235,0.10)',
    color: '#2563eb',
    border: '1px solid rgba(37,99,235,0.18)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  }

  const renderEmpty = (text: string, icon: React.ReactNode) => (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '58px 24px',
        borderRadius: 28,
        background: c.card,
        border: `1px solid ${c.border}`,
        textAlign: 'center',
        boxShadow: '0 16px 36px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>{icon}</div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: c.text,
          marginBottom: 8,
        }}
      >
        Nothing here yet
      </div>
      <p
        style={{
          margin: 0,
          color: c.textMuted,
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {text}
      </p>
    </motion.div>
  )

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

  const listCardStyle = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    padding: '20px 22px',
    borderRadius: 24,
    background: c.card,
    border: `1px solid ${c.border}`,
    boxShadow: '0 14px 32px rgba(0,0,0,0.05)',
  }

  const modalOverlay = {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backdropFilter: 'blur(6px)',
  }

  const modalCard = {
    width: '100%',
    maxWidth: 680,
    borderRadius: 28,
    background: c.card,
    border: `1px solid ${c.border}`,
    padding: '28px',
    maxHeight: '92vh',
    overflowY: 'auto' as const,
    boxShadow: '0 35px 90px rgba(0,0,0,0.25)',
  }

  const getModuleTitle = (moduleId: number | string) => {
    return modules.find((m) => String(m.id) === String(moduleId))?.title || 'Unknown module'
  }
  
  const groupedTopics = modules
    .map((module) => ({
      module,
      items: topics.filter((t) => String(t.module) === String(module.id)),
    }))
    .filter((group) => group.items.length > 0)
  
  const groupedAssignments = modules
    .map((module) => ({
      module,
      items: assignments.filter((a) => {
        const topic = topics.find((t) => String(t.id) === String(a.topic))
        return topic && String(topic.module) === String(module.id)
      }),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <div style={{ padding: '4px 2px 20px' }}>
      {/* Header */}
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
            Teacher Panel
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
          Content Manager
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
          Manage your academic structure in one place: subjects, grades, modules, topics, and assignments.
        </p>
      </motion.div>

      {/* Alerts */}
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

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 26,
          flexWrap: 'wrap',
        }}
      >
        {TABS.map((t) => (
          <motion.button
            key={t.key}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTab(t.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 16px',
              borderRadius: 16,
              fontSize: 13,
              fontWeight: 700,
              border:
                tab === t.key
                  ? '1px solid rgba(37,99,235,0.22)'
                  : `1px solid ${c.border}`,
              background: tab === t.key ? 'rgba(37,99,235,0.10)' : c.card,
              color: tab === t.key ? '#2563eb' : c.textMuted,
              cursor: 'pointer',
              boxShadow: tab === t.key ? '0 10px 24px rgba(37,99,235,0.12)' : 'none',
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: 999,
                background: tab === t.key ? 'rgba(37,99,235,0.10)' : c.input,
                color: tab === t.key ? '#2563eb' : c.textFaint,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {t.count}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Edit Subject Modal */}
      <AnimatePresence>
        {editingSubject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlay}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} style={modalCard}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 6 }}>
                  Edit Subject
                </div>
                <div style={{ fontSize: 13, color: c.textMuted }}>
                  Update the subject name and description.
                </div>
              </div>

              <input
                value={ef('sname')}
                onChange={sef('sname')}
                placeholder="Subject name *"
                style={{ ...inputStyle, marginBottom: 12 }}
              />

              <textarea
                value={ef('sdesc')}
                onChange={sef('sdesc')}
                placeholder="Description"
                rows={4}
                style={{ ...inputStyle, resize: 'none', marginBottom: 20 }}
              />

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={saveEditSubject} style={{ ...primaryBtn, flex: 1 }}>
                  Save Changes
                </button>
                <button onClick={() => setEditingSubject(null)} style={{ ...ghostBtn, flex: 1 }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Grade Modal */}
      <AnimatePresence>
        {editingGrade && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlay}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} style={{ ...modalCard, maxWidth: 560 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 6 }}>
                  Edit Grade
                </div>
                <div style={{ fontSize: 13, color: c.textMuted }}>
                  Update the grade title.
                </div>
              </div>

              <input
                value={ef('gname')}
                onChange={sef('gname')}
                placeholder="Grade name *"
                style={{ ...inputStyle, marginBottom: 20 }}
              />

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={saveEditGrade} style={{ ...primaryBtn, flex: 1 }}>
                  Save Changes
                </button>
                <button onClick={() => setEditingGrade(null)} style={{ ...ghostBtn, flex: 1 }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Module Modal */}
      <AnimatePresence>
        {editingModule && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlay}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} style={modalCard}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 6 }}>
                  Edit Module
                </div>
                <div style={{ fontSize: 13, color: c.textMuted }}>
                  Update module title, subject, and grade.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                <input
                  value={ef('mtitle')}
                  onChange={sef('mtitle')}
                  placeholder="Module title *"
                  style={inputStyle}
                />

                <select
                  value={ef('msubject')}
                  onChange={sef('msubject')}
                  style={{ ...inputStyle, color: ef('msubject') ? c.text : c.textFaint }}
                >
                  <option value="">Subject *</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={ef('mgrade')}
                  onChange={sef('mgrade')}
                  style={{ ...inputStyle, color: ef('mgrade') ? c.text : c.textFaint }}
                >
                  <option value="">Grade *</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={saveEditModule} style={{ ...primaryBtn, flex: 1 }}>
                  Save Changes
                </button>
                <button onClick={() => setEditingModule(null)} style={{ ...ghostBtn, flex: 1 }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBJECTS */}
      {tab === 'subjects' && (
        <div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={panelStyle}>
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
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: c.text, marginBottom: 6 }}>
                  Create subject
                </div>
                <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.6 }}>
                  Add a new academic subject for your learning structure.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  value={f('sname')}
                  onChange={sf('sname')}
                  placeholder="Subject name *"
                  style={{ ...inputStyle, flex: 1, minWidth: 220 }}
                />
                <input
                  value={f('sdesc')}
                  onChange={sf('sdesc')}
                  placeholder="Description"
                  style={{ ...inputStyle, flex: 1, minWidth: 220 }}
                />
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={addSubject} style={primaryBtn}>
                  Add Subject
                </motion.button>
              </div>
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {subjects.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                viewport={{ once: true }}
                whileHover={{ y: -3, scale: 1.005 }}
                style={listCardStyle}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: c.text, fontSize: 17, marginBottom: 6 }}>
                      {s.name}
                    </div>
                    {s.description && (
                      <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.7 }}>
                        {s.description}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEditSubject(s)} style={editBtn}>
                      Edit
                    </button>
                    <button onClick={() => delSubject(s.id)} style={deleteBtn}>
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {subjects.length === 0 && renderEmpty('Your subjects will appear here after you create the first one.', <BookIcon size={42} color={c.textFaint} />)}
          </div>
        </div>
      )}

      {/* GRADES */}
      {tab === 'grades' && (
        <div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={panelStyle}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: c.text, marginBottom: 6 }}>
                Create grade
              </div>
              <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.6 }}>
                Organize content by school or academic grade level.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input
                value={f('gname')}
                onChange={sf('gname')}
                placeholder="Grade name (e.g. Grade 9) *"
                style={{ ...inputStyle, flex: 1, minWidth: 240 }}
              />
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={addGrade} style={primaryBtn}>
                Add Grade
              </motion.button>
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {grades.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                viewport={{ once: true }}
                whileHover={{ y: -3, scale: 1.005 }}
                style={listCardStyle}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ fontWeight: 700, color: c.text, fontSize: 16 }}>
                    {g.name}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEditGrade(g)} style={editBtn}>
                      Edit
                    </button>
                    <button onClick={() => delGrade(g.id)} style={deleteBtn}>
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {grades.length === 0 && renderEmpty('Your grade levels will appear here after you add them.', <GraduationCapIcon size={42} color={c.textFaint} />)}
          </div>
        </div>
      )}

      {/* MODULES */}
      {tab === 'modules' && (
        <div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={panelStyle}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: c.text, marginBottom: 6 }}>
                Create module
              </div>
              <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.6 }}>
                Modules help you group lessons and topics inside a subject and grade.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <input
                value={f('mtitle')}
                onChange={sf('mtitle')}
                placeholder="Module title *"
                style={{ ...inputStyle, flex: 1, minWidth: 220 }}
              />

              <select
                value={f('msubject')}
                onChange={sf('msubject')}
                style={{
                  ...inputStyle,
                  width: 190,
                  color: f('msubject') ? c.text : c.textFaint,
                }}
              >
                <option value="">Subject *</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={f('mgrade')}
                onChange={sf('mgrade')}
                style={{
                  ...inputStyle,
                  width: 170,
                  color: f('mgrade') ? c.text : c.textFaint,
                }}
              >
                <option value="">Grade *</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={addModule} style={primaryBtn}>
                Add Module
              </motion.button>
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {modules.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                viewport={{ once: true }}
                whileHover={{ y: -3, scale: 1.005 }}
                style={listCardStyle}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ fontWeight: 700, color: c.text, fontSize: 17 }}>{m.title}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEditModule(m)} style={editBtn}>
                      Edit
                    </button>
                    <button onClick={() => delModule(m.id)} style={deleteBtn}>
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {modules.length === 0 && renderEmpty('Modules will show up here after you create them.', <PuzzleIcon size={42} color={c.textFaint} />)}
          </div>
        </div>
      )}

      {/* TOPICS */}
      {tab === 'topics' && (
        <div>
          <AnimatePresence>
            {editingTopic && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={modalOverlay}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  style={modalCard}
                >
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 6 }}>
                      Edit Topic
                    </div>
                    <div style={{ fontSize: 13, color: c.textMuted }}>
                      Update lesson details, video source, explanation, and example.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <input
                      value={editForm.ttitle}
                      onChange={(e) => setEditForm((p: any) => ({ ...p, ttitle: e.target.value }))}
                      placeholder="Topic title *"
                      style={inputStyle}
                    />
                    <select
                      value={editForm.tmodule}
                      onChange={(e) => setEditForm((p: any) => ({ ...p, tmodule: e.target.value }))}
                      style={{ ...inputStyle, color: editForm.tmodule ? c.text : c.textFaint }}
                    >
                      <option value="">Select Module *</option>
                      {modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    value={editForm.tvideo}
                    onChange={(e) => setEditForm((p: any) => ({ ...p, tvideo: e.target.value }))}
                    placeholder="YouTube URL (optional)"
                    style={{ ...inputStyle, marginBottom: 10 }}
                  />

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 7 }}>
                      Or upload video file
                    </div>
                    <input
                      ref={editVideoRef}
                      type="file"
                      accept="video/*"
                      style={{ display: 'none' }}
                      onChange={(e) => setEditVideoFile(e.target.files?.[0] ?? null)}
                    />
                    <button 
                      type="button" 
                      onClick={() => editVideoRef.current?.click()} 
                      style={ghostBtn}
                      >
                        <FolderIcon size={14} /> {editVideoFile ? editVideoFile.name : 'Choose video file'}
                        {uploadingTopicEdit ? ' • Uploading...' : ''}
                    </button>
                  </div>

                  <textarea
                    value={editForm.texpl}
                    onChange={(e) => setEditForm((p: any) => ({ ...p, texpl: e.target.value }))}
                    placeholder="Explanation (optional)"
                    rows={4}
                    style={{ ...inputStyle, resize: 'none', marginBottom: 12 }}
                  />

                  <textarea
                    value={editForm.texample}
                    onChange={(e) => setEditForm((p: any) => ({ ...p, texample: e.target.value }))}
                    placeholder="Example (optional)"
                    rows={3}
                    style={{ ...inputStyle, resize: 'none', marginBottom: 20 }}
                  />

                  <div style={{ display: 'flex', gap: 12 }}>
                  <button
                      onClick={saveEditTopic}
                      disabled={uploadingTopicEdit}
                      style={{ ...primaryBtn, flex: 1, opacity: uploadingTopicEdit ? 0.65 : 1, cursor: uploadingTopicEdit ? 'not-allowed' : 'pointer' }}
                    >
                      {uploadingTopicEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={() => setEditingTopic(null)} style={{ ...ghostBtn, flex: 1 }}>
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={panelStyle}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: c.text, marginBottom: 6 }}>
                Create topic
              </div>
              <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.6 }}>
                Add a lesson topic with video, explanation, and example content.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input
                value={f('ttitle')}
                onChange={sf('ttitle')}
                placeholder="Topic title *"
                style={inputStyle}
              />
              <select
                value={f('tmodule')}
                onChange={sf('tmodule')}
                style={{ ...inputStyle, color: f('tmodule') ? c.text : c.textFaint }}
              >
                <option value="">Select Module *</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <input
              value={f('tvideo')}
              onChange={sf('tvideo')}
              placeholder="YouTube URL (optional)"
              style={{ ...inputStyle, marginBottom: 10 }}
            />

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 7 }}>
                Or upload video file (mp4, webm, etc.)
              </div>
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
              />
              <button type="button" onClick={() => videoRef.current?.click()} style={ghostBtn}>
                  <FolderIcon size={14} /> {videoFile ? videoFile.name : 'Choose video file'}
                  {uploadingTopic ? ' • Uploading...' : ''}
              </button>
            </div>

            <textarea
              value={f('texpl')}
              onChange={sf('texpl')}
              placeholder="Explanation (optional)"
              rows={4}
              style={{ ...inputStyle, resize: 'none', marginBottom: 12 }}
            />

            <textarea
              value={f('texample')}
              onChange={sf('texample')}
              placeholder="Example (optional)"
              rows={3}
              style={{ ...inputStyle, resize: 'none', marginBottom: 16 }}
            />

              <motion.button
                whileHover={{ y: uploadingTopic ? 0 : -2 }}
                whileTap={{ scale: uploadingTopic ? 1 : 0.98 }}
                onClick={addTopic}
                disabled={uploadingTopic}
                style={{ ...primaryBtn, opacity: uploadingTopic ? 0.65 : 1, cursor: uploadingTopic ? 'not-allowed' : 'pointer' }}
              >
                {uploadingTopic ? 'Uploading topic...' : 'Add Topic'}
              </motion.button>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {groupedTopics.map((group, groupIndex) => (
              <motion.div
                key={group.module.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
                viewport={{ once: true }}
                style={{
                  ...panelStyle,
                  marginBottom: 0,
                  padding: '22px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <PuzzleIcon size={14} color={c.text} /> {group.module.title}
                    </div>
                    <div style={{ fontSize: 13, color: c.textMuted }}>
                      {group.items.length} topic{group.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: 'rgba(37,99,235,0.08)',
                      color: '#2563eb',
                      border: '1px solid rgba(37,99,235,0.16)',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Module
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {group.items.map((t: any, i: number) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -3, scale: 1.005 }}
                      style={listCardStyle}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 18,
                          flexWrap: 'wrap',
                          alignItems: 'center',
                        }}
                      >
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
                            <span style={{ fontSize: 15, display: 'flex', alignItems: 'center' }}><VideoIcon size={16} color={c.textMuted} /></span>
                            <div style={{ fontWeight: 700, color: c.text, fontSize: 17 }}>
                              {t.title}
                            </div>
                            {(t.video_file || t.video_url) && (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: '#2563eb',
                                  padding: '5px 10px',
                                  borderRadius: 999,
                                  background: 'rgba(37,99,235,0.08)',
                                  border: '1px solid rgba(37,99,235,0.16)',
                                  fontWeight: 700,
                                }}
                              >
                                {t.video_file ? <><FolderIcon size={12} /> file</> : <><LinkIcon size={12} /> url</>}
                              </span>
                            )}
                          </div>

                          {t.explanation && (
                            <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.7 }}>
                              {t.explanation}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => startEditTopic(t)} style={editBtn}>
                            Edit
                          </button>
                          <button onClick={() => delTopic(t.id)} style={deleteBtn}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            {topics.length === 0 &&
              renderEmpty('Topics will appear here after you add lesson content.', <VideoIcon size={42} color={c.textFaint} />)}
          </div>
        </div>
      )}

      {/* ASSIGNMENTS */}
      {tab === 'assignments' && (
        <div>
          <AnimatePresence>
            {editingAssignment && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={modalOverlay}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  style={modalCard}
                >
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 6 }}>
                      Edit Assignment
                    </div>
                    <div style={{ fontSize: 13, color: c.textMuted }}>
                      Update title, topic, file, due date, points, and instructions.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <input
                      value={ef('atitle')}
                      onChange={sef('atitle')}
                      placeholder="Assignment title *"
                      style={inputStyle}
                    />
                    <select
                      value={ef('atopic')}
                      onChange={sef('atopic')}
                      style={{ ...inputStyle, color: ef('atopic') ? c.text : c.textFaint }}
                    >
                      <option value="">Select Topic *</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 7 }}>
                      Upload task file (optional — leave empty to keep current)
                    </div>
                    <input
                      ref={editTaskFileRef}
                      type="file"
                      accept=".txt,.doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => setEditTaskFile(e.target.files?.[0] ?? null)}
                    />
                    <button type="button" onClick={() => taskFileRef.current?.click()} style={ghostBtn}>
                      <FolderIcon size={14} /> {taskFile ? taskFile.name : 'Choose task file'}
                      {uploadingAssignment ? ' • Uploading...' : ''}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: c.textMuted, marginBottom: 6 }}>
                        Points (max score)
                      </label>
                      <input type="number" value={ef('apoints')} onChange={sef('apoints')} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: c.textMuted, marginBottom: 6 }}>
                        Due date (optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={ef('adue')}
                        onChange={sef('adue')}
                        style={{ ...inputStyle, colorScheme: 'dark' }}
                      />
                    </div>
                  </div>

                  <textarea
                    value={ef('ainstr')}
                    onChange={sef('ainstr')}
                    placeholder="Instructions — what students need to do..."
                    rows={4}
                    style={{ ...inputStyle, resize: 'none', marginBottom: 12 }}
                  />

                  <textarea
                    value={ef('adesc')}
                    onChange={sef('adesc')}
                    placeholder="Additional description (optional)"
                    rows={3}
                    style={{ ...inputStyle, resize: 'none', marginBottom: 20 }}
                  />

                  <div style={{ display: 'flex', gap: 12 }}>
                  <button
                      onClick={saveEditAssignment}
                      disabled={uploadingAssignmentEdit}
                      style={{ ...primaryBtn, flex: 1, opacity: uploadingAssignmentEdit ? 0.65 : 1, cursor: uploadingAssignmentEdit ? 'not-allowed' : 'pointer' }}
                    >
                      {uploadingAssignmentEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingAssignment(null)
                        setEditTaskFile(null)
                      }}
                      style={{ ...ghostBtn, flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={panelStyle}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: c.text, marginBottom: 6 }}>
                Create assignment
              </div>
              <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.6 }}>
                Create tasks, upload materials, set points, and choose due dates.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input
                value={f('atitle')}
                onChange={sf('atitle')}
                placeholder="Assignment title *"
                style={inputStyle}
              />
              <select
                value={f('atopic')}
                onChange={sf('atopic')}
                style={{ ...inputStyle, color: f('atopic') ? c.text : c.textFaint }}
              >
                <option value="">Select Topic *</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 7 }}>
                Upload task file
              </div>
              <input
                ref={taskFileRef}
                type="file"
                accept=".txt,.doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => setTaskFile(e.target.files?.[0] ?? null)}
              />
              <button type="button" onClick={() => editTaskFileRef.current?.click()} style={ghostBtn}>
                <FolderIcon size={14} /> {editTaskFile ? editTaskFile.name : 'Choose new task file'}
                {uploadingAssignmentEdit ? ' • Uploading...' : ''}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: c.textMuted, marginBottom: 6 }}>
                  Points (max score)
                </label>
                <input
                  type="number"
                  value={f('apoints')}
                  onChange={sf('apoints')}
                  placeholder="100"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: c.textMuted, marginBottom: 6 }}>
                  Due date (optional)
                </label>
                <input
                  type="datetime-local"
                  value={f('adue')}
                  onChange={sf('adue')}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                />
              </div>
            </div>

            <textarea
              value={f('ainstr')}
              onChange={sf('ainstr')}
              placeholder="Instructions — what students need to do..."
              rows={4}
              style={{ ...inputStyle, resize: 'none', marginBottom: 12 }}
            />

            <textarea
              value={f('adesc')}
              onChange={sf('adesc')}
              placeholder="Additional description (optional)"
              rows={3}
              style={{ ...inputStyle, resize: 'none', marginBottom: 16 }}
            />

            <motion.button
              whileHover={{ y: uploadingAssignment ? 0 : -2 }}
              whileTap={{ scale: uploadingAssignment ? 1 : 0.98 }}
              onClick={addAssignment}
              disabled={uploadingAssignment}
              style={{ ...primaryBtn, opacity: uploadingAssignment ? 0.65 : 1, cursor: uploadingAssignment ? 'not-allowed' : 'pointer' }}
            >
              {uploadingAssignment ? 'Uploading assignment...' : 'Create Assignment'}
            </motion.button>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {groupedAssignments.map((group, groupIndex) => (
              <motion.div
                key={group.module.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
                viewport={{ once: true }}
                style={{
                  ...panelStyle,
                  marginBottom: 0,
                  padding: '22px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <PuzzleIcon size={14} color={c.text} /> {group.module.title}
                    </div>
                    <div style={{ fontSize: 13, color: c.textMuted }}>
                      {group.items.length} assignment{group.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: 'rgba(37,99,235,0.08)',
                      color: '#2563eb',
                      border: '1px solid rgba(37,99,235,0.16)',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Module
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {group.items.map((a: any, i: number) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -3, scale: 1.005 }}
                      style={listCardStyle}
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
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: c.text,
                              fontSize: 17,
                              marginBottom: 8,
                            }}
                          >
                            {a.title}
                          </div>

                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                            {a.topic_title && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 12,
                                  color: c.textFaint,
                                  padding: '5px 10px',
                                  borderRadius: 999,
                                  background: c.input,
                                }}
                              >
                                <PinIcon size={12} color={c.textFaint} /> {a.topic_title}
                              </span>
                            )}
                            {a.grade_name && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 12,
                                  color: c.textFaint,
                                  padding: '5px 10px',
                                  borderRadius: 999,
                                  background: c.input,
                                }}
                              >
                                <GraduationCapIcon size={12} color={c.textFaint} /> {a.grade_name}
                              </span>
                            )}
                            {a.subject_name && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 12,
                                  color: c.textFaint,
                                  padding: '5px 10px',
                                  borderRadius: 999,
                                  background: c.input,
                                }}
                              >
                                <BookIcon size={12} color={c.textFaint} /> {a.subject_name}
                              </span>
                            )}
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12,
                                color: '#f59e0b',
                                padding: '5px 10px',
                                borderRadius: 999,
                                background: 'rgba(245,158,11,0.10)',
                                border: '1px solid rgba(245,158,11,0.16)',
                                fontWeight: 700,
                              }}
                            >
                              <StarIcon size={12} color="#f59e0b" /> {a.points} pts
                            </span>
                            {a.due_date && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 12,
                                  color: c.textFaint,
                                  padding: '5px 10px',
                                  borderRadius: 999,
                                  background: c.input,
                                }}
                              >
                                <CalendarIcon size={12} color="#ef4444" /> {new Date(a.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {a.instructions && (
                            <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.7 }}>
                              {a.instructions}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => startEditAssignment(a)} style={editBtn}>
                            Edit
                          </button>
                          <button onClick={() => delAssignment(a.id)} style={deleteBtn}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            {assignments.length === 0 &&
              renderEmpty('Assignments will appear here after you create them.', <FileTextIcon size={42} color={c.textFaint} />)}
          </div>
        </div>
      )}
    </div>
  )
}