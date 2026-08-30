import { hymnUrl } from '../utils/hymnUrl'

function ExternalLink({ number }) {
  return (
    <a
      href={hymnUrl(number)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors shrink-0"
      title="Abrir himno en churchofjesuschrist.org"
      aria-label="Abrir himno en churchofjesuschrist.org"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}

function HymnBlock({ hymn }) {
  if (!hymn) return null
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl font-bold font-mono text-white tabular-nums">{hymn.number}</span>
      <span className="text-lg text-white/95 flex-1 leading-snug">{hymn.title}</span>
      <ExternalLink number={hymn.number} />
    </div>
  )
}

function Step({ number, title, children, highlight = false }) {
  if (!children) return null
  return (
    <section
      className={`rounded-2xl p-5 md:p-6 ${
        highlight
          ? 'bg-slate-800 text-white ring-2 ring-slate-600'
          : 'bg-white border border-gray-200 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0 ${
            highlight ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <h3
            className={`text-xs font-bold uppercase tracking-wider mb-3 ${
              highlight ? 'text-white/70' : 'text-slate-500'
            }`}
          >
            {title}
          </h3>
          {children}
        </div>
      </div>
    </section>
  )
}

function formatDate(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function AgendaConduct({ agenda, hymns, onBack }) {
  const findHymn = (number) => hymns.find((h) => h.number === number)
  const isSacrament = agenda.meetingType === 'sacrament'

  const openingHymn = agenda.openingHymn ? findHymn(agenda.openingHymn) : null
  const sacramentHymn = agenda.sacramentHymn ? findHymn(agenda.sacramentHymn) : null
  const closingHymn = agenda.closingHymn ? findHymn(agenda.closingHymn) : null

  const announcements = agenda.announcements.filter((a) => a.trim())
  const wardBusiness = agenda.wardBusiness.filter((b) => b.trim())
  const stakeBusiness = agenda.stakeBusiness.filter((b) => b.trim())
  const speakers = agenda.speakers.filter((s) => s.name.trim())
  const testimonies = agenda.testimonies.filter((t) => t.trim())

  const title = isSacrament ? 'Reunión Sacramental' : 'Ayuno y Testimonio'

  let step = 0
  const nextStep = () => ++step

  const musicTeam = [
    agenda.musicDirector && { label: 'Dir. música', value: agenda.musicDirector },
    agenda.pianist && { label: 'Pianista', value: agenda.pianist },
    agenda.musicAssistant && { label: 'Asist. musical', value: agenda.musicAssistant },
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 bg-slate-900 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-white/80 hover:text-white flex items-center gap-1.5 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Editar
          </button>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/60 truncate">
            {title}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="text-center py-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Barrio {agenda.ward}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 capitalize">
            {formatDate(agenda.date)}
          </h1>
          {(agenda.presides || agenda.conducts) && (
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-4 text-sm text-slate-600">
              {agenda.presides && (
                <span>
                  <strong className="text-slate-800">Preside:</strong> {agenda.presides}
                </span>
              )}
              {agenda.conducts && (
                <span>
                  <strong className="text-slate-800">Dirige:</strong> {agenda.conducts}
                </span>
              )}
            </div>
          )}
        </div>

        {musicTeam.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {musicTeam.map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        )}

        {openingHymn && (
          <Step number={nextStep()} title="Himno de apertura">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold font-mono text-slate-800 tabular-nums">{openingHymn.number}</span>
              <span className="text-xl text-slate-800 flex-1 leading-snug">{openingHymn.title}</span>
              <a
                href={hymnUrl(openingHymn.number)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
                title="Abrir himno"
                aria-label="Abrir himno"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </Step>
        )}

        {agenda.openingPrayer && (
          <Step number={nextStep()} title="Primera oración">
            <p className="text-2xl font-semibold text-slate-900">{agenda.openingPrayer}</p>
          </Step>
        )}

        {announcements.length > 0 && (
          <Step number={nextStep()} title="Anuncios">
            <ul className="space-y-2">
              {announcements.map((a, i) => (
                <li key={i} className="text-lg text-slate-800 leading-relaxed pl-4 border-l-2 border-slate-200">
                  {a}
                </li>
              ))}
            </ul>
          </Step>
        )}

        {wardBusiness.length > 0 && (
          <Step number={nextStep()} title="Asuntos del barrio">
            <ul className="space-y-2">
              {wardBusiness.map((b, i) => (
                <li key={i} className="text-lg text-slate-800 leading-relaxed pl-4 border-l-2 border-slate-200">
                  {b}
                </li>
              ))}
            </ul>
          </Step>
        )}

        {stakeBusiness.length > 0 && (
          <Step number={nextStep()} title="Asuntos de la estaca">
            <ul className="space-y-2">
              {stakeBusiness.map((b, i) => (
                <li key={i} className="text-lg text-slate-800 leading-relaxed pl-4 border-l-2 border-slate-200">
                  {b}
                </li>
              ))}
            </ul>
          </Step>
        )}

        {isSacrament && sacramentHymn && (
          <Step number={nextStep()} title="La Santa Cena" highlight>
            <HymnBlock hymn={sacramentHymn} />
          </Step>
        )}

        {isSacrament && speakers.length > 0 && (
          <Step number={nextStep()} title="Discursos">
            <ul className="space-y-4">
              {speakers.map((s, i) => (
                <li key={i}>
                  <p className="text-xl font-semibold text-slate-900">{s.name}</p>
                  {s.topic && (
                    <p className="text-base text-slate-500 mt-0.5 italic">{s.topic}</p>
                  )}
                </li>
              ))}
            </ul>
          </Step>
        )}

        {!isSacrament && (
          <Step number={nextStep()} title="Testimonios">
            {testimonies.length > 0 ? (
              <ul className="space-y-3">
                {testimonies.map((t, i) => (
                  <li key={i} className="flex gap-3 items-baseline">
                    <span className="text-sm font-mono text-slate-400 w-6 text-right shrink-0">{i + 1}.</span>
                    <span className="text-lg font-medium text-slate-900">{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-slate-500 italic">
                Espacio abierto para testimonios espontáneos
              </p>
            )}
          </Step>
        )}

        {closingHymn && (
          <Step number={nextStep()} title="Himno de cierre">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold font-mono text-slate-800 tabular-nums">{closingHymn.number}</span>
              <span className="text-xl text-slate-800 flex-1 leading-snug">{closingHymn.title}</span>
              <a
                href={hymnUrl(closingHymn.number)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
                title="Abrir himno"
                aria-label="Abrir himno"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </Step>
        )}

        {agenda.closingPrayer && (
          <Step number={nextStep()} title="Última oración">
            <p className="text-2xl font-semibold text-slate-900">{agenda.closingPrayer}</p>
          </Step>
        )}
      </main>
    </div>
  )
}
