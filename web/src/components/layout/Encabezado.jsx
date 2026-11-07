import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import Marca from './Marca.jsx';
import RedesSociales from './RedesSociales.jsx';
import Navegacion from './Navegacion.jsx';
import MenuMovil from './MenuMovil.jsx';

export default function Encabezado({ items, marca, redes }) {
  const [abierto, setAbierto] = useState(false);
  const ubicacion = useLocation();
  const cerrar = useCallback(() => setAbierto(false), []);
  useEffect(cerrar, [ubicacion, cerrar]);
  useEffect(() => {
    const consulta = window.matchMedia('(min-width: 1024px)');
    const cambiar = () => { if (consulta.matches) cerrar(); };
    consulta.addEventListener('change', cambiar);
    return () => consulta.removeEventListener('change', cambiar);
  }, [cerrar]);
  return <header className="encabezado">
    <div className="barra-social"><div className="contenedor-layout"><RedesSociales redes={redes} /></div></div>
    <div className="cabecera-principal contenedor-layout">
      <Marca marca={marca} />
      <div className="navegacion-escritorio"><Navegacion key={ubicacion.key} items={items} /></div>
      <button type="button" className="boton-menu abrir-menu" aria-label="Abrir menú"
        aria-expanded={abierto} aria-controls="menu-movil" onClick={() => setAbierto(true)}>
        <span aria-hidden="true" />
      </button>
    </div>
    <MenuMovil abierto={abierto} cerrar={cerrar} marca={marca} items={items} />
  </header>;
}
