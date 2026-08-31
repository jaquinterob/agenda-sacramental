import { capitalizeName } from '../utils/capitalizeName'

export default function NameInput({ value, onChange, onBlur, className, ...props }) {
  return (
    <input
      type="text"
      {...props}
      value={value}
      onChange={onChange}
      onBlur={(e) => {
        const formatted = capitalizeName(e.target.value)
        if (formatted !== e.target.value) {
          onChange({ ...e, target: { ...e.target, value: formatted } })
        }
        onBlur?.(e)
      }}
      autoCapitalize="words"
      autoCorrect="off"
      spellCheck={false}
      className={className}
    />
  )
}
