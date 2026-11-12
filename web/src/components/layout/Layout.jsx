import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import useData from '../../hooks/useData.js';
import DataState from '../common/DataState.jsx';
import Encabezado from './Encabezado.jsx';
import PiePagina from './PiePagina.jsx';
import '../../styles/layout.css';

export default function Layout() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.hash]);
  const navigation = useData('navigation');
  const pie = useData('footer');
  return (
    <div className="app-layout">
      <a className="saltar-contenido" href="#contenido">Saltar al contenido</a>
      <DataState state={pie}>{datos => <DataState state={navigation}>{menu => (
        <Encabezado items={menu.items} marca={datos.marca} redes={datos.redes} />
      )}</DataState>}</DataState>
      <main id="contenido" className="contenido-provisional contenedor-layout"><Outlet /></main>
      <DataState state={pie}>{datos => <PiePagina datos={datos} />}</DataState>
    </div>
  );
}
