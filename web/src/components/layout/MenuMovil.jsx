import { useEffect, useRef } from 'react';
import Marca from './Marca.jsx';
import Navegacion from './Navegacion.jsx';

export default function MenuMovil({ abierto, cerrar, marca, items, botonAbrir }) {
  const dialogo = useRef(null);
  useEffect(() => {
    const elemento = dialogo.current;
    if (!abierto) { if (elemento.open) elemento.close(); return; }
    elemento.showModal();
    elemento.querySelector('.cerrar-menu').focus();
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
      if (elemento.open) elemento.close();
      if (botonAbrir.current?.getClientRects().length) botonAbrir.current.focus();
    };
  }, [abierto]);
  return <dialog ref={dialogo} id="menu-movil" className="menu-movil" aria-label="Menú principal"
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const controles = [...event.currentTarget.querySelectorAll('a[href], button:not([disabled])')]
        .filter(control => control.getClientRects().length > 0);
      const primero = controles[0];
      const ultimo = controles.at(-1);
      if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault(); ultimo?.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault(); primero?.focus();
      }
    }}
    onCancel={event => { event.preventDefault(); cerrar(); }}>
    <div className="cabecera-menu">
      <Marca marca={marca} onClick={cerrar} />
      <button type="button" className="boton-menu cerrar-menu" onClick={cerrar} aria-label="Cerrar menú" autoFocus>
        <span aria-hidden="true" />
      </button>
    </div>
    <Navegacion items={items} onNavigate={cerrar} etiqueta="Principal móvil" />
  </dialog>;
}
