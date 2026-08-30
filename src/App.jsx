import { useState, useEffect } from 'react'
import AgendaForm from './components/AgendaForm'
import AgendaConduct from './components/AgendaConduct'

export default function App() {
  const [hymns, setHymns] = useState([])
  const [loading, setLoading] = useState(true)
  const [agenda, setAgenda] = useState(null)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando himnos…</p>
      </div>
    )
  }

  if (agenda) {
    return (
      <AgendaConduct
        agenda={agenda}
        hymns={hymns}
        onBack={() => setAgenda(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <AgendaForm hymns={hymns} onGenerate={setAgenda} />
    </div>
  )
}
