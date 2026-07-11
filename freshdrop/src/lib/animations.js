export const ease = [0.25, 0.4, 0.25, 1]
export const springHover = { stiffness: 300, damping: 30 }

export const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, ease },
}

export const staggerContainer = (stagger = 0.08, delayStart = 0) => ({
  animate: { transition: { staggerChildren: stagger, delayChildren: delayStart } },
})

export const staggerItem = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

export const viewportOnce = { once: true, margin: '-80px' }
