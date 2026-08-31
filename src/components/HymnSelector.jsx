import { useState, useMemo, useRef, useEffect } from 'react'
import { FormLabel } from './ItemTypeIcon'
import { useListTapSelect } from '../utils/listTapSelect'

export default function HymnSelector({
  label,
  iconType = 'hymn',
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
  const skipAutoFocusRef = useRef(
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  )
  const bindTapSelect = useListTapSelect()

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
    if (!skipAutoFocusRef.current) {
      inputRef.current?.focus()
    }
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
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
      {label ? <FormLabel type={iconType}>{label}</FormLabel> : null}

      <div className="relative">
        <div
          role="combobox"
          aria-expanded={isOpen}
          className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white cursor-pointer hover:border-slate-400 transition-colors"
          onClick={() => {
            setIsOpen(true)
            if (!skipAutoFocusRef.current) {
              inputRef.current?.focus()
            }
          }}
        >
          {selected ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-gray-500 font-mono text-sm shrink-0">{selected.number}</span>
              <span className="truncate text-gray-900 text-sm">{selected.title}</span>
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
          <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
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
                placeholder="Buscar por número o título…"
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
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-60 overflow-y-auto overscroll-contain touch-pan-y"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-gray-400 text-sm">
                  No se encontraron himnos
                </li>
              ) : (
                filtered.map((hymn, idx) => (
                  <li key={hymn.number} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={value === hymn.number}
                      {...bindTapSelect(() => selectHymn(hymn))}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm ${
                        idx === highlightIdx ? 'bg-slate-100' : 'hover:bg-gray-50 active:bg-slate-100'
                      }`}
                    >
                      <span className="text-gray-400 font-mono w-10 text-right shrink-0">{hymn.number}</span>
                      <span className="text-gray-900 truncate flex-1">{hymn.title}</span>
                    </button>
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
