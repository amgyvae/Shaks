import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useIsMobile } from '../hooks/useIsMobile'
import NotificationsDropdown from './NotificationsDropdown'
import LanguageSwitcher from './LanguageSwitcher'
import { SunIcon, MoonIcon, LogOutIcon } from '../assets/icons/Icons'

interface NavbarProps {
  links: { to: string; label: string; end?: boolean }[]
  roleLabel: string
  accentColor?: string
}

export default function Navbar({
  links,
  roleLabel,
  accentColor = '#2563eb',
}: NavbarProps) {
  const { user, logout } = useAuth()
  const { theme, toggle, c } = useTheme()
  const location = useLocation()
  const isMobile = useIsMobile()

  const initials =
    user?.full_name
      ?.split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??'

  const avatarUrl = (user as any)?.avatar

  const activeLink =
    links.find((l) =>
      l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)
    ) || links[0]

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        padding: '14px 18px 0',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          minHeight: 78,
          padding: '14px 18px',
          borderRadius: 26,
          border: `1px solid ${c.navBorder || c.border}`,
          background: c.navBg,
          boxShadow: `0 18px 50px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.05)`,
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        {/* LEFT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 0, flex: 1 }}>
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', minWidth: 'fit-content' }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: 'white',
                fontSize: 16,
                background: `linear-gradient(135deg, ${accentColor}, #60a5fa)`,
                boxShadow: '0 14px 30px rgba(37,99,235,0.30)',
                flexShrink: 0,
              }}
            >
              M
            </div>
            {!isMobile && (
              <div style={{ lineHeight: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: c.text, letterSpacing: '-0.03em', marginBottom: 4 }}>
                  MLS
                </div>
                <div style={{ fontSize: 11, color: c.textFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Learning System
                </div>
              </div>
            )}
          </Link>

          {/* CENTER NAV — hidden on mobile (bottom nav handles it) */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  style={({ isActive }) => ({
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 14px',
                    borderRadius: 14,
                    fontSize: 13,
                    fontWeight: 800,
                    color: isActive ? accentColor : c.textMuted,
                    background: isActive ? 'rgba(37,99,235,0.10)' : 'transparent',
                    border: isActive ? '1px solid rgba(37,99,235,0.18)' : '1px solid transparent',
                    boxShadow: isActive ? '0 10px 24px rgba(37,99,235,0.10)' : 'none',
                    transition: 'all 0.22s ease',
                    whiteSpace: 'nowrap',
                  })}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* current page pill */}
          <div
            className="hidden lg:flex"
            style={{
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 16,
              background: c.input,
              border: `1px solid ${c.border}`,
              color: c.textMuted,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor, boxShadow: `0 0 10px ${accentColor}55` }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: c.text }}>
              {activeLink?.label || roleLabel}
            </span>
          </div>

          {/* language switcher */}
          <LanguageSwitcher />

          {/* theme toggle */}
          <motion.button
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggle}
            title="Toggle theme"
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${c.border}`,
              background: c.input,
              color: c.textMuted,
              cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? <SunIcon size={18} color={c.textMuted} /> : <MoonIcon size={18} color={c.textMuted} />}
          </motion.button>

          {/* notifications */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 44,
              minHeight: 44,
              borderRadius: 16,
              border: `1px solid ${c.border}`,
              background: c.input,
              padding: '0 2px',
            }}
          >
            <NotificationsDropdown />
          </div>

          {/* user block */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingLeft: 10,
              marginLeft: 2,
              borderLeft: `1px solid ${c.border}`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 900,
                color: 'white',
                background: avatarUrl ? 'transparent' : `linear-gradient(135deg, ${accentColor}, #60a5fa)`,
                boxShadow: '0 12px 26px rgba(37,99,235,0.24)',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>

            <div className="hidden md:block" style={{ lineHeight: 1.15 }}>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: c.text,
                  marginBottom: 4,
                  maxWidth: 140,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.full_name || 'User'}
              </div>
              <div style={{ fontSize: 11, color: c.textFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {roleLabel}
              </div>
            </div>

            <motion.button
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={logout}
              title="Logout"
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${c.border}`,
                background: c.input,
                color: c.textFaint,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444'
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.24)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = c.textFaint
                e.currentTarget.style.borderColor = c.border
              }}
            >
              <LogOutIcon size={16} />
            </motion.button>
          </div>
        </div>
      </nav>
    </div>
  )
}
