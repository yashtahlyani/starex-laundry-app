import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const SplitText = ({
  text = '',
  className = '',
  delay = 50,
  duration = 0.8,
  ease = [0.25, 0.4, 0.25, 1],
  splitType = 'chars',
  from = { opacity: 0, y: 40, filter: 'blur(8px)' },
  to = { opacity: 1, y: 0, filter: 'blur(0px)' },
  threshold = 0.2,
  rootMargin = '0px',
  tag: Tag = 'p',
  onLetterAnimationComplete,
}) => {
  const [inView, setInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(ref.current)
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  const units =
    splitType === 'chars'
      ? text.split('')
      : splitType === 'words'
      ? text.split(' ')
      : text.split('\n')

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}
    >
      {units.map((unit, i) => (
        <span key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
          <motion.span
            style={{ display: 'inline-block', willChange: 'transform, opacity, filter' }}
            initial={from}
            animate={inView ? to : from}
            transition={{
              duration,
              delay: (i * delay) / 1000,
              ease,
            }}
            onAnimationComplete={
              i === units.length - 1 ? onLetterAnimationComplete : undefined
            }
          >
            {unit === ' ' ? ' ' : unit}
            {splitType === 'words' && i < units.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

export default SplitText
