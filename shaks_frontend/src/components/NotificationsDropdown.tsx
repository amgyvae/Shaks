import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { BellIcon } from '../assets/icons/Icons'
import api from '../api/axios'

interface Notif { id: number; title: string; body: string; message?: string; is_read: boolean; created_at: string }

export default function NotificationsDropdown() {
  const { c } = useTheme()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const ref = useRef<HTMLDivElement>(null)

  const load = () => api.get('/notifications/').then(r => setNotifs(r.data.results ?? r.data)).catch(() => {})

  useEffect(() => {
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifs.filter(n => !n.is_read).length

  const markRead = async (n: Notif) => {
    if (n.is_read) return
    await api.post(`/notifications/${n.id}/mark_read/`).catch(() => {})
    setNotifs(p => p.map(x => x.id === n.id ? { ...x, is_read: true } : x))
  }

  const markAll = async () => {
    await api.post('/notifications/mark_all_read/').catch(() => {})
    setNotifs(p => p.map(x => ({ ...x, is_read: true })))
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', color: c.textMuted }}>
        <BellIcon size={18} color={c.textMuted} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 44, right: 0, width: 340, borderRadius: 20, background: c.card, border: `1px solid ${c.border}`, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', zIndex: 200, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${c.border}` }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: c.text }}>{t('notifications_title')}</span>
            {unread > 0 && (
              <button onClick={markAll} style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                {t('notifications_mark_all')}
              </button>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifs.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: c.textFaint, fontSize: 13 }}>
                {t('notifications_empty')}
              </div>
            )}
            {notifs.map(n => (
              <div key={n.id} onClick={() => markRead(n)}
                style={{ padding: '12px 18px', borderBottom: `1px solid ${c.border}`, cursor: 'pointer', background: n.is_read ? 'transparent' : 'rgba(37,99,235,0.05)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = c.input)}
                onMouseLeave={e => (e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(37,99,235,0.05)')}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? 'transparent' : '#2563eb', flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: c.text, marginBottom: 2 }}>{n.title || n.message}</div>
                    {n.body && <div style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.5 }}>{n.body}</div>}
                    <div style={{ fontSize: 11, color: c.textFaint, marginTop: 4 }}>
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
