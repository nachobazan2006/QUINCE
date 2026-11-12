import useData from '../hooks/useData.js';
import DataState from '../components/common/DataState.jsx';
import EncabezadoColeccion from '../components/categorias/EncabezadoColeccion.jsx';
import SeccionInstitucional from '../components/institucional/SeccionInstitucional.jsx';
import '../styles/categorias.css';
import '../styles/nosotros.css';

function esContenidoInstitucionalValido(datos) {
  return typeof datos?.title === 'string' && Array.isArray(datos.sections)
    && datos.sections.every(seccion => typeof seccion?.id === 'string'
      && typeof seccion.heading === 'string' && Array.isArray(seccion.paragraphs)
      && seccion.paragraphs.every(parrafo => typeof parrafo === 'string'))
    && new Set(datos.sections.map(seccion => seccion.id)).size === datos.sections.length;
}

export default function PaginaNosotros() {
  const estado = useData('about');
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);
  return <div className="pagina-nosotros">
    <DataState state={estado}>{datos => {
      if (!esContenidoInstitucionalValido(datos)) return <p role="alert">El contenido institucional no tiene un formato válido.</p>;
      return <>
        <EncabezadoColeccion categoria={{ name: datos.title, parentId: null }} />
        <div className="bloques-nosotros">
          {datos.sections.map(seccion => <SeccionInstitucional key={seccion.id} seccion={seccion} />)}
        </div>
      </>;
    }}</DataState>
  </div>;
}
import { useEffect } from 'react';
