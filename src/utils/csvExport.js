function escapeCSV(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toLines(rows) {
  return rows.map((row) => row.map(escapeCSV).join(',')).join('\n')
}

function triggerDownload(csvString, filename) {
  const bom = '﻿'
  const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// trial 한 건 → 단일 CSV 문자열 (메타 + 문항 N행 + 요약)
export function generateTrialCSV(trial) {
  const meta = [
    ['# section', 'meta'],
    ['participant_id', trial.participant_id],
    ['trial_index', trial.trial_index],
    ['is_practice', trial.is_practice ? 1 : 0],
    ['text_id', trial.text_id ?? ''],
    ['cue_id', trial.cue_id ?? ''],
    ['started_at', trial.started_at_iso],
    ['ended_at', trial.ended_at_iso],
    ['reading_total_ms', trial.reading_total_ms ?? ''],
    ['driving_seconds', trial.driving_seconds ?? ''],
    ['cue_read_ms', trial.cue_read_ms ?? ''],
    ['quiz_total_ms', trial.quiz_total_ms ?? ''],
    ['correct_count', trial.correct_count ?? ''],
    ['ease_of_recognition', trial.ease_of_recognition ?? ''],
    [],
  ]

  const quizHeader = ['quiz_index', 'quiz_type', 'question', 'correct_answer', 'given_answer', 'correct', 'response_ms']
  const quizRows = (trial.quiz_results || []).map((q, i) => [
    i + 1,
    q.type ?? '',
    q.question,
    q.correct_answer,
    q.given_answer ?? '',
    q.correct ? 1 : 0,
    q.response_ms ?? '',
  ])

  return toLines([...meta, quizHeader, ...quizRows])
}

// 참가자 통합본 CSV: 1행 = trial 1개 × 1문항. 본 trial 3 × 12문항 = 36행 + practice 4행. practice 포함 옵션은 단순화 위해 항상 포함.
const SUMMARY_HEADER = [
  'participant_id',
  'trial_index',
  'is_practice',
  'text_id',
  'cue_id',
  'started_at',
  'ended_at',
  'reading_total_ms',
  'driving_seconds',
  'cue_read_ms',
  'quiz_total_ms',
  'ease_of_recognition',
  'quiz_index',
  'quiz_type',
  'question',
  'correct_answer',
  'given_answer',
  'correct',
  'response_ms',
]

export function generateSummaryCSV(trials) {
  const rows = [SUMMARY_HEADER]
  for (const trial of trials) {
    const base = [
      trial.participant_id,
      trial.trial_index,
      trial.is_practice ? 1 : 0,
      trial.text_id ?? '',
      trial.cue_id ?? '',
      trial.started_at_iso,
      trial.ended_at_iso,
      trial.reading_total_ms ?? '',
      trial.driving_seconds ?? '',
      trial.cue_read_ms ?? '',
      trial.quiz_total_ms ?? '',
      trial.ease_of_recognition ?? '',
    ]
    for (let i = 0; i < (trial.quiz_results || []).length; i++) {
      const q = trial.quiz_results[i]
      rows.push([
        ...base,
        i + 1,
        q.type ?? '',
        q.question,
        q.correct_answer,
        q.given_answer ?? '',
        q.correct ? 1 : 0,
        q.response_ms ?? '',
      ])
    }
  }
  return toLines(rows)
}

export function downloadTrialCSV(trial, filename) {
  triggerDownload(generateTrialCSV(trial), filename)
}

export function downloadSummaryCSV(trials, filename) {
  triggerDownload(generateSummaryCSV(trials), filename)
}
