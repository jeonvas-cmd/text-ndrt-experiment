import { useEffect, useRef, useState } from 'react'
import { useKeyPress } from '../hooks/useKeyPress.js'

export default function ReadingScreen({ sentences, onFinish }) {
  const [shownCount, setShownCount] = useState(1) // 시작 시 첫 문장 표시
  const containerRef = useRef(null)

  const handleSpace = () => {
    setShownCount((prev) => {
      if (prev >= sentences.length) {
        onFinish()
        return prev
      }
      return prev + 1
    })
  }

  useKeyPress(' ', handleSpace, true)

  // 새 문장이 추가될 때 하단으로 스크롤
  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [shownCount])

  const visible = sentences.slice(0, shownCount)

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-shrink-0 px-8 py-4 border-b border-gray-200 text-sm text-gray-500">
        스페이스바를 눌러 다음 문장으로 이동하세요.
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-12 py-8 flex flex-col items-start justify-end"
      >
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
          {visible.map((s, i) => {
            const isLatest = i === visible.length - 1
            return (
              <p
                key={i}
                className={`text-2xl leading-relaxed ${isLatest ? 'text-black font-medium' : 'text-gray-400'}`}
              >
                {s}
              </p>
            )
          })}
        </div>
      </div>
    </div>
  )
}
