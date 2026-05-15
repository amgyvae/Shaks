import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatIcon } from '../../assets/icons/Icons'

const WS_BASE = 'ws://localhost:8000'

export default function TeacherChat() {
  const { c, theme } = useTheme()
  const { user } = useAuth()

  const [rooms, setRooms] = useState<any[]>([])
  const [activeRoom, setActiveRoom] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [showStudents, setShowStudents] = useState(false)
  const [search, setSearch] = useState('')

  const wsRef = useRef<WebSocket | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get('/chat/rooms/').then((r) => setRooms(r.data.results ?? r.data))
    api
      .get('/auth/users/')
      .then((r) => {
        const all: any[] = r.data.results ?? r.data
        setStudents(all.filter((u: any) => u.role === 'student'))
      })
      .catch(() => {})
  }, [])

  const openRoom = async (room: any) => {
    if (wsRef.current) wsRef.current.close()

    setActiveRoom(room)

    const { data } = await api.get(`/chat/rooms/${room.id}/messages/`)
    setMessages(data.results ?? data)

    const token = localStorage.getItem('access') ?? sessionStorage.getItem('access') ?? ''
    const ws = new WebSocket(`${WS_BASE}/ws/chat/${room.id}/?token=${token}`)

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      setMessages((prev) => [...prev, msg])
    }

    wsRef.current = ws
  }

  const startChat = async (studentId: number) => {
    const { data } = await api.post('/chat/rooms/get-or-create/', { user_id: studentId })

    setRooms((prev) => {
      const exists = prev.find((r) => r.id === data.id)
      return exists ? prev : [data, ...prev]
    })

    setShowStudents(false)
    await openRoom(data)
  }

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ content: input.trim() }))
    setInput('')
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    return () => {
      wsRef.current?.close()
    }
  }, [])

  const inputStyle = {
    padding: '14px 16px',
    borderRadius: 16,
    border: `1px solid ${c.inputBorder}`,
    background: c.input,
    color: c.text,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const filteredRooms = rooms.filter((room) =>
    room.student_name?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredStudents = students.filter((student) =>
    student.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      style={{
        height: 'calc(100vh - 150px)',
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: 18,
      }}
    >
      {/* LEFT PANEL */}
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 30,
          overflow: 'hidden',
          background: c.card,
          border: `1px solid ${c.border}`,
          boxShadow: '0 24px 50px rgba(0,0,0,0.06)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
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
            position: 'relative',
            zIndex: 1,
            padding: '22px 20px 18px',
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: c.text,
                  lineHeight: 1.1,
                  marginBottom: 4,
                }}
              >
                Messages
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: c.textFaint,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                teacher communication
              </div>
            </div>

            <motion.button
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowStudents((p) => !p)}
              style={{
                padding: '10px 14px',
                borderRadius: 14,
                background: '#2563eb',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 14px 28px -10px rgba(37,99,235,0.65)',
              }}
            >
              + New
            </motion.button>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats or students..."
            style={{
              ...inputStyle,
              width: '100%',
            }}
          />
        </div>

        <AnimatePresence>
          {showStudents && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 220 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28 }}
              style={{
                overflow: 'hidden',
                borderBottom: `1px solid ${c.border}`,
                background:
                  theme === 'dark'
                    ? 'rgba(37,99,235,0.04)'
                    : 'rgba(37,99,235,0.03)',
              }}
            >
              <div
                style={{
                  padding: '14px 16px 8px',
                  fontSize: 12,
                  color: c.textMuted,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Start new chat
              </div>

              <div style={{ overflowY: 'auto', maxHeight: 180 }}>
                {filteredStudents.map((s, index) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(37,99,235,0.06)' }}
                    onClick={() => startChat(s.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderBottom: `1px solid ${c.navBorder}`,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'rgba(37,99,235,0.14)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 800,
                        color: '#2563eb',
                        flexShrink: 0,
                      }}
                    >
                      {s.full_name?.[0] ?? '?'}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: c.text,
                          marginBottom: 2,
                        }}
                      >
                        {s.full_name}
                      </div>
                      <div style={{ fontSize: 12, color: c.textFaint }}>student</div>
                    </div>
                  </motion.button>
                ))}

                {filteredStudents.length === 0 && (
                  <div
                    style={{
                      padding: '18px 16px',
                      fontSize: 13,
                      color: c.textFaint,
                    }}
                  >
                    No students found.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
          {filteredRooms.map((room, index) => {
            const isActive = activeRoom?.id === room.id

            return (
              <motion.button
                key={room.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => openRoom(room)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px',
                  marginBottom: 8,
                  borderRadius: 20,
                  background: isActive ? 'rgba(37,99,235,0.10)' : 'transparent',
                  border: isActive
                    ? '1px solid rgba(37,99,235,0.18)'
                    : '1px solid transparent',
                  boxShadow: isActive ? '0 14px 30px rgba(37,99,235,0.10)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    background: isActive ? 'rgba(37,99,235,0.18)' : 'rgba(37,99,235,0.10)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#2563eb',
                    flexShrink: 0,
                  }}
                >
                  {room.student_name?.[0] ?? '?'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: c.text,
                      marginBottom: 4,
                    }}
                  >
                    {room.student_name}
                  </div>

                  {room.last_message ? (
                    <div
                      style={{
                        fontSize: 12,
                        color: c.textFaint,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {room.last_message.content}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: c.textFaint }}>No messages yet</div>
                  )}
                </div>

                {room.unread_count > 0 && (
                  <span
                    style={{
                      minWidth: 22,
                      height: 22,
                      borderRadius: 999,
                      background: '#2563eb',
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 6px',
                      boxShadow: '0 8px 18px rgba(37,99,235,0.35)',
                    }}
                  >
                    {room.unread_count}
                  </span>
                )}
              </motion.button>
            )
          })}

          {filteredRooms.length === 0 && (
            <div
              style={{
                padding: '28px 16px',
                textAlign: 'center',
                color: c.textFaint,
                fontSize: 14,
              }}
            >
              No chats yet. Start a new conversation.
            </div>
          )}
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          borderRadius: 30,
          overflow: 'hidden',
          background: c.card,
          border: `1px solid ${c.border}`,
          boxShadow: '0 24px 50px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          position: 'relative',
        }}
      >
        {activeRoom ? (
          <>
            {/* chat header */}
            <div
              style={{
                padding: '20px 22px',
                borderBottom: `1px solid ${c.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                background:
                  theme === 'dark'
                    ? 'rgba(255,255,255,0.01)'
                    : 'rgba(255,255,255,0.5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(37,99,235,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  {activeRoom.student_name?.[0] ?? '?'}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: c.text,
                      marginBottom: 4,
                    }}
                  >
                    {activeRoom.student_name}
                  </div>
                  <div style={{ fontSize: 12, color: c.textFaint }}>Active conversation</div>
                </div>
              </div>

              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: 'rgba(37,99,235,0.08)',
                  border: '1px solid rgba(37,99,235,0.14)',
                  color: '#2563eb',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                live chat
              </div>
            </div>

            {/* messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                background:
                  theme === 'dark'
                    ? `
                      radial-gradient(circle at top right, rgba(37,99,235,0.08), transparent 20%),
                      ${c.bg}
                    `
                    : `
                      radial-gradient(circle at top right, rgba(37,99,235,0.05), transparent 20%),
                      ${c.bg}
                    `,
              }}
            >
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id

                return (
                  <motion.div
                    key={msg.id ?? i}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '72%',
                        padding: '12px 15px',
                        borderRadius: isMe
                          ? '20px 20px 6px 20px'
                          : '20px 20px 20px 6px',
                        background: isMe
                          ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                          : c.card,
                        color: isMe ? 'white' : c.text,
                        fontSize: 14,
                        border: isMe ? 'none' : `1px solid ${c.border}`,
                        boxShadow: isMe
                          ? '0 14px 30px rgba(37,99,235,0.22)'
                          : '0 10px 20px rgba(0,0,0,0.04)',
                        lineHeight: 1.6,
                      }}
                    >
                      {!isMe && (
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            marginBottom: 5,
                            opacity: 0.7,
                          }}
                        >
                          {msg.sender_name}
                        </div>
                      )}

                      <div>{msg.content}</div>

                      <div
                        style={{
                          fontSize: 10,
                          opacity: 0.65,
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
            </div>

            {/* composer */}
            <div
              style={{
                padding: '16px 18px',
                borderTop: `1px solid ${c.border}`,
                background: c.card,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 22,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: c.text,
                    fontSize: 14,
                    padding: '10px 12px',
                  }}
                />

                <motion.button
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={sendMessage}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 16,
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 14,
                    boxShadow: '0 14px 30px -10px rgba(37,99,235,0.65)',
                  }}
                >
                  Send
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 32,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                textAlign: 'center',
                maxWidth: 420,
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  margin: '0 auto 22px',
                  borderRadius: 28,
                  background: 'rgba(37,99,235,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 42,
                  boxShadow: '0 20px 45px rgba(37,99,235,0.10)',
                }}
              >
                <ChatIcon size={24} color="currentColor" />
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: c.text,
                  marginBottom: 10,
                }}
              >
                Your conversations
              </div>

              <p
                style={{
                  fontSize: 15,
                  color: c.textMuted,
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                Select an existing chat from the left side or start a new conversation with a student.
              </p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}