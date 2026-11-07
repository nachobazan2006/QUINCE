import useData from '../../hooks/useData.js';
import DataState from '../common/DataState.jsx';
import PortadaInicio from '../inicio/PortadaInicio.jsx';
import ProductosDestacados from '../inicio/ProductosDestacados.jsx';
import useProductos from '../../hooks/useProductos.js';

export default function ContenidoDeportes({ categoria, categorias }) {
  const inicio = useData('home');
  const productos = useProductos();
  const disciplinas = categoria.childIds.map(id => categorias.find(item => item.id === id)).filter(Boolean);
  return <>
    <PortadaInicio categorias={disciplinas} etiqueta={categoria.name} principal indicadoresEnTodas />
    <DataState state={inicio}>{datos => {
      const destacados = datos.sections.find(seccion => seccion.id === categoria.featuredSectionId);
      return destacados ? <DataState state={productos}>{prendas => (
        <ProductosDestacados datos={destacados} categorias={categorias} productos={prendas.products} ids={datos.featuredProductIds} />
      )}</DataState> : null;
    }}</DataState>
  </>;
}
