import { useKeyPress } from '../hooks/useKeyPress.js'

export default function QuizScreen({ quiz, currentIndex, onAnswer }) {
  const q = quiz[currentIndex]

  const handleKey = (key) => {
    const k = key.toUpperCase()
    if (k === 'T' || k === 'F') onAnswer(k)
  }
  useKeyPress(['t', 'f'], handleKey, true)

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white px-12">
      <div className="max-w-3xl w-full">
        <div className="text-sm text-gray-500 mb-6">
          문제 {currentIndex + 1} / {quiz.length}
        </div>
        <div className="text-3xl text-black leading-relaxed mb-12">
          {q.question}
        </div>
        <div className="flex gap-6 justify-center">
          <div className="bg-emerald-100 border-2 border-emerald-300 rounded-2xl px-10 py-6 flex flex-col items-center">
            <div className="text-4xl font-bold text-emerald-700">T</div>
            <div className="text-sm text-emerald-700 mt-1">True</div>
          </div>
          <div className="bg-rose-100 border-2 border-rose-300 rounded-2xl px-10 py-6 flex flex-col items-center">
            <div className="text-4xl font-bold text-rose-700">F</div>
            <div className="text-sm text-rose-700 mt-1">False</div>
          </div>
        </div>
        <div className="mt-10 text-center text-gray-400 text-sm">
          T 또는 F 키를 눌러 응답하세요.
        </div>
      </div>
    </div>
  )
}
