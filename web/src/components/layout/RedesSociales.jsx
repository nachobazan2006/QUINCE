function Icono({ tipo }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {tipo === 'instagram' ? <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </g> : <><circle cx="12" cy="12" r="11" fill="currentColor" />
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.3c0-.9.3-1.4 1.5-1.4h1.7V4.2c-.3 0-1.3-.2-2.4-.2-2.4 0-4 1.5-4 4.1V10H8v3h2.3v8" fill="var(--fondo-icono)" />
    </>}
  </svg>;
}

export default function RedesSociales({ redes }) {
  return <ul className="redes-sociales">{redes.map(red => <li key={red.id}>
    {red.href ? <a href={red.href} aria-label={red.label}><Icono tipo={red.id} /></a>
      : <span className="enlace-pendiente" role="img" aria-label={`${red.label}: enlace pendiente`}
        title={`${red.label}: enlace pendiente`}><Icono tipo={red.id} /></span>}
  </li>)}</ul>;
}
