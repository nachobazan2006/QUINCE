import { Link, useParams } from 'react-router';
import useData from '../hooks/useData.js';
import DataState from '../components/common/DataState.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import ContenidoDeportes from '../components/categorias/ContenidoDeportes.jsx';
import '../styles/inicio.css';
import '../styles/categorias.css';

function ContenidoCategoria({ categorias, categorySlug, subcategorySlug }) {
  const padre = categorias.find(item => item.slug === categorySlug && item.parentId === null);
  const categoria = subcategorySlug
    ? categorias.find(item => item.slug === subcategorySlug && item.parentId === padre?.id) : padre;
  if (!padre || !categoria) return <NotFoundPage />;
  return <div className="pagina-categoria">
    <div className="cabecera-categoria">
      <Link to={subcategoriaDestino(padre, subcategorySlug)} aria-label="Volver"><span aria-hidden="true">←</span></Link>
      <h1>{categoria.name}</h1>
    </div>
    {categoria.designStatus === 'ready'
      ? <ContenidoDeportes categoria={categoria} categorias={categorias} />
      : <p className="estado-categoria">{categoria.pendingMessage ?? 'Pantalla pendiente de implementación.'}</p>}
  </div>;
}

function subcategoriaDestino(padre, subcategoria) {
  return subcategoria ? `/${padre.slug}` : '/';
}

export default function PaginaCategorias() {
  const parametros = useParams();
  const categorias = useData('categories');
  return <DataState state={categorias}>{datos => (
    <ContenidoCategoria categorias={datos.categories} {...parametros} />
  )}</DataState>;
}
