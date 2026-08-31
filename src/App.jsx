import { useState, useEffect } from 'react'
import AgendaForm from './components/AgendaForm'
import AgendaConduct from './components/AgendaConduct'
import { createInitialAgenda } from './utils/agendaForm'
import { readAgendaFromLocation, SHARE_MODES } from './utils/agendaShareLink'
import ChurchLogo from './components/ChurchLogo'

export default function App() {
  const [hymns, setHymns] = useState([])
  const [loading, setLoading] = useState(true)
  const [agenda, setAgenda] = useState(createInitialAgenda)
  const [stepIndex, setStepIndex] = useState(0)
  const [view, setView] = useState('form')
  const [conductReadOnly, setConductReadOnly] = useState(false)

  useEffect(() => {
    fetch('/data/hymns.json')
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
    }
  }, [loading])

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <AgendaForm
        hymns={hymns}
        form={agenda}
        setForm={setAgenda}
        stepIndex={stepIndex}
        setStepIndex={setStepIndex}
        onOpenPresentation={() => {
          setConductReadOnly(false)
          setView('conduct')
        }}
      />
    </div>
  )
}
