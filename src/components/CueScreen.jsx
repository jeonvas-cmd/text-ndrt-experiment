import { useKeyPress } from '../hooks/useKeyPress.js'

export default function CueScreen({ cue, onDismiss }) {
  useKeyPress(' ', onDismiss, true)

  const lines = (cue.text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 px-6 py-8 overflow-y-auto">
      <div className="max-w-screen-2xl w-full">
        <div className="mb-5 flex items-center gap-3">
          <div className="bg-amber-500 text-white font-bold rounded-md px-4 py-1.5 text-base tracking-wider shadow">
            단서
          </div>
          <div className="text-amber-800 text-sm">
            방금 읽은 글의 핵심을 다시 떠올려 보세요.
          </div>
        </div>

        <div className="bg-white border-2 border-amber-400 rounded-2xl shadow-xl p-10">
          <ul className="space-y-4 text-xl text-gray-900 leading-relaxed text-left">
            {lines.map((line, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="text-amber-500 font-bold mt-1 select-none flex-shrink-0">•</span>
                <span className="flex-1">{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 text-gray-500 text-sm text-center">
          다 읽었으면{' '}
          <kbd className="px-2 py-0.5 bg-gray-200 rounded text-xs font-mono">Space</kbd>
          {' '}를 눌러 퀴즈로 넘어가세요.
        </div>
      </div>
    </div>
  )
}
