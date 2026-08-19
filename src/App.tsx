import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import Home from "./pages/Home"
import Calendar from './pages/Calendar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Leaders from './pages/Leaders'
import Workers from './pages/Workers'
import Users from './pages/Users'
import Services from './pages/Services'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Requests from './pages/Requests'
import ResetPassword from './pages/ResetPassword'
import { useAuth } from './context/useAuth'

function App() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const resetRequired = Boolean(
    isAuthenticated && user?.password_reset_required,
  )

  if (resetRequired && location.pathname !== '/reset-password') {
    return <Navigate to='/reset-password' replace />
  }

  if (resetRequired) {
    return <ResetPassword />
  }

  if (location.pathname === '/reset-password') {
    return <Navigate to={isAuthenticated ? '/' : '/login'} replace />
  }

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-slate-100 text-slate-950'>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-slate-100 text-slate-950'>
      <div className='flex-1'>
        <Navbar />
          <Routes> 
            <Route path='/' element={<Home />} />
            <Route path='/calendar' element={<Calendar />} />
            <Route path='/login' element={<Navigate to='/' replace />} />
            <Route path='/signup' element={<Navigate to='/' replace />} />
            <Route path='/workers' element={<Workers />} />
            <Route path='/users' element={<Users />} />
            <Route path='/services' element={<Services />} />
            <Route path='/requests' element={<Requests />} />
            <Route path='/Leaders' element={<Leaders />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
