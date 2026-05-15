import { useEffect, useRef, useState } from 'react'

// durationMs 동안 카운트다운, 0이 되면 onComplete 호출.
// 1초 간격으로 remainingMs를 업데이트하여 화면 표시 가능.
export function useCountdown(durationMs, onComplete) {
  const [remaining, setRemaining] = useState(durationMs)
  const completedRef = useRef(false)

  useEffect(() => {
    completedRef.current = false
    setRemaining(durationMs)
    const startedAt = performance.now()
    const tick = () => {
      const elapsed = performance.now() - startedAt
      const left = durationMs - elapsed
      if (left <= 0) {
        setRemaining(0)
        if (!completedRef.current) {
          completedRef.current = true
          onComplete && onComplete()
        }
        return
      }
      setRemaining(left)
    }
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [durationMs, onComplete])

  return remaining
}
