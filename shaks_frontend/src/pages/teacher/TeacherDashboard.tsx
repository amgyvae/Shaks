import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { motion } from 'framer-motion'
import { BookIcon, PackageIcon, ClockIcon, UsersIcon, PuzzleIcon, RocketIcon } from '../../assets/icons/Icons'

export default function TeacherDashboard() {
  const { c, theme } = useTheme()
  const [stats, setStats] = useState({
    subjects: 0,
    modules: 0,
    pending: 0,
    students: 0,
  })

  useEffect(() => {
    api
      .get('/courses/subjects/')
      .then((r) =>
        setStats((p) => ({ ...p, subjects: (r.data.results ?? r.data).length }))
      )

    api
      .get('/courses/modules/')
      .then((r) =>
        setStats((p) => ({ ...p, modules: (r.data.results ?? r.data).length }))
      )

    api
      .get('/assignments/submissions/')
      .then((r) =>
        setStats((p) => ({
          ...p,
          pending: (r.data.results ?? r.data).filter((s: any) => s.status === 'pending').length,
        }))
      )

    api
      .get('/auth/users/', { params: { role: 'student' } })
      .then((r) =>
        setStats((p) => ({ ...p, students: (r.data.results ?? r.data).length }))
      )
  }, [])

  const cards = useMemo(
    () => [
      {
        label: 'Subjects',
        val: stats.subjects,
        color: '#2563eb',
        icon: <BookIcon size={22} color="#2563eb" />,
        desc: 'Academic categories',
      },
      {
        label: 'Modules',
        val: stats.modules,
        color: '#22c55e',
        icon: <PackageIcon size={22} color="#22c55e" />,
        desc: 'Structured learning units',
      },
      {
        label: 'Pending Reviews',
        val: stats.pending,
        color: '#f59e0b',
        icon: <ClockIcon size={22} color="#f59e0b" />,
        desc: 'Submissions waiting for feedback',
      },
      {
        label: 'Students',
        val: stats.students,
        color: '#a855f7',
        icon: <UsersIcon size={22} color="#a855f7" />,
        desc: 'Active learners in the system',
      },
    ],
    [stats]
  )

  const totalContent = stats.subjects + stats.modules
  const productivityText =
    stats.pending === 0
      ? 'Everything is reviewed. Great job.'
      : `${stats.pending} submission${stats.pending > 1 ? 's are' : ' is'} waiting for review.`

  const panelStyle = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderRadius: 30,
    background: c.card,
    border: `1px solid ${c.border}`,
    boxShadow: '0 22px 50px rgba(0,0,0,0.06)',
  }

  return (
    <div style={{ padding: '4px 2px 20px' }}>
      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          ...panelStyle,
          padding: '34px 32px',
          marginBottom: 24,
          background:
            theme === 'dark'
              ? `
                radial-gradient(circle at 12% 20%, rgba(37,99,235,0.18), transparent 28%),
                radial-gradient(circle at 88% 24%, rgba(168,85,247,0.14), transparent 24%),
                linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.96))
              `
              : `
                radial-gradient(circle at 12% 20%, rgba(37,99,235,0.12), transparent 28%),
                radial-gradient(circle at 88% 24%, rgba(168,85,247,0.08), transparent 24%),
                linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.96))
              `,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 760 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 999,
                background: 'rgba(37,99,235,0.10)',
                border: '1px solid rgba(37,99,235,0.20)',
                marginBottom: 16,
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
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>
                Teacher Workspace
              </span>
            </div>

            <h1
              style={{
                fontSize: 38,
                fontWeight: 800,
                color: c.text,
                margin: '0 0 10px',
                lineHeight: 1.05,
              }}
            >
              Dashboard overview
            </h1>

            <p
              style={{
                fontSize: 15,
                color: c.textMuted,
                lineHeight: 1.8,
                margin: 0,
                maxWidth: 620,
              }}
            >
              Monitor your content structure, student base, and submission flow in one premium
              command center.
            </p>
          </div>

          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            style={{
              minWidth: 250,
              padding: '18px 18px',
              borderRadius: 24,
              background:
                theme === 'dark'
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(255,255,255,0.72)',
              border: `1px solid ${c.border}`,
              backdropFilter: 'blur(14px)',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#2563eb',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Quick insight
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: c.text,
                lineHeight: 1.5,
                marginBottom: 8,
              }}
            >
              {productivityText}
            </div>
            <div
              style={{
                fontSize: 13,
                color: c.textMuted,
                lineHeight: 1.7,
              }}
            >
              Total content units: {totalContent}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* STATS */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 18,
          marginBottom: 24,
        }}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -4, scale: 1.01 }}
            style={{
              ...panelStyle,
              padding: '24px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `${card.color}18`,
                filter: 'blur(16px)',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 18,
                  background: `${card.color}16`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  marginBottom: 18,
                  boxShadow: `0 10px 24px ${card.color}18`,
                }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: card.color,
                  marginBottom: 6,
                  lineHeight: 1,
                }}
              >
                {card.val}
              </div>

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: c.text,
                  marginBottom: 6,
                }}
              >
                {card.label}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: c.textMuted,
                  lineHeight: 1.7,
                }}
              >
                {card.desc}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* LOWER GRID */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: 18,
        }}
      >
        {/* Performance summary */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          style={{
            ...panelStyle,
            padding: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              flexWrap: 'wrap',
              marginBottom: 22,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: c.text,
                  marginBottom: 6,
                }}
              >
                Overview
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: c.textMuted,
                  lineHeight: 1.7,
                }}
              >
                A quick summary of your teaching environment.
              </div>
            </div>

            <div
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(37,99,235,0.08)',
                border: '1px solid rgba(37,99,235,0.16)',
                color: '#2563eb',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Live teacher stats
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {[
              {
                title: 'Learning structure',
                value: `${stats.subjects} subjects • ${stats.modules} modules`,
                icon: <PuzzleIcon size={16} color={c.textMuted} />,
              },
              {
                title: 'Student network',
                value: `${stats.students} students connected`,
                icon: <UsersIcon size={16} color={c.textMuted} />,
              },
              {
                title: 'Review queue',
                value:
                  stats.pending === 0
                    ? 'No pending reviews'
                    : `${stats.pending} submissions need review`,
                icon: <ClockIcon size={16} color={c.textMuted} />,
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.16 + i * 0.06 }}
                whileHover={{ x: 2 }}
                style={{
                  padding: '18px 18px',
                  borderRadius: 20,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 16,
                    background: c.input,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: c.text,
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: c.textMuted,
                      lineHeight: 1.7,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Focus card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{
            ...panelStyle,
            padding: '28px',
            background:
              theme === 'dark'
                ? `
                  radial-gradient(circle at top right, rgba(168,85,247,0.18), transparent 30%),
                  linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.96))
                `
                : `
                  radial-gradient(circle at top right, rgba(168,85,247,0.10), transparent 30%),
                  linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.98))
                `,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 20,
              background: 'rgba(168,85,247,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              marginBottom: 18,
            }}
          >
            <RocketIcon size={28} color="#a855f7" />
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: c.text,
              marginBottom: 10,
              lineHeight: 1.15,
            }}
          >
            Keep your workflow sharp
          </div>

          <p
            style={{
              fontSize: 14,
              color: c.textMuted,
              lineHeight: 1.8,
              margin: '0 0 18px',
            }}
          >
            Build content, review submissions faster, and keep your classroom experience polished.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              `${stats.pending} pending review${stats.pending === 1 ? '' : 's'}`,
              `${stats.students} students in your ecosystem`,
              `${totalContent} total content units`,
            ].map((line) => (
              <div
                key={line}
                style={{
                  padding: '12px 14px',
                  borderRadius: 16,
                  background:
                    theme === 'dark'
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${c.border}`,
                  fontSize: 13,
                  fontWeight: 600,
                  color: c.text,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}