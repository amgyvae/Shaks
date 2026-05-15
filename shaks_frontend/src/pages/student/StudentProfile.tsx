import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../api/axios'
import {
  CameraIcon, BellIcon, CheckIcon, ClockIcon, SaveIcon, EditIcon,
  BarChartIcon, ClipboardIcon,
} from '../../assets/icons/Icons'

const STATUS_COLORS: Record<string, string> = {
  approved: '#16a34a',
  pending: '#d97706',
  rejected: '#dc2626',
}

export default function StudentProfile() {
  const { user, setUser } = useAuth() as any
  const { c } = useTheme()
  const { t } = useLanguage()

  const [submissions, setSubmissions] = useState<any[]>([])
  const [form, setForm] = useState({ full_name: '', phone_number: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [notifications, setNotifications] = useState<any[]>([])
  const [notifLoading, setNotifLoading] = useState(true)

  useEffect(() => {
    api.get('/assignments/submissions/')
      .then((r) => setSubmissions(r.data.results ?? r.data))
      .catch(() => setSubmissions([]))

    api.get('/auth/me/')
      .then((r) => {
        const d = r.data
        setForm({ full_name: d.full_name || '', phone_number: d.phone_number || '', email: d.email || '' })
        if (d.avatar) setAvatarPreview(d.avatar)
      })
      .catch(() => {})

    api.get('/notifications/')
      .then((r) => setNotifications(r.data?.results ?? r.data ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false))
  }, [])

  const approved = useMemo(() => submissions.filter((s) => s.status === 'approved').length, [submissions])
  const pending = useMemo(() => submissions.filter((s) => s.status === 'pending').length, [submissions])
  const rejected = useMemo(() => submissions.filter((s) => s.status === 'rejected').length, [submissions])
  const total = submissions.length
  const rate = total > 0 ? Math.round((approved / total) * 100) : 0

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    setError('')
    try {
      const fd = new FormData()
      fd.append('full_name', form.full_name)
      if (form.phone_number) fd.append('phone_number', form.phone_number)
      if (form.email) fd.append('email', form.email)
      if (avatarFile) fd.append('avatar', avatarFile)
      const { data } = await api.patch('/auth/me/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (setUser) setUser(data)
      setSuccess(t('profile_saved'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error saving profile.')
    } finally {
      setSaving(false)
    }
  }

  const markNotifRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/`, { is_read: true })
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/')
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const initials = user?.full_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'S'

  const card = {
    borderRadius: 28,
    background: c.card,
    border: `1px solid ${c.border}`,
    padding: 24,
    boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
  }

  const inp = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 16,
    border: `1px solid ${c.border}`,
    background: c.input,
    color: c.text,
    fontSize: 14,
    fontWeight: 600,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const statusLabel = (s: string) => {
    if (s === 'approved') return t('status_approved')
    if (s === 'pending') return t('status_pending')
    if (s === 'rejected') return t('status_rejected')
    return s
  }

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t('student_profile_label')}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 22 }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Avatar hero */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 26,
                  background: avatarPreview ? 'transparent' : 'linear-gradient(135deg, #2563eb, #60a5fa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 900,
                  color: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 12px 26px rgba(37,99,235,0.24)',
                }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initials}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => fileRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
                  width: 32,
                  height: 32,
                  borderRadius: 11,
                  background: '#2563eb',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 5px 12px rgba(37,99,235,0.35)',
                }}
              >
                <CameraIcon size={13} color="white" />
              </motion.button>
            </div>
            <div>
              <div style={{ fontSize: 21, fontWeight: 800, color: c.text, marginBottom: 4 }}>
                {form.full_name || user?.full_name || 'Student'}
              </div>
              <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Student
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={() => fileRef.current?.click()}
                style={{
                  padding: '7px 14px',
                  borderRadius: 11,
                  border: `1px solid ${c.border}`,
                  background: c.input,
                  color: c.textMuted,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <CameraIcon size={13} color={c.textMuted} />
                {avatarPreview ? t('profile_change_photo') : t('profile_upload_photo')}
              </motion.button>
            </div>
          </motion.div>

          {/* Edit form */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <EditIcon size={17} color="#2563eb" />
              <span style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{t('profile_title')}</span>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: c.text, marginBottom: 7 }}>{t('profile_full_name')}</label>
                  <input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} style={inp} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: c.text, marginBottom: 7 }}>{t('profile_phone')}</label>
                  <input value={form.phone_number} onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))} style={inp} placeholder="+7 xxx xxx xx xx" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: c.text, marginBottom: 7 }}>{t('profile_email')}</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inp} placeholder="name@example.com" />
                </div>

                {error && <div style={{ padding: '11px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', color: '#ef4444', fontSize: 13, fontWeight: 600 }}>{error}</div>}
                {success && (
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '11px 14px', borderRadius: 12, background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)', color: '#16a34a', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckIcon size={13} color="#16a34a" /> {success}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '13px 26px',
                    borderRadius: 16,
                    background: saving ? '#93c5fd' : '#2563eb',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: 14,
                    border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 12px 24px -8px rgba(37,99,235,0.42)',
                  }}
                >
                  <SaveIcon size={15} color="white" />
                  {saving ? t('profile_saving') : t('profile_save')}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <BarChartIcon size={17} color="#2563eb" />
              <span style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{t('student_learning_status')}</span>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: c.textMuted }}>{t('student_submission_rate')}</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#2563eb' }}>{rate}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: c.input, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${rate}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #2563eb, #60a5fa)' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: t('student_total_submissions'), val: total, color: '#2563eb' },
                { label: t('student_approved'), val: approved, color: '#16a34a' },
                { label: t('student_pending'), val: pending, color: '#d97706' },
                { label: t('student_rejected'), val: rejected, color: '#dc2626' },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 16, background: c.input, border: `1px solid ${c.border}` }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: item.color }}>{item.val}</div>
                  <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4, lineHeight: 1.3 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent submissions */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <ClipboardIcon size={17} color="#2563eb" />
              <span style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{t('student_recent_submissions')}</span>
            </div>
            {submissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: c.textMuted, fontSize: 13 }}>{t('student_no_submissions')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {submissions.slice(0, 5).map((s: any) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 16, background: c.input, border: `1px solid ${c.border}` }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.assignment_title || s.assignment?.title || 'Assignment'}
                      </div>
                      <div style={{ fontSize: 11, color: c.textMuted, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <ClockIcon size={11} color={c.textFaint} />
                        {new Date(s.submitted_at || s.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 800,
                      color: STATUS_COLORS[s.status] || c.textMuted,
                      background: `${STATUS_COLORS[s.status] || '#6b7280'}18`,
                      border: `1px solid ${STATUS_COLORS[s.status] || '#6b7280'}30`,
                      whiteSpace: 'nowrap',
                    }}>
                      {statusLabel(s.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* RIGHT: Notifications */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}>
          <div style={{ ...card, position: 'sticky', top: 94 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <BellIcon size={17} color="#2563eb" />
                <span style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{t('profile_notifications')}</span>
                {unreadCount > 0 && (
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#2563eb', color: 'white', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={markAllRead}
                  style={{ padding: '5px 10px', borderRadius: 9, border: `1px solid ${c.border}`, background: c.input, color: c.textMuted, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                >
                  {t('profile_mark_all')}
                </motion.button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxHeight: 580, overflowY: 'auto' }}>
              {notifLoading ? (
                <div style={{ textAlign: 'center', padding: 24, color: c.textMuted }}>...</div>
              ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 36, color: c.textMuted }}>
                  <BellIcon size={32} color={c.border} style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 13 }}>{t('profile_no_notif')}</div>
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      padding: '13px 14px',
                      borderRadius: 16,
                      background: n.is_read ? c.input : 'rgba(37,99,235,0.06)',
                      border: n.is_read ? `1px solid ${c.border}` : '1px solid rgba(37,99,235,0.18)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 9 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: n.is_read ? 600 : 700, color: c.text, marginBottom: 4, lineHeight: 1.5 }}>
                          {n.message}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <ClockIcon size={11} color={c.textFaint} />
                          <span style={{ fontSize: 10, color: c.textFaint }}>
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {!n.is_read && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => markNotifRead(n.id)}
                          style={{ width: 26, height: 26, borderRadius: 9, background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                          title={t('profile_mark_read')}
                        >
                          <CheckIcon size={11} color="#2563eb" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
