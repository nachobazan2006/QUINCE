import TarjetaProducto from './TarjetaProducto.jsx';

export default function GrillaProductos({ productos, categoria }) {
  return <div className="grilla-productos">
    {productos.map((producto, indice) => <TarjetaProducto key={producto.id} producto={producto}
      categoria={categoria} nivelTitulo={2} prioritaria={indice < 2} />)}
  </div>;
}
