import { useRef, useState } from 'react'
import { LinkSimple } from '@phosphor-icons/react'
import { SHARE_MODES } from '../utils/agendaShareLink'
import AnchorDropdownPanel from './AnchorDropdownPanel'

export default function ConductLinkMenu({ readOnly, linkCopied, onCopyLink }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-sm text-white/80 hover:text-white flex items-center gap-1.5"
        title="Copiar enlace para compartir"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <LinkSimple className="w-4 h-4" weight="bold" aria-hidden="true" />
        <span className="hidden sm:inline">
          {linkCopied === SHARE_MODES.VIEW
            ? 'Lectura copiado'
            : linkCopied === SHARE_MODES.EDIT
              ? 'Edición copiado'
              : 'Enlace'}
        </span>
        <span className="sm:hidden">{linkCopied ? 'Listo' : 'Enlace'}</span>
      </button>

      <AnchorDropdownPanel
        open={open}
        anchorRef={buttonRef}
        preferredWidth={288}
        contentHeight={220}
        ariaLabel="Tipo de enlace"
        className="rounded-xl border border-white/10 bg-brand-900 p-4 shadow-xl"
        onClose={() => setOpen(false)}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
          Compartir enlace
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              onCopyLink(SHARE_MODES.VIEW)
              setOpen(false)
            }}
            className="w-full rounded-lg bg-white/10 px-3 py-2.5 text-left hover:bg-white/15 transition-colors"
          >
            <span className="block text-sm font-semibold text-white">Solo lectura</span>
            <span className="block text-xs text-white/60 mt-0.5 leading-snug">
              Abre la presentación para dirigir, sin editar la agenda.
            </span>
          </button>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => {
              onCopyLink(SHARE_MODES.EDIT)
              setOpen(false)
            }}
            className="w-full rounded-lg px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 bg-white/10 enabled:hover:bg-white/15"
          >
            <span className="block text-sm font-semibold text-white">Para editar</span>
            <span className="block text-xs text-white/60 mt-0.5 leading-snug">
              {readOnly
                ? 'No disponible en enlaces de solo lectura.'
                : 'Abre el formulario completo para cambiar nombres, himnos y orden.'}
            </span>
          </button>
        </div>
      </AnchorDropdownPanel>
    </div>
  )
}
