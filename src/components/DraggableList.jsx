import { useState } from 'react'
import HymnSelector from './HymnSelector'
import NameInput from './NameInput'
import { FormLabel, TypeLabel } from './ItemTypeIcon'

export function DragHandle({ className = 'mt-2' }) {
  return (
    <div
      className={`flex h-8 w-7 shrink-0 cursor-grab active:cursor-grabbing items-center justify-center rounded text-icon-muted hover:bg-slate-100 hover:text-icon touch-none ${className}`}
      aria-hidden="true"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="9" cy="7" r="1.5" />
        <circle cx="15" cy="7" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="17" r="1.5" />
        <circle cx="15" cy="17" r="1.5" />
      </svg>
    </div>
  )
}

export function useDragReorder(items, onReorder) {
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)

  const reorder = (from, to) => {
    if (from === null || from === to) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onReorder(next)
  }

  const containerProps = (index) => ({
    onDragOver: (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (overIndex !== index) setOverIndex(index)
    },
    onDrop: (e) => {
      e.preventDefault()
      reorder(dragIndex, index)
      setDragIndex(null)
      setOverIndex(null)
    },
  })

  const handleProps = (index) => ({
    draggable: true,
    onDragStart: (e) => {
      setDragIndex(index)
      e.dataTransfer.effectAllowed = 'move'
    },
    onDragEnd: () => {
      setDragIndex(null)
      setOverIndex(null)
    },
  })

  return { dragIndex, overIndex, containerProps, handleProps }
}

const inputClass =
  'w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/10 focus:border-brand-700 transition'

export function ProgramItemsEditor({ items, onChange, hymns = [] }) {
  const { dragIndex, overIndex, containerProps, handleProps } = useDragReorder(items, onChange)

  const updateItem = (index, patch) => {
    const next = [...items]
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }

  const removeItem = (index) => {
    if (items.length <= 1) return
    onChange(items.filter((_, i) => i !== index))
  }

  const addItem = (type) => {
    if (type === 'speaker') onChange([...items, newSpeaker()])
    else if (type === 'testimony') onChange([...items, newTestimony()])
    else onChange([...items, newIntermediateHymn()])
  }

  let speakerNum = 0

  return (
    <div>
      <p className="text-xs text-slate-500 mb-4">
        Arrastra para cambiar el orden. Discurso: 7 min · Himno intermedio: 3 min · Testimonio: 3 min.
      </p>

      <div className="space-y-2">
        {items.map((item, index) => {
          const isSpeaker = item.type === 'speaker'
          const isHymn = item.type === 'hymn'
          const iconType = isSpeaker ? 'speaker' : isHymn ? 'hymn' : 'testimony'
          const label = isSpeaker ? `Discursante ${++speakerNum}` : isHymn ? 'Himno intermedio' : 'Testimonio'
          const duration = isSpeaker ? '7 min' : '3 min'
          const isDragging = dragIndex === index
          const isOver = overIndex === index && dragIndex !== index

          return (
            <div
              key={item.id}
              {...containerProps(index)}
              className={[
                'flex gap-2 items-start rounded-xl border p-3 transition-all',
                isDragging && 'opacity-40 scale-[0.98]',
                isOver ? 'border-brand-700 bg-slate-50 shadow-sm' : 'border-slate-200 bg-white',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div {...handleProps(index)}>
                <DragHandle />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <TypeLabel type={iconType}>
                  {label} · {duration}
                </TypeLabel>
                {isHymn ? (
                  <HymnSelector
                    label=""
                    hymns={hymns}
                    value={item.hymnNumber}
                    onChange={(n) => updateItem(index, { hymnNumber: n })}
                  />
                ) : (
                  <>
                    <NameInput
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      placeholder={isSpeaker ? 'Nombre del discursante' : 'Nombre del testigo'}
                      className={inputClass}
                    />
                    {isSpeaker && (
                      <input
                        type="text"
                        value={item.topic || ''}
                        onChange={(e) => updateItem(index, { topic: e.target.value })}
                        placeholder="Tema (opcional)"
                        className={inputClass}
                      />
                    )}
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
                className="mt-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none text-lg leading-none shrink-0"
                title="Eliminar"
                aria-label="Eliminar"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          type="button"
          onClick={() => addItem('speaker')}
          className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          + Discursante
        </button>
        <button
          type="button"
          onClick={() => addItem('hymn')}
          className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          + Himno intermedio
        </button>
        <button
          type="button"
          onClick={() => addItem('testimony')}
          className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          + Testimonio
        </button>
      </div>
    </div>
  )
}

function newSpeaker() {
  return { id: crypto.randomUUID(), type: 'speaker', name: '', topic: '' }
}

function newTestimony() {
  return { id: crypto.randomUUID(), type: 'testimony', name: '' }
}

function newIntermediateHymn() {
  return { id: crypto.randomUUID(), type: 'hymn', hymnNumber: null }
}
