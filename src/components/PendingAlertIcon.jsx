/** Triángulo de aviso para campos pendientes (estilo wizard). */
export default function PendingAlertIcon({ className = 'h-3.5 w-3.5', title = 'Campos pendientes' }) {
  return (
    <span className={`inline-flex shrink-0 text-amber-500 ${className}`} title={title} aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.8 1.9 20.5A1.1 1.1 0 0 0 2.85 22h18.3a1.1 1.1 0 0 0 .95-1.5L12 2.8Zm0 5.7c.55 0 1 .4 1 .95v4.4a1 1 0 1 1-2 0v-4.4c0-.55.45-.95 1-.95Zm0 9.1a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" />
      </svg>
    </span>
  )
}
