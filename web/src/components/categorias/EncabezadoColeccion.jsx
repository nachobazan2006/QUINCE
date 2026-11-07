import { Link } from 'react-router';

export default function EncabezadoColeccion({ categoria, padre }) {
  return <div className="cabecera-categoria">
    <Link to={categoria.parentId ? `/${padre.slug}` : '/'} aria-label={categoria.parentId ? `Volver a ${padre.name}` : 'Volver al inicio'}>
      <span aria-hidden="true">←</span>
    </Link>
    <h1>{categoria.name}</h1>
  </div>;
}
