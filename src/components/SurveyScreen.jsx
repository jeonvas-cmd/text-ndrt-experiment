import { useState, useCallback } from 'react'
import { useKeyPress } from '../hooks/useKeyPress.js'

const SCALE = [1, 2, 3, 4, 5, 6, 7]

export default function SurveyScreen({ onSubmit }) {
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const choose = useCallback((n) => {
    if (submitting) return
    setSelected(n)
    setSubmitting(true)
    setTimeout(() => onSubmit(n), 280)
  }, [onSubmit, submitting])

  const handleKey = useCallback((key) => {
    const n = parseInt(key, 10)
    if (n >= 1 && n <= 7) choose(n)
  }, [choose])

  useKeyPress(['1', '2', '3', '4', '5', '6', '7'], handleKey, true)

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 px-8 py-10">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-12">
        <div className="text-sm font-semibold text-blue-600 mb-2 tracking-wider">
          간단한 자기보고
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-snug">
          방금 푼 퀴즈에서 제시된 문장이 글의 내용과 일치하는지 판단하는 일이
          얼마나 어렵게 느껴졌습니까?
        </h1>
        <p className="text-gray-600 mb-10">
          가장 잘 맞는 점수를 한 가지 골라주세요. (숫자 키 1–7 또는 클릭)
        </p>

        <div className="flex justify-between items-baseline mb-3 px-1">
          <span className="text-sm text-gray-700"><b>1</b> · 매우 쉬웠다</span>
          <span className="text-sm text-gray-700"><b>7</b> · 매우 어려웠다</span>
        </div>

        <div className="flex gap-2">
          {SCALE.map((n) => (
            <button
              key={n}
              onClick={() => choose(n)}
              disabled={submitting}
              className={`flex-1 py-6 rounded-xl border-2 text-2xl font-bold transition-colors ${
                selected === n
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50'
              } disabled:opacity-70 disabled:cursor-default`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
