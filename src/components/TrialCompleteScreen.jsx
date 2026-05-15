import { useEffect, useRef } from 'react'
import { downloadTrialCSV, downloadSummaryCSV } from '../utils/csvExport.js'
import { timestampForFilename } from '../utils/timing.js'

export default function TrialCompleteScreen({ trial, allTrials, isLast, onNext }) {
  const downloadedRef = useRef(false)

  useEffect(() => {
    if (downloadedRef.current) return
    downloadedRef.current = true
    const ts = timestampForFilename()
    const tag = trial.is_practice
      ? `practice_${trial.text_id}${trial.cue_id}`
      : `trial${trial.trial_index}_${trial.text_id}${trial.cue_id}`
    downloadTrialCSV(trial, `${trial.participant_id}_${tag}_${ts}.csv`)
    if (isLast) {
      // 본 trial 3회 완료 시 통합 CSV
      downloadSummaryCSV(allTrials, `${trial.participant_id}_summary_${ts}.csv`)
    }
  }, [trial, allTrials, isLast])

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-[480px] flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-gray-900">
          {trial.is_practice ? 'Practice 완료' : `Trial ${trial.trial_index} 완료`}
        </h1>
        <div className="text-gray-700 text-sm space-y-1">
          <div>참가자: <b>{trial.participant_id}</b></div>
          <div>글: <b>{trial.text_id}</b> / Cue: <b>{trial.cue_id}</b></div>
          <div>정답: <b>{trial.correct_count} / {trial.quiz_results.length}</b></div>
          <div>퀴즈 총 시간: <b>{(trial.quiz_total_ms / 1000).toFixed(2)}s</b></div>
          {trial.cue_read_ms != null && (
            <div>Cue 읽는 시간: <b>{(trial.cue_read_ms / 1000).toFixed(2)}s</b></div>
          )}
        </div>
        <div className="text-xs text-gray-500">CSV가 자동 다운로드되었습니다.</div>
        {isLast && (
          <div className="text-sm text-emerald-700 font-semibold">
            모든 본 Trial이 완료되어 통합 CSV도 다운로드되었습니다.
          </div>
        )}
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {isLast ? '실험 종료' : '다음으로'}
        </button>
      </div>
    </div>
  )
}
