import { useMemo } from 'react'
import { FormLabel } from './ItemTypeIcon'

const selectClass =
  'w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/10 focus:border-brand-700 transition'

export default function HymnSelector({
  label,
  iconType = 'hymn',
  hymns = [],
  value,
  onChange,
  sacramentOnly = false,
}) {
  const available = useMemo(() => {
    let list = sacramentOnly ? hymns.filter((h) => h.isSacrament) : hymns
    if (value != null && !list.some((h) => h.number === value)) {
      const selected = hymns.find((h) => h.number === value)
      if (selected) list = [selected, ...list]
    }
    return list
  }, [hymns, sacramentOnly, value])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const hymn of available) {
      if (!map.has(hymn.category)) map.set(hymn.category, [])
      map.get(hymn.category).push(hymn)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'es'))
  }, [available])

  return (
    <div>
      {label ? <FormLabel type={iconType}>{label}</FormLabel> : null}
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className={selectClass}
      >
        <option value="">{sacramentOnly ? 'Seleccionar himno sacramental…' : 'Seleccionar himno…'}</option>
        {grouped.map(([category, items]) => (
          <optgroup key={category} label={category}>
            {items.map((hymn) => (
              <option key={hymn.number} value={hymn.number}>
                {hymn.number} — {hymn.title}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}
