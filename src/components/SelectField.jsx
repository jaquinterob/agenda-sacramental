import { useEffect, useRef, useState } from 'react'

const triggerClass =
  'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-brand-700/10 focus:border-brand-700'

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-4 h-4 shrink-0 text-icon-muted transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar…',
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const containerRef = useRef(null)

  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
        setHighlightIdx(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const select = (optionValue) => {
    onChange(optionValue)
    setOpen(false)
    setHighlightIdx(-1)
  }

  const handleKeyDown = (event) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setOpen(true)
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightIdx((index) => Math.min(index + 1, options.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightIdx((index) => Math.max(index - 1, 0))
        break
      case 'Enter':
        event.preventDefault()
        if (highlightIdx >= 0) select(options[highlightIdx].value)
        break
      case 'Escape':
        setOpen(false)
        setHighlightIdx(-1)
        break
      default:
        break
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`${triggerClass} ${open ? 'border-brand-700 ring-2 ring-brand-700/10' : 'hover:border-slate-400'}`}
      >
        <span className={`truncate ${selected ? 'text-slate-900' : 'text-gray-400'}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {options.map((option, index) => {
            const isSelected = value === option.value
            const isHighlighted = index === highlightIdx

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightIdx(index)}
                onClick={() => select(option.value)}
                className={[
                  'cursor-pointer px-3 py-2 text-sm transition-colors',
                  isSelected ? 'font-medium text-slate-900' : 'text-slate-700',
                  isHighlighted || isSelected ? 'bg-slate-100' : 'hover:bg-gray-50',
                ].join(' ')}
              >
                {option.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
