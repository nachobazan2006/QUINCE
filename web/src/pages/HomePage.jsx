import useData from '../hooks/useData.js';
import DataState from '../components/common/DataState.jsx';
import PortadaInicio from '../components/inicio/PortadaInicio.jsx';
import PresentacionMarca from '../components/inicio/PresentacionMarca.jsx';
import ProductosDestacados from '../components/inicio/ProductosDestacados.jsx';
import ImagenAdaptable from '../components/common/ImagenAdaptable.jsx';
import useProductos from '../hooks/useProductos.js';
import '../styles/inicio.css';

export default function PaginaInicio() {
  const inicio = useData('home');
  const categorias = useData('categories');
  const productos = useProductos();
  return <DataState state={inicio}>{datos => <DataState state={categorias}>{catalogo => (
    <div className="pagina-inicio">
      <h1 className="solo-lectores">{datos.title}</h1>
      {datos.sections.map(seccion => seccion.type === 'categories'
        ? <PortadaInicio key={seccion.id} principal rotacion={seccion.carousel} catalogo={catalogo.categories} categorias={seccion.categoryIds
          .map(id => catalogo.categories.find(categoria => categoria.id === id)).filter(Boolean)} />
        : ['institutional', 'contact'].includes(seccion.type) ? <PresentacionMarca key={seccion.id} datos={seccion} />
          : seccion.type === 'featured' ? <DataState key={seccion.id} state={productos}>{prendas => (
            <ProductosDestacados datos={seccion} categorias={catalogo.categories} productos={prendas.products} ids={datos.featuredProductIds} />
          )}</DataState>
            : seccion.type === 'image' ? <div key={seccion.id} className="imagen-institucional-movil">
              <ImagenAdaptable imagen={seccion.image} />
            </div> : null)}
    </div>
  )}</DataState>}</DataState>;
}
