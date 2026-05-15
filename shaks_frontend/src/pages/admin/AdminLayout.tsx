import { Outlet } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useTheme } from '../../context/ThemeContext'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/teacher/content', label: 'Content' },
  { to: '/teacher/submissions', label: 'Submissions' },
]

export default function AdminLayout() {
  const { c } = useTheme()
  return (
    <div style={{ background: c.bg, minHeight: '100vh' }}>
      <Navbar links={LINKS} roleLabel="Admin" accentColor="#e94560" />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <Outlet />
      </main>
    </div>
  )
}
