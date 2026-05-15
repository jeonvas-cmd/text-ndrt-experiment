import { useEffect } from 'react'

// targetKeys: 단일 문자열 또는 배열. 정규화는 호출자가 책임짐.
// handler(key, event) 형태로 호출.
export function useKeyPress(targetKeys, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined
    const keys = Array.isArray(targetKeys) ? targetKeys : [targetKeys]
    const onKey = (e) => {
      // Space는 keydown 시 스크롤 방지
      const k = e.key
      const matched = keys.some((tk) => {
        if (tk === ' ' || tk === 'Space') return k === ' ' || e.code === 'Space'
        return k.toLowerCase() === tk.toLowerCase()
      })
      if (!matched) return
      if (k === ' ' || e.code === 'Space') e.preventDefault()
      handler(k, e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [targetKeys, handler, enabled])
}
