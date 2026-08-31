const SIZES = {
  sm: 'h-11',
  md: 'h-14',
  lg: 'h-20',
  xl: 'h-24',
}

const logoSrc = `${import.meta.env.BASE_URL}church-logo.png`

export default function ChurchLogo({ size = 'md', className = '' }) {
  const heightClass = size ? (SIZES[size] ?? size) : ''

  return (
    <img
      src={logoSrc}
      alt="La Iglesia de Jesucristo de los Santos de los Últimos Días"
      className={`w-auto max-w-full object-contain shrink-0 ${heightClass} ${className}`.trim()}
      decoding="async"
    />
  )
}
