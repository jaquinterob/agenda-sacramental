import SlidingToggle from './SlidingToggle'

const GENDER_OPTIONS = [
  {
    value: 'male',
    label: 'Hombre',
    activeTextClass: 'text-sky-700',
    pillClass: 'bg-sky-100 ring-sky-200',
  },
  {
    value: 'female',
    label: 'Mujer',
    activeTextClass: 'text-rose-700',
    pillClass: 'bg-rose-100 ring-rose-200',
  },
]

export default function PersonGenderToggle({ value, onChange, nameLabel = '' }) {
  const groupLabel = nameLabel
    ? `Forma del texto para ${nameLabel}`
    : 'Forma del texto'

  return (
    <SlidingToggle
      value={value || 'male'}
      onChange={onChange}
      options={GENDER_OPTIONS}
      ariaLabel={groupLabel}
    />
  )
}
