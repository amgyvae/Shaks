import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import LessonDetail from './pages/LessonDetail'
import TeacherProfile from "./pages/TeacherProfile"
import StudentProfile from "./pages/StudentProfile"
import Login from "./pages/Login"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail/>} />
        <Route path="/lessons/:lessonId" element={<LessonDetail />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
