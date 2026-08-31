const SIZES = {
  sm: 'h-10',
  md: 'h-14',
  lg: 'h-[4.5rem]',
  xl: 'h-24',
}

export default function ChurchLogo({ size = 'md', className = '' }) {
  const heightClass = size ? (SIZES[size] ?? size) : ''

  return (
    <img
      src="/church-logo.png"
      alt="La Iglesia de Jesucristo de los Santos de los Últimos Días"
      className={`w-auto max-w-full object-contain shrink-0 ${heightClass} ${className}`.trim()}
      decoding="async"
    />
  )
}
