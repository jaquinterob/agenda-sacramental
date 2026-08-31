import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FormLabel } from './ItemTypeIcon'

const fieldClass =
  'w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/10 focus:border-brand-700 transition'

const MAX_RESULTS = 25
const STEP_NAV_RESERVE = 104

function formatHymn(hymn) {
  return `${hymn.number} — ${hymn.title}`
}

function filterHymns(hymns, query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return hymns.filter(
    (h) => String(h.number).includes(q) || h.title.toLowerCase().includes(q),
  )
}

function measureDropdown(input) {
  const rect = input.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom - STEP_NAV_RESERVE
  const spaceAbove = rect.top - 12
  const openUp = spaceBelow < 160 && spaceAbove > spaceBelow
  const maxHeight = Math.max(120, Math.min(280, openUp ? spaceAbove - 8 : spaceBelow - 8))

  return {
    top: openUp ? rect.top - maxHeight - 4 : rect.bottom + 4,
    left: rect.left,
    width: rect.width,
    maxHeight,
  }
}

export default function HymnSelector({
  label,
  iconType = 'hymn',
  hymns = [],
  value,
  onChange,
  sacramentOnly = false,
}) {
  const listboxId = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [dropdownLayout, setDropdownLayout] = useState(null)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const selected = useMemo(
    () => hymns.find((h) => h.number === value) ?? null,
    [hymns, value],
  )

  const pool = useMemo(
    () => (sacramentOnly ? hymns.filter((h) => h.isSacrament) : hymns),
    [hymns, sacramentOnly],
  )

  const results = useMemo(() => filterHymns(pool, query), [pool, query])
  const visibleResults = results.slice(0, MAX_RESULTS)
  const inputValue = open ? query : selected ? formatHymn(selected) : ''
  const showList = open && query.trim().length > 0

  useEffect(() => {
    setActiveIndex(visibleResults.length > 0 ? 0 : -1)
  }, [query, visibleResults.length])

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    listRef.current.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  useEffect(() => {
    if (!showList || !inputRef.current) {
      setDropdownLayout(null)
      return
    }

    const updateLayout = () => {
      if (inputRef.current) setDropdownLayout(measureDropdown(inputRef.current))
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    window.addEventListener('scroll', updateLayout, true)
    return () => {
      window.removeEventListener('resize', updateLayout)
      window.removeEventListener('scroll', updateLayout, true)
    }
  }, [showList, query])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event) => {
      const target = event.target
      if (containerRef.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      closeList()
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

  const closeList = () => {
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
    setDropdownLayout(null)
  }

  const pickHymn = (hymn) => {
    onChange(hymn.number)
    closeList()
    inputRef.current?.blur()
  }

  const handleFocus = () => {
    setOpen(true)
    setQuery(selected ? formatHymn(selected) : '')
  }

  const handleChange = (event) => {
    setQuery(event.target.value)
    setOpen(true)
    if (value != null) onChange(null)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeList()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) setOpen(true)
      setActiveIndex((index) => Math.min(index + 1, visibleResults.length - 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
      return
    }

    if (event.key !== 'Enter') return

    event.preventDefault()

    if (open && activeIndex >= 0 && visibleResults[activeIndex]) {
      pickHymn(visibleResults[activeIndex])
      return
    }

    const trimmed = query.trim()
    const byNumber = pool.find((h) => String(h.number) === trimmed)
    if (byNumber) pickHymn(byNumber)
    else if (results.length === 1) pickHymn(results[0])
  }

  const clearSelection = () => {
    onChange(null)
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const placeholder = sacramentOnly
    ? 'Escribe número o título del himno sacramental…'
    : 'Escribe número o título del himno…'

  const dropdown =
    showList &&
    dropdownLayout &&
    createPortal(
      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        style={{
          position: 'fixed',
          top: dropdownLayout.top,
          left: dropdownLayout.left,
          width: dropdownLayout.width,
          maxHeight: dropdownLayout.maxHeight,
          zIndex: 100,
        }}
        className="overflow-y-auto overscroll-contain touch-pan-y rounded-lg border border-gray-200 bg-white py-1 shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
      >
        {visibleResults.length === 0 ? (
          <li className="px-3 py-3 text-sm text-slate-500">No se encontraron himnos.</li>
        ) : (
          visibleResults.map((hymn, index) => (
            <li key={hymn.number} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === hymn.number}
                onClick={() => pickHymn(hymn)}
                className={[
                  'flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm',
                  index === activeIndex ? 'bg-slate-100' : 'hover:bg-slate-50 active:bg-slate-100',
                ].join(' ')}
              >
                <span className="w-10 shrink-0 text-right font-mono text-slate-400">{hymn.number}</span>
                <span className="min-w-0 flex-1 truncate text-slate-900">{hymn.title}</span>
              </button>
            </li>
          ))
        )}

        {results.length > MAX_RESULTS && (
          <li className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
            Mostrando {MAX_RESULTS} de {results.length}. Escribe más para acotar.
          </li>
        )}
      </ul>,
      document.body,
    )

  return (
    <div ref={containerRef} className="relative">
      {label ? <FormLabel type={iconType}>{label}</FormLabel> : null}

      <div className="relative mt-0">
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-autocomplete="list"
          aria-controls={listboxId}
          value={inputValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${fieldClass} ${selected && !open ? 'pr-10' : ''}`}
          autoComplete="off"
          enterKeyHint="search"
        />

        {selected && !open && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-red-600"
            aria-label="Quitar himno seleccionado"
            title="Quitar selección"
          >
            ×
          </button>
        )}
      </div>

      {dropdown}

      {!showList && !selected && (
        <p className="mt-1.5 text-xs text-slate-500">Escribe para buscar en la lista de himnos.</p>
      )}
    </div>
  )
}
