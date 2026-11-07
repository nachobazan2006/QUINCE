import { Link } from 'react-router';
import Marca from './Marca.jsx';
import RedesSociales from './RedesSociales.jsx';

export default function PiePagina({ datos }) {
  return <footer className="pie-pagina">
    <div className="fondo-pie"><div className="columnas-pie contenedor-layout">
      <Marca marca={datos.marca} />
      {datos.grupos.map(grupo => <section key={grupo.id} aria-labelledby={`pie-${grupo.id}`}>
        <h2 id={`pie-${grupo.id}`}>{grupo.label}</h2>
        <ul>{grupo.items.map(item => <li key={item.id}>
          {item.href ? <Link to={item.href}>{item.label}</Link> : <span className="enlace-pendiente"
            aria-disabled="true">{item.label}</span>}
        </li>)}</ul>
      </section>)}
      <section aria-labelledby="pie-redes"><h2 id="pie-redes">{datos.tituloRedes}</h2><RedesSociales redes={datos.redes} /></section>
    </div></div>
    <div className="copyright contenedor-layout">{datos.copyright.map(linea => <p key={linea}>{linea}</p>)}</div>
  </footer>;
}
