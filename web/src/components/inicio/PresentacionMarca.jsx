import EnlaceAccion from '../common/EnlaceAccion.jsx';
import '../../styles/botones-presentacion.css';

export default function PresentacionMarca({ datos }) {
  return <section className={`presentacion-marca ${datos.variant === 'dark' ? 'presentacion-oscura' : ''} ${datos.id === 'equipo' ? 'presentacion-equipo' : ''}`}>
    <h2>{datos.heading}</h2>
    <p>{datos.body}</p>
    <EnlaceAccion accion={datos.action} className={['presentacion', 'equipo', 'contacto'].includes(datos.id) ? 'enlace-presentacion-marca' : ''} />
  </section>;
}
