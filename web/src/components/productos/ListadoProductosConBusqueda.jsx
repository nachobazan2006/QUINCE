import { useId, useState } from 'react';
import GrillaProductos from './GrillaProductos.jsx';
import { obtenerCategoriaPrincipal } from '../../services/catalogo.js';
import '../../styles/buscador-productos.css';

function normalizarTexto(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
}

export default function ListadoProductosConBusqueda({ productos, categorias, categoria }) {
  const [consulta, setConsulta] = useState('');
  const idBuscador = useId();
  const consultaNormalizada = normalizarTexto(consulta.trim());
  const productosFiltrados = consultaNormalizada
    ? productos.filter(producto => {
      const categoriaProducto = obtenerCategoriaPrincipal(producto, categorias);
      return normalizarTexto(`${producto.name} ${categoriaProducto?.name ?? ''}`).includes(consultaNormalizada);
    })
    : productos;

  return <>
    <div className="controles-listado-productos">
      <div className="buscador-productos" role="search" aria-label="Buscar productos">
        <label htmlFor={idBuscador}>Buscar productos</label>
        <div className="campo-buscador-productos">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.2 4.2" />
          </svg>
          <input id={idBuscador} type="search" value={consulta}
            onChange={evento => setConsulta(evento.target.value)}
            placeholder="Nombre del producto o categoría" autoComplete="off" />
        </div>
      </div>
      <p className="resultados-busqueda-productos" role="status" aria-live="polite">
        {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto' : 'productos'}
      </p>
    </div>
    {productos.length === 0
      ? <p className="estado-coleccion" role="status">Todavía no hay productos cargados en esta colección.</p>
      : productosFiltrados.length === 0
        ? <p className="estado-coleccion" role="status">
          No encontramos productos para “{consulta.trim()}”. Probá con otro nombre o categoría.
        </p>
        : <GrillaProductos productos={productosFiltrados} categoria={categoria} categorias={categorias} />}
  </>;
}
