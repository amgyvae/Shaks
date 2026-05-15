import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../api/axios'
import { CameraIcon, BellIcon, CheckIcon, ClockIcon, SaveIcon, EditIcon } from '../../assets/icons/Icons'

export default function TeacherProfile() {
  const { c } = useTheme()
  const { user, setUser } = useAuth() as any
  const { t } = useLanguage()

  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    email: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [notifications, setNotifications] = useState<any[]>([])
  const [notifLoading, setNotifLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me/')
      .then((r) => {
        const d = r.data
        setForm({
          full_name: d.full_name || '',
          phone_number: d.phone_number || '',
          email: d.email || '',
        })
        if (d.avatar) setAvatarPreview(d.avatar)
      })
      .finally(() => setLoading(false))

    api.get('/notifications/')
      .then((r) => setNotifications(r.data?.results ?? r.data ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false))
  }, [])

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
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const initials =
    user?.full_name
      ?.split(' ')
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'T'

  const card = {
    borderRadius: 28,
    background: c.card,
    border: `1px solid ${c.border}`,
    padding: 28,
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: c.textMuted }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${c.border}`, borderTopColor: '#2563eb' }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t('teacher_profile_label')}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        {/* LEFT: Profile form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Avatar + name */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ ...card, display: 'flex', alignItems: 'center', gap: 24 }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 28,
                  background: avatarPreview ? 'transparent' : 'linear-gradient(135deg, #2563eb, #60a5fa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 900,
                  color: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 14px 30px rgba(37,99,235,0.24)',
                }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initials}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  background: '#2563eb',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 6px 14px rgba(37,99,235,0.35)',
                }}
              >
                <CameraIcon size={14} color="white" />
              </motion.button>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 6 }}>
                {form.full_name || user?.full_name || 'Teacher'}
              </div>
              <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Teacher
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => fileRef.current?.click()}
                style={{
                  padding: '8px 16px',
                  borderRadius: 12,
                  border: `1px solid ${c.border}`,
                  background: c.input,
                  color: c.textMuted,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CameraIcon size={14} color={c.textMuted} />
                {avatarPreview ? t('profile_change_photo') : t('profile_upload_photo')}
              </motion.button>
            </div>
          </motion.div>

          {/* Edit form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <EditIcon size={18} color="#2563eb" />
              <span style={{ fontSize: 16, fontWeight: 800, color: c.text }}>{t('profile_title')}</span>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 8 }}>
                    {t('profile_full_name')}
                  </label>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    style={inp}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 8 }}>
                    {t('profile_phone')}
                  </label>
                  <input
                    value={form.phone_number}
                    onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                    style={inp}
                    placeholder="+7 xxx xxx xx xx"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 8 }}>
                    {t('profile_email')}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    style={inp}
                    placeholder="name@example.com"
                  />
                </div>

                {error && (
                  <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', color: '#ef4444', fontSize: 13, fontWeight: 600 }}>
                    {error}
                  </div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)', color: '#16a34a', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <CheckIcon size={14} color="#16a34a" />
                    {success}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '14px 28px',
                    borderRadius: 18,
                    background: saving ? '#93c5fd' : '#2563eb',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: 14,
                    border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 14px 28px -8px rgba(37,99,235,0.42)',
                  }}
                >
                  <SaveIcon size={16} color="white" />
                  {saving ? t('profile_saving') : t('profile_save')}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* RIGHT: Notifications */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div style={{ ...card }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BellIcon size={18} color="#2563eb" />
                <span style={{ fontSize: 16, fontWeight: 800, color: c.text }}>{t('profile_notifications')}</span>
                {unreadCount > 0 && (
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563eb', color: 'white', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={markAllRead}
                  style={{ padding: '6px 12px', borderRadius: 10, border: `1px solid ${c.border}`, background: c.input, color: c.textMuted, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  {t('profile_mark_all')}
                </motion.button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto' }}>
              {notifLoading ? (
                <div style={{ textAlign: 'center', padding: 30, color: c.textMuted }}>...</div>
              ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: c.textMuted }}>
                  <BellIcon size={36} color={c.border} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 13 }}>{t('profile_no_notif')}</div>
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 18,
                      background: n.is_read ? c.input : 'rgba(37,99,235,0.06)',
                      border: n.is_read ? `1px solid ${c.border}` : '1px solid rgba(37,99,235,0.18)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: n.is_read ? 600 : 700, color: c.text, marginBottom: 4, lineHeight: 1.5 }}>
                          {n.message}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ClockIcon size={12} color={c.textFaint} />
                          <span style={{ fontSize: 11, color: c.textFaint }}>
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {!n.is_read && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => markNotifRead(n.id)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 10,
                            background: 'rgba(37,99,235,0.10)',
                            border: '1px solid rgba(37,99,235,0.16)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          title={t('profile_mark_read')}
                        >
                          <CheckIcon size={12} color="#2563eb" />
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
