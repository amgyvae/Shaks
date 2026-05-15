import { createContext, useContext, useState, type ReactNode } from 'react'
import api from '../api/axios'

export interface User {
  id: number
  full_name: string
  phone_number: string | null
  email: string | null
  role: 'admin' | 'teacher' | 'student'
  is_active: boolean
  avatar?: string | null
}

interface AuthCtx {
  user: User | null
  login: (identifier: string, password: string) => Promise<User>
  register: (identifier: string, password: string) => Promise<User>
  logout: () => void
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthCtx>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem('user')
    return s ? JSON.parse(s) : null
  })

  const login = async (identifier: string, password: string) => {
    const { data } = await api.post('/auth/login/', { identifier, password })
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user as User
  }

  const register = async (identifier: string, password: string) => {
    const { data } = await api.post('/auth/register/', { identifier, password })
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    const me = await api.get('/auth/me/')
    localStorage.setItem('user', JSON.stringify(me.data))
    setUser(me.data)
    return me.data as User
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    window.location.href = '/login'
  }

  const updateUser = (updated: User) => {
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
