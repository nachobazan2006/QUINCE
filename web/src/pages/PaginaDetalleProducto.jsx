import { Link, useParams } from 'react-router';
import useProductos from '../hooks/useProductos.js';
import useData from '../hooks/useData.js';
import DataState from '../components/common/DataState.jsx';
import GaleriaProducto from '../components/productos/GaleriaProducto.jsx';
import InformacionProducto from '../components/productos/InformacionProducto.jsx';
import ProductosRelacionados from '../components/productos/ProductosRelacionados.jsx';
import { obtenerImagenesDetalle, obtenerProductosRelacionados } from '../services/catalogo.js';
import '../styles/detalle-producto.css';

export default function PaginaDetalleProducto() {
  const { slug } = useParams();
  const productos = useProductos();
  const categorias = useData('categories');
  return <div className="pagina-detalle-producto">
    <DataState state={productos}>{datos => <DataState state={categorias}>{colecciones => {
      if (!Array.isArray(colecciones?.categories)) return <p role="alert">No se pudieron leer las categorías.</p>;
      const producto = datos.products.find(item => item.slug === slug);
      if (!producto) return <>
        <h1>404 — Producto no encontrado</h1>
        <p>No encontramos una prenda con esa dirección.</p>
        <Link to="/deportes">Volver a Deportes</Link>
      </>;
      const categoria = colecciones.categories.find(item => item.id === producto.categoryIds[0]);
      const relacionados = obtenerProductosRelacionados(producto, datos.products);
      return <>
        <Link className="volver-detalle" to={categoria?.action?.href || '/deportes'}>
          <span aria-hidden="true">←</span> Volver
        </Link>
        <article className="detalle-producto">
          <GaleriaProducto key={producto.id} imagenes={obtenerImagenesDetalle(producto)} nombre={producto.name} />
          <InformacionProducto producto={producto} categoria={categoria} />
        </article>
        <ProductosRelacionados productos={relacionados} categorias={colecciones.categories} />
      </>;
    }}</DataState>}</DataState>
  </div>;
}
