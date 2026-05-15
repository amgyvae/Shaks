import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { EyeIcon, RocketIcon, SunIcon, MoonIcon } from '../../assets/icons/Icons'

function DayNightCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        width: '100%',
        maxWidth: 470,
        height: 320,
        borderRadius: 32,
        position: 'relative',
        overflow: 'hidden',
        background: '#0f172a',
        boxShadow: '0 35px 90px -20px rgba(0,0,0,0.28)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <motion.div
        animate={{
          background: [
            'linear-gradient(135deg, #7dd3fc 0%, #bfdbfe 45%, #eff6ff 100%)',
            'linear-gradient(135deg, #7dd3fc 0%, #bfdbfe 45%, #eff6ff 100%)',
            'linear-gradient(135deg, #0f172a 0%, #172554 45%, #1e3a8a 100%)',
            'linear-gradient(135deg, #0f172a 0%, #172554 45%, #1e3a8a 100%)',
            'linear-gradient(135deg, #7dd3fc 0%, #bfdbfe 45%, #eff6ff 100%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
        }}
      />

      {[...Array(9)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0, 0, 0.85, 1, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
          style={{
            position: 'absolute',
            top: `${14 + (i * 7) % 26}%`,
            left: `${12 + (i * 9) % 72}%`,
            width: i % 2 === 0 ? 3 : 2,
            height: i % 2 === 0 ? 3 : 2,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 0 8px rgba(255,255,255,0.9)',
          }}
        />
      ))}

      <motion.div
        animate={{
          x: [0, 0, 200, 200, 0],
          opacity: [1, 1, 0, 0, 1],
          scale: [1, 1.05, 0.82, 0.82, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 36,
          left: 38,
          width: 78,
          height: 78,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ffe58f 0%, #ffd54f 60%, #ffb300 100%)',
          boxShadow: '0 0 55px rgba(255,200,0,0.55)',
        }}
      />

      <motion.div
        animate={{
          x: [-90, -90, 0, 0, -90],
          opacity: [0, 0, 1, 1, 0],
          scale: [0.72, 0.72, 1, 1, 0.72],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 42,
          left: 42,
          width: 62,
          height: 62,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #e2e8f0 55%, #94a3b8 100%)',
          boxShadow: '0 0 40px rgba(255,255,255,0.25)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: 12,
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'rgba(15,23,42,0.94)',
          }}
        />
      </motion.div>

      <motion.div
        animate={{
          opacity: [1, 1, 0.18, 0.18, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 58,
          left: 122,
          width: 130,
          height: 34,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.22)',
          filter: 'blur(1px)',
        }}
      />

      <motion.div
        animate={{
          opacity: [1, 1, 0.15, 0.15, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{
          position: 'absolute',
          top: 116,
          right: 58,
          width: 108,
          height: 28,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.16)',
        }}
      />

      <motion.div
        animate={{
          background: [
            'linear-gradient(180deg, rgba(34,197,94,0) 0%, rgba(34,197,94,0) 35%, #22c55e 36%, #15803d 100%)',
            'linear-gradient(180deg, rgba(34,197,94,0) 0%, rgba(34,197,94,0) 35%, #22c55e 36%, #15803d 100%)',
            'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0) 35%, #0f172a 36%, #1e293b 100%)',
            'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0) 35%, #0f172a 36%, #1e293b 100%)',
            'linear-gradient(180deg, rgba(34,197,94,0) 0%, rgba(34,197,94,0) 35%, #22c55e 36%, #15803d 100%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 92,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{
            background: [
              'rgba(255,255,255,0.12)',
              'rgba(255,255,255,0.12)',
              'rgba(255,255,255,0.04)',
              'rgba(255,255,255,0.04)',
              'rgba(255,255,255,0.12)',
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
          }}
        />
      </motion.div>

      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: 28,
          right: 28,
          bottom: 24,
          height: 128,
          borderRadius: 28,
          background: 'rgba(255,255,255,0.14)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 18px 40px rgba(0,0,0,0.16)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <motion.div
            animate={{
              color: ['#0f172a', '#0f172a', '#ffffff', '#ffffff', '#0f172a'],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 14, fontWeight: 800 }}
          >
            Learning Access
          </motion.div>

          <motion.div
            animate={{
              background: [
                'rgba(37,99,235,0.12)',
                'rgba(37,99,235,0.12)',
                'rgba(255,255,255,0.12)',
                'rgba(255,255,255,0.12)',
                'rgba(37,99,235,0.12)',
              ],
              color: ['#2563eb', '#2563eb', '#e2e8f0', '#e2e8f0', '#2563eb'],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            day ↔ night
          </motion.div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {['activate access', 'set password', 'start learning'].map((item, index) => (
            <motion.div
              key={item}
              animate={{
                background: [
                  'rgba(255,255,255,0.72)',
                  'rgba(255,255,255,0.72)',
                  'rgba(255,255,255,0.12)',
                  'rgba(255,255,255,0.12)',
                  'rgba(255,255,255,0.72)',
                ],
                color: ['#334155', '#334155', '#e2e8f0', '#e2e8f0', '#334155'],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: index * 0.08 }}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'capitalize',
                backdropFilter: 'blur(8px)',
              }}
            >
              {item}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function RegisterPage() {
  const { register } = useAuth()
  const { toggle, theme, c } = useTheme()
  const { t } = useLanguage()
  const nav = useNavigate()

  const [phone, setPhone] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setOk('')
    setLoading(true)

    try {
      const user = await register(phone, pass)
      setOk('Account activated! Redirecting...')

      setTimeout(() => {
        if (user.role === 'admin') nav('/admin')
        else if (user.role === 'teacher') nav('/teacher')
        else nav('/student')
      }, 900)
    } catch (e: any) {
      const d = e.response?.data
      setErr(d?.phone_number?.[0] || d?.detail || 'Activation failed')
    } finally {
      setLoading(false)
    }
  }

  const inpStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 14px',
    borderRadius: 14,
    border: `1.5px solid ${c.inputBorder}`,
    background: c.input,
    color: c.text,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: c.bg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background:
            theme === 'dark'
              ? `
                radial-gradient(circle at 15% 20%, rgba(37,99,235,0.16), transparent 28%),
                radial-gradient(circle at 82% 26%, rgba(99,102,241,0.14), transparent 26%),
                radial-gradient(circle at 50% 80%, rgba(59,130,246,0.10), transparent 28%)
              `
              : `
                radial-gradient(circle at 15% 20%, rgba(37,99,235,0.10), transparent 28%),
                radial-gradient(circle at 82% 26%, rgba(99,102,241,0.08), transparent 26%),
                radial-gradient(circle at 50% 80%, rgba(59,130,246,0.08), transparent 28%)
              `,
        }}
      />

      {/* Left */}
      <div
        style={{
          flex: 1,
          maxWidth: 560,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 400,
            marginBottom: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.div
              whileHover={{ rotate: -8, scale: 1.05 }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: 'white',
                boxShadow: '0 0 0 4px rgba(37,99,235,0.2)',
              }}
            >
              M
            </motion.div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19, color: c.text, lineHeight: 1.1 }}>MLS</div>
              <div style={{ fontSize: 11, color: c.textFaint }}>Learning Platform</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LanguageSwitcher />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggle}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                border: `1px solid ${c.border}`,
                background: c.card,
                cursor: 'pointer',
                fontSize: 16,
                boxShadow: '0 8px 18px rgba(0,0,0,0.05)',
              }}
            >
              {theme === 'dark' ? <SunIcon size={16} color="currentColor" /> : <MoonIcon size={16} color="currentColor" />}
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '34px 30px',
            borderRadius: 28,
            background: c.card,
            border: `1px solid ${c.border}`,
            boxShadow: '0 24px 60px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <h2
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: c.text,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {t('register_title')}
          </h2>

          <p
            style={{
              fontSize: 14,
              color: c.textMuted,
              textAlign: 'center',
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            {t('register_subtitle')}
          </p>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 700,
                  color: c.text,
                  marginBottom: 7,
                }}
              >
                {t('register_phone_label')}
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 xxx xxx xx xx"
                required
                style={inpStyle}
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 700,
                  color: c.text,
                  marginBottom: 7,
                }}
              >
                {t('register_pass_label')}
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  style={{ ...inpStyle, paddingRight: 46 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  <EyeIcon size={16} color="currentColor" />
                </button>
              </div>
            </div>

            {err && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444',
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {err}
              </div>
            )}

            {ok && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: '#22c55e',
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {ok}
              </div>
            )}

            <motion.button
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: 'white',
                fontWeight: 700,
                fontSize: 15,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.65 : 1,
                boxShadow: '0 18px 36px -12px rgba(37,99,235,0.5)',
              }}
            >
              {loading ? t('register_loading') : t('register_btn')}
            </motion.button>
          </form>

          <p
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: c.textMuted,
              marginTop: 22,
              lineHeight: 1.6,
            }}
          >
            {t('register_already')}{' '}
            <Link
              to="/login"
              style={{
                color: '#2563eb',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {t('register_signin')}
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right */}
      <div
        style={{
          flex: 1,
          margin: 16,
          borderRadius: 28,
          background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 30px 70px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.06), transparent)',
            animation: 'shine 5s linear infinite',
          }}
        />

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ marginBottom: 28 }}
        >
          <DayNightCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ textAlign: 'center', maxWidth: 520, padding: '0 36px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 74, height: 74, borderRadius: 24, background: 'rgba(255,255,255,0.15)', marginBottom: 16 }}>
            <span style={{ fontSize: 36 }}><RocketIcon size={36} color="currentColor" /></span>
          </div>
          <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            {t('register_join')}
          </h3>
          <p style={{ fontSize: 14, opacity: 0.88, lineHeight: 1.7 }}>
            {t('register_rocket_sub')}
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </div>
  )
}