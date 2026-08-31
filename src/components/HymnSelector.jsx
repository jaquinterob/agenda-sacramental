import { useMemo, useState } from 'react'
import { FormLabel } from './ItemTypeIcon'

const fieldClass =
  'w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/10 focus:border-brand-700 transition'

function formatHymn(hymn) {
  return `${hymn.number} — ${hymn.title}`
}

function groupHymns(hymns) {
  const map = new Map()
  for (const hymn of hymns) {
    if (!map.has(hymn.category)) map.set(hymn.category, [])
    map.get(hymn.category).push(hymn)
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'es'))
}

export default function HymnSelector({
  label,
  iconType = 'hymn',
  hymns = [],
  value,
  onChange,
  sacramentOnly = false,
}) {
  const [query, setQuery] = useState('')

  const selected = useMemo(
    () => hymns.find((h) => h.number === value) ?? null,
    [hymns, value],
  )

  const pool = useMemo(
    () => (sacramentOnly ? hymns.filter((h) => h.isSacrament) : hymns),
    [hymns, sacramentOnly],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return pool.filter(
      (h) => String(h.number).includes(q) || h.title.toLowerCase().includes(q),
    )
  }, [pool, query])

  const grouped = useMemo(() => groupHymns(filtered), [filtered])

  const inputValue = query || (selected ? formatHymn(selected) : '')

  const pickHymn = (hymn) => {
    onChange(hymn.number)
    setQuery('')
  }

  const handleInputChange = (event) => {
    setQuery(event.target.value)
    if (value != null) onChange(null)
  }

  const handleInputKeyDown = (event) => {
    if (event.key !== 'Enter') return

    const trimmed = query.trim()
    const byNumber = pool.find((h) => String(h.number) === trimmed)
    if (byNumber) {
      event.preventDefault()
      pickHymn(byNumber)
      return
    }

    if (filtered.length === 1) {
      event.preventDefault()
      pickHymn(filtered[0])
    }
  }

  const clearSelection = () => {
    onChange(null)
    setQuery('')
  }

  return (
    <div className="space-y-2">
      {label ? <FormLabel type={iconType}>{label}</FormLabel> : null}

      <input
        type="search"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={
          sacramentOnly ? 'Buscar himno sacramental por número o título…' : 'Buscar por número o título…'
        }
        className={fieldClass}
        autoComplete="off"
        enterKeyHint="done"
      />

      {query.trim() === '' ? (
        <p className="text-xs text-slate-500">
          {selected
            ? 'Himno seleccionado. Escribe de nuevo para cambiarlo.'
            : 'Escribe el número o parte del título para ver resultados.'}
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No se encontraron himnos.</p>
      ) : (
        <select
          size={Math.min(filtered.length, 10)}
          value={value ?? ''}
          onChange={(event) => {
            const hymn = filtered.find((h) => h.number === Number(event.target.value))
            if (hymn) pickHymn(hymn)
          }}
          className={`${fieldClass} py-1`}
        >
          {grouped.map(([category, items]) => (
            <optgroup key={category} label={category}>
              {items.map((hymn) => (
                <option key={hymn.number} value={hymn.number}>
                  {formatHymn(hymn)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      )}

      {selected && (
        <button
          type="button"
          onClick={clearSelection}
          className="text-xs font-medium text-red-600 hover:text-red-700"
        >
          Quitar selección
        </button>
      )}
    </div>
  )
}
