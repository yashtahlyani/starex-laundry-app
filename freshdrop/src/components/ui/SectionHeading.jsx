import { motion } from 'framer-motion'

export default function SectionHeading({ eyebrow, title, serifWord, subtitle, light = false, center = false }) {
  const titleParts = serifWord ? title.split(serifWord) : [title]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease: [0.25, 0.4, 0.25, 1] }}
      style={center ? { textAlign: 'center' } : {}}
    >
      <div className="eyebrow-line" style={center ? { justifyContent: 'center' } : {}}>
        <span className="eyebrow-text">{eyebrow}</span>
      </div>
      <h2
        className="font-display font-bold"
        style={{
          fontSize: 'clamp(2.25rem,5vw,4rem)',
          letterSpacing: '-0.03em',
          lineHeight: 1.0,
          color: light ? '#18181B' : '#FAFAFA',
        }}
      >
        {serifWord ? (
          <>
            {titleParts[0]}
            <em style={{ fontStyle: 'italic', fontFamily: '"Instrument Serif"', color: light ? '#22D3EE' : '#22D3EE' }}>
              {serifWord}
            </em>
            {titleParts[1] || ''}
          </>
        ) : title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: '1.0625rem',
            lineHeight: 1.7,
            color: light ? '#52525B' : '#A1A1AA',
            maxWidth: '55ch',
            marginTop: '1.25rem',
          }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
