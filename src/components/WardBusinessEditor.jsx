import NameInput from './NameInput'
import PersonGenderToggle from './PersonGenderToggle'
import { TypeLabel } from './ItemTypeIcon'
import {
  buildWardReleaseParts,
  buildWardSustainingParts,
  buildWardWelcomeParts,
  newCallingEntry,
  newWardBusinessRelease,
  newWardBusinessSustaining,
  newWardBusinessText,
  newWardBusinessWelcome,
  normalizeWardBusinessItem,
  wardBusinessItemMeta,
} from '../utils/wardBusiness'
import WardScriptText from './WardScriptText'

const inputClass =
  'w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/10 focus:border-brand-700 transition'

const textareaClass =
  'w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/10 focus:border-brand-700 transition resize-y min-h-[5rem] leading-relaxed'

function FieldLabel({ children }) {
  return <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{children}</p>
}

function PreviewBlock({ parts }) {
  if (!parts?.length) return null
  return (
    <div className="space-y-1.5 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
      <FieldLabel>Vista previa en reunión</FieldLabel>
      <WardScriptText parts={parts} className="text-xs" />
    </div>
  )
}

function TemplateLinks({ onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
      <span>Usar plantilla:</span>
      <button type="button" onClick={() => onChange(newWardBusinessWelcome())} className="font-medium text-slate-700 hover:text-slate-900">
        Bienvenida
      </button>
      <span aria-hidden="true">·</span>
      <button type="button" onClick={() => onChange(newWardBusinessRelease())} className="font-medium text-slate-700 hover:text-slate-900">
        Relevos
      </button>
      <span aria-hidden="true">·</span>
      <button type="button" onClick={() => onChange(newWardBusinessSustaining())} className="font-medium text-slate-700 hover:text-slate-900">
        Sostenimientos
      </button>
    </div>
  )
}


function PersonCallingFields({ entries, field, onFieldChange, addLabel }) {
  const updateEntry = (index, fieldName, value) => {
    const next = entries.map((entry, i) => (i === index ? { ...entry, [fieldName]: value } : entry))
    onFieldChange(next)
  }

  const addEntry = () => onFieldChange([...entries, newCallingEntry()])

  const removeEntry = (index) => {
    const next = entries.filter((_, i) => i !== index)
    onFieldChange(next.length > 0 ? next : [newCallingEntry()])
  }

  return (
    <div className="space-y-3">
      <FieldLabel>Personas</FieldLabel>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={index} className="rounded-lg border border-slate-100 bg-white p-2.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-400">Persona {index + 1}</span>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(index)}
                  className="text-gray-400 hover:text-red-500 text-sm leading-none"
                  title="Quitar persona"
                  aria-label="Quitar persona"
                >
                  ×
                </button>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <NameInput
                value={entry.name}
                onChange={(e) => updateEntry(index, 'name', e.target.value)}
                placeholder="Nombre"
                className={`${inputClass} min-w-0 flex-1`}
              />
              <PersonGenderToggle
                value={entry.gender || 'male'}
                onChange={(gender) => updateEntry(index, 'gender', gender)}
                nameLabel={entry.name || `persona ${index + 1}`}
              />
            </div>
            <input
              type="text"
              value={entry.calling}
              onChange={(e) => updateEntry(index, 'calling', e.target.value)}
              placeholder="Cargo o llamamiento"
              className={inputClass}
            />
          </div>
        ))}
      </div>
      <button type="button" onClick={addEntry} className="text-sm font-medium text-slate-700 hover:text-slate-900">
        + {addLabel}
      </button>
    </div>
  )
}

function WardBusinessItemBody({ item, onChange }) {
  const normalized = normalizeWardBusinessItem(item)

  if (normalized.type === 'welcome') {
    const updateName = (index, value) => {
      const names = [...normalized.names]
      names[index] = value
      onChange({ type: 'welcome', names })
    }

    const addName = () => onChange({ type: 'welcome', names: [...normalized.names, ''] })
    const removeName = (index) => {
      const names = normalized.names.filter((_, i) => i !== index)
      onChange({ type: 'welcome', names: names.length > 0 ? names : [''] })
    }

    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <FieldLabel>Nombres o familias</FieldLabel>
          {normalized.names.map((name, index) => (
            <div key={index} className="flex gap-2 items-center">
              <NameInput
                value={name}
                onChange={(e) => updateName(index, e.target.value)}
                placeholder={index === 0 ? 'Nombre o familia' : 'Otro nombre'}
                className={inputClass}
              />
              {normalized.names.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeName(index)}
                  className="text-gray-400 hover:text-red-500 text-lg leading-none shrink-0"
                  title="Quitar nombre"
                  aria-label="Quitar nombre"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addName} className="text-sm font-medium text-slate-700 hover:text-slate-900">
            + Agregar nombre
          </button>
        </div>
        <PreviewBlock parts={buildWardWelcomeParts(normalized.names)} />
      </div>
    )
  }

  if (normalized.type === 'release') {
    return (
      <div className="space-y-3">
        <PersonCallingFields
          entries={normalized.releases}
          onFieldChange={(releases) => onChange({ type: 'release', releases })}
          addLabel="Agregar persona"
        />
        <PreviewBlock parts={buildWardReleaseParts(normalized.releases)} />
      </div>
    )
  }

  if (normalized.type === 'sustaining') {
    return (
      <div className="space-y-3">
        <PersonCallingFields
          entries={normalized.callings}
          onFieldChange={(callings) => onChange({ type: 'sustaining', callings })}
          addLabel="Agregar persona"
        />
        <PreviewBlock parts={buildWardSustainingParts(normalized.callings)} />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <FieldLabel>Texto del asunto</FieldLabel>
      <textarea
        rows={4}
        value={normalized.text}
        onChange={(e) => onChange({ type: 'text', text: e.target.value })}
        placeholder="Describe el asunto del barrio…"
        className={textareaClass}
      />
      <TemplateLinks onChange={onChange} />
    </div>
  )
}

function WardBusinessItemCard({ index, item, onChange, onRemove, canRemove }) {
  const meta = wardBusinessItemMeta(item)
  const isTemplate = meta.type !== 'text'

  return (
    <article className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Asunto {index + 1}
          </p>
          <TypeLabel type={meta.type === 'text' ? 'freeText' : meta.type} className="mb-0 text-[11px]">
            {meta.label}
          </TypeLabel>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-white hover:text-red-500"
            title="Eliminar asunto"
            aria-label="Eliminar asunto"
          >
            Eliminar
          </button>
        )}
      </header>

      <div className="px-4 py-4">
        <WardBusinessItemBody item={item} onChange={onChange} />
      </div>

      {isTemplate && (
        <footer className="border-t border-slate-100 bg-slate-50/50 px-4 py-2.5">
          <button
            type="button"
            onClick={() => onChange(newWardBusinessText())}
            className="text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            Cambiar a texto libre
          </button>
        </footer>
      )}
    </article>
  )
}

export function WardBusinessList({ items, onChange }) {
  const updateItem = (index, value) => {
    onChange(items.map((item, i) => (i === index ? value : item)))
  }

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <WardBusinessItemCard
              key={index}
              index={index}
              item={item}
              onChange={(value) => updateItem(index, value)}
              onRemove={() => removeItem(index)}
              canRemove={items.length > 1}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Aún no hay asuntos del barrio.</p>
      )}

      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
        <FieldLabel>Agregar asunto al barrio</FieldLabel>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <button
            type="button"
            onClick={() => onChange([...items, newWardBusinessText()])}
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            + Texto libre
          </button>
          <button
            type="button"
            onClick={() => onChange([...items, newWardBusinessWelcome()])}
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            + Bienvenida
          </button>
          <button
            type="button"
            onClick={() => onChange([...items, newWardBusinessRelease()])}
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            + Relevos
          </button>
          <button
            type="button"
            onClick={() => onChange([...items, newWardBusinessSustaining()])}
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            + Sostenimientos
          </button>
        </div>
      </div>
    </div>
  )
}
