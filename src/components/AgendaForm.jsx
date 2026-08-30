import { useState } from 'react'
import HymnSelector from './HymnSelector'

const emptyTestimonies = () => Array.from({ length: 10 }, () => '')

const initialForm = () => ({
  date: new Date().toISOString().split('T')[0],
  ward: 'Sabaneta',
  meetingType: 'sacrament',
  presides: '',
  conducts: '',
  musicDirector: '',
  pianist: '',
  musicAssistant: '',
  announcements: [''],
  openingHymn: null,
  openingPrayer: '',
  wardBusiness: [''],
  stakeBusiness: [''],
  sacramentHymn: null,
  speakers: [{ name: '', topic: '' }],
  testimonies: emptyTestimonies(),
  closingPrayer: '',
  closingHymn: null,
})

function Section({ title, children }) {
  return (
    <section className="mb-8 pb-8 border-b border-gray-200 last:border-b-0">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">{title}</h2>
      {children}
    </section>
  )
}

function DynamicList({ items, onChange, onAdd, onRemove, renderItem, addLabel }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-start">
          {renderItem(item, index)}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="mt-2 text-gray-400 hover:text-red-500 text-lg leading-none shrink-0"
            title="Eliminar"
            aria-label="Eliminar"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        + {addLabel}
      </button>
    </div>
  )
}

const inputClass =
  'w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition'

export default function AgendaForm({ hymns, onGenerate }) {
  const [form, setForm] = useState(initialForm)
  const isSacrament = form.meetingType === 'sacrament'

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const updateListItem = (key, index, value) => {
    setForm((prev) => {
      const list = [...prev[key]]
      list[index] = value
      return { ...prev, [key]: list }
    })
  }

  const addListItem = (key) => setForm((prev) => ({ ...prev, [key]: [...prev[key], ''] }))

  const removeListItem = (key, index) => {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }))
  }

  const updateSpeaker = (index, field, value) => {
    setForm((prev) => {
      const speakers = [...prev.speakers]
      speakers[index] = { ...speakers[index], [field]: value }
      return { ...prev, speakers }
    })
  }

  const addSpeaker = () => {
    setForm((prev) => ({ ...prev, speakers: [...prev.speakers, { name: '', topic: '' }] }))
  }

  const removeSpeaker = (index) => {
    setForm((prev) => ({ ...prev, speakers: prev.speakers.filter((_, i) => i !== index) }))
  }

  const setMeetingType = (type) => {
    setForm((prev) => ({
      ...prev,
      meetingType: type,
      testimonies: type === 'testimony' ? emptyTestimonies() : prev.testimonies,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate(form)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <header className="text-center mb-8 pb-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-slate-900 tracking-wide">Agenda Sacramental</h1>
        <p className="text-sm text-gray-500 mt-1">Generador de programa de reunión</p>
      </header>

      {/* 1. Tipo de reunión */}
      <Section title="Tipo de reunión">
        <div className="flex rounded-xl overflow-hidden border-2 border-slate-200">
          <button
            type="button"
            onClick={() => setMeetingType('sacrament')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              isSacrament ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-gray-50'
            }`}
          >
            Reunión Sacramental
          </button>
          <button
            type="button"
            onClick={() => setMeetingType('testimony')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              !isSacrament ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-gray-50'
            }`}
          >
            Ayuno y Testimonio
          </button>
        </div>
      </Section>

      {/* 2. Fecha y barrio */}
      <Section title="Fecha y barrio">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              id="date"
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="ward" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Barrio
            </label>
            <input
              type="text"
              id="ward"
              value={form.ward}
              onChange={(e) => update('ward', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      {/* 3. Quién preside / dirige */}
      <Section title="Quién preside / Quién dirige">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="presides" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Quién preside
            </label>
            <input
              type="text"
              id="presides"
              value={form.presides}
              onChange={(e) => update('presides', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="conducts" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Quién dirige
            </label>
            <input
              type="text"
              id="conducts"
              value={form.conducts}
              onChange={(e) => update('conducts', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      {/* 4. Música */}
      <Section title="Director de música / Pianista / Asistente musical">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="musicDirector" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Director de música
            </label>
            <input
              type="text"
              id="musicDirector"
              value={form.musicDirector}
              onChange={(e) => update('musicDirector', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="pianist" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Pianista
            </label>
            <input
              type="text"
              id="pianist"
              value={form.pianist}
              onChange={(e) => update('pianist', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="musicAssistant" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Asistente musical
            </label>
            <input
              type="text"
              id="musicAssistant"
              value={form.musicAssistant}
              onChange={(e) => update('musicAssistant', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      {/* 5. Anuncios */}
      <Section title="Anuncios">
        <DynamicList
          items={form.announcements}
          onAdd={() => addListItem('announcements')}
          onRemove={(i) => removeListItem('announcements', i)}
          addLabel="Agregar anuncio"
          renderItem={(item, i) => (
            <input
              type="text"
              value={item}
              onChange={(e) => updateListItem('announcements', i, e.target.value)}
              className={`${inputClass} flex-1`}
            />
          )}
        />
      </Section>

      {/* 6. Himno de apertura / Primera oración */}
      <Section title="Himno de apertura / Primera oración">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HymnSelector
            label="Himno de apertura"
            hymns={hymns}
            value={form.openingHymn}
            onChange={(n) => update('openingHymn', n)}
          />
          <div>
            <label htmlFor="openingPrayer" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Primera oración
            </label>
            <input
              type="text"
              id="openingPrayer"
              value={form.openingPrayer}
              onChange={(e) => update('openingPrayer', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      {/* 7. Asuntos */}
      <Section title="Asuntos del barrio / Asuntos de la estaca">
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Asuntos del barrio</h3>
            <DynamicList
              items={form.wardBusiness}
              onAdd={() => addListItem('wardBusiness')}
              onRemove={(i) => removeListItem('wardBusiness', i)}
              addLabel="Agregar asunto"
              renderItem={(item, i) => (
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateListItem('wardBusiness', i, e.target.value)}
                  className={`${inputClass} flex-1`}
                />
              )}
            />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Asuntos de la estaca</h3>
            <DynamicList
              items={form.stakeBusiness}
              onAdd={() => addListItem('stakeBusiness')}
              onRemove={(i) => removeListItem('stakeBusiness', i)}
              addLabel="Agregar asunto"
              renderItem={(item, i) => (
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateListItem('stakeBusiness', i, e.target.value)}
                  className={`${inputClass} flex-1`}
                />
              )}
            />
          </div>
        </div>
      </Section>

      {/* 8. Himno sacramental */}
      {isSacrament && (
        <Section title="Himno sacramental">
          <HymnSelector
            label="Himno de la Santa Cena"
            hymns={hymns}
            value={form.sacramentHymn}
            onChange={(n) => update('sacramentHymn', n)}
            sacramentOnly
          />
        </Section>
      )}

      {/* 9. Discursantes o testimonios */}
      {isSacrament ? (
        <Section title="Discursantes">
          <div className="space-y-2">
            {form.speakers.map((speaker, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={speaker.name}
                      onChange={(e) => updateSpeaker(i, 'name', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                      Tema (opcional)
                    </label>
                    <input
                      type="text"
                      value={speaker.topic}
                      onChange={(e) => updateSpeaker(i, 'topic', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeSpeaker(i)}
                  className="mt-8 text-gray-400 hover:text-red-500 text-lg leading-none shrink-0"
                  title="Eliminar"
                  aria-label="Eliminar"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSpeaker}
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              + Agregar discursante
            </button>
          </div>
        </Section>
      ) : (
        <Section title="Testimonios">
          <DynamicList
            items={form.testimonies}
            onAdd={() => addListItem('testimonies')}
            onRemove={(i) => removeListItem('testimonies', i)}
            addLabel="Agregar testigo"
            renderItem={(item, i) => (
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                  Testigo {i + 1}
                </label>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateListItem('testimonies', i, e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
          />
        </Section>
      )}

      {/* 10. Cierre */}
      <Section title="Última oración / Himno de cierre">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="closingPrayer" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Última oración
            </label>
            <input
              type="text"
              id="closingPrayer"
              value={form.closingPrayer}
              onChange={(e) => update('closingPrayer', e.target.value)}
              className={inputClass}
            />
          </div>
          <HymnSelector
            label="Himno de cierre"
            hymns={hymns}
            value={form.closingHymn}
            onChange={(n) => update('closingHymn', n)}
          />
        </div>
      </Section>

      <div className="sticky bottom-0 pt-4 pb-2 bg-white">
        <button
          type="submit"
          className="w-full py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors"
        >
          Ver programa de reunión
        </button>
      </div>
    </form>
  )
}
