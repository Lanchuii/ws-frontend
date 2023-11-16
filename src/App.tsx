import { Routes, Route} from 'react-router-dom'
import Home from "./pages/Home"
import Leaders from './pages/Leaders'
import Navbar from './components/Navbar'

function App() {

  return (
    <>
    <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Leaders' element={<Leaders />} />
      </Routes>
    </>
  )
}

export default App
