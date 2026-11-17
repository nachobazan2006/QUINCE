import useProductos from '../hooks/useProductos.js';
import useData from '../hooks/useData.js';
import DataState from '../components/common/DataState.jsx';
import ListadoProductosConBusqueda from '../components/productos/ListadoProductosConBusqueda.jsx';
import '../styles/productos.css';
import '../styles/categorias.css';

export default function PaginaCatalogo() {
  const estadoProductos = useProductos();
  const estadoCategorias = useData('categories');

  return <section className="pagina-categoria pagina-listado pagina-catalogo" aria-labelledby="titulo-catalogo">
    <header className="cabecera-categoria">
      <h1 id="titulo-catalogo">Catálogo</h1>
    </header>
    <DataState state={estadoProductos}>{datos => <DataState state={estadoCategorias}>{catalogo => (
      <ListadoProductosConBusqueda productos={datos.products} categorias={catalogo.categories} />
    )}</DataState>}</DataState>
  </section>;
}
