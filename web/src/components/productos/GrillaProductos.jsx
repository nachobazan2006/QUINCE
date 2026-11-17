import TarjetaProducto from './TarjetaProducto.jsx';
import { obtenerCategoriaPrincipal } from '../../services/catalogo.js';

export default function GrillaProductos({ productos, categoria, categorias }) {
  return <div className="grilla-productos">
    {productos.map((producto, indice) => <TarjetaProducto key={producto.id} producto={producto}
      categoria={categoria ?? obtenerCategoriaPrincipal(producto, categorias ?? [])}
      nivelTitulo={2} prioritaria={indice < 2} />)}
  </div>;
}
