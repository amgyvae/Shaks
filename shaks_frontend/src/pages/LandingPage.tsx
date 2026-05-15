import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef } from 'react'
import LanguageSwitcher from '../components/LanguageSwitcher'
import {
  PlayCircleIcon, ClipboardIcon, PeopleIcon,
  BarChartIcon, GraduationCapIcon,
  BookIcon, VideoIcon, BrainIcon, UserIcon,
  SunIcon, MoonIcon, FileTextIcon, UsersIcon,
} from '../assets/icons/Icons'

const EXAMPLE_IMAGES = [
  { src: 'https://picsum.photos/id/1015/1200/720', title: 'Student Dashboard' },
  { src: 'https://picsum.photos/id/160/1200/720', title: 'Video Lesson Player' },
  { src: 'https://picsum.photos/id/201/1200/720', title: 'Interactive Quiz' },
  { src: 'https://picsum.photos/id/870/1200/720', title: 'Community Feed' },
]

const TESTIMONIALS = [
  {
    quote: 'MLS изменил моё обучение! Видео-уроки и квизы — это огонь. Я вижу прогресс каждый день.',
    author: 'Айгерим К.',
    role: 'Ученица 11 класс, Астана',
    initials: 'АК',
  },
  {
    quote: 'Как учитель я экономлю часы на проверке заданий. Платформа очень удобная и современная.',
    author: 'Ерлан С.',
    role: 'Учитель математики',
    initials: 'ЕС',
  },
  {
    quote: 'Сообщество мотивирует! Делюсь прогрессом с друзьями и получаю поддержку.',
    author: 'Данияр М.',
    role: 'Студент университета',
    initials: 'ДМ',
  },
]

function DayNightHero(_props: { c: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, rotate: -6 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.01 }}
      style={{
        width: 430,
        maxWidth: '100%',
        height: 310,
        borderRadius: 34,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 35px 90px -20px rgba(37,99,235,0.35)',
        border: '1px solid rgba(255,255,255,0.12)',
        background: '#0f172a',
      }}
    >
      {/* animated sky */}
      <motion.div
        animate={{
          background: [
            'linear-gradient(135deg, #7dd3fc 0%, #bae6fd 35%, #eff6ff 100%)',
            'linear-gradient(135deg, #7dd3fc 0%, #bae6fd 35%, #eff6ff 100%)',
            'linear-gradient(135deg, #0f172a 0%, #172554 45%, #1e3a8a 100%)',
            'linear-gradient(135deg, #0f172a 0%, #172554 45%, #1e3a8a 100%)',
            'linear-gradient(135deg, #7dd3fc 0%, #bae6fd 35%, #eff6ff 100%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
        }}
      />

      {/* glow overlay */}
      <motion.div
        animate={{ opacity: [0.2, 0.3, 0.14, 0.18, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.55), transparent 25%), radial-gradient(circle at 75% 30%, rgba(255,255,255,0.15), transparent 28%)',
        }}
      />

      {/* stars */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0, 0, 0.9, 1, 0] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
          style={{
            position: 'absolute',
            top: `${14 + (i * 7) % 28}%`,
            left: `${10 + (i * 9) % 75}%`,
            width: i % 2 === 0 ? 3 : 2,
            height: i % 2 === 0 ? 3 : 2,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 0 10px rgba(255,255,255,0.9)',
          }}
        />
      ))}

      {/* clouds */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          opacity: [1, 1, 0.2, 0.2, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 55,
          left: 55,
          width: 120,
          height: 36,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.55)',
          filter: 'blur(1px)',
        }}
      />
      <motion.div
        animate={{
          x: [0, -20, 0],
          opacity: [1, 1, 0.15, 0.15, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        style={{
          position: 'absolute',
          top: 95,
          right: 65,
          width: 92,
          height: 28,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.48)',
          filter: 'blur(1px)',
        }}
      />

      {/* sun */}
      <motion.div
        animate={{
          x: [0, 0, 190, 190, 0],
          y: [0, 0, 10, 10, 0],
          opacity: [1, 1, 0, 0, 1],
          scale: [1, 1.06, 0.8, 0.8, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 42,
          left: 42,
          width: 82,
          height: 82,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ffe58f 0%, #ffd54f 60%, #ffb300 100%)',
          boxShadow: '0 0 55px rgba(255,200,0,0.55)',
        }}
      />

      {/* moon */}
      <motion.div
        animate={{
          x: [-90, -90, 0, 0, -90],
          y: [6, 6, 0, 0, 6],
          opacity: [0, 0, 1, 1, 0],
          scale: [0.7, 0.7, 1, 1, 0.7],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 48,
          left: 52,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #e2e8f0 55%, #94a3b8 100%)',
          boxShadow: '0 0 40px rgba(255,255,255,0.28)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: 12,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(15,23,42,0.95)',
          }}
        />
      </motion.div>

      {/* hills / bottom */}
      <motion.div
        animate={{
          background: [
            'linear-gradient(180deg, rgba(34,197,94,0.0) 0%, rgba(34,197,94,0.0) 55%, #22c55e 55%, #15803d 100%)',
            'linear-gradient(180deg, rgba(34,197,94,0.0) 0%, rgba(34,197,94,0.0) 55%, #22c55e 55%, #15803d 100%)',
            'linear-gradient(180deg, rgba(15,23,42,0.0) 0%, rgba(15,23,42,0.0) 55%, #0f172a 55%, #1e293b 100%)',
            'linear-gradient(180deg, rgba(15,23,42,0.0) 0%, rgba(15,23,42,0.0) 55%, #0f172a 55%, #1e293b 100%)',
            'linear-gradient(180deg, rgba(34,197,94,0.0) 0%, rgba(34,197,94,0.0) 55%, #22c55e 55%, #15803d 100%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* device */}
      <motion.div
        animate={{
          y: [0, -5, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: 34,
          right: 34,
          bottom: 28,
          height: 128,
          borderRadius: 28,
          background: 'rgba(255,255,255,0.16)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 18px 40px rgba(0,0,0,0.16)',
          padding: 22,
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
            Adaptive Screen
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
          {['video lessons', 'smart quizzes', 'study progress'].map((item, index) => (
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
                color: [
                  '#334155',
                  '#334155',
                  '#e2e8f0',
                  '#e2e8f0',
                  '#334155',
                ],
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

// Компонент для эффекта Воронки — возвращён обратно, но чуть мягче
function FunnelImage({
  src,
  title,
  index,
  scrollYProgress,
}: {
  src: string
  title: string
  index: number
  scrollYProgress: any
}) {
  const start = 0.15 + index * 0.2
  const end = start + 0.42

  const scale = useTransform(scrollYProgress, [start, end], [0.78, 1.18])
  const skewX = useTransform(scrollYProgress, [start, end], [0, index % 2 === 0 ? 10 : -10])
  const rotateY = useTransform(scrollYProgress, [start, end], [0, index % 2 === 0 ? 14 : -14])
  const y = useTransform(scrollYProgress, [start, end], [70, -10])
  const opacity = useTransform(scrollYProgress, [start - 0.08, start, end], [0.35, 1, 1])

  return (
    <motion.div
      style={{
        perspective: 1400,
        width: '100%',
        maxWidth: 760,
        position: 'relative',
        opacity,
      }}
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ duration: 0.25 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.img
          src={src}
          alt={title}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: 28,
            boxShadow: '0 35px 70px -20px rgba(37, 99, 235, 0.32)',
            scale,
            skewX,
            rotateY,
            y,
            transformOrigin: 'center center',
            filter: 'contrast(1.08) brightness(1.05)',
          }}
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            position: 'absolute',
            top: 28,
            right: 28,
            background: 'rgba(37,99,235,0.95)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: 9999,
            fontSize: 14,
            fontWeight: 700,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {title}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// Компонент для эффекта "Интерактивное повествование" — возвращён обратно
function StoryScreen({
  children,
  index,
  scrollYProgress,
}: {
  children: any
  index: number
  scrollYProgress: any
}) {
  const offset = index * 0.28

  const x = useTransform(scrollYProgress, [offset, offset + 0.65], ['-18%', '0%'])
  const y = useTransform(scrollYProgress, [offset, offset + 0.65], ['60px', '0px'])
  const rotateX = useTransform(scrollYProgress, [offset, offset + 0.65], [10, 0])
  const scale = useTransform(scrollYProgress, [offset, offset + 0.65], [0.92, 1])
  const opacity = useTransform(scrollYProgress, [offset - 0.15, offset, offset + 0.75], [0.3, 1, 1])

  return (
    <motion.div
      style={{
        x,
        y,
        scale,
        opacity,
        rotateX,
        transformStyle: 'preserve-3d',
        perspective: 1800,
        marginBottom: index === 2 ? 0 : 140,
      }}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const { c, theme, toggle } = useTheme()
  const { user } = useAuth()
  const { t } = useLanguage()
  const nav = useNavigate()

  const FEATURES = [
    { Icon: PlayCircleIcon, title: t('feature_video_title'), desc: t('feature_video_desc') },
    { Icon: BrainIcon, title: t('feature_quiz_title'), desc: t('feature_quiz_desc') },
    { Icon: ClipboardIcon, title: t('feature_assignments_title'), desc: t('feature_assignments_desc') },
    { Icon: PeopleIcon, title: t('feature_community_title'), desc: t('feature_community_desc') },
    { Icon: BarChartIcon, title: t('feature_progress_title'), desc: t('feature_progress_desc') },
    { Icon: GraduationCapIcon, title: t('feature_teachers_title'), desc: t('feature_teachers_desc') },
  ]

  const STEPS = [
    { num: '01', title: t('step1_title'), desc: t('step1_desc') },
    { num: '02', title: t('step2_title'), desc: t('step2_desc') },
    { num: '03', title: t('step3_title'), desc: t('step3_desc') },
  ]

  const STATS = [
    { Icon: BookIcon, label: t('landing_stats_subjects'), sub: t('landing_stats_subjects_sub') },
    { Icon: VideoIcon, label: t('landing_stats_videos'), sub: t('landing_stats_videos_sub') },
    { Icon: BrainIcon, label: t('landing_stats_quizzes'), sub: t('landing_stats_quizzes_sub') },
    { Icon: UserIcon, label: t('landing_stats_students'), sub: t('landing_stats_students_sub') },
  ]

  const dashboardPath = user
    ? user.role === 'admin'
      ? '/admin'
      : user.role === 'teacher'
        ? '/teacher'
        : '/student'
    : null

  const examplesRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: funnelScroll } = useScroll({
    target: examplesRef,
    offset: ['start end', 'end start'],
  })

  const storyRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: storyScroll } = useScroll({
    target: storyRef,
    offset: ['start end', 'end start'],
  })

  const { scrollYProgress } = useScroll()
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    mass: 0.8,
  })

  const heroY = useTransform(smoothScroll, [0, 1], [0, -60])
  const bgY = useTransform(smoothScroll, [0, 1], [0, -90])

  return (
    <div
      style={{
        background: c.bg,
        color: c.text,
        minHeight: '100vh',
        fontFamily: 'inherit',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* animated background */}
      <motion.div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          y: bgY,
          pointerEvents: 'none',
          background:
            theme === 'dark'
              ? `
                radial-gradient(circle at 15% 20%, rgba(37,99,235,0.18), transparent 28%),
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

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navbar */}
        <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: c.navBg,
            borderBottom: `1px solid ${c.navBorder}`,
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            height: 72,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <motion.div
              whileHover={{ rotate: -8, scale: 1.05 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                color: 'white',
                boxShadow: '0 0 0 4px rgba(37,99,235,0.2)',
              }}
            >
              M
            </motion.div>
            <span style={{ fontWeight: 700, fontSize: 19, color: c.text }}>MLS</span>
            <span style={{ fontSize: 13, color: c.textFaint, marginLeft: 4, letterSpacing: '-0.02em' }}>
              {t('landing_tagline')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LanguageSwitcher />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggle}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: `1px solid ${c.border}`,
                background: c.card,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {theme === 'dark' ? <SunIcon size={18} color={c.textMuted} /> : <MoonIcon size={18} color={c.textMuted} />}
            </motion.button>

            {dashboardPath ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => nav(dashboardPath)}
                style={{
                  padding: '10px 24px',
                  borderRadius: 14,
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px -5px #2563eb',
                }}
              >
                {t('landing_go_dashboard')}
              </motion.button>
            ) : (
              <>
                <motion.div whileHover={{ y: -2 }}>
                  <Link
                    to="/login"
                    style={{
                      padding: '10px 22px',
                      borderRadius: 14,
                      border: `1px solid ${c.border}`,
                      color: c.text,
                      fontWeight: 600,
                      fontSize: 14,
                      textDecoration: 'none',
                      background: c.card,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                    }}
                  >
                    {t('landing_signin')}
                  </Link>
                </motion.div>

                <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    style={{
                      padding: '10px 24px',
                      borderRadius: 14,
                      background: '#2563eb',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: 'none',
                      boxShadow: '0 10px 25px -5px #2563eb',
                    }}
                  >
                    {t('landing_activate')}
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <motion.section
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '100px 32px 80px',
            display: 'flex',
            alignItems: 'center',
            gap: 80,
            flexWrap: 'wrap',
            y: heroY,
          }}
        >
          <div style={{ flex: 1, minWidth: 300 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 9999,
                background: 'rgba(37,99,235,0.1)',
                border: '1px solid rgba(37,99,235,0.3)',
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#2563eb',
                  animation: 'pulse 2s infinite',
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
                Modern Learning System
              </span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.05, color: c.text, marginBottom: 24 }}
            >
              {t('landing_hero_title1')}<br />
              <span style={{ color: '#2563eb' }}>{t('landing_hero_title2')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ fontSize: 18, color: c.textMuted, lineHeight: 1.6, maxWidth: 520, marginBottom: 40 }}
            >
              {t('landing_hero_desc')}
            </motion.p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {dashboardPath ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => nav(dashboardPath)}
                  style={{
                    padding: '16px 36px',
                    borderRadius: 16,
                    background: '#2563eb',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 15px 30px -10px #2563eb',
                  }}
                >
                  {t('landing_go_dashboard')}
                </motion.button>
              ) : (
                <>
                  <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/register"
                      style={{
                        padding: '16px 36px',
                        borderRadius: 16,
                        background: '#2563eb',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 16,
                        textDecoration: 'none',
                        boxShadow: '0 15px 30px -10px #2563eb',
                      }}
                    >
                      {t('landing_start_free')}
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/login"
                      style={{
                        padding: '16px 36px',
                        borderRadius: 16,
                        border: `2px solid ${c.border}`,
                        color: c.text,
                        fontWeight: 600,
                        fontSize: 16,
                        textDecoration: 'none',
                        background: c.card,
                      }}
                    >
                      {t('landing_signin')}
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </div>

          {/* New premium hero visual with day/night */}
          <div style={{ flex: 1, minWidth: 300, display: 'flex', justifyContent: 'center' }}>
            <DayNightHero c={c} />
          </div>
        </motion.section>

        {/* Stats */}
        <section style={{ background: c.card, borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px', display: 'flex', justifyContent: 'center', gap: 80, flexWrap: 'wrap' }}>
            {STATS.map(({ Icon, label, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 18, background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.16)', margin: '0 auto 12px' }}>
                  <Icon size={24} color="#2563eb" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 17, color: c.text }}>{label}</div>
                <div style={{ fontSize: 13, color: c.textMuted }}>{sub}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: c.text, marginBottom: 12 }}>{t('landing_features_title')}</h2>
            <p style={{ fontSize: 16, color: c.textMuted, maxWidth: 520, margin: '0 auto' }}>
              {t('landing_features_sub')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                style={{
                  padding: '32px 28px',
                  borderRadius: 24,
                  background: c.card,
                  border: `1px solid ${c.border}`,
                  boxShadow: '0 14px 30px rgba(0,0,0,0.05)',
                }}
              >
                <motion.div
                  whileHover={{ rotate: -8, scale: 1.06 }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    background: 'rgba(37,99,235,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <f.Icon size={26} color="#2563eb" />
                </motion.div>

                <div style={{ fontWeight: 700, fontSize: 17, color: c.text, marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: c.textMuted, lineHeight: 1.7 }}>{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section style={{ background: c.card, borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontSize: 34, fontWeight: 800, color: c.text, marginBottom: 12 }}>{t('landing_how_title')}</h2>
              <p style={{ fontSize: 16, color: c.textMuted }}>{t('landing_how_sub')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  style={{
                    padding: '36px 28px',
                    borderRadius: 24,
                    border: `1px solid ${c.border}`,
                    background: c.bg,
                  }}
                >
                  <div style={{ fontSize: 42, fontWeight: 800, color: 'rgba(37,99,235,0.15)', marginBottom: 16, lineHeight: 1 }}>
                    {s.num}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: c.text, marginBottom: 12 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: c.textMuted, lineHeight: 1.7 }}>{s.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive story */}
        <section
          ref={storyRef}
          style={{
            padding: '120px 32px',
            background: c.card,
            position: 'relative',
          }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: c.text, marginBottom: 12 }}>Погрузись в MLS</h2>
            <p style={{ fontSize: 17, color: c.textMuted }}>
              Прокручивай вниз — интерфейс платформы оживает и превращается в интерактивное повествование
            </p>
          </div>

          <div style={{ maxWidth: 1100, margin: '0 auto', perspective: 2000 }}>
            <StoryScreen index={0} scrollYProgress={storyScroll}>
              <motion.div
                whileHover={{ y: -4 }}
                style={{
                  background: c.bg,
                  borderRadius: 28,
                  padding: 40,
                  boxShadow: '0 40px 100px -25px rgba(0,0,0,0.22)',
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 20, color: c.text, display: 'flex', alignItems: 'center', gap: 8 }}><GraduationCapIcon size={24} color={c.text} />Дашборд ученика</div>
                <div style={{ height: 340, background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 52, fontWeight: 700 }}>
                  87% прогресса
                </div>
              </motion.div>
            </StoryScreen>

            <StoryScreen index={1} scrollYProgress={storyScroll}>
              <motion.div
                whileHover={{ y: -4 }}
                style={{
                  background: c.bg,
                  borderRadius: 28,
                  padding: 40,
                  boxShadow: '0 40px 100px -25px rgba(0,0,0,0.22)',
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 20, color: c.text, display: 'flex', alignItems: 'center', gap: 8 }}><VideoIcon size={24} color={c.text} />Видео-урок</div>
                <div style={{ height: 380, background: '#0f172a', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 90 }}>
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.2, repeat: Infinity }}>
                    ►
                  </motion.div>
                </div>
                <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ padding: '10px 24px', background: c.card, borderRadius: 9999, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 6 }}><BrainIcon size={14} color="currentColor" />Тест после урока</span>
                  <span style={{ padding: '10px 24px', background: c.card, borderRadius: 9999, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 6 }}><FileTextIcon size={14} color="currentColor" />Задание</span>
                </div>
              </motion.div>
            </StoryScreen>

            <StoryScreen index={2} scrollYProgress={storyScroll}>
              <motion.div
                whileHover={{ y: -4 }}
                style={{
                  background: c.bg,
                  borderRadius: 28,
                  padding: 40,
                  boxShadow: '0 40px 100px -25px rgba(0,0,0,0.22)',
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 20, color: c.text, display: 'flex', alignItems: 'center', gap: 8 }}><UsersIcon size={24} color={c.text} />Сообщество MLS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {['Сегодня решил сложную задачу!', 'Кто уже прошёл модуль по алгебре?', 'Спасибо за помощь с геометрией!'].map((text, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -18 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 4 }}
                      style={{ padding: 22, background: c.card, borderRadius: 20, fontSize: 15, lineHeight: 1.5 }}
                    >
                      {text}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </StoryScreen>
          </div>
        </section>

        {/* Funnel effect */}
        <section ref={examplesRef} style={{ maxWidth: 1800, margin: '0 auto', padding: '100px 32px', background: c.card }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: c.text, marginBottom: 12 }}>MLS в действии</h2>
            <p style={{ fontSize: 17, color: c.textMuted, maxWidth: 480, margin: '0 auto' }}>
              Прокручивай — изображения расширяются и создают красивый воронкообразный эффект
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 120, alignItems: 'center' }}>
            {EXAMPLE_IMAGES.map((ex, index) => (
              <FunnelImage
                key={index}
                src={ex.src}
                title={ex.title}
                index={index}
                scrollYProgress={funnelScroll}
              />
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: c.text }}>{t('landing_testimonials_title')}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28 }}>
            {TESTIMONIALS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                style={{
                  padding: '36px 32px',
                  borderRadius: 28,
                  background: c.card,
                  border: `1px solid ${c.border}`,
                }}
              >
                <p style={{ fontSize: 17, lineHeight: 1.7, color: c.textMuted, fontStyle: 'italic', marginBottom: 32 }}>
                  «{item.quote}»
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      fontWeight: 800,
                      color: 'white',
                    }}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: c.text }}>{item.author}</div>
                    <div style={{ fontSize: 14, color: c.textMuted }}>{item.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        {!user && (
          <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              style={{
                padding: '64px 40px',
                borderRadius: 32,
                background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                boxShadow: '0 30px 70px -15px rgba(37,99,235,0.6)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.08), transparent)',
                  animation: 'shine 4.5s linear infinite',
                }}
              />
              <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 16 }}>{t('landing_cta_title')}</h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', marginBottom: 32, maxWidth: 460, margin: '0 auto 32px' }}>
                {t('landing_cta_desc')}
              </p>
              <Link
                to="/register"
                style={{
                  padding: '18px 40px',
                  borderRadius: 18,
                  background: 'white',
                  color: '#2563eb',
                  fontWeight: 700,
                  fontSize: 17,
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxShadow: '0 15px 30px -10px rgba(255,255,255,0.4)',
                }}
              >
                {t('landing_cta_btn')}
              </Link>
            </motion.div>
          </section>
        )}

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${c.border}`, padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 12, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, color: 'white' }}>
              M
            </div>
            <span style={{ fontWeight: 700, color: c.text, fontSize: 18 }}>MLS</span>
          </div>
          <p style={{ fontSize: 13, color: c.textFaint }}>{t('landing_footer')}</p>
        </footer>

        {/* Global animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }

          @keyframes shine {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(120%); }
          }
        `}</style>
      </div>
    </div>
  )
}