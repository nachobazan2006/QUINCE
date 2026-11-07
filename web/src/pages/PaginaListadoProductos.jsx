import useProductos from '../hooks/useProductos.js';
import DataState from '../components/common/DataState.jsx';
import GrillaProductos from '../components/productos/GrillaProductos.jsx';
import { obtenerProductosColeccion } from '../services/catalogo.js';

export default function PaginaListadoProductos({ categoria, categorias }) {
  const estado = useProductos();
  return <DataState state={estado}>{datos => {
    const productos = obtenerProductosColeccion(datos.products, categorias, categoria.id);
    return productos.length ? <GrillaProductos productos={productos} categoria={categoria} />
      : <p className="estado-coleccion" role="status">Todavía no hay productos cargados en esta colección.</p>;
  }}</DataState>;
}
