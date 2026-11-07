import { Link } from 'react-router';

export default function EnlaceAccion({ accion, className = '' }) {
  if (!accion) return null;
  return accion.href ? <Link className={`enlace-accion ${className}`} to={accion.href}>{accion.label}</Link>
    : <span className={`enlace-accion accion-pendiente ${className}`} aria-disabled="true"
      title="Destino pendiente de confirmación">{accion.label}</span>;
}
