import { useEffect, useRef, useState } from 'react'
import { FaArrowUp } from 'react-icons/fa'

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false)
  const [scrolling, setScrolling] = useState(false)
  const idleTimer = useRef<number>()

  useEffect(() => {
    const updateFromScroll = () => {
      const awayFromTop = window.scrollY > 0
      setVisible(awayFromTop)
      setScrolling(awayFromTop)

      window.clearTimeout(idleTimer.current)
      idleTimer.current = window.setTimeout(() => setScrolling(false), 700)
    }

    setVisible(window.scrollY > 0)
    window.addEventListener('scroll', updateFromScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateFromScroll)
      window.clearTimeout(idleTimer.current)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className={`fixed bottom-5 right-5 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 shadow-md backdrop-blur-sm transition duration-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 ${
        visible
          ? 'translate-y-0 pointer-events-auto'
          : 'translate-y-3 pointer-events-none opacity-0'
      } ${
        visible && scrolling
          ? 'bg-white opacity-100'
          : visible
            ? 'bg-white/30 opacity-40 hover:bg-white hover:opacity-100'
            : ''
      }`}
    >
      <FaArrowUp aria-hidden="true" />
    </button>
  )
}

export default ScrollToTopButton
