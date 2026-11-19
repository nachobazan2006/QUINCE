import { useState } from 'react';
import { Link, useParams } from 'react-router';
import useProductos from '../hooks/useProductos.js';
import useData from '../hooks/useData.js';
import DataState from '../components/common/DataState.jsx';
import GaleriaProducto from '../components/productos/GaleriaProducto.jsx';
import InformacionProducto from '../components/productos/InformacionProducto.jsx';
import ProductosRelacionados from '../components/productos/ProductosRelacionados.jsx';
import { obtenerImagenesDetalle, obtenerProductosRelacionados } from '../services/catalogo.js';
import '../styles/detalle-producto.css';

function ContenidoDetalleProducto({ producto, categoria, relacionados, categorias }) {
  const variantes = Array.isArray(producto.colorVariants) ? producto.colorVariants : [];
  const [idVarianteActiva, cambiarVarianteActiva] = useState(variantes[0]?.id);
  const varianteActiva = variantes.find(variante => variante.id === idVarianteActiva) ?? variantes[0];
  const galeria = varianteActiva?.gallerySource === 'gallery'
    ? producto.gallery
    : varianteActiva?.gallery ?? producto.gallery;
  const productoConGaleriaActiva = { ...producto, gallery: galeria };

  return <>
    <Link className="volver-detalle" to={categoria?.action?.href || '/deportes'}>
      <span aria-hidden="true">←</span> Volver
    </Link>
    <article className="detalle-producto">
      <GaleriaProducto key={`${producto.id}-${varianteActiva?.id ?? 'original'}`}
        imagenes={obtenerImagenesDetalle(productoConGaleriaActiva)} nombre={producto.name}
        normalizarEncuadre={variantes.length > 1} />
      <InformacionProducto producto={producto} categoria={categoria} variantes={variantes}
        varianteActiva={varianteActiva} alSeleccionarVariante={cambiarVarianteActiva} />
    </article>
    <ProductosRelacionados productos={relacionados} categorias={categorias} />
  </>;
}

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
      return <ContenidoDetalleProducto key={producto.id} producto={producto} categoria={categoria}
        relacionados={relacionados} categorias={colecciones.categories} />;
    }}</DataState>}</DataState>
  </div>;
}
