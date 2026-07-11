import { useState, useEffect, useRef } from 'react'

export function useScrollDirection() {
  const [dir, setDir] = useState('up')
  const lastY = useRef(0)

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY
      setDir(y > lastY.current && y > 80 ? 'down' : 'up')
      lastY.current = y
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return dir
}
