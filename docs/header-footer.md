# QUINCE — Header, navegación y footer (Prompt 4)

## Referencias y alcance

Se leyó íntegramente AGENTS.md y se consultaron auditoría, arquitectura, contratos JSON, optimización y manifiesto. Se inspeccionaron visualmente las referencias originales de detalle desktop, Deportes mobile y menú abierto mobile, disponibles en las copias temporales de auditoría. Se verificó además el listado de entradas de los ZIP actuales: `pagina-web.quince.zip` (31 entradas) y `fotos-finales-quince.zip` (282). Sus nombres fueron cambiados desde la auditoría; las rutas históricas del inventario conservan la trazabilidad anterior. No se modificaron los ZIP ni AGENTS.md en esta etapa.

Solo se implementaron componentes de layout. Las páginas internas siguen siendo las pantallas mínimas del Prompt 2; no se crearon Home, grillas, galerías ni contenido comercial adicional.

## Implementación

- Header: franja negra social desktop, marca a izquierda y navegación horizontal sobre blanco. Sin sombras, promociones o controles comerciales nuevos.
- Mobile/tablet: logo a izquierda, hamburguesa a derecha, menú blanco de pantalla completa con cierre X. Sin animaciones. La franja social superior se oculta, como en las referencias.
- Footer: fondo gris claro, marca y grupos Explorá, Quince, Seguinos; copyright sobre blanco. En columnas desktop y apilado en mobile.
- Subcategorías: enlace al padre y botón separado que despliega hijos. Es una solución técnica propuesta porque las capturas no muestran la interacción secundaria. Puede abrirse con clic, toque, Enter o Espacio; Escape cierra el submenú y recupera su botón. Al salir con Tab del grupo se cierra; navegar reinicia los submenús desktop.
- Enlace activo: subrayado discreto sin alterar el ancho; el padre Deportes permanece activo dentro de Rugby. Este estado se propone técnicamente, no se presenta como una especificación del mockup.

## Recursos y fidelidad pendiente

El usuario proporcionó y autorizó como provisional `Logotipo Quince en blanco y negro.png`, 1536 × 1024 con transparencia. Se preparó una copia PNG proporcional de 256 × 171 en `web/public/images/logos/quince-provisional.png`, conservando alpha, sin recortar, vectorizar ni alterar colores. El original no se sobrescribió. Para reproducir la copia, desde `web/`: `node scripts/preparar-logo.mjs`.

La marca se configura mediante `footer.json → marca.image`, compartida con el header. Si se retira la imagen, Marca conserva el fallback textual QUINCE. El logo contiene márgenes transparentes propios; se respetaron y condicionan el tamaño visual. El usuario deberá sustituir este archivo cuando entregue el recurso final.

No se entregaron las fuentes: se usa Arial como fallback explícitamente **provisional**, no como identificación de la familia del diseñador. Los colores observados son blanco, negro y gris; `#e6e6e6` es una aproximación del fondo de footer, no un token oficial entregado. La iconografía social SVG inline reproduce los símbolos representados, sin añadir dependencia ni descargar recursos; su trazo puede diferir del archivo del diseñador.

El menú conserva Inicio, un elemento adicional respecto de la referencia de cinco enlaces; no se borró ni ocultó para aparentar una coincidencia visual. Durante las pruebas el usuario volvió a guardar su etiqueta como Inicio, cambio que se conservó y recompiló. Training, Urbano e Instituciones se incorporaron con sus rótulos observados y destino pendiente. Fitness se conserva en el footer, tal como aparece allí; su equivalencia con Training sigue sin resolverse.

## Componentes y archivos

En `web/src/components/layout/`:

| Componente | Responsabilidad |
| --- | --- |
| Layout.jsx | Carga una vez navegación y footer usando useData; conecta header, Outlet y pie. |
| Encabezado.jsx | Versiones responsive, apertura y cierre por cambio de ruta/ancho. |
| Navegacion.jsx | Árbol reutilizable de datos, NavLink, subcategorías y estado activo. |
| MenuMovil.jsx | Dialog modal nativo, foco inicial en cierre, Tab contenido, Escape y bloqueo de scroll. |
| Marca.jsx | Logo configurable con enlace a Inicio y fallback textual. |
| PiePagina.jsx | Grupos y copyright desde datos. |
| RedesSociales.jsx | Iconos y vínculos reales solo cuando se proporcionen URLs. |

Se modificaron `Layout.jsx`, `base.css`, `navigation.json` y el verificador `scripts/verificar-assets.mjs`; se agregaron los seis componentes restantes, `styles/layout.css`, `public/data/footer.json`, la copia del logo, su script de preparación, este documento y las capturas. No se cambiaron rutas/IDs previos, páginas ni dependencias. El verificador ahora contempla seis JSON, incluido footer.

## Datos y destinos

`navigation.json` conserva `items`, `id`, `label`, `href`, `children`. No hay enlaces de menú duplicados manualmente en JSX. Los IDs home/sports/rugby/about y sus rutas permanecen intactos. Los nuevos nodos de destino pendiente usan `href: null`: se muestran como texto no interactivo con estado deshabilitado y título explicativo, sin `href="#"` ni rutas inventadas.

`footer.json` contiene `marca`, `grupos`, `tituloRedes`, `redes` y `copyright`. Los títulos/textos legales provienen de las referencias; no se añadieron direcciones, teléfonos ni afirmaciones comerciales. Los destinos confirmados son Deportes y Nosotros. Contacto, Fitness, Urbano, Instituciones e Instagram/Facebook tienen `href: null` hasta recibir aprobación/URL real. Los iconos pendientes son informativos, no enlaces que aparentan funcionar.

El layout obtiene cada JSON una vez y comparte sus datos por props entre desktop y mobile, sin fetch por tarjeta/enlace. Si falla una carga, DataState presenta el error; el contenido de página sigue separado de esos datos. El contrato de JSON sigue siendo necesario: esta etapa no agrega un validador integral.

## Responsive y accesibilidad

Breakpoint propuesto: desktop desde 1024 px; por debajo, menú mobile y footer apilado. No existe una referencia tablet específica; se eligió el patrón mobile para no comprimir los enlaces. Márgenes laterales 40 px desktop y 16 px mobile; header principal mínimo 96 px, barra social 32 px. Son decisiones CSS proporcionales, no conversiones exactas desde exportaciones de 3024 px.

El menú usa dialog modal, `aria-expanded`, `aria-controls`, etiqueta accesible, botón de cierre y foco visible. Tab y Shift+Tab permanecen dentro del menú; Escape cierra (primero el submenú si tiene foco), y el cierre devuelve foco al control de apertura. Se cierra al elegir enlace y al pasar al modo desktop; el scroll de fondo se restaura. El menú permite desplazamiento vertical para contenido largo y no causa desborde horizontal. El enlace Saltar al contenido permanece oculto salvo al recibir foco.

## Validación ejecutada

- `npm run dev -- --host 127.0.0.1 --port 5174 --strictPort`: correcto. El intento en 5173 detectó un servidor ya activo; no se cerró el proceso del usuario. Puerto de revisión usado: 5174.
- `npm run build`: correcto, sin advertencias de compilación. Preview existente en 4173 sirve la compilación actualizada.
- Edge/DevTools sobre desarrollo y preview: navegación con teclado hacia Rugby, estado activo del padre, enlace Nosotros del footer, apertura/cierre del menú, foco inicial, ciclo de Tab, Escape, cierre al seleccionar una ruta y al redimensionar. También se enviaron eventos táctiles de apertura/cierre a 375 px.
- Sin desborde horizontal a 375, 600, 768, 900, 1024, 1200 y 1440 px.
- La etiqueta actual del usuario coincide con el texto recibido del JSON; H1 independiente. Se interceptó temporalmente una respuesta de navigation.json con otra etiqueta y se verificó su aparición sin cambiar `/`. No se guardaron datos de prueba en el proyecto.
- `npm run assets:verify -- http://127.0.0.1:4173/`: 41 WebP, seis JSON y sus referencias public/dist/HTTP correctos, incluida la ruta del logo del footer. Sin excepciones de ejecución durante las comprobaciones.

Automatización temporal: `%TEMP%/quince-audit/check-layout.cjs`. Capturas reales de preview: [desktop 1440](capturas-layout/layout-1440.png), [tablet 768](capturas-layout/layout-768.png), [mobile 375](capturas-layout/layout-375.png), [menú mobile](capturas-layout/menu-375.png). Se inspeccionaron contra las referencias: corresponden disposición de header/footer, fondo, alineación general y apilado; la tipografía, iconografía, logo provisional y el enlace Inicio adicional impiden declarar fidelidad final. El contenido Rugby de esas capturas sigue siendo el placeholder técnico, no una página comercial implementada. El foco visible en capturas es consecuencia de la navegación por teclado.

Pendiente de revisión humana: tipografía oficial, aprobación de tamaños definitivos, interacción secundaria propuesta, URLs y equivalencia Training/Fitness. No hay errores de compilación conocidos. Los scripts de optimización ZIP del Prompt 3 aún usan los nombres históricos; si se vuelven a ejecutar, habrá que actualizar la selección a los nombres actuales, fuera del alcance de este layout.

## Aprendizaje

Un componente reutilizable recibe props y puede mostrarse en distintos lugares: Navegacion usa los mismos items en desktop y mobile. Layout solicita navigation.json; useData guarda el resultado y entrega items al header. NavLink genera enlaces del router e identifica la ruta activa. CSS y el estado del menú adaptan la presentación; no hay dos fuentes de datos.

`onClick` ejecuta una función al activar un control; aquí abre/cierra el menú o cambia el estado de subcategorías. `base.css` contiene reglas globales y el layout flexible; `layout.css` contiene header, navegación, footer y media query.

Tres archivos para estudiar: `src/components/layout/Layout.jsx`, `src/components/layout/Navegacion.jsx` y `src/components/layout/MenuMovil.jsx`.

Ejercicio: cambiá solo el label de Rugby en navigation.json, recargá y verificá el submenú en desktop y mobile; comprobá que la dirección siga siendo `/deportes/rugby`. No se resolvió el ejercicio por vos.
