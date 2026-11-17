import useProductos from '../hooks/useProductos.js';
import DataState from '../components/common/DataState.jsx';
import ListadoProductosConBusqueda from '../components/productos/ListadoProductosConBusqueda.jsx';
import { obtenerProductosColeccion } from '../services/catalogo.js';

export default function PaginaListadoProductos({ categoria, categorias }) {
  const estado = useProductos();
  return <DataState state={estado}>{datos => {
    const productos = obtenerProductosColeccion(datos.products, categorias, categoria.id);
    return <ListadoProductosConBusqueda productos={productos} categorias={categorias} categoria={categoria} />;
  }}</DataState>;
}
