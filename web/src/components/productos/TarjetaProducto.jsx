import { useState } from 'react';
import { Link } from 'react-router';
import ImagenAdaptable from '../common/ImagenAdaptable.jsx';
import '../../styles/productos.css';

export default function TarjetaProducto({ producto, categoria, nivelTitulo = 3, prioritaria = false,
  sizes = '(min-width: 1024px) 25vw, 50vw', className = '' }) {
  const Titulo = nivelTitulo === 2 ? 'h2' : 'h3';
  const [imagenFallida, cambiarImagenFallida] = useState(false);
  const contenido = <>
    {producto.image && !imagenFallida ? <ImagenAdaptable imagen={producto.image} prioritaria={prioritaria} sizes={sizes}
      onError={() => cambiarImagenFallida(true)} />
      : <p className="imagen-producto-pendiente">Imagen no disponible</p>}
    <Titulo title={producto.name}>{producto.name}</Titulo>
    <p>{categoria?.name}</p>
  </>;
  return <article className={`tarjeta-producto ${className}`} data-producto={producto.id}>
    {producto.slug ? <Link to={`/productos/${encodeURIComponent(producto.slug)}`}>{contenido}</Link> : contenido}
  </article>;
}
