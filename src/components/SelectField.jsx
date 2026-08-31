const selectClass =
  'w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/10 focus:border-brand-700 transition'

export default function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar…',
  className = '',
}) {
  return (
    <select
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={`${selectClass} ${className}`.trim()}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
