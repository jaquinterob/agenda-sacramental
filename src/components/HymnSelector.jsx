import { useState, useMemo, useRef, useEffect } from 'react'
import { hymnUrl } from '../utils/hymnUrl'

function ExternalLinkIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

export default function HymnSelector({
  label,
  hymns = [],
  value,
  onChange,
  sacramentOnly = false,
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sacramentFilter, setSacramentFilter] = useState(sacramentOnly)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const containerRef = useRef(null)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  const categories = useMemo(() => {
    return [...new Set(hymns.map((h) => h.category))].sort()
  }, [hymns])

  const filtered = useMemo(() => {
    let result = hymns
    if (sacramentOnly || sacramentFilter) {
      result = result.filter((h) => h.isSacrament)
    }
    if (category !== 'all') {
      result = result.filter((h) => h.category === category)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (h) => String(h.number).includes(q) || h.title.toLowerCase().includes(q),
      )
    }
    return result
  }, [hymns, query, category, sacramentOnly, sacramentFilter])

  const selected = hymns.find((h) => h.number === value)

  useEffect(() => {
    setSacramentFilter(sacramentOnly)
  }, [sacramentOnly])

  useEffect(() => {
    setHighlightIdx(-1)
  }, [filtered.length])

  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.children
      if (items[highlightIdx]) {
        items[highlightIdx].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightIdx])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const selectHymn = (hymn) => {
    onChange(hymn.number)
    setQuery('')
    setIsOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIdx((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightIdx >= 0 && filtered[highlightIdx]) {
          selectHymn(filtered[highlightIdx])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setQuery('')
        break
    }
  }

  const clearSelection = (e) => {
    e.stopPropagation()
    onChange(null)
    setQuery('')
  }

  return (
    <div ref={containerRef}>
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
        {label}
      </label>

      <div className="relative">
        <div
          role="combobox"
          aria-expanded={isOpen}
          className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white cursor-pointer hover:border-slate-400 transition-colors"
          onClick={() => {
            setIsOpen(true)
            inputRef.current?.focus()
          }}
        >
          {selected ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-gray-500 font-mono text-sm shrink-0">{selected.number}</span>
              <span className="truncate text-gray-900 text-sm">{selected.title}</span>
              <a
                href={hymnUrl(selected.number)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-gray-400 hover:text-slate-700 transition-colors"
                title="Ver himno en churchofjesuschrist.org"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLinkIcon />
              </a>
              <button
                type="button"
                onClick={clearSelection}
                className="shrink-0 text-gray-400 hover:text-red-500 transition-colors ml-auto"
                title="Quitar selección"
                aria-label="Quitar selección"
              >
                ×
              </button>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Seleccionar himno…</span>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-2 border-b border-gray-100 space-y-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setHighlightIdx(-1)
                }}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
                autoFocus
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {!sacramentOnly && (
                <label className="flex items-center gap-2 text-sm text-gray-700 px-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sacramentFilter}
                    onChange={(e) => setSacramentFilter(e.target.checked)}
                  />
                  Solo himnos sacramentales
                </label>
              )}
              {sacramentOnly && (
                <p className="text-xs text-slate-600 font-medium px-1">
                  Solo himnos sacramentales
                </p>
              )}
            </div>
            <ul ref={listRef} className="max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-gray-400 text-sm">
                  No se encontraron himnos
                </li>
              ) : (
                filtered.map((hymn, idx) => (
                  <li
                    key={hymn.number}
                    onClick={() => selectHymn(hymn)}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm ${
                      idx === highlightIdx ? 'bg-slate-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-gray-400 font-mono w-10 text-right shrink-0">{hymn.number}</span>
                    <span className="text-gray-900 truncate flex-1">{hymn.title}</span>
                    <a
                      href={hymnUrl(hymn.number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-gray-300 hover:text-slate-600 transition-colors"
                      title="Ver himno en churchofjesuschrist.org"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
