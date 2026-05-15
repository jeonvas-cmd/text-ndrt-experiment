import { useEffect } from 'react'
import { useCountdown } from '../hooks/useCountdown.js'
import { isFastMode } from '../utils/config.js'

const COUNTDOWN_THRESHOLD_MS = 5000

function ClockIcon() {
  const handStyle = (sec) => ({
    transformOrigin: '50px 50px',
    animation: `clockSpin ${sec}s linear infinite`,
  })
  return (
    <svg viewBox="0 0 100 100" className="w-12 h-12 text-slate-500">
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="3" fill="none" />
      <line x1="50" y1="6" x2="50" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="86" x2="50" y2="94" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="6" y1="50" x2="14" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="86" y1="50" x2="94" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* 시침 — 느리게 */}
      <line x1="50" y1="50" x2="50" y2="28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" style={handStyle(12)} />
      {/* 분침 — 빠르게 */}
      <line x1="50" y1="50" x2="50" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={handStyle(3)} />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  )
}

export default function DrivingScreen({ durationSec, onComplete, onEnter }) {
  const fast = isFastMode()
  const durationMs = (fast ? Math.max(3, Math.min(durationSec, 7)) : durationSec) * 1000

  useEffect(() => {
    if (onEnter) onEnter()
  }, [onEnter])

  const remaining = useCountdown(durationMs, onComplete)
  const showCountdown = remaining <= COUNTDOWN_THRESHOLD_MS

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="text-5xl font-bold mb-10">주행 게임을 시작해주세요.</div>

      <div className="h-14 flex items-center justify-center">
        {showCountdown ? (
          <div className="text-2xl text-slate-400 font-mono tabular-nums">
            {Math.max(0, Math.ceil(remaining / 1000))}
          </div>
        ) : (
          <ClockIcon />
        )}
      </div>

      {fast && (
        <div className="mt-8 text-amber-300 text-sm">
          [fast mode] 7분 → {Math.round(durationMs / 1000)}초로 단축됨
        </div>
      )}
    </div>
  )
}
