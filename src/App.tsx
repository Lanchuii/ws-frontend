import { Routes, Route} from 'react-router-dom'
import Home from "./pages/Home"
import Leaders from './pages/Leaders'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {

  return (
    <div className='bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col min-h-screen'>
      <div className='flex-1 mb-4'>
        <Navbar />
          <Routes> 
            <Route path='/' element={<Home />} />
            <Route path='/Leaders' element={<Leaders />} />
          </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
