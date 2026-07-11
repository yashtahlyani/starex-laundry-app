export default function OutlinedWord({ word, className = '', size = '15vw', opacity = 1 }) {
  return (
    <div
      aria-hidden="true"
      className={`word-outlined select-none pointer-events-none ${className}`}
      style={{ fontSize: size, opacity }}
    >
      {word}
    </div>
  )
}
