import { useEffect, useState } from 'react'
import { loadConfig } from './utils/config.js'
import { PHASE, useExperimentState } from './hooks/useExperimentState.js'
import WelcomeScreen from './components/WelcomeScreen.jsx'
import MenuScreen from './components/MenuScreen.jsx'
import ReadingScreen from './components/ReadingScreen.jsx'
import DrivingScreen from './components/DrivingScreen.jsx'
import CueScreen from './components/CueScreen.jsx'
import QuizScreen from './components/QuizScreen.jsx'
import SurveyScreen from './components/SurveyScreen.jsx'
import TrialCompleteScreen from './components/TrialCompleteScreen.jsx'

export default function App() {
  const [config, setConfig] = useState(null)
  const [configError, setConfigError] = useState('')
  const { state, actions } = useExperimentState()

  useEffect(() => {
    loadConfig().then(setConfig).catch((e) => setConfigError(String(e)))
  }, [])

  if (configError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow p-8 max-w-lg">
          <div className="text-red-600 font-bold mb-2">config.json 로드 실패</div>
          <div className="text-sm text-gray-700">{configError}</div>
        </div>
      </div>
    )
  }
  if (!config) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="text-gray-500">config 로드 중...</div>
      </div>
    )
  }

  const drivingSec = config.experiment_metadata?.driving_seconds ?? 420

  switch (state.phase) {
    case PHASE.WELCOME:
      return <WelcomeScreen onSubmit={actions.setParticipant} />

    case PHASE.MENU:
      return (
        <MenuScreen
          participantId={state.participantId}
          mainTrialIndex={state.mainTrialIndex}
          assignment={state.assignment}
          config={config}
          onStartPractice={actions.startPractice}
          onStartMainTrial={actions.startMainTrial}
        />
      )

    case PHASE.READING:
      return (
        <ReadingScreen
          sentences={state.currentText.sentences}
          onFinish={actions.goDriving}
        />
      )

    case PHASE.DRIVING:
      return (
        <DrivingScreen
          durationSec={drivingSec}
          onComplete={actions.goCueOrQuiz}
        />
      )

    case PHASE.CUE:
      return <CueScreen cue={state.currentCue} onDismiss={actions.cueDismissed} />

    case PHASE.QUIZ:
      return (
        <QuizScreen
          quiz={state.currentQuiz}
          currentIndex={state.quizResults.length}
          onAnswer={actions.recordQuizAnswer}
        />
      )

    case PHASE.SURVEY:
      return <SurveyScreen onSubmit={actions.recordSurvey} />

    case PHASE.TRIAL_COMPLETE: {
      const trial = state.completedTrials[state.completedTrials.length - 1]
      const isLast = !trial.is_practice && state.mainTrialIndex >= 2
      return (
        <TrialCompleteScreen
          trial={trial}
          allTrials={state.completedTrials}
          isLast={isLast}
          onNext={actions.nextTrial}
        />
      )
    }

    case PHASE.EXPERIMENT_COMPLETE:
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50">
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <h1 className="text-3xl font-bold text-emerald-700 mb-4">실험 종료</h1>
            <p className="text-gray-700">참여해주셔서 감사합니다.</p>
          </div>
        </div>
      )

    default:
      return null
  }
}
