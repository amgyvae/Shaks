import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import StudentLayout from './pages/student/StudentLayout'
import StudentHome from './pages/student/StudentHome'
import StudentSubjects from './pages/student/StudentSubjects'
import StudentModules from './pages/student/StudentModules'
import StudentTopic from './pages/student/StudentTopic'
import StudentAssignments from './pages/student/StudentAssignments'
import StudentFeed from './pages/student/StudentFeed'
import StudentProfile from './pages/student/StudentProfile'
import StudentChat from './pages/student/StudentChat'
import StudentMeetings from './pages/student/StudentMeetings'
import TeacherLayout from './pages/teacher/TeacherLayout'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherContent from './pages/teacher/TeacherContent'
import TeacherQuizzes from './pages/teacher/TeacherQuizzes'
import TeacherSubmissions from './pages/teacher/TeacherSubmissions'
import TeacherStudents from './pages/teacher/TeacherStudents'
import TeacherAnnouncements from './pages/teacher/TeacherAnnouncements'
import TeacherAssignments from './pages/teacher/TeacherAssignments'
import TeacherChat from './pages/teacher/TeacherChat'
import TeacherMeetings from './pages/teacher/TeacherMeetings'
import TeacherProfile from './pages/teacher/TeacherProfile'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'

function RequireAuth({ children, roles }: { children: React.ReactElement; roles?: string[] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <LanguageProvider>
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/student" element={<RequireAuth roles={['student']}><StudentLayout /></RequireAuth>}>
            <Route index element={<StudentHome />} />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="modules/:subjectId/:gradeId" element={<StudentModules />} />
            <Route path="topic/:topicId" element={<StudentTopic />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="feed" element={<StudentFeed />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="chat" element={<StudentChat />} />
            <Route path="meetings" element={<StudentMeetings />} />
          </Route>

          <Route path="/teacher" element={<RequireAuth roles={['teacher', 'admin']}><TeacherLayout /></RequireAuth>}>
            <Route index element={<TeacherDashboard />} />
            <Route path="content" element={<TeacherContent />} />
            <Route path="quizzes" element={<TeacherQuizzes />} />
            <Route path="submissions" element={<TeacherSubmissions />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="announcements" element={<TeacherAnnouncements />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="chat" element={<TeacherChat />} />
            <Route path="meetings" element={<TeacherMeetings />} />
            <Route path="profile" element={<TeacherProfile />} />
          </Route>

          <Route path="/admin" element={<RequireAuth roles={['admin']}><AdminLayout /></RequireAuth>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  )
}
