import { useEffect, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { motion } from 'framer-motion'
import { MegaphoneIcon } from '../../assets/icons/Icons'

export default function TeacherAnnouncements() {
  const { c } = useTheme()
  const [list, setList] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    api.get('/courses/announcements/').then((r) => setList(r.data.results ?? r.data))
  }, [])

  const post = async () => {
    if (!title.trim() || !body.trim()) return
    const { data } = await api.post('/courses/announcements/', { title, body })
    setList((prev) => [data, ...prev])
    setTitle('')
    setBody('')
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 16,
    border: `1px solid ${c.inputBorder}`,
    background: c.input,
    color: c.text,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'all 0.25s ease',
  }

  return (
    <div style={{ padding: '4px 2px 20px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 28 }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 999,
            background: 'rgba(37,99,235,0.10)',
            border: '1px solid rgba(37,99,235,0.22)',
            marginBottom: 14,
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
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', letterSpacing: '0.02em' }}>
            Teacher Panel
          </span>
        </div>

        <h1
          style={{
            fontSize: 34,
            fontWeight: 800,
            color: c.text,
            margin: '0 0 10px',
            lineHeight: 1.08,
          }}
        >
          Announcements
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 15,
            color: c.textMuted,
            lineHeight: 1.7,
            maxWidth: 700,
          }}
        >
          Publish important updates for your students in a clean and professional format.
        </p>
      </motion.div>

      {/* Create announcement card */}
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08 }}
        whileHover={{ y: -2 }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '28px',
          borderRadius: 28,
          background: c.card,
          border: `1px solid ${c.border}`,
          boxShadow: '0 20px 45px rgba(0,0,0,0.06)',
          marginBottom: 28,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(37,99,235,0.08)',
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 20,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: c.text,
                marginBottom: 6,
              }}
            >
              Create announcement
            </div>
            <div
              style={{
                fontSize: 13,
                color: c.textMuted,
                lineHeight: 1.6,
              }}
            >
              Share reminders, class updates, deadlines, or important news.
            </div>
          </div>

          <div
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.18)',
              fontSize: 12,
              fontWeight: 700,
              color: '#2563eb',
            }}
          >
            {list.length} published
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            style={{
              ...inputStyle,
              marginBottom: 14,
            }}
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here..."
            rows={5}
            style={{
              ...inputStyle,
              resize: 'none',
              marginBottom: 18,
              lineHeight: 1.6,
            }}
          />

          <motion.button
            whileHover={title.trim() && body.trim() ? { y: -2, scale: 1.02 } : {}}
            whileTap={title.trim() && body.trim() ? { scale: 0.98 } : {}}
            onClick={post}
            disabled={!title.trim() || !body.trim()}
            style={{
              padding: '13px 24px',
              borderRadius: 16,
              background: '#2563eb',
              color: 'white',
              fontWeight: 700,
              fontSize: 14,
              border: 'none',
              cursor: !title.trim() || !body.trim() ? 'not-allowed' : 'pointer',
              opacity: !title.trim() || !body.trim() ? 0.45 : 1,
              boxShadow: !title.trim() || !body.trim()
                ? 'none'
                : '0 14px 30px -10px rgba(37,99,235,0.7)',
              transition: 'all 0.25s ease',
            }}
          >
            Post Announcement
          </motion.button>
        </div>
      </motion.div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {list.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            whileHover={{ y: -4, scale: 1.01 }}
            viewport={{ once: true }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '24px 24px 20px',
              borderRadius: 24,
              background: c.card,
              border: `1px solid ${c.border}`,
              boxShadow: '0 16px 36px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                  'linear-gradient(135deg, rgba(37,99,235,0.04), transparent 35%, transparent 100%)',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                  flexWrap: 'wrap',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontWeight: 750,
                    color: c.text,
                    fontSize: 18,
                    lineHeight: 1.35,
                  }}
                >
                  {a.title}
                </div>

                <div
                  style={{
                    padding: '7px 12px',
                    borderRadius: 999,
                    background: 'rgba(37,99,235,0.08)',
                    border: '1px solid rgba(37,99,235,0.15)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#2563eb',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Announcement
                </div>
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: c.textMuted,
                  lineHeight: 1.8,
                  marginBottom: 16,
                }}
              >
                {a.body}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                  fontSize: 12,
                  color: c.textFaint,
                  paddingTop: 14,
                  borderTop: `1px solid ${c.border}`,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {a.author_name?.[0]?.toUpperCase() || 'T'}
                </span>

                <span>
                  By <span style={{ color: c.text, fontWeight: 600 }}>{a.author_name}</span>
                </span>

                <span style={{ opacity: 0.5 }}>•</span>

                <span>{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {list.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              padding: '56px 24px',
              borderRadius: 28,
              background: c.card,
              border: `1px solid ${c.border}`,
              textAlign: 'center',
              boxShadow: '0 16px 36px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}><MegaphoneIcon size={42} color={c.textFaint} /></div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: c.text,
                marginBottom: 8,
              }}
            >
              No announcements yet
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: c.textMuted,
                lineHeight: 1.7,
              }}
            >
              Your announcements will appear here after you publish the first one.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}