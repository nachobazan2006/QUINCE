import { useParams } from 'react-router';
import useData from '../hooks/useData.js';
import DataState from '../components/common/DataState.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import ContenidoDeportes from '../components/categorias/ContenidoDeportes.jsx';
import EncabezadoColeccion from '../components/categorias/EncabezadoColeccion.jsx';
import PaginaListadoProductos from './PaginaListadoProductos.jsx';
import '../styles/productos.css';
import '../styles/inicio.css';
import '../styles/categorias.css';

function ContenidoCategoria({ categorias, categorySlug, subcategorySlug }) {
  const padre = categorias.find(item => item.slug === categorySlug && item.parentId === null);
  const categoria = subcategorySlug
    ? categorias.find(item => item.slug === subcategorySlug && item.parentId === padre?.id) : padre;
  if (!padre || !categoria) return <NotFoundPage />;
  return <div className={`pagina-categoria ${categoria.view === 'collection' ? 'pagina-listado' : ''}`}>
    <EncabezadoColeccion categoria={categoria} padre={padre} />
    {categoria.view === 'collection'
      ? <PaginaListadoProductos key={categoria.id} categoria={categoria} categorias={categorias} />
      : categoria.designStatus === 'ready'
      ? <ContenidoDeportes categoria={categoria} categorias={categorias} />
      : <p className="estado-categoria">{categoria.pendingMessage ?? 'Pantalla pendiente de implementación.'}</p>}
  </div>;
}

export default function PaginaCategorias() {
  const parametros = useParams();
  const categorias = useData('categories');
  return <DataState state={categorias}>{datos => (
    <ContenidoCategoria categorias={datos.categories} {...parametros} />
  )}</DataState>;
}
