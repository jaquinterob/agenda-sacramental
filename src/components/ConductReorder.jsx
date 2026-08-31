import { useState } from 'react'
import { DragHandle, useDragReorder } from './DraggableList'
import NameInput from './NameInput'
import { scheduleItemIconType, TypeLabel } from './ItemTypeIcon'
import { StandUpCue } from './StepWizard'
import ConductItemToggle from './ConductItemToggle'
import ConductProgressRail from './ConductProgressRail'
import { capitalizeName } from '../utils/capitalizeName'
import { formatTestimonyGap, testimonyGapMs } from '../utils/formatTestimonyGap'
import { newWitness } from '../utils/programItems'


function reorderByIds(items, ids) {
  const map = new Map(items.map((item) => [item.id, item]))
  return ids.map((id) => map.get(id)).filter(Boolean)
}

function SpeakerRow({ item }) {
  const iconType = scheduleItemIconType(item)

  if (item.type === 'hymn') {
    return (
      <>
        <TypeLabel type={iconType}>{item.label}</TypeLabel>
        <p className="text-sm font-semibold text-slate-900 leading-snug uppercase">
          <span className="font-mono normal-case text-slate-500">#{item.hymn.number}</span> {item.hymn.title}
        </p>
        {item.duration && (
          <span className="inline-block text-[10px] font-medium text-slate-400 mt-1">{item.duration} min</span>
        )}
      </>
    )
  }

  return (
    <>
      <TypeLabel type={iconType}>{item.label}</TypeLabel>
      <p className="text-sm font-semibold text-slate-900 leading-snug">{capitalizeName(item.name)}</p>
      {item.topic && <p className="text-sm text-slate-500 mt-0.5 italic">{item.topic}</p>}
      {item.duration && (
        <span className="inline-block text-[10px] font-medium text-slate-400 mt-1">{item.duration} min</span>
      )}
    </>
  )
}

export function SpeakersPhaseContent({ items, programItems, onReorder, doneItems, onToggleItemDone, setItemRef, getItemProgress, exportMode, readOnly = false }) {
  const { dragIndex, overIndex, containerProps, handleProps } = useDragReorder(items, (next) => {
    onReorder(reorderByIds(programItems, next.map((i) => i.programItemId)))
  })
  const canReorder = !exportMode && !readOnly

  let lastSpeakerIndex = -1
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (items[i].type === 'speaker') {
      lastSpeakerIndex = i
      break
    }
  }

  return (
    <div>
      {canReorder && (
        <p className="text-[11px] text-slate-500 mb-3 pl-14">
          Arrastra para cambiar el orden de discursos, himnos y testimonios.
        </p>
      )}
      <div className="space-y-1">
        {items.map((item, index) => {
          const isDragging = canReorder && dragIndex === index
          const isOver = canReorder && overIndex === index && dragIndex !== index
          const showStandCue = index === lastSpeakerIndex && lastSpeakerIndex > 0

          const itemKey = item.programItemId
          const progress = exportMode
            ? { done: false, current: false, isLast: index === items.length - 1, connectorDone: false }
            : getItemProgress?.(itemKey) ?? { done: doneItems?.has(itemKey), current: false, isLast: false, connectorDone: false }
          const { done, current } = progress

          return (
            <div key={item.programItemId} ref={exportMode ? undefined : setItemRef?.(itemKey)} className="scroll-mt-20">
              {showStandCue && <StandUpCue className="py-3 my-1" />}
              <div
                data-pdf-block
                {...(canReorder ? containerProps(index) : {})}
                className={`flex items-stretch gap-1.5 md:gap-2 rounded-lg transition-all ${
                  isDragging ? 'opacity-40' : isOver ? 'bg-slate-50 ring-1 ring-slate-300' : ''
                } ${!exportMode && done ? 'opacity-45' : ''} ${!exportMode && current && !done ? 'bg-brand-700/[0.04]' : ''}`}
              >
                {canReorder && (
                  <div {...handleProps(index)} className="pt-2 shrink-0">
                    <DragHandle className="mt-0" />
                  </div>
                )}
                <ConductProgressRail time={item.time} exportMode={exportMode} {...progress} />
                <div className="min-w-0 flex-1 pb-2 pl-3 md:pl-4 pt-2">
                  <SpeakerRow item={item} />
                </div>
                {!exportMode && onToggleItemDone && (
                  <ConductItemToggle
                    done={done}
                    onToggle={() => onToggleItemDone(itemKey)}
                    label={item.label || item.name || 'Ítem'}
                    className="mt-1.5 shrink-0"
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const TESTIMONY_COLUMN_COUNT = 2

function testimonyColumns(witnesses) {
  if (witnesses.length === 0) return []

  const columns = Array.from({ length: TESTIMONY_COLUMN_COUNT }, (_, col) => ({
    col,
    entries: [],
  }))

  witnesses.forEach((entry, index) => {
    columns[index % TESTIMONY_COLUMN_COUNT].entries.push({ entry, index })
  })

  return columns
}

function TestimonyEntryRow({
  entry,
  index,
  witnesses,
  dragIndex,
  overIndex,
  containerProps,
  handleProps,
  editingId,
  editDraft,
  setEditDraft,
  startEdit,
  commitEdit,
  cancelEdit,
  removeEntry,
}) {
  const slot = index + 1
  const isDragging = dragIndex === index
  const isOver = overIndex === index && dragIndex !== index
  const name = capitalizeName(entry.name)
  const gapMs = testimonyGapMs(entry, witnesses[index + 1])
  const gapLabel = gapMs != null ? formatTestimonyGap(gapMs) : null

  return (
    <li
      {...containerProps(index)}
      className={`group flex max-w-full items-center gap-2 rounded-md py-0.5 pr-1 transition-all ${
        isDragging ? 'opacity-40' : isOver ? 'bg-slate-50' : ''
      }`}
    >
      <span className="flex w-4 shrink-0 items-center justify-center">
        <span {...handleProps(index)} className="opacity-0 transition-opacity group-hover:opacity-100">
          <DragHandle className="mt-0 scale-[0.65]" />
        </span>
      </span>
      <span className="shrink-0 text-sm text-slate-400 tabular-nums">{slot}.</span>
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
          className="min-w-0 flex-1 truncate text-left text-sm font-medium leading-snug text-slate-800 hover:text-brand-800"
          title="Tocar para editar"
        >
          {name}
        </button>
      )}
      {gapLabel && (
        <span className="shrink-0 text-[10px] font-medium tabular-nums text-slate-400">{gapLabel}</span>
      )}
      <button
        type="button"
        onClick={() => removeEntry(entry.id)}
        className="shrink-0 px-0.5 text-sm leading-none text-slate-300 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
        title="Quitar"
        aria-label="Quitar"
      >
        ×
      </button>
    </li>
  )
}

export function TestimoniesPhaseContent({ item, witnesses, onChange, itemKey, setItemRef, done, progress, onToggleDone, exportMode, readOnly = false }) {
  const { dragIndex, overIndex, containerProps, handleProps } = useDragReorder(witnesses, onChange)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState('')

  const commitAdd = (keepOpen = true) => {
    const trimmed = draft.trim()
    if (trimmed) {
      onChange([...witnesses, { ...newWitness(), name: capitalizeName(trimmed) }])
      setDraft('')
      setAdding(keepOpen)
      return
    }
    setDraft('')
    setAdding(false)
  }

  const startEdit = (entry) => {
    setEditingId(entry.id)
    setEditDraft(entry.name)
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
    onChange(witnesses.map((w) => (w.id === id ? { ...w, name: trimmed } : w)))
    cancelEdit()
  }

  const removeEntry = (id) => {
    if (editingId === id) cancelEdit()
    onChange(witnesses.filter((w) => w.id !== id))
  }

  const columns = testimonyColumns(witnesses)
  const hasNames = witnesses.length > 0
  const { current = false } = progress ?? {}
  const namedWitnesses = witnesses.filter((entry) => capitalizeName(entry.name))

  const entryRowProps = {
    witnesses,
    dragIndex,
    overIndex,
    containerProps,
    handleProps,
    editingId,
    editDraft,
    setEditDraft,
    startEdit,
    commitEdit,
    cancelEdit,
    removeEntry,
  }

  if (exportMode) {
    return (
      <div ref={setItemRef?.(itemKey)} data-pdf-block className="scroll-mt-20 flex items-stretch gap-2 md:gap-3">
        <ConductProgressRail time={item.time} exportMode />
        <div className="min-w-0 flex-1 pb-3 pl-3 md:pl-4 pt-2">
          <TypeLabel type="testimony" className="mb-1.5">
            Testimonios
          </TypeLabel>
          {namedWitnesses.length > 0 && (
            <ul className="m-0 list-none space-y-1 p-0">
              {namedWitnesses.map((entry, index) => (
                <li key={entry.id} className="text-sm font-medium text-slate-800">
                  {index + 1}. {capitalizeName(entry.name)}
                </li>
              ))}
            </ul>
          )}
          {item.duration && (
            <span className="mt-2 inline-block text-[10px] font-medium tabular-nums text-slate-400">
              {item.duration} min
            </span>
          )}
        </div>
      </div>
    )
  }

  if (readOnly) {
    return (
      <div
        ref={setItemRef?.(itemKey)}
        className={`scroll-mt-20 flex items-stretch gap-2 md:gap-3 transition-opacity duration-300 ${
          done ? 'opacity-45' : 'opacity-100'
        } ${current && !done ? 'rounded-lg bg-brand-700/[0.04]' : ''}`}
      >
        <ConductProgressRail time={item.time} {...progress} />
        <div className="min-w-0 flex-1 pb-3 pl-3 md:pl-4 pt-2">
          <TypeLabel type="testimony" className="mb-1.5">
            Testimonios
          </TypeLabel>
          {namedWitnesses.length > 0 && (
            <ul className="m-0 list-none space-y-1 p-0">
              {namedWitnesses.map((entry, index) => (
                <li key={entry.id} className="text-sm font-medium text-slate-800">
                  {index + 1}. {capitalizeName(entry.name)}
                </li>
              ))}
            </ul>
          )}
          {item.duration && (
            <span className="mt-2 inline-block text-[10px] font-medium tabular-nums text-slate-400">
              {item.duration} min
            </span>
          )}
        </div>
        {onToggleDone && (
          <ConductItemToggle
            done={done}
            onToggle={onToggleDone}
            label="Testimonios"
            className="mt-1.5 shrink-0"
          />
        )}
      </div>
    )
  }

  return (
    <div
      ref={setItemRef?.(itemKey)}
      className={`scroll-mt-20 flex items-stretch gap-2 md:gap-3 transition-opacity duration-300 ${
        done ? 'opacity-45' : 'opacity-100'
      } ${current && !done ? 'rounded-lg bg-brand-700/[0.04]' : ''}`}
    >
      <ConductProgressRail time={item.time} {...progress} />

      <div className="min-w-0 flex-1 pb-3 pl-3 md:pl-4 pt-2">
        <TypeLabel type="testimony" className="mb-1.5">
          Testimonios
        </TypeLabel>

        {hasNames && (
          <>
            <ol className="m-0 min-w-0 list-none space-y-1 p-0 md:hidden">
              {witnesses.map((entry, index) => (
                <TestimonyEntryRow key={entry.id} entry={entry} index={index} {...entryRowProps} />
              ))}
            </ol>
            <div className="hidden md:grid md:grid-cols-2 md:items-start md:gap-x-10">
              {columns.map(({ col, entries }) => (
                <ol key={col} className="m-0 min-w-0 list-none space-y-1 p-0">
                  {entries.map(({ entry, index }) => (
                    <TestimonyEntryRow key={entry.id} entry={entry} index={index} {...entryRowProps} />
                  ))}
                </ol>
              ))}
            </div>
          </>
        )}

        <div className={`flex items-center gap-3 ${hasNames ? 'mt-3 border-t border-slate-100 pt-3' : 'mt-1'}`}>
          <div className="min-w-0 flex-1">
            {adding ? (
              <NameInput
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => commitAdd(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitAdd(true)
                  }
                  if (e.key === 'Escape') {
                    setDraft('')
                    setAdding(false)
                  }
                }}
                placeholder="Nombre"
                autoFocus
                className="w-full max-w-xs bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-1 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-brand-700 focus:ring-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                title="Anotar quien testificó"
                aria-label="Anotar quien testificó"
              >
                <span className="text-lg leading-none font-light">+</span>
              </button>
            )}
          </div>
          {item.duration && (
            <span className="shrink-0 text-[10px] font-medium tabular-nums text-slate-400">
              {item.duration} min
            </span>
          )}
        </div>
      </div>

      {onToggleDone && (
        <ConductItemToggle
          done={done}
          onToggle={onToggleDone}
          label="Testimonios"
          className="mt-1.5 shrink-0"
        />
      )}
    </div>
  )
}
