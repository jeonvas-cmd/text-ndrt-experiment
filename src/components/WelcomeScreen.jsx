import { useState } from 'react'
import { getAssignment, normalizeParticipantId } from '../utils/latinSquare.js'

export default function WelcomeScreen({ onSubmit }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const normalized = normalizeParticipantId(value)
    if (!normalized) {
      setError('올바른 참가자 번호를 입력하세요. 예) P01, 1, 12')
      return
    }
    const assignment = getAssignment(normalized)
    onSubmit(normalized, assignment)
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-10 w-[440px] flex flex-col gap-5"
      >
        <h1 className="text-2xl font-bold text-gray-900">참가자 번호 입력</h1>
        <p className="text-gray-600 text-sm">예: P01 ~ P09</p>
        <input
          autoFocus
          value={value}
          onChange={(e) => { setValue(e.target.value); setError('') }}
          placeholder="P01"
          className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500"
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          시작
        </button>
      </form>
    </div>
  )
}
