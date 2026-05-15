export default function MenuScreen({
  participantId,
  mainTrialIndex,        // 0,1,2 — 다음에 진행할 본 trial 인덱스
  assignment,            // { trials: [{text,cue}, ...] }
  config,
  onStartPractice,
  onStartMainTrial,
}) {
  const allDone = mainTrialIndex >= 3
  const next = !allDone ? assignment.trials[mainTrialIndex] : null

  const handlePractice = () => {
    if (!config.practice) return
    const text = {
      id: 'practice',
      title: '연습',
      sentences: config.practice.sentences,
    }
    const cue = { id: 'practice', text: config.practice.cue }
    onStartPractice(text, cue, config.practice.quizzes)
  }

  const handleStartMain = () => {
    if (!next) return
    const textData = config.texts[next.text]
    const text = { id: next.text, title: textData.title, sentences: textData.sentences }
    const cueId = next.cue
    const cueText = cueId === 'A' ? null : (textData.cues?.[cueId] ?? null)
    const cue = { id: cueId, text: cueText }
    const quiz = config.quizzes[next.text]
    onStartMainTrial(text, cue, quiz)
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-[560px] flex flex-col gap-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold text-gray-900">실험 메뉴</h1>
          <span className="text-gray-500 text-sm">참가자: <b className="text-gray-900">{participantId}</b></span>
        </div>

        <button
          onClick={handlePractice}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Practice 시작
        </button>

        <div className="border-t border-gray-200" />

        {!allDone ? (
          <div className="flex flex-col gap-4">
            <div className="text-gray-700">
              <div className="text-sm text-gray-500 mb-1">다음 진행</div>
              <div className="text-xl font-bold">
                Trial {mainTrialIndex + 1} / 3 — 글 {next.text} / Cue {next.cue}
                {next.cue === 'A' && <span className="ml-2 text-sm text-gray-500">(No cue)</span>}
              </div>
            </div>

            <div className="text-xs text-gray-500 leading-relaxed">
              ※ 라틴 방진 배정에 따라 글·Cue 조합은 자동 결정됩니다.
            </div>

            <button
              onClick={handleStartMain}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              본 Trial {mainTrialIndex + 1} 시작
            </button>
          </div>
        ) : (
          <div className="text-center text-green-700 font-semibold py-4">
            모든 본 Trial이 완료되었습니다.
          </div>
        )}

        <div className="border-t border-gray-200" />
        <div className="text-xs text-gray-400">
          진행 상황: 본 Trial {Math.min(mainTrialIndex, 3)} / 3 완료
        </div>
      </div>
    </div>
  )
}
