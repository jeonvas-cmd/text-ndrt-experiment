import { useReducer, useCallback } from 'react'

export const PHASE = {
  WELCOME: 'WELCOME',
  MENU: 'MENU',
  READING: 'READING',
  DRIVING: 'DRIVING',
  CUE: 'CUE',
  QUIZ: 'QUIZ',
  SURVEY: 'SURVEY',
  TRIAL_COMPLETE: 'TRIAL_COMPLETE',
  EXPERIMENT_COMPLETE: 'EXPERIMENT_COMPLETE',
}

const initialState = {
  phase: PHASE.WELCOME,
  participantId: null,
  assignment: null,        // { participantId, trials: [{text,cue}, ...] }
  mainTrialIndex: 0,       // 0,1,2 — 본 trial 진행 인덱스
  isPractice: false,       // 현재 실행 중인 trial이 practice인지
  currentText: null,       // { id, sentences, title }  ※ practice면 id="practice"
  currentCue: null,        // { id, label, text }       ※ practice면 id="practice"
  currentQuiz: null,       // [{ question, answer }, ...]
  // 시간 기록 (현재 trial)
  readingStartMs: null,
  readingTotalMs: null,
  drivingStartMs: null,
  cueShownMs: null,
  cueReadMs: null,
  quizStartMs: null,
  quizTotalMs: null,
  quizResults: [],         // [{ question, correct_answer, given_answer, correct, response_ms }]
  startedAtIso: null,
  pendingTrial: null,      // 퀴즈 종료 후 SURVEY 응답 대기 중인 trial 임시 보관
  // 누적 trial 데이터 (CSV summary용) — practice 포함 모두 저장
  completedTrials: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PARTICIPANT':
      return { ...state, participantId: action.participantId, assignment: action.assignment, phase: PHASE.MENU }

    case 'START_PRACTICE':
      return {
        ...state,
        phase: PHASE.READING,
        isPractice: true,
        currentText: action.text,
        currentCue: action.cue,
        currentQuiz: action.quiz,
        readingStartMs: action.ts,
        readingTotalMs: null,
        drivingStartMs: null,
        cueShownMs: null,
        cueReadMs: null,
        quizStartMs: null,
        quizTotalMs: null,
        quizResults: [],
        startedAtIso: new Date().toISOString(),
      }

    case 'START_MAIN_TRIAL':
      return {
        ...state,
        phase: PHASE.READING,
        isPractice: false,
        currentText: action.text,
        currentCue: action.cue,
        currentQuiz: action.quiz,
        readingStartMs: action.ts,
        readingTotalMs: null,
        drivingStartMs: null,
        cueShownMs: null,
        cueReadMs: null,
        quizStartMs: null,
        quizTotalMs: null,
        quizResults: [],
        startedAtIso: new Date().toISOString(),
      }

    case 'GO_DRIVING':
      return {
        ...state,
        phase: PHASE.DRIVING,
        drivingStartMs: action.ts,
        readingTotalMs: state.readingStartMs != null ? Math.round(action.ts - state.readingStartMs) : null,
      }

    case 'GO_CUE_OR_QUIZ': {
      // A 조건이면 CUE 스킵
      if (state.currentCue && state.currentCue.id === 'A') {
        return { ...state, phase: PHASE.QUIZ, quizStartMs: action.ts }
      }
      return { ...state, phase: PHASE.CUE, cueShownMs: action.ts }
    }

    case 'CUE_DISMISSED':
      return {
        ...state,
        phase: PHASE.QUIZ,
        cueReadMs: state.cueShownMs != null ? action.ts - state.cueShownMs : null,
        quizStartMs: action.ts,
      }

    case 'RECORD_QUIZ_ANSWER': {
      const idx = state.quizResults.length
      const q = state.currentQuiz[idx]
      const correct = action.given === q.answer
      const prevTs = idx === 0 ? state.quizStartMs : state.quizResults[idx - 1].__endTs
      const responseMs = action.ts - prevTs
      const result = {
        type: q.type,
        question: q.question,
        correct_answer: q.answer,
        given_answer: action.given,
        correct,
        response_ms: Math.round(responseMs),
        __endTs: action.ts,
      }
      const nextResults = [...state.quizResults, result]
      const isLast = nextResults.length >= state.currentQuiz.length
      if (!isLast) {
        return { ...state, quizResults: nextResults }
      }
      // 퀴즈 모두 응답 완료 → SURVEY phase로 이동, trial 임시 보관
      const quizTotalMs = action.ts - state.quizStartMs
      const correctCount = nextResults.filter((r) => r.correct).length
      const partialTrial = {
        participant_id: state.participantId,
        trial_index: state.isPractice ? 0 : state.mainTrialIndex + 1,
        is_practice: state.isPractice,
        text_id: state.currentText.id,
        cue_id: state.currentCue.id,
        started_at_iso: state.startedAtIso,
        reading_total_ms: state.readingTotalMs,
        driving_seconds: state.drivingStartMs != null
          ? Math.round((state.cueShownMs ?? state.quizStartMs) - state.drivingStartMs) / 1000
          : null,
        cue_read_ms: state.cueReadMs,
        quiz_total_ms: Math.round(quizTotalMs),
        correct_count: correctCount,
        quiz_results: nextResults.map(({ __endTs, ...r }) => r),
      }
      return {
        ...state,
        phase: PHASE.SURVEY,
        quizResults: nextResults,
        quizTotalMs: Math.round(quizTotalMs),
        pendingTrial: partialTrial,
      }
    }

    case 'RECORD_SURVEY': {
      if (!state.pendingTrial) return state
      const trialRecord = {
        ...state.pendingTrial,
        ended_at_iso: new Date().toISOString(),
        ease_of_recognition: action.score,
      }
      return {
        ...state,
        phase: PHASE.TRIAL_COMPLETE,
        pendingTrial: null,
        completedTrials: [...state.completedTrials, trialRecord],
      }
    }

    case 'NEXT_TRIAL': {
      // practice 였으면 mainTrialIndex 그대로, 본 trial이면 +1
      const newIdx = state.isPractice ? state.mainTrialIndex : state.mainTrialIndex + 1
      const allDone = !state.isPractice && newIdx >= 3
      return {
        ...state,
        phase: allDone ? PHASE.EXPERIMENT_COMPLETE : PHASE.MENU,
        mainTrialIndex: newIdx,
        isPractice: false,
        currentText: null,
        currentCue: null,
        currentQuiz: null,
      }
    }

    default:
      return state
  }
}

export function useExperimentState() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const actions = {
    setParticipant: useCallback((participantId, assignment) => {
      dispatch({ type: 'SET_PARTICIPANT', participantId, assignment })
    }, []),
    startPractice: useCallback((text, cue, quiz) => {
      dispatch({ type: 'START_PRACTICE', text, cue, quiz, ts: performance.now() })
    }, []),
    startMainTrial: useCallback((text, cue, quiz) => {
      dispatch({ type: 'START_MAIN_TRIAL', text, cue, quiz, ts: performance.now() })
    }, []),
    goDriving: useCallback(() => {
      dispatch({ type: 'GO_DRIVING', ts: performance.now() })
    }, []),
    goCueOrQuiz: useCallback(() => {
      dispatch({ type: 'GO_CUE_OR_QUIZ', ts: performance.now() })
    }, []),
    cueDismissed: useCallback(() => {
      dispatch({ type: 'CUE_DISMISSED', ts: performance.now() })
    }, []),
    recordQuizAnswer: useCallback((given) => {
      dispatch({ type: 'RECORD_QUIZ_ANSWER', given, ts: performance.now() })
    }, []),
    recordSurvey: useCallback((score) => {
      dispatch({ type: 'RECORD_SURVEY', score })
    }, []),
    nextTrial: useCallback(() => {
      dispatch({ type: 'NEXT_TRIAL' })
    }, []),
  }

  return { state, actions }
}
