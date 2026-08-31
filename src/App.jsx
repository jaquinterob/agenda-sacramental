import { useState, useEffect, useRef } from 'react'
import AgendaForm from './components/AgendaForm'
import AgendaConduct from './components/AgendaConduct'
import { createInitialAgenda } from './utils/agendaForm'
import { readAgendaFromLocation, SHARE_MODES } from './utils/agendaShareLink'
import { clearAgendaDraft, loadAgendaDraft, saveAgendaDraft } from './utils/agendaStorage'
import ChurchLogo from './components/ChurchLogo'

export default function App() {
  const [hymns, setHymns] = useState([])
  const [loading, setLoading] = useState(true)
  const [agenda, setAgenda] = useState(createInitialAgenda)
  const [stepIndex, setStepIndex] = useState(0)
  const [attemptedSteps, setAttemptedSteps] = useState(() => new Set())
  const [view, setView] = useState('form')
  const [conductReadOnly, setConductReadOnly] = useState(false)
  const hydratedRef = useRef(false)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/hymns.json`)
      .then((res) => res.json())
      .then((data) => {
        setHymns(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error al cargar himnos:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (loading) return

    const shared = readAgendaFromLocation()
    if (shared) {
      setAgenda(shared.agenda)
      if (shared.mode === SHARE_MODES.EDIT) {
        setView('form')
        setConductReadOnly(false)
      } else {
        setView('conduct')
        setConductReadOnly(true)
      }
    } else {
      const draft = loadAgendaDraft()
      if (draft) {
        setAgenda(draft.agenda)
        setStepIndex(draft.stepIndex)
        setAttemptedSteps(new Set(draft.attemptedSteps))
      }
    }

    hydratedRef.current = true
  }, [loading])

  useEffect(() => {
    if (loading || !hydratedRef.current) return
    saveAgendaDraft(agenda, stepIndex, attemptedSteps)
  }, [agenda, stepIndex, attemptedSteps, loading])

  const clearDraft = () => {
    if (
      !window.confirm(
        '¿Borrar todo el programa guardado en este dispositivo? No se puede deshacer.',
      )
    ) {
      return
    }

    clearAgendaDraft()
    setAgenda(createInitialAgenda())
    setStepIndex(0)
    setAttemptedSteps(new Set())
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-6">
        <ChurchLogo size="lg" />
        <p className="text-gray-500 text-sm">Cargando himnos…</p>
      </div>
    )
  }

  if (view === 'conduct') {
    return (
      <AgendaConduct
        agenda={agenda}
        hymns={hymns}
        readOnly={conductReadOnly}
        onBack={(updatedAgenda) => {
          if (updatedAgenda) setAgenda(updatedAgenda)
          setConductReadOnly(false)
          setView('form')
        }}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-gray-50 py-8 px-4">
      <AgendaForm
        hymns={hymns}
        form={agenda}
        setForm={setAgenda}
        stepIndex={stepIndex}
        setStepIndex={setStepIndex}
        attemptedSteps={attemptedSteps}
        setAttemptedSteps={setAttemptedSteps}
        onClearDraft={clearDraft}
        onOpenPresentation={() => {
          setConductReadOnly(false)
          setView('conduct')
        }}
      />
    </div>
  )
}
