import { useLanguage } from '../context/LanguageContext'
import type { Lang } from '../context/LanguageContext'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'kz', label: 'KZ' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const { c } = useTheme()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '4px',
        borderRadius: 12,
        background: c.input,
        border: `1px solid ${c.border}`,
      }}
    >
      {LANGS.map((l) => (
        <motion.button
          key={l.code}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLang(l.code)}
          style={{
            padding: '5px 9px',
            borderRadius: 8,
            border: 'none',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            transition: 'all 0.18s ease',
            background: lang === l.code ? '#2563eb' : 'transparent',
            color: lang === l.code ? 'white' : c.textMuted,
          }}
        >
          {l.label}
        </motion.button>
      ))}
    </div>
  )
}
