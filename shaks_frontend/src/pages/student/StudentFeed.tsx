import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { SparklesIcon, ChatIcon, CameraIcon, HeartIcon, UsersIcon } from '../../assets/icons/Icons'

export default function StudentFeed() {
  const { c } = useTheme()

  const [posts, setPosts] = useState<any[]>([])
  const [text, setText] = useState('')
  const [postFile, setPostFile] = useState<File | null>(null)
  const [comments, setComments] = useState<Record<number, string>>({})
  const [creating, setCreating] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  const load = () =>
    api.get('/social/posts/').then((r) => setPosts(r.data.results ?? r.data))

  useEffect(() => {
    load()
  }, [])

  const createPost = async () => {
    if (!text.trim()) return
    setCreating(true)
    try {
      const fd = new FormData()
      fd.append('text', text)
      if (postFile) fd.append('image', postFile)

      await api.post('/social/posts/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setText('')
      setPostFile(null)
      load()
    } finally {
      setCreating(false)
    }
  }

  const toggleLike = async (post: any) => {
    const { data } = await api.post(`/social/posts/${post.id}/like/`, {})
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              is_liked: data.liked,
              likes_count: p.likes_count + (data.liked ? 1 : -1),
            }
          : p
      )
    )
  }

  const addComment = async (post: any) => {
    const value = comments[post.id]?.trim()
    if (!value) return

    const { data } = await api.post(`/social/posts/${post.id}/comment/`, { text: value })

    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              comments: [...(p.comments || []), data],
              comments_count: (p.comments_count || 0) + 1,
            }
          : p
      )
    )

    setComments((prev) => ({ ...prev, [post.id]: '' }))
  }

  const inputStyle = {
    padding: '14px 16px',
    borderRadius: 18,
    border: `1.5px solid ${c.inputBorder}`,
    background: c.input,
    color: c.text,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
    width: '100%',
  }

  const cardStyle = {
    borderRadius: 28,
    border: `1px solid ${c.border}`,
    background: c.card,
    boxShadow: '0 24px 70px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  }

  const getInitials = (name?: string) => {
    if (!name) return '?'
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2px 0 10px' }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ marginBottom: 24 }}
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
          <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', letterSpacing: '0.03em' }}>
            COMMUNITY FEED
          </span>
        </div>

        <h1
          style={{
            margin: '0 0 10px',
            fontSize: 34,
            fontWeight: 900,
            color: c.text,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
          }}
        >
          Student Feed
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: c.textMuted,
            lineHeight: 1.7,
            maxWidth: 700,
          }}
        >
          Share progress, ask questions, post updates, and stay connected with your classmates in one premium social space.
        </p>
      </motion.div>

      {/* Create post */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          ...cardStyle,
          padding: 22,
          marginBottom: 22,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -20,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(37,99,235,0.10)',
            filter: 'blur(24px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 18,
                background: 'rgba(37,99,235,0.12)',
                border: '1px solid rgba(37,99,235,0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#2563eb',
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              <SparklesIcon size={16} color="currentColor" />
            </div>

            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: c.text,
                  marginBottom: 4,
                }}
              >
                Create a post
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: c.textMuted,
                }}
              >
                Share something useful, interesting, or inspiring with your classmates.
              </div>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="What’s on your mind today?"
            style={{
              ...inputStyle,
              resize: 'none',
              marginBottom: 14,
              display: 'block',
              lineHeight: 1.7,
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => fileRef.current?.click()}
                style={{
                  padding: '11px 16px',
                  borderRadius: 16,
                  border: `1px solid ${c.border}`,
                  background: c.input,
                  color: c.textMuted,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <CameraIcon size={14} style={{ marginRight: 4 }} />{postFile ? postFile.name.slice(0, 18) + '…' : 'Add photo'}
              </motion.button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => setPostFile(e.target.files?.[0] ?? null)}
              />

              {postFile && (
                <span
                  style={{
                    fontSize: 12,
                    color: c.textFaint,
                    background: c.input,
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  Ready to upload
                </span>
              )}
            </div>

            <motion.button
              whileHover={!text.trim() ? {} : { y: -2, scale: 1.02 }}
              whileTap={!text.trim() ? {} : { scale: 0.97 }}
              onClick={createPost}
              disabled={!text.trim() || creating}
              style={{
                padding: '12px 22px',
                borderRadius: 16,
                background: '#2563eb',
                color: 'white',
                fontWeight: 800,
                fontSize: 13,
                border: 'none',
                cursor: !text.trim() ? 'not-allowed' : 'pointer',
                opacity: !text.trim() ? 0.45 : 1,
                boxShadow: '0 16px 32px rgba(37,99,235,0.24)',
              }}
            >
              {creating ? 'Posting...' : 'Publish Post'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <AnimatePresence>
          {posts.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: index * 0.04 }}
              style={{
                ...cardStyle,
                padding: 22,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 900,
                    color: 'white',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    boxShadow: '0 12px 24px rgba(37,99,235,0.22)',
                  }}
                >
                  {getInitials(p.author_name)}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 14.5,
                      color: c.text,
                      marginBottom: 4,
                    }}
                  >
                    {p.author_name}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: c.textFaint,
                    }}
                  >
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 14.5,
                  color: c.text,
                  lineHeight: 1.8,
                  marginBottom: p.image ? 14 : 16,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {p.text}
              </div>

              {p.image && (
                <div
                  style={{
                    borderRadius: 22,
                    overflow: 'hidden',
                    border: `1px solid ${c.border}`,
                    marginBottom: 16,
                    background: c.input,
                  }}
                >
                  <img
                    src={p.image}
                    alt=""
                    style={{
                      width: '100%',
                      display: 'block',
                      maxHeight: 420,
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 0',
                  borderTop: `1px solid ${c.border}`,
                  borderBottom: `1px solid ${c.border}`,
                  marginBottom: 14,
                }}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleLike(p)}
                  style={{
                    background: p.is_liked ? 'rgba(244,63,94,0.10)' : 'none',
                    border: p.is_liked ? '1px solid rgba(244,63,94,0.18)' : 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: p.is_liked ? '#f43f5e' : c.textMuted,
                    fontWeight: 700,
                    borderRadius: 999,
                    padding: '8px 12px',
                  }}
                >
                  <HeartIcon size={14} style={{ marginRight: 4 }} />{p.likes_count}
                </motion.button>

                <div
                  style={{
                    fontSize: 13,
                    color: c.textMuted,
                    fontWeight: 700,
                    padding: '8px 12px',
                    borderRadius: 999,
                    background: c.input,
                    border: `1px solid ${c.border}`,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ChatIcon size={14} color="currentColor" style={{ marginRight: 4 }} />{p.comments_count}
                </div>
              </div>

              {!!p.comments?.length && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  {p.comments.map((cm: any) => (
                    <div
                      key={cm.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 16,
                        background: c.input,
                        border: `1px solid ${c.border}`,
                        fontSize: 13,
                        color: c.textMuted,
                        lineHeight: 1.7,
                      }}
                    >
                      <span style={{ fontWeight: 800, color: c.text }}>
                        {cm.author_name}:{' '}
                      </span>
                      {cm.text}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  value={comments[p.id] ?? ''}
                  onChange={(e) =>
                    setComments((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addComment(p)
                  }}
                  placeholder="Write a comment..."
                  style={{
                    ...inputStyle,
                    flex: 1,
                    borderRadius: 999,
                    padding: '12px 16px',
                  }}
                />

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addComment(p)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 999,
                    background: '#2563eb',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: 12.5,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 12px 24px rgba(37,99,235,0.22)',
                  }}
                >
                  Send
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...cardStyle,
              padding: '56px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><UsersIcon size={42} color={c.textFaint} /></div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: c.text,
                marginBottom: 8,
              }}
            >
              No posts yet
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: c.textMuted,
                lineHeight: 1.7,
              }}
            >
              Be the first to post something in the student community.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}