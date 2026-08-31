import { useState } from 'react'
import NameInput from './NameInput'
import { SectionLabel, TypeLabel } from './ItemTypeIcon'
import { capitalizeName } from '../utils/capitalizeName'
import { newVisitor } from '../utils/programItems'

const inputClass =
  'w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/10 focus:border-brand-700 transition'

export function VisitorsEditor({ items, onChange }) {
  const updateName = (id, name) => {
    onChange(items.map((entry) => (entry.id === id ? { ...entry, name } : entry)))
  }

  const remove = (id) => {
    onChange(items.filter((entry) => entry.id !== id))
  }

  const add = () => onChange([...items, newVisitor()])

  return (
    <div>
      <SectionLabel type="visitors">Visitantes</SectionLabel>
      <p className="text-xs text-slate-500 mb-3">
        Personas a quienes se dará la bienvenida en la apertura. También se pueden anotar desde la presentación.
      </p>
      <div className="space-y-2">
        {items.map((entry, index) => (
          <div key={entry.id} className="flex gap-2 items-center">
            <NameInput
              value={entry.name}
              onChange={(e) => updateName(entry.id, e.target.value)}
              placeholder={`Visitante ${index + 1}`}
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => remove(entry.id)}
              className="text-gray-400 hover:text-red-500 text-lg leading-none shrink-0"
              title="Quitar"
              aria-label="Quitar visitante"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        + Agregar visitante
      </button>
    </div>
  )
}

export function WelcomeVisitorsList({ visitors, onChange, readOnly = false }) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState('')

  const commitAdd = () => {
    const trimmed = draft.trim()
    if (trimmed) {
      onChange([...visitors, newVisitor(capitalizeName(trimmed))])
      setDraft('')
      setAdding(true)
      return
    }
    setDraft('')
    setAdding(false)
  }

  const startEdit = (entry) => {
    setEditingId(entry.id)
    setEditDraft(entry.name)
    setAdding(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDraft('')
  }

  const commitEdit = (id, rawValue = editDraft) => {
    const trimmed = capitalizeName(String(rawValue).trim())
    if (!trimmed) {
      cancelEdit()
      return
    }
    onChange(visitors.map((entry) => (entry.id === id ? { ...entry, name: trimmed } : entry)))
    cancelEdit()
  }

  const remove = (id) => {
    if (editingId === id) cancelEdit()
    onChange(visitors.filter((entry) => entry.id !== id))
  }

  return (
    <div className="mt-3 space-y-2">
      <TypeLabel type="visitors" className="mb-1">
        Visitantes
      </TypeLabel>

      {visitors.length > 0 && (
        <ul className="m-0 list-none space-y-1 p-0">
          {visitors.map((entry) => {
            const name = capitalizeName(entry.name)
            if (!name && editingId !== entry.id) return null

            if (readOnly) {
              return (
                <li key={entry.id} className="flex items-center gap-2 text-sm text-slate-800">
                  <span className="text-slate-400 shrink-0">•</span>
                  <span className="min-w-0 flex-1 font-medium leading-snug break-words">{name}</span>
                </li>
              )
            }

            return (
              <li key={entry.id} className="group flex items-center gap-2 text-sm text-slate-800">
                <span className="text-slate-400 shrink-0">•</span>
                {editingId === entry.id ? (
                  <NameInput
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    onBlur={(e) => commitEdit(entry.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        commitEdit(entry.id)
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault()
                        cancelEdit()
                      }
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className="min-w-0 flex-1 bg-transparent border-0 border-b border-brand-700 rounded-none px-0 py-0 text-sm font-medium text-slate-800 focus:outline-none focus:ring-0"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(entry)}
                    className="min-w-0 flex-1 truncate text-left font-medium leading-snug text-slate-800 hover:text-brand-800"
                    title="Tocar para editar"
                  >
                    {name}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(entry.id)}
                  className="shrink-0 px-0.5 text-sm leading-none text-slate-300 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                  title="Quitar"
                  aria-label="Quitar"
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {!readOnly && (adding ? (
        <NameInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitAdd}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitAdd()
            }
            if (e.key === 'Escape') {
              setDraft('')
              setAdding(false)
            }
          }}
          placeholder="Nombre del visitante"
          autoFocus
          className="w-full max-w-xs bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-1 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-brand-700 focus:ring-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            cancelEdit()
            setAdding(true)
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="Agregar visitante"
          aria-label="Agregar visitante"
        >
          <span className="text-lg leading-none font-light">+</span>
        </button>
      ))}
    </div>
  )
}
