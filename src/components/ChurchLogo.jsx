const SIZES = {
  sm: 'h-9',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-20',
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
