import { useState, useEffect, useCallback } from 'react'

const QUOTES = [
  "Discipline today, Success tomorrow.",
  "Small progress every day.",
  "Code. Learn. Repeat.",
  "Consistency beats talent every time.",
  "Focus on the process, not the outcome.",
  "One commit at a time.",
  "Build in silence, let results speak.",
  "Stay curious, stay humble.",
  "The best time to code is now.",
  "Every expert was once a beginner.",
]

export function MotivationCard() {
  const [idx, setIdx] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const cycleQuote = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      setIdx((i) => (i + 1) % QUOTES.length)
      setIsVisible(true)
    }, 400)
  }, [])

  useEffect(() => {
    const t = setInterval(cycleQuote, 12000)
    return () => clearInterval(t)
  }, [cycleQuote])

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <span className="section-label" style={{ color: 'var(--accent-yellow)' }}>MOTIVATION</span>

      <div className="relative min-h-[60px] flex items-center">
        <div
          className="flex gap-2 transition-all duration-400"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-6px)',
          }}
        >
          <span
            className="text-3xl leading-none font-black flex-shrink-0"
            style={{ color: 'rgba(250,204,21,0.35)', fontFamily: 'Georgia, serif' }}
          >
            &ldquo;
          </span>
          <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {QUOTES[idx]}
          </p>
        </div>
      </div>

      {/* Carousel dots */}
      <div className="flex items-center gap-1 justify-center">
        {QUOTES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === idx ? '16px' : '4px',
              height: '4px',
              background: i === idx ? 'var(--accent-yellow)' : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
