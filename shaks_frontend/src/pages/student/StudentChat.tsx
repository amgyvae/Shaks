import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { ChatIcon } from '../../assets/icons/Icons'

const WS_BASE = 'ws://localhost:8000'

export default function StudentChat() {
  const { c } = useTheme()
  const { user } = useAuth()

  const [rooms, setRooms] = useState<any[]>([])
  const [activeRoom, setActiveRoom] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [teachers, setTeachers] = useState<any[]>([])
  const [showTeachers, setShowTeachers] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get('/chat/rooms/')
      .then((r) => setRooms(r.data.results ?? r.data))
      .catch(() => setRooms([]))

    api.get('/auth/users/')
      .then((r) => {
        const all: any[] = r.data.results ?? r.data
        setTeachers(all.filter((u: any) => u.role === 'teacher' || u.role === 'admin'))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    return () => {
      wsRef.current?.close()
    }
  }, [])

  const currentTeacher = useMemo(() => {
    if (!activeRoom) return null
    return teachers.find((t) => t.full_name === activeRoom.teacher_name) ?? null
  }, [activeRoom, teachers])

  const getInitials = (name?: string) => {
    if (!name) return '?'
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }

  const closeSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  const openRoom = async (room: any) => {
    closeSocket()
    setActiveRoom(room)
    setLoadingMessages(true)
    setMessages([])

    try {
      const { data } = await api.get(`/chat/rooms/${room.id}/messages/`)
      setMessages(data.results ?? data)

      const token =
        localStorage.getItem('access') ??
        sessionStorage.getItem('access') ??
        ''

      const ws = new WebSocket(`${WS_BASE}/ws/chat/${room.id}/?token=${token}`)

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data)
        setMessages((prev) => [...prev, msg])
      }

      wsRef.current = ws
    } finally {
      setLoadingMessages(false)
    }
  }

  const startChat = async (teacherId: number) => {
    const { data } = await api.post('/chat/rooms/get-or-create/', { user_id: teacherId })

    setRooms((prev) => {
      const exists = prev.find((r) => r.id === data.id)
      return exists ? prev : [data, ...prev]
    })

    setShowTeachers(false)
    await openRoom(data)
  }

  const sendMessage = async () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    setSending(true)
    try {
      wsRef.current.send(JSON.stringify({ content: input.trim() }))
      setInput('')
    } finally {
      setSending(false)
    }
  }

  const shellStyle = {
    height: 'calc(100vh - 190px)',
    minHeight: 620,
    display: 'grid',
    gridTemplateColumns: '340px minmax(0, 1fr)',
    gap: 20,
  }

  const cardStyle = {
    borderRadius: 30,
    border: `1px solid ${c.border}`,
    background: c.card,
    boxShadow: '0 24px 70px rgba(0,0,0,0.10)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  }

  const glassInput = {
    padding: '14px 16px',
    borderRadius: 18,
    border: `1.5px solid ${c.inputBorder}`,
    background: c.input,
    color: c.text,
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ padding: '2px 0 8px' }}>
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
            LIVE MESSAGING
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
          Student Chat
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: c.textMuted,
            lineHeight: 1.7,
            maxWidth: 720,
          }}
        >
          Talk to teachers, ask questions, and keep your learning flow fast, clear, and organized.
        </p>
      </motion.div>

      <div style={shellStyle}>
        {/* LEFT SIDEBAR */}
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            ...cardStyle,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -50,
              right: -40,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(37,99,235,0.10)',
              filter: 'blur(24px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              padding: '20px 20px 16px',
              borderBottom: `1px solid ${c.border}`,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: c.text,
                    marginBottom: 4,
                  }}
                >
                  Messages
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: c.textMuted,
                  }}
                >
                  Your private teacher chats
                </div>
              </div>

              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowTeachers((p) => !p)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 14,
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 800,
                  boxShadow: '0 14px 30px -10px rgba(37,99,235,0.55)',
                }}
              >
                + New Chat
              </motion.button>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 18,
                background: c.input,
                border: `1px solid ${c.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: c.textFaint,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Active account
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: c.text,
                }}
              >
                {user?.full_name || 'Student'}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showTeachers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 220 }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  overflow: 'hidden',
                  borderBottom: `1px solid ${c.border}`,
                  background: c.bg,
                }}
              >
                <div style={{ padding: 14, height: '100%', overflowY: 'auto' }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: c.textFaint,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: 10,
                    }}
                  >
                    Start new conversation
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {teachers.map((t) => (
                      <motion.button
                        key={t.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => startChat(t.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 13px',
                          background: c.card,
                          border: `1px solid ${c.border}`,
                          borderRadius: 18,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 14,
                            background: 'rgba(37,99,235,0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            fontWeight: 800,
                            color: '#2563eb',
                            flexShrink: 0,
                            border: '1px solid rgba(37,99,235,0.12)',
                          }}
                        >
                          {getInitials(t.full_name)}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: c.text,
                              marginBottom: 4,
                            }}
                          >
                            {t.full_name}
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: c.textMuted,
                            }}
                          >
                            {t.role === 'admin' ? 'Administrator' : 'Teacher'}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {rooms.map((room) => {
              const active = activeRoom?.id === room.id
              return (
                <motion.button
                  key={room.id}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => openRoom(room)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '13px',
                    background: active ? 'rgba(37,99,235,0.10)' : c.input,
                    border: active
                      ? '1px solid rgba(37,99,235,0.20)'
                      : `1px solid ${c.border}`,
                    borderRadius: 20,
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: active ? '0 14px 30px rgba(37,99,235,0.10)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      background: active ? 'rgba(37,99,235,0.14)' : c.card,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 800,
                      color: active ? '#2563eb' : c.text,
                      flexShrink: 0,
                      border: active
                        ? '1px solid rgba(37,99,235,0.14)'
                        : `1px solid ${c.border}`,
                    }}
                  >
                    {getInitials(room.teacher_name)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 13.5,
                        color: active ? '#2563eb' : c.text,
                        marginBottom: 4,
                      }}
                    >
                      {room.teacher_name}
                    </div>

                    <div
                      style={{
                        fontSize: 11.5,
                        color: c.textFaint,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                      }}
                    >
                      {room.last_message?.content || 'Start your conversation'}
                    </div>
                  </div>

                  {room.unread_count > 0 && (
                    <span
                      style={{
                        minWidth: 22,
                        height: 22,
                        padding: '0 6px',
                        borderRadius: 999,
                        background: '#2563eb',
                        color: 'white',
                        fontSize: 11,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 18px rgba(37,99,235,0.30)',
                      }}
                    >
                      {room.unread_count}
                    </span>
                  )}
                </motion.button>
              )
            })}

            {rooms.length === 0 && (
              <div
                style={{
                  padding: '28px 16px',
                  textAlign: 'center',
                  color: c.textFaint,
                }}
              >
                <div style={{ marginBottom: 10 }}><ChatIcon size={32} color={c.textFaint} /></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 6 }}>
                  No chats yet
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.7 }}>
                  Start a new conversation with a teacher.
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* RIGHT CHAT AREA */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            ...cardStyle,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'rgba(168,85,247,0.10)',
              filter: 'blur(26px)',
              pointerEvents: 'none',
            }}
          />

          {activeRoom ? (
            <>
              {/* TOP BAR */}
              <div
                style={{
                  padding: '18px 22px',
                  borderBottom: `1px solid ${c.border}`,
                  background: c.card,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 18,
                      background: 'rgba(37,99,235,0.10)',
                      border: '1px solid rgba(37,99,235,0.16)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb',
                      fontWeight: 900,
                      fontSize: 15,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(activeRoom.teacher_name)}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: c.text,
                        marginBottom: 4,
                      }}
                    >
                      {activeRoom.teacher_name}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: c.textMuted,
                      }}
                    >
                      {currentTeacher?.role === 'admin' ? 'Administrator' : 'Teacher'} • Live conversation
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 16,
                    background: c.input,
                    border: `1px solid ${c.border}`,
                    fontSize: 12.5,
                    color: c.textMuted,
                    fontWeight: 700,
                  }}
                >
                  Private chat
                </div>
              </div>

              {/* MESSAGES */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '22px 22px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  background: `
                    radial-gradient(circle at top right, rgba(37,99,235,0.04), transparent 25%),
                    radial-gradient(circle at bottom left, rgba(168,85,247,0.04), transparent 20%),
                    ${c.bg}
                  `,
                }}
              >
                {loadingMessages ? (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: c.textFaint,
                      fontSize: 14,
                    }}
                  >
                    Loading messages...
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isMe = msg.sender_id === user?.id
                      return (
                        <motion.div
                          key={msg.id ?? i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            display: 'flex',
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '72%',
                              padding: '12px 14px 10px',
                              borderRadius: isMe
                                ? '22px 22px 8px 22px'
                                : '22px 22px 22px 8px',
                              background: isMe
                                ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                                : c.card,
                              color: isMe ? 'white' : c.text,
                              fontSize: 13.5,
                              lineHeight: 1.7,
                              border: isMe ? 'none' : `1px solid ${c.border}`,
                              boxShadow: isMe
                                ? '0 14px 28px rgba(37,99,235,0.18)'
                                : '0 10px 22px rgba(0,0,0,0.04)',
                              wordBreak: 'break-word',
                            }}
                          >
                            {!isMe && (
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  marginBottom: 5,
                                  color: c.textFaint,
                                }}
                              >
                                {msg.sender_name}
                              </div>
                            )}

                            <div>{msg.content}</div>

                            <div
                              style={{
                                fontSize: 10,
                                opacity: isMe ? 0.85 : 0.6,
                                marginTop: 6,
                                textAlign: 'right',
                              }}
                            >
                              {new Date(msg.sent_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              {/* INPUT BAR */}
              <div
                style={{
                  padding: '16px 18px',
                  borderTop: `1px solid ${c.border}`,
                  background: c.card,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-end',
                }}
              >
                <div style={{ flex: 1 }}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Write your message..."
                    style={glassInput}
                  />
                </div>

                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  style={{
                    padding: '14px 20px',
                    borderRadius: 18,
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    cursor: !input.trim() ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    fontSize: 13,
                    opacity: !input.trim() ? 0.55 : 1,
                    boxShadow: '0 16px 32px rgba(37,99,235,0.28)',
                    minWidth: 110,
                  }}
                >
                  {sending ? 'Sending...' : 'Send'}
                </motion.button>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 30,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  textAlign: 'center',
                  maxWidth: 460,
                }}
              >
                <div
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: 28,
                    margin: '0 auto 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(37,99,235,0.10)',
                    border: '1px solid rgba(37,99,235,0.16)',
                    boxShadow: '0 20px 40px rgba(37,99,235,0.10)',
                  }}
                >
                  <ChatIcon size={40} color="currentColor" />
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: c.text,
                    marginBottom: 10,
                    lineHeight: 1.1,
                  }}
                >
                  Your conversations start here
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: c.textMuted,
                    lineHeight: 1.8,
                  }}
                >
                  Select an existing chat on the left, or create a new one and message your teacher directly.
                </p>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}