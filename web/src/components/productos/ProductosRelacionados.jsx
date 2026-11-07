import TarjetaProducto from './TarjetaProducto.jsx';

export default function ProductosRelacionados({ productos, categorias }) {
  if (!productos.length) return null;
  return <section className="productos-relacionados" aria-labelledby="titulo-relacionados">
    <h2 id="titulo-relacionados">También puede interesarte</h2>
    <div className="grilla-relacionados">
      {productos.map(producto => <TarjetaProducto key={producto.id} producto={producto}
        categoria={categorias.find(item => item.id === producto.categoryIds[0])}
        sizes="(min-width: 1680px) 350px, 23vw" />)}
    </div>
  </section>;
}
