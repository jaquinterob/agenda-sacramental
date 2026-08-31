import {
  ArrowBendUpLeft,
  Bread,
  Buildings,
  CalendarBlank,
  Disc,
  Clock,
  Hand,
  HandsClapping,
  HandsPraying,
  HandWaving,
  Heart,
  House,
  MapPin,
  Megaphone,
  Microphone,
  MusicNote,
  MusicNotes,
  TextT,
  NotePencil,
  PianoKeys,
  UsersThree,
  Users,
} from '@phosphor-icons/react'

const ICON_SIZE = 16
const ICON_WEIGHT = 'fill'
const ICON_CLASS = 'text-icon'

const ICONS = {
  hymn: { label: 'Himno', Icon: MusicNotes },
  speaker: { label: 'Discurso', Icon: Microphone },
  testimony: { label: 'Testimonio', Icon: Heart },
  wardBusiness: { label: 'Asuntos del barrio', Icon: House },
  stakeBusiness: { label: 'Asuntos de la estaca', Icon: Buildings },
  welcome: { label: 'Bienvenida', Icon: UsersThree },
  visitors: { label: 'Visitantes', Icon: HandWaving },
  release: { label: 'Relevo', Icon: ArrowBendUpLeft },
  sustaining: { label: 'Sostenimiento', Icon: Hand },
  freeText: { label: 'Texto libre', Icon: TextT },
  announcements: { label: 'Anuncios', Icon: Megaphone },
  prayer: { label: 'Oración', Icon: HandsPraying },
  sacrament: { label: 'Santa Cena', Icon: Bread },
  thanks: { label: 'Agradecimientos', Icon: HandsClapping },
  date: { label: 'Fecha', Icon: CalendarBlank },
  time: { label: 'Hora', Icon: Clock },
  location: { label: 'Lugar', Icon: MapPin },
  musicDirector: { label: 'Dirección de la música', Icon: MusicNote },
  pianist: { label: 'Pianista', Icon: PianoKeys },
  musicAssistant: { label: 'Asistente musical', Icon: Disc },
  attendance: { label: 'Asistencia', Icon: Users },
  notes: { label: 'Notas', Icon: NotePencil },
}

export function ItemTypeIcon({ type, className = '' }) {
  const config = ICONS[type]
  if (!config) return null

  const { Icon, label } = config

  return (
    <span className={`inline-flex shrink-0 items-center ${className}`} title={label} aria-hidden="true">
      <Icon size={ICON_SIZE} weight={ICON_WEIGHT} className={ICON_CLASS} />
    </span>
  )
}

/** Título con icono al lado (presentación) */
export function TypeLabel({ type, children, className = '' }) {
  return (
    <p
      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 ${className}`}
    >
      {type && <ItemTypeIcon type={type} />}
      <span>{children}</span>
    </p>
  )
}

const labelRow = 'flex items-center gap-1.5'

/** Etiqueta de campo en formulario */
export function FormLabel({ type, htmlFor, children, className = '', required = false }) {
  const classNames = `${labelRow} text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5 ${className}`
  const content = (
    <>
      {type && <ItemTypeIcon type={type} />}
      <span>
        {children}
        {required ? (
          <span className="ml-0.5 text-amber-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      {required ? <span className="sr-only">(obligatorio)</span> : null}
    </>
  )

  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} className={classNames}>
        {content}
      </label>
    )
  }

  return <p className={classNames}>{content}</p>
}

/** Encabezado de sección en formulario */
export function SectionLabel({ type, children, className = '' }) {
  return (
    <p className={`${labelRow} text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 ${className}`}>
      {type && <ItemTypeIcon type={type} />}
      <span>{children}</span>
    </p>
  )
}

export function scheduleItemIconType(item) {
  if (item.type === 'hymn') return 'hymn'
  if (item.type === 'speaker') return 'speaker'
  if (item.type === 'midTestimony') return 'testimony'
  if (item.type === 'testimonies') return 'testimony'
  if (item.type === 'person') return 'prayer'
  if (item.type === 'announcements') return 'announcements'
  if (item.type === 'block') return 'welcome'
  if (item.type === 'text') return item.sacrament ? 'sacrament' : 'thanks'
  if (item.type === 'list') {
    return item.listKind === 'stake' ? 'stakeBusiness' : 'wardBusiness'
  }
  return null
}
