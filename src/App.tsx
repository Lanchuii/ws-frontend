import { lazy, Suspense } from 'react'
import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { useAuth } from './context/useAuth'
import ScrollToTopButton from './components/ScrollToTopButton'

const Home = lazy(() => import('./pages/Home'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Workers = lazy(() => import('./pages/Workers'))
const Users = lazy(() => import('./pages/Users'))
const Services = lazy(() => import('./pages/Services'))
const Requests = lazy(() => import('./pages/Requests'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))

const PageFallback = () => (
  <div className='flex min-h-64 items-center justify-center text-sm font-semibold text-slate-600'>
    Loading page...
  </div>
)

function App() {
  const { isAuthenticated, isReady, user } = useAuth()
  const location = useLocation()

  if (!isReady) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-100 text-sm font-semibold text-slate-600'>
        Restoring your session...
      </div>
    )
  }

  const resetRequired = Boolean(
    isAuthenticated && user?.password_reset_required,
  )

  if (resetRequired && location.pathname !== '/reset-password') {
    return <Navigate to='/reset-password' replace />
  }

  if (resetRequired) {
    return <Suspense fallback={<PageFallback />}><ResetPassword /></Suspense>
  }

  if (location.pathname === '/reset-password') {
    return <Navigate to={isAuthenticated ? '/' : '/login'} replace />
  }

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-slate-100 text-slate-950'>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='*' element={<Navigate to='/login' replace />} />
          </Routes>
        </Suspense>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-slate-100 text-slate-950'>
      <div className='flex-1'>
        <Navbar />
        <Suspense fallback={<PageFallback />}>
          <Routes> 
            <Route path='/' element={<Home />} />
            <Route path='/calendar' element={<Calendar />} />
            <Route path='/login' element={<Navigate to='/' replace />} />
            <Route path='/signup' element={<Navigate to='/' replace />} />
            <Route path='/forgot-password' element={<Navigate to='/' replace />} />
            <Route path='/workers' element={<Workers />} />
            <Route path='/users' element={<Users />} />
            <Route path='/services' element={<Services />} />
            <Route path='/requests' element={<Requests />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </Suspense>
      </div>
      <ScrollToTopButton />
      <Footer />
    </div>
  )
}

export default App
