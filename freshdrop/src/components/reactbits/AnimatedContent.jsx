import { useRef, useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

const AnimatedContent = ({
  children,
  distance = 60,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = [0.25, 0.4, 0.25, 1],
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.15,
  delay = 0,
  className = '',
  style = {},
  ...props
}) => {
  const ref = useRef(null)
  const controls = useAnimation()
  const [triggered, setTriggered] = useState(false)

  const axis = direction === 'horizontal' ? 'x' : 'y'
  const offset = reverse ? -distance : distance

  const initial = {
    [axis]: offset,
    scale,
    opacity: animateOpacity ? initialOpacity : 1,
  }

  const animate = { [axis]: 0, scale: 1, opacity: 1 }

  useEffect(() => {
    if (triggered) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true)
          controls.start(animate)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [triggered, threshold])

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={controls}
      transition={{ duration, ease, delay }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedContent
