import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import CreateTutorProfile from './pages/CreateTutorProfile'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-brand-50/40">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/me" element={<Profile />} />
          <Route path="/become-tutor" element={<CreateTutorProfile />} />
        </Routes>
      </main>
      <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-slate-400">
        EduMatch · Projet Master MIAGE GR2
      </footer>
    </div>
  )
}
