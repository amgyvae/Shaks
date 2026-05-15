import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  HomeIcon, BookIcon, ClipboardIcon, SparklesIcon,
  ChatIcon, VideoIcon, UserIcon,
} from '../../assets/icons/Icons'

export default function StudentLayout() {
  const { c } = useTheme()
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const LINKS = [
    { to: '/student', label: t('nav_home'), Icon: HomeIcon, end: true, desc: t('desc_home') },
    { to: '/student/subjects', label: t('nav_subjects'), Icon: BookIcon, desc: t('desc_subjects') },
    { to: '/student/assignments', label: t('nav_assignments'), Icon: ClipboardIcon, desc: t('desc_assignments') },
    { to: '/student/feed', label: t('nav_feed'), Icon: SparklesIcon, desc: t('desc_feed') },
    { to: '/student/chat', label: t('nav_chat'), Icon: ChatIcon, desc: t('desc_chat') },
    { to: '/student/meetings', label: t('nav_meetings'), Icon: VideoIcon, desc: t('desc_meetings') },
    { to: '/student/profile', label: t('nav_profile'), Icon: UserIcon, desc: t('desc_profile') },
  ]

  const navLinks = LINKS.map(({ to, label, end }) => ({ to, label, end }))

  const currentPage =
    LINKS.find((link) =>
      link.end ? location.pathname === link.to : location.pathname.startsWith(link.to)
    ) || LINKS[0]

  const sidebarCard = {
    borderRadius: 26,
    border: `1px solid ${c.border}`,
    background: c.card,
    boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  }

  const glassCard = {
    borderRadius: isMobile ? 20 : 32,
    border: `1px solid ${c.border}`,
    background: c.card,
    boxShadow: `0 24px 70px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.05)`,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 0% 0%, rgba(59,130,246,0.18), transparent 25%),
          radial-gradient(circle at 100% 0%, rgba(168,85,247,0.14), transparent 24%),
          radial-gradient(circle at 50% 100%, rgba(37,99,235,0.10), transparent 30%),
          linear-gradient(180deg, ${c.bg} 0%, ${c.bg} 100%)
        `,
        position: 'relative',
        overflowX: 'hidden',
        paddingBottom: isMobile ? 80 : 0,
      }}
    >
      <div style={{ position: 'fixed', top: -140, left: -120, width: 360, height: 360, borderRadius: '50%', background: 'rgba(59,130,246,0.18)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: 120, right: -100, width: 320, height: 320, borderRadius: '50%', background: 'rgba(168,85,247,0.14)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: -120, left: '30%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(37,99,235,0.12)', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar links={navLinks} roleLabel={t('student_mode_val')} accentColor="#2563eb" />

        <div style={{ maxWidth: 1540, margin: '0 auto', padding: isMobile ? '16px 12px 20px' : '28px 20px 40px' }}>
          {isMobile ? (
            /* MOBILE: single column, full width */
            <motion.main
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{ ...glassCard, padding: 16, position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: 16 }}>
                  <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900, color: c.text, lineHeight: 1.1 }}>
                    {currentPage.label}
                  </h1>
                  <p style={{ margin: 0, fontSize: 13, color: c.textMuted, lineHeight: 1.6 }}>
                    {currentPage.desc}
                  </p>
                </div>
                <Outlet />
              </div>
            </motion.main>
          ) : (
            /* DESKTOP: sidebar + content */
            <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
              {/* LEFT SIDEBAR */}
              <motion.aside
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45 }}
                style={{ position: 'sticky', top: 94 }}
              >
                <div style={{ ...sidebarCard, padding: 20, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: 'rgba(37,99,235,0.12)', filter: 'blur(26px)', pointerEvents: 'none' }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 14px',
                        borderRadius: 999,
                        background: 'rgba(37,99,235,0.10)',
                        border: '1px solid rgba(37,99,235,0.20)',
                        marginBottom: 16,
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 12px rgba(37,99,235,0.45)' }} />
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', letterSpacing: '0.03em' }}>
                        {t('student_os')}
                      </span>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: c.text, lineHeight: 1.1, marginBottom: 8 }}>
                        {t('student_learn')}
                        <br />
                        {t('student_not_louder')}
                      </div>
                      <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.7 }}>
                        {t('student_workspace_desc')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                      {LINKS.map((link) => {
                        const active = link.end
                          ? location.pathname === link.to
                          : location.pathname.startsWith(link.to)
                        const IconComp = link.Icon

                        return (
                          <motion.button
                            key={link.to}
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => navigate(link.to)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              borderRadius: 20,
                              padding: '14px 14px',
                              border: active ? '1px solid rgba(37,99,235,0.20)' : `1px solid ${c.border}`,
                              background: active ? 'rgba(37,99,235,0.10)' : c.input,
                              color: active ? '#2563eb' : c.text,
                              cursor: 'pointer',
                              transition: 'all 0.25s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div
                                style={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: 14,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: active ? 'rgba(37,99,235,0.14)' : c.card,
                                  border: active ? '1px solid rgba(37,99,235,0.18)' : `1px solid ${c.border}`,
                                  flexShrink: 0,
                                }}
                              >
                                <IconComp size={18} color={active ? '#2563eb' : c.textMuted} />
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: active ? '#2563eb' : c.text, marginBottom: 3 }}>
                                  {link.label}
                                </div>
                                <div style={{ fontSize: 12, color: active ? '#2563eb' : c.textMuted, opacity: active ? 0.9 : 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {link.desc}
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>

                    <div
                      style={{
                        padding: 16,
                        borderRadius: 22,
                        background: `linear-gradient(135deg, rgba(37,99,235,0.16), rgba(99,102,241,0.10))`,
                        border: '1px solid rgba(37,99,235,0.18)',
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 800, letterSpacing: '0.05em', marginBottom: 8 }}>
                        {t('student_current_page')}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: c.text, marginBottom: 4 }}>
                        {currentPage.label}
                      </div>
                      <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.6 }}>
                        {currentPage.desc}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>

              {/* RIGHT CONTENT SHELL */}
              <motion.main
                initial={{ opacity: 0, y: 18, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{ ...glassCard, minHeight: 'calc(100vh - 130px)', padding: 28, position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: -80, left: 60, width: 420, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(42px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: -20, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(37,99,235,0.12)', filter: 'blur(30px)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', marginBottom: 24 }}>
                    <div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 15px',
                          borderRadius: 999,
                          background: 'rgba(37,99,235,0.10)',
                          border: '1px solid rgba(37,99,235,0.20)',
                          marginBottom: 14,
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 12px rgba(37,99,235,0.45)' }} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', letterSpacing: '0.03em' }}>Shaks</span>
                      </div>

                      <h1 style={{ margin: '0 0 8px', fontSize: 34, fontWeight: 900, color: c.text, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                        {currentPage.label}
                      </h1>

                      <p style={{ margin: 0, fontSize: 14, color: c.textMuted, lineHeight: 1.7, maxWidth: 720 }}>
                        {currentPage.desc}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))', gap: 12, minWidth: 280 }}>
                      {[
                        { label: t('student_focus'), value: t('student_focus_val') },
                        { label: t('student_mode'), value: t('student_mode_val') },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{ padding: '14px 16px', borderRadius: 20, background: c.input, border: `1px solid ${c.border}` }}
                        >
                          <div style={{ fontSize: 11, color: c.textFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderRadius: 26, padding: 6 }}>
                    <Outlet />
                  </div>
                </div>
              </motion.main>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            background: c.card,
            borderTop: `1px solid ${c.border}`,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            display: 'flex',
            alignItems: 'stretch',
            padding: '6px 4px calc(6px + env(safe-area-inset-bottom))',
          }}
        >
          {LINKS.map((link) => {
            const active = link.end
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to)
            const IconComp = link.Icon
            return (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  padding: '6px 2px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 12,
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: active ? 'rgba(37,99,235,0.12)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IconComp size={20} color={active ? '#2563eb' : c.textFaint} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: active ? '#2563eb' : c.textFaint, letterSpacing: '0.02em', maxWidth: 44, textAlign: 'center', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {link.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
