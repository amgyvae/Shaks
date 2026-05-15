import { useEffect, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'

export default function AdminUsers() {
  const { c } = useTheme()
  const [users, setUsers] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ full_name: '', phone_number: '', role: 'student', grade: '' })
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')

  const load = () => {
    const p: any = {}
    if (filter) p.role = filter
    api.get('/auth/users/', { params: p }).then(r => setUsers(r.data.results ?? r.data))
  }
  useEffect(() => {
    load()
    api.get('/courses/grades/').then(r => setGrades(r.data.results ?? r.data))
  }, [filter])

  const create = async () => {
    setErr(''); setOk('')
    try {
      const payload: any = { full_name: form.full_name, phone_number: form.phone_number, role: form.role }
      if (form.grade) payload.grade = Number(form.grade)
      await api.post('/auth/users/create/', payload)
      setOk('User created! They can activate at /register')
      setForm({ full_name: '', phone_number: '', role: 'student', grade: '' })
      load()
      setTimeout(() => setOk(''), 4000)
    } catch (e: any) { setErr(JSON.stringify(e.response?.data)) }
  }

  const del = async (id: number) => {
    if (!confirm('Delete?')) return
    await api.delete(`/auth/users/${id}/`)
    setUsers(p => p.filter(u => u.id !== id))
  }

  const sf = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }))
  const inp = { padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${c.inputBorder}`, background: c.input, color: c.text, fontSize: 13, outline: 'none' }
  const rc = (r: string) => r === 'admin' ? { bg: 'rgba(233,69,96,0.12)', text: '#e94560' } : r === 'teacher' ? { bg: 'rgba(37,99,235,0.12)', text: '#60a5fa' } : { bg: 'rgba(168,85,247,0.12)', text: '#c084fc' }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: c.text, marginBottom: 24 }}>User Management</h1>

      <div style={{ padding: '20px 22px', borderRadius: 16, background: c.card, border: `1px solid ${c.border}`, marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, color: c.text, marginBottom: 16, fontSize: 16 }}>Create New User</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
          <input value={form.full_name} onChange={sf('full_name')} placeholder="Full Name" style={{ ...inp, flex: 1, minWidth: 140 }} />
          <input value={form.phone_number} onChange={sf('phone_number')} placeholder="Phone Number" style={{ ...inp, flex: 1, minWidth: 140 }} />
          <select value={form.role} onChange={sf('role')} style={{ ...inp }}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          {form.role === 'student' && (
            <select value={form.grade} onChange={sf('grade')} style={{ ...inp, color: form.grade ? c.text : c.textFaint }}>
              <option value="">Grade (optional)</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          )}
          <button onClick={create} style={{ padding: '10px 20px', borderRadius: 12, background: '#2563eb', color: 'white', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Create</button>
        </div>
        {form.role === 'student' && (
          <p style={{ fontSize: 12, color: c.textFaint, marginTop: 4 }}>
            Students assigned to a grade will only see assignments for that grade.
          </p>
        )}
        {ok && <p style={{ fontSize: 13, color: '#22c55e', marginTop: 8 }}>{ok}</p>}
        {err && <p style={{ fontSize: 13, color: '#ef4444', marginTop: 8 }}>{err}</p>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {['', 'admin', 'teacher', 'student'].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13, border: `1.5px solid ${filter === r ? '#2563eb' : c.border}`, background: filter === r ? '#2563eb' : c.card, color: filter === r ? 'white' : c.textMuted, cursor: 'pointer', textTransform: 'capitalize' }}>
            {r || 'All'}
          </button>
        ))}
      </div>

      <div style={{ borderRadius: 16, overflow: 'hidden', background: c.card, border: `1px solid ${c.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${c.border}` }}>
              {['Name', 'Phone', 'Role', 'Grade', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: c.textFaint }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${c.navBorder}` }}>
                <td style={{ padding: '12px 20px', fontWeight: 500, color: c.text, fontSize: 14 }}>{u.full_name}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, color: c.textMuted }}>{u.phone_number}</td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: rc(u.role).bg, color: rc(u.role).text, textTransform: 'capitalize' }}>{u.role}</span>
                </td>
                <td style={{ padding: '12px 20px', fontSize: 13, color: c.textMuted }}>
                  {u.grade_name ?? <span style={{ color: c.textFaint }}>—</span>}
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: u.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.15)', color: u.is_active ? '#22c55e' : '#9ca3af' }}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <button onClick={() => del(u.id)} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: 12 }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: c.textFaint, fontSize: 14 }}>No users found.</p>}
      </div>
    </div>
  )
}
