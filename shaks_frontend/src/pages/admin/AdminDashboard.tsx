import React, { useEffect, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import { UserIcon, UsersIcon, GraduationCapIcon, CheckCircleIcon } from '../../assets/icons/Icons'

export default function AdminDashboard() {
  const { c } = useTheme()
  const [stats, setStats] = useState({ admins: 0, teachers: 0, students: 0, active: 0 })
  useEffect(() => {
    api.get('/auth/users/').then(r => {
      const u = r.data.results ?? r.data
      setStats({ admins: u.filter((x: any) => x.role === 'admin').length, teachers: u.filter((x: any) => x.role === 'teacher').length, students: u.filter((x: any) => x.role === 'student').length, active: u.filter((x: any) => x.is_active).length })
    })
  }, [])

  const cards: [string, number, string, React.ReactNode][] = [
    ['Admins', stats.admins, '#e94560', <UserIcon size={20} color="#e94560" />],
    ['Teachers', stats.teachers, '#2563eb', <UsersIcon size={20} color="#2563eb" />],
    ['Students', stats.students, '#a855f7', <GraduationCapIcon size={20} color="#a855f7" />],
    ['Active', stats.active, '#22c55e', <CheckCircleIcon size={20} color="#22c55e" />],
  ]

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: c.text, marginBottom: 32 }}>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
        {cards.map(([l, v, color, icon]) => (
          <div key={l as string} style={{ padding: '24px', borderRadius: 18, background: c.card, border: `1px solid ${c.border}` }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontSize: 38, fontWeight: 700, color: color as string, marginBottom: 4, lineHeight: 1 }}>{v as number}</div>
            <div style={{ fontSize: 13, color: c.textMuted }}>{l as string}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
