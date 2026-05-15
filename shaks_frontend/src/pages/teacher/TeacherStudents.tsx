import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCapIcon, UsersIcon, PinIcon, ZapIcon, BookIcon, UserIcon } from '../../assets/icons/Icons'

export default function TeacherStudents() {
  const { c, theme } = useTheme()

  const [grades, setGrades] = useState<any[]>([])
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [selectedGrade, setSelectedGrade] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState<number | null>(null)

  const loadData = () => {
    api.get('/courses/grades/').then((r) => setGrades(r.data.results ?? r.data))
    api
      .get('/auth/users/', { params: { role: 'student' } })
      .then((r) => setAllStudents(r.data.results ?? r.data))
  }

  useEffect(() => {
    loadData()
  }, [])

  const enrolled = selectedGrade
    ? allStudents.filter((s) => s.grade === selectedGrade.id)
    : []

  const unassigned = allStudents.filter((s) => !s.grade)

  const searchFiltered = (list: any[]) =>
    search.trim()
      ? list.filter(
          (s) =>
            s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            s.phone_number?.includes(search)
        )
      : list

  const assign = async (studentId: number, gradeId: number | null) => {
    setBusy(studentId)
    try {
      const { data } = await api.patch(`/auth/users/${studentId}/assign-grade/`, {
        grade: gradeId,
      })
      setAllStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, grade: data.grade, grade_name: data.grade_name }
            : s
        )
      )
    } finally {
      setBusy(null)
    }
  }

  const inputStyle = {
    padding: '14px 16px',
    borderRadius: 16,
    border: `1px solid ${c.inputBorder}`,
    background: c.input,
    color: c.text,
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  const primaryBtn = {
    padding: '12px 18px',
    borderRadius: 14,
    background: '#2563eb',
    color: 'white',
    fontWeight: 700,
    fontSize: 13,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 14px 30px -10px rgba(37,99,235,0.65)',
  }

  const softBlueBtn = {
    padding: '10px 14px',
    borderRadius: 12,
    background: 'rgba(37,99,235,0.10)',
    color: '#2563eb',
    border: '1px solid rgba(37,99,235,0.16)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  }

  const softDangerBtn = {
    padding: '10px 14px',
    borderRadius: 12,
    background: 'rgba(239,68,68,0.10)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.16)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  }

  const panelStyle = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderRadius: 30,
    background: c.card,
    border: `1px solid ${c.border}`,
    boxShadow: '0 22px 50px rgba(0,0,0,0.06)',
  }

  const stats = useMemo(() => {
    const assigned = allStudents.filter((s) => s.grade).length
    const unassignedCount = allStudents.filter((s) => !s.grade).length
    const active = allStudents.filter((s) => s.is_active).length
    return {
      total: allStudents.length,
      assigned,
      unassigned: unassignedCount,
      active,
    }
  }, [allStudents])

  const Badge = ({
    text,
    bg,
    color,
  }: {
    text: string
    bg?: string
    color?: string
  }) => (
    <span
      style={{
        padding: '6px 12px',
        borderRadius: 999,
        background: bg || c.input,
        color: color || c.textMuted,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {text}
    </span>
  )

  const StudentRow = ({
    student,
    action,
    avatarBg,
    avatarColor,
  }: {
    student: any
    action?: React.ReactNode
    avatarBg: string
    avatarColor: string
  }) => (
    <motion.div
      whileHover={{ y: -2, scale: 1.003 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 18,
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: avatarBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 800,
          color: avatarColor,
          flexShrink: 0,
        }}
      >
        {student.full_name?.charAt(0)?.toUpperCase() || '?'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            color: c.text,
            fontSize: 14,
            marginBottom: 4,
          }}
        >
          {student.full_name}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: c.textFaint }}>{student.phone_number}</span>

          <span
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              background: student.is_active
                ? 'rgba(34,197,94,0.12)'
                : 'rgba(107,114,128,0.15)',
              color: student.is_active ? '#22c55e' : '#9ca3af',
            }}
          >
            {student.is_active ? 'Active' : 'Inactive'}
          </span>

          {student.grade_name && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                background: 'rgba(37,99,235,0.10)',
                color: '#60a5fa',
              }}
            >
              <GraduationCapIcon size={12} color="#60a5fa" /> {student.grade_name}
            </span>
          )}
        </div>
      </div>

      {action}
    </motion.div>
  )

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
                radial-gradient(circle at 88% 24%, rgba(168,85,247,0.12), transparent 24%),
                linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.96))
              `
              : `
                radial-gradient(circle at 12% 20%, rgba(37,99,235,0.10), transparent 28%),
                radial-gradient(circle at 88% 24%, rgba(168,85,247,0.08), transparent 24%),
                linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.98))
              `,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
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
                Teacher Panel
              </span>
            </div>

            <h1
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: c.text,
                margin: '0 0 10px',
                lineHeight: 1.05,
              }}
            >
              Student Management
            </h1>

            <p
              style={{
                fontSize: 15,
                color: c.textMuted,
                lineHeight: 1.8,
                margin: 0,
                maxWidth: 680,
              }}
            >
              Organize students by grade so they only receive the correct content, assignments,
              and learning flow for their academic level.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Badge text={`${stats.total} students`} />
            <Badge text={`${stats.assigned} assigned`} bg="rgba(37,99,235,0.10)" color="#2563eb" />
            <Badge text={`${stats.unassigned} unassigned`} bg="rgba(245,158,11,0.10)" color="#f59e0b" />
          </div>
        </div>
      </motion.section>

      {/* STATS */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: 'Total Students',
            value: stats.total,
            icon: <UsersIcon size={22} color="#2563eb" />,
            color: '#2563eb',
            desc: 'All student accounts',
          },
          {
            label: 'Assigned to Grades',
            value: stats.assigned,
            icon: <GraduationCapIcon size={22} color="#22c55e" />,
            color: '#22c55e',
            desc: 'Students with active grade',
          },
          {
            label: 'Unassigned',
            value: stats.unassigned,
            icon: <PinIcon size={22} color="#f59e0b" />,
            color: '#f59e0b',
            desc: 'Need grade placement',
          },
          {
            label: 'Active Accounts',
            value: stats.active,
            icon: <ZapIcon size={22} color="#a855f7" />,
            color: '#a855f7',
            desc: 'Currently active students',
          },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -4, scale: 1.01 }}
            style={{
              ...panelStyle,
              padding: '22px',
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

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  background: `${card.color}14`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  marginBottom: 16,
                }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: card.color,
                  marginBottom: 4,
                  lineHeight: 1,
                }}
              >
                {card.value}
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: c.text,
                  marginBottom: 5,
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

      {/* Grade cards */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          ...panelStyle,
          padding: '24px',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: c.text,
                marginBottom: 6,
              }}
            >
              Grade Structure
            </div>
            <div
              style={{
                fontSize: 14,
                color: c.textMuted,
                lineHeight: 1.7,
              }}
            >
              Select a grade to manage its enrolled students and add unassigned students.
            </div>
          </div>

          {selectedGrade && (
            <button
              onClick={() => setSelectedGrade(null)}
              style={softBlueBtn}
            >
              Reset selection
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {grades.map((g, index) => {
            const count = allStudents.filter((s) => s.grade === g.id).length
            const active = selectedGrade?.id === g.id

            return (
              <motion.button
                key={g.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedGrade(active ? null : g)}
                style={{
                  padding: '18px 22px',
                  borderRadius: 20,
                  border: `1px solid ${active ? 'rgba(37,99,235,0.20)' : c.border}`,
                  background: active ? 'rgba(37,99,235,0.10)' : c.bg,
                  cursor: 'pointer',
                  minWidth: 140,
                  textAlign: 'center',
                  boxShadow: active ? '0 14px 30px rgba(37,99,235,0.10)' : 'none',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6, display: 'flex', justifyContent: 'center' }}><GraduationCapIcon size={22} color={active ? '#2563eb' : c.textMuted} /></div>
                <div
                  style={{
                    fontWeight: 800,
                    color: active ? '#2563eb' : c.text,
                    fontSize: 15,
                    marginBottom: 4,
                  }}
                >
                  {g.name}
                </div>
                <div style={{ fontSize: 12, color: c.textFaint }}>
                  {count} student{count !== 1 ? 's' : ''}
                </div>
              </motion.button>
            )
          })}

          {grades.length === 0 && (
            <div
              style={{
                padding: '24px 18px',
                borderRadius: 18,
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: c.textFaint,
                fontSize: 14,
              }}
            >
              No grades found. Create grades in the Content section first.
            </div>
          )}
        </div>
      </motion.section>

      {/* Selected grade mode */}
      {selectedGrade && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 18,
          }}
        >
          {/* Enrolled */}
          <div style={{ ...panelStyle, padding: '22px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 800,
                    color: c.text,
                    fontSize: 20,
                    marginBottom: 4,
                  }}
                >
                  <BookIcon size={18} color="currentColor" /> {selectedGrade.name}
                </div>
                <div style={{ fontSize: 13, color: c.textMuted }}>
                  {enrolled.length} enrolled student{enrolled.length !== 1 ? 's' : ''}
                </div>
              </div>

              <Badge text="Assigned list" bg="rgba(37,99,235,0.10)" color="#2563eb" />
            </div>

            {enrolled.length === 0 ? (
              <div
                style={{
                  padding: '50px 20px',
                  textAlign: 'center',
                  color: c.textFaint,
                  fontSize: 14,
                  borderRadius: 20,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                }}
              >
                No students in this grade yet.
                <br />
                Add them from the right panel.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {enrolled.map((s) => (
                  <StudentRow
                    key={s.id}
                    student={s}
                    avatarBg="rgba(37,99,235,0.12)"
                    avatarColor="#2563eb"
                    action={
                      <button
                        onClick={() => assign(s.id, null)}
                        disabled={busy === s.id}
                        style={{
                          ...softDangerBtn,
                          opacity: busy === s.id ? 0.5 : 1,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Remove
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Unassigned */}
          <div style={{ ...panelStyle, padding: '22px' }}>
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 800,
                  color: c.text,
                  fontSize: 20,
                  marginBottom: 6,
                }}
              >
                <UserIcon size={18} color="currentColor" /> Unassigned Students
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or phone..."
                style={inputStyle}
              />
            </div>

            {searchFiltered(unassigned).length === 0 ? (
              <div
                style={{
                  padding: '50px 20px',
                  textAlign: 'center',
                  color: c.textFaint,
                  fontSize: 14,
                  borderRadius: 20,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                }}
              >
                {search ? 'No matches found.' : 'All students are assigned to a grade.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {searchFiltered(unassigned).map((s) => (
                  <StudentRow
                    key={s.id}
                    student={s}
                    avatarBg="rgba(107,114,128,0.12)"
                    avatarColor={c.textMuted}
                    action={
                      <button
                        onClick={() => assign(s.id, selectedGrade.id)}
                        disabled={busy === s.id}
                        style={{
                          ...softBlueBtn,
                          opacity: busy === s.id ? 0.5 : 1,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        + Add to {selectedGrade.name}
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* All students mode */}
      {!selectedGrade && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...panelStyle,
            padding: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginBottom: 18,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: c.text,
                  marginBottom: 8,
                }}
              >
                Student Directory
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                style={inputStyle}
              />
            </div>
          </div>

          {allStudents.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                color: c.textFaint,
                fontSize: 14,
                borderRadius: 22,
                background: c.bg,
                border: `1px solid ${c.border}`,
              }}
            >
              No students yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {searchFiltered(allStudents).map((s) => (
                <motion.div
                  key={s.id}
                  whileHover={{ y: -2, scale: 1.002 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto',
                    gap: 14,
                    alignItems: 'center',
                    padding: '16px 18px',
                    borderRadius: 20,
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: c.text,
                        fontSize: 14,
                        marginBottom: 4,
                      }}
                    >
                      {s.full_name}
                    </div>
                    <div style={{ fontSize: 12, color: c.textFaint }}>
                      {s.phone_number}
                    </div>
                  </div>

                  <div>
                    {s.grade_name ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: 'rgba(37,99,235,0.10)',
                          color: '#60a5fa',
                        }}
                      >
                        <GraduationCapIcon size={12} color="#60a5fa" /> {s.grade_name}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: c.textFaint }}>— unassigned</span>
                    )}
                  </div>

                  <div>
                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: s.is_active
                          ? 'rgba(34,197,94,0.12)'
                          : 'rgba(107,114,128,0.15)',
                        color: s.is_active ? '#22c55e' : '#9ca3af',
                      }}
                    >
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div style={{ minWidth: 160 }}>
                    <select
                      value={s.grade ?? ''}
                      onChange={(e) =>
                        assign(s.id, e.target.value ? Number(e.target.value) : null)
                      }
                      disabled={busy === s.id}
                      style={{
                        ...inputStyle,
                        padding: '10px 12px',
                        fontSize: 13,
                      }}
                    >
                      <option value="">No grade</option>
                      {grades.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    {busy === s.id && (
                      <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 700 }}>
                        saving...
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      )}
    </div>
  )
}