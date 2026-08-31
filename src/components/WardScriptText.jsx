const PART_CLASS = {
  script: 'text-slate-500 font-normal',
  name: 'text-slate-900 font-medium',
  calling: 'text-slate-800 font-medium',
  cue: 'text-slate-400 font-normal italic',
}

export default function WardScriptText({ parts, className = '' }) {
  if (!parts?.length) return null

  return (
    <p className={`leading-relaxed ${className}`}>
      {parts.map((part, index) => (
        <span key={`${part.type}-${index}`} className={PART_CLASS[part.type] || PART_CLASS.script}>
          {part.text}
        </span>
      ))}
    </p>
  )
}
