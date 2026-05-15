import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  GridIcon, PuzzleIcon, ClipboardIcon, BrainIcon,
  FolderIcon, UsersIcon, MegaphoneIcon, ChatIcon,
  CalendarIcon, UserIcon, SunIcon, MoonIcon, LogOutIcon, XIcon,
} from '../../assets/icons/Icons'

export default function TeacherLayout() {
  const { c, theme, toggle } = useTheme()
  const { logout } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const LINKS = [
    { to: '/teacher', label: t('nav_dashboard'), Icon: GridIcon, end: true },
    { to: '/teacher/content', label: t('nav_content'), Icon: PuzzleIcon },
    { to: '/teacher/assignments', label: t('nav_assignments'), Icon: ClipboardIcon },
    { to: '/teacher/quizzes', label: t('nav_quizzes'), Icon: BrainIcon },
    { to: '/teacher/submissions', label: t('nav_submissions'), Icon: FolderIcon },
    { to: '/teacher/students', label: t('nav_students'), Icon: UsersIcon },
    { to: '/teacher/announcements', label: t('nav_announcements'), Icon: MegaphoneIcon },
    { to: '/teacher/chat', label: t('nav_chat'), Icon: ChatIcon },
    { to: '/teacher/meetings', label: t('nav_meetings'), Icon: CalendarIcon },
  ]

  const activeLabel =
    LINKS.find((l) =>
      l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)
    )?.label || t('teacher_panel')

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  const goToProfile = () => {
    navigate('/teacher/profile')
    setDrawerOpen(false)
  }

  const baseActionBtn = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '12px 18px',
    borderRadius: 16,
    fontWeight: 800,
    fontSize: 13,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    backdropFilter: 'blur(12px)',
    border: 'none',
  }

  const logoutBtnStyle = {
    ...baseActionBtn,
    border: '1px solid rgba(239,68,68,0.18)',
    background:
      theme === 'dark'
        ? 'linear-gradient(135deg, rgba(239,68,68,0.16), rgba(127,29,29,0.18))'
        : 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(254,226,226,0.92))',
    color: '#ef4444',
    boxShadow: '0 14px 30px -14px rgba(239,68,68,0.45)',
  }

  const profileBtnStyle = {
    ...baseActionBtn,
    border: '1px solid rgba(37,99,235,0.16)',
    background:
      theme === 'dark'
        ? 'linear-gradient(135deg, rgba(37,99,235,0.20), rgba(30,64,175,0.18))'
        : 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(219,234,254,0.95))',
    color: '#2563eb',
    boxShadow: '0 14px 30px -14px rgba(37,99,235,0.40)',
  }

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ padding: '10px 8px 24px', marginBottom: 12 }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <motion.div
            whileHover={{ rotate: -8, scale: 1.05 }}
            style={{
              width: 48, height: 48, borderRadius: 18,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: 18,
              boxShadow: '0 0 0 7px rgba(37,99,235,0.14)',
            }}
          >
            T
          </motion.div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.text, lineHeight: 1.1 }}>{t('teacher_panel')}</div>
            <div style={{ fontSize: 12, color: c.textFaint, marginTop: 3 }}>{t('teacher_premium')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ padding: '10px 14px', borderRadius: 16, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.16)', fontSize: 12, color: '#2563eb', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 12px rgba(37,99,235,0.45)' }} />
            {t('teacher_workspace')}
          </div>
          <motion.button
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggle}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 14, background: c.card, border: `1px solid ${c.border}`, color: c.text, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            {theme === 'dark' ? <SunIcon size={14} color={c.text} /> : <MoonIcon size={14} color={c.text} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </motion.button>
          <LanguageSwitcher />
        </div>
      </motion.div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {LINKS.map((link, index) => (
          <motion.div key={link.to} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.04 * index }}>
            <NavLink
              to={link.to}
              end={link.end}
              onClick={onNavigate}
              style={({ isActive }) => ({
                position: 'relative', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 18, textDecoration: 'none',
                color: isActive ? '#2563eb' : c.textMuted,
                fontWeight: isActive ? 700 : 600, fontSize: 14,
                overflowX: 'hidden',
                background: isActive ? 'rgba(37,99,235,0.10)' : 'transparent',
                border: isActive ? '1px solid rgba(37,99,235,0.16)' : '1px solid transparent',
                transition: 'all 0.25s ease',
              })}
            >
              {({ isActive }) => {
                const IconComp = link.Icon
                return (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="teacher-active-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        style={{ position: 'absolute', inset: 0, borderRadius: 18, background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.18)', boxShadow: '0 10px 30px rgba(37,99,235,0.12)' }}
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      style={{ position: 'relative', zIndex: 1, width: 34, height: 34, borderRadius: 12, background: isActive ? 'rgba(37,99,235,0.14)' : c.input, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      <IconComp size={16} color={isActive ? '#2563eb' : c.textMuted} />
                    </motion.div>
                    <span style={{ position: 'relative', zIndex: 1 }}>{link.label}</span>
                    {isActive && (
                      <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} style={{ position: 'relative', zIndex: 1, marginLeft: 'auto', fontSize: 16, color: '#2563eb' }}>
                        →
                      </motion.span>
                    )}
                  </>
                )
              }}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ marginTop: 24, padding: '18px', borderRadius: 24, background: theme === 'dark' ? 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(30,64,175,0.18))' : 'linear-gradient(135deg, rgba(37,99,235,0.10), rgba(30,64,175,0.08))', border: '1px solid rgba(37,99,235,0.14)', boxShadow: '0 18px 36px rgba(37,99,235,0.10)' }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 8 }}>{t('teacher_smart_flow')}</div>
          <div style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.7, marginBottom: 14 }}>{t('teacher_manage_desc')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={goToProfile} style={{ ...profileBtnStyle, width: '100%' }}>
              <UserIcon size={15} color="#2563eb" />
              <span>{t('teacher_open_profile')}</span>
            </motion.button>
            <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleLogout} style={{ ...logoutBtnStyle, width: '100%' }}>
              <LogOutIcon size={15} color="#ef4444" />
              <span>{t('teacher_exit')}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  )

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, position: 'relative', overflowX: 'hidden' }}>
      <motion.div
        animate={{ opacity: [0.9, 1, 0.92, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: theme === 'dark'
            ? `radial-gradient(circle at 12% 20%, rgba(37,99,235,0.18), transparent 26%),radial-gradient(circle at 85% 18%, rgba(59,130,246,0.12), transparent 24%),radial-gradient(circle at 50% 78%, rgba(99,102,241,0.12), transparent 28%)`
            : `radial-gradient(circle at 12% 20%, rgba(37,99,235,0.10), transparent 26%),radial-gradient(circle at 85% 18%, rgba(59,130,246,0.08), transparent 24%),radial-gradient(circle at 50% 78%, rgba(99,102,241,0.08), transparent 28%)`,
        }}
      />

      {isMobile ? (
        /* ── MOBILE LAYOUT ── */
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
          {/* Mobile top bar */}
          <header style={{ position: 'sticky', top: 0, zIndex: 30, padding: '12px 16px', background: theme === 'dark' ? 'rgba(15,23,42,0.90)' : 'rgba(255,255,255,0.90)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 14 }}>T</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: c.text, lineHeight: 1 }}>{activeLabel}</div>
                <div style={{ fontSize: 11, color: c.textFaint }}>{t('teacher_workspace')}</div>
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              style={{ width: 40, height: 40, borderRadius: 12, background: c.input, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 18, height: 2, borderRadius: 2, background: c.textMuted }} />
                ))}
              </div>
            </button>
          </header>

          {/* Mobile drawer overlay */}
          <AnimatePresence>
            {drawerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDrawerOpen(false)}
                  style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  style={{
                    position: 'fixed', top: 0, left: 0, bottom: 0, width: 300,
                    zIndex: 50, background: theme === 'dark' ? 'rgba(15,23,42,0.98)' : 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(18px)', borderRight: `1px solid ${c.border}`,
                    padding: '16px 14px', display: 'flex', flexDirection: 'column',
                    overflowY: 'auto',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      style={{ width: 36, height: 36, borderRadius: 10, background: c.input, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <XIcon size={16} color={c.textMuted} />
                    </button>
                  </div>
                  <SidebarContent onNavigate={() => setDrawerOpen(false)} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Mobile content */}
          <main style={{ padding: '16px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      ) : (
        /* ── DESKTOP LAYOUT ── */
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '290px 1fr', minHeight: '100vh' }}>
          <aside style={{ padding: '24px 18px', borderRight: `1px solid ${c.border}`, background: theme === 'dark' ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(18px)', position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' }}>
            <SidebarContent />
          </aside>

          <div style={{ minWidth: 0 }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 20, padding: '20px 28px 0', background: 'transparent', backdropFilter: 'blur(8px)' }}>
              <motion.div
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                style={{ borderRadius: 28, padding: '18px 22px', background: theme === 'dark' ? 'rgba(15,23,42,0.70)' : 'rgba(255,255,255,0.72)', border: `1px solid ${c.border}`, backdropFilter: 'blur(18px)', boxShadow: '0 16px 34px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', position: 'relative', overflowX: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: -70, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(37,99,235,0.10)', filter: 'blur(28px)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('teacher_workspace')}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: c.text, lineHeight: 1.1, marginBottom: 6 }}>{t('teacher_build')}</div>
                  <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.6 }}>{t('teacher_elegant')}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                  <div style={{ padding: '10px 14px', borderRadius: 14, background: c.card, border: `1px solid ${c.border}`, color: c.textMuted, fontSize: 13, fontWeight: 600 }}>{t('teacher_active_section')}</div>
                  <div style={{ padding: '10px 14px', borderRadius: 14, background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.16)', color: '#2563eb', fontSize: 13, fontWeight: 700 }}>{activeLabel}</div>
                  <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={goToProfile} style={profileBtnStyle}>
                    <UserIcon size={16} color="#2563eb" />
                    <span>{t('nav_profile')}</span>
                  </motion.button>
                  <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleLogout} style={logoutBtnStyle}>
                    <LogOutIcon size={16} color="#ef4444" />
                    <span>{t('teacher_log_out')}</span>
                  </motion.button>
                </div>
              </motion.div>
            </header>

            <main style={{ padding: '28px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 18, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{ maxWidth: 1320, margin: '0 auto' }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      )}
    </div>
  )
}
