# QUINCE — Nosotros y accesos de contacto (Prompt 10)

## Resultado

`/nosotros` muestra los dos bloques institucionales del diseño desde about.json. El usuario autorizó cambiar el primer título a «+10 AÑOS DE TRAYECTORIA» y entregó las URLs de Instagram y Facebook. Se respetaron los demás textos del diseñador, sin nuevas fotografías, formularios, animaciones ni secciones.

Se leyó AGENTS.md completo y se revisaron documentación, contrato JSON, páginas, layout, footer, navegación y recursos. Se inspeccionaron visualmente Nosotros.jpg mobile y el footer desktop de Camiseta Peak.jpg, mediante copias temporales extraídas del ZIP original en Downloads/QUINCE. Se revisaron sus 31 entradas: no hay un mockup Nosotros desktop ni una pantalla de Contacto.

## Componentes y archivos

Nuevos:

- `web/src/pages/PaginaNosotros.jsx`: carga about con useData, controla esquema, entrega props y mantiene el orden de sections.
- `web/src/components/institucional/SeccionInstitucional.jsx`: section con h2 y párrafos; useId relaciona el título accesible con el bloque.
- `web/src/styles/nosotros.css`: reglas limitadas a esta página.
- `web/scripts/comprobar-nosotros.cjs`: pruebas repetibles en Edge mediante depuración local.
- `docs/inconsistencias-a-resolver.txt`, este informe y cinco capturas en `docs/capturas-nosotros/`.

Modificados: App.jsx conserva `/nosotros` y sustituye AboutPage por PaginaNosotros; AboutPage.jsx se retira. about.json incorpora los dos bloques con el contrato existente. footer.json recibe las dos URLs sociales. modelos-datos.md actualiza el contrato. Los cambios anteriores del Prompt 9 se conservaron.

Reutilizados: Layout, Encabezado, MenuMovil, Navegacion, EncabezadoColeccion, PiePagina, RedesSociales, useData y DataState. No se modificaron componentes ni CSS globales del header/footer; tampoco originales, dependencias o configuración de servidor.

## Presentación y navegación

Mobile sigue fondo blanco, título condensado, bloques alineados a izquierda, márgenes de 16 px y espacio blanco amplio. La referencia usa flecha seguida de NOSOTROS, sin palabra VOLVER visible: se reutilizó ese encabezado, con enlace cuyo nombre accesible es «Volver al inicio». Siempre vuelve a `/`, incluso con entrada directa externa. No depende del historial.

El contenido principal mantiene una altura mínima de 645 px, coherente con el comienzo del footer a 741 px en el original mobile de 393 px. Un padding inferior de 280 px conserva el aire cuando el texto crece; no se corta ni se fija la altura de los párrafos.

Desktop es una adaptación inferida: una columna de lectura de hasta 680 px, margen general de 40 px, texto de 18 px y títulos con los fallbacks existentes. Hasta 1023 px el texto usa 17 px y ancho máximo de 640 px. No se inventó una composición de varias columnas. No hay mockup tablet ni desktop de esta página.

El footer conserva fondo gris, logo provisional, columnas desktop, apilado mobile y copyright. Se mantiene exactamente la configuración global existente para su disposición. Quedan diferencias respecto del JPEG por la fuente original ausente, el logo provisional y los espaciados ya aprobados del footer. No se afirma fidelidad de píxel.

## Accesos funcionales y pendientes

- Header, footer y CTA «Conocé Quince» de Home enlazan internamente a `/nosotros` mediante React Router.
- Regreso de Nosotros: `/`.
- Instagram: https://www.instagram.com/quinceindumentaria/?hl=es
- Facebook: https://www.facebook.com/quincesrl
- Las redes se configuran una vez en footer.json y se muestran como enlaces externos reales en footer y barra social desktop. Se conserva la navegación en la misma pestaña. Las URLs fueron suministradas por el usuario; las pruebas comprueban los href renderizados y no certifican la disponibilidad remota o el acceso sin login de esas plataformas.
- Contacto en footer y Hablemos/Cotizar mi equipo en Home continúan con href null. Se representan sin enlaces ficticios; no se creó formulario ni página de contacto. `/contacto` no tiene ruta propia y produce el 404 existente, sin prometer funcionalidades.
- Fitness sigue sin destino por la discrepancia Training/Fitness; Deportes, Urbano, Instituciones y Nosotros conservan sus rutas actuales.

La configuración de contacto ya está preparada en los campos href de footer.json y home.json. No se añadió otro JSON ni se inventó un destino compartido. Al recibir un destino se debe completar cada acceso aplicable de manera coherente.

La contradicción original «10 años» / «2009», el título provisorio pedido por el usuario, la cifra de más de 100 clubes, el texto comercial y otros recursos pendientes se registran en `inconsistencias-a-resolver.txt`. La transcripción no equivale a validación comercial; no se encontró una validación anterior del cliente que reemplazara esos párrafos.

## Pruebas ejecutadas

- Se utilizó Vite activo en 5176 y preview en 4173. Un intento adicional de iniciar dev informó puerto ocupado; se comprobó que el servidor existente respondía y se usó ese proceso.
- `npm.cmd run build`: correcto.
- `node scripts/comprobar-nosotros.cjs`: desarrollo y preview, entrada directa, navegación header desktop y menú mobile, cierre del menú, footer, regreso a Inicio sin recarga del documento, lectura exacta de title/headings/paragraphs, un solo main/h1, URLs sociales y ausencia de enlaces ficticios o ruta de contacto prometida.
- Anchos 375, 393, 768, 1024 y 1440: sin desborde horizontal. Capturas completas de preview guardadas e inspeccionadas visualmente; comparación directa con Nosotros mobile y footer desktop originales.
- Edición temporal real de un párrafo de about.json: se reflejó al recargar desarrollo y se restauró el archivo byte a byte. Preview lee dist/data: para cambiarlo sin recompilar se actualiza ese JSON publicado, no el de public/data.
- Intercepción de about.json malformado y esquema incompleto: errores controlados. Sin excepciones JavaScript ni console.error registrados durante las pruebas.
- `npm.cmd run assets:verify -- http://127.0.0.1:4173/`: 53 WebP, proporciones, hashes, seis JSON y referencias/HTTP correctos.
- `node scripts/comprobar-detalle.cjs`: regresión de las 12 fichas, galería/teclado/toque emulado, relacionados, volver, 404, responsive y mantenimiento JSON aprobada. Sus capturas se regeneraron con las redes conectadas.
- `git diff --check`: correcto. Sin commits, deploy ni auditoría general.

Para repetir el script de Nosotros: desarrollo 5176 y preview 4173 activos, más Edge/Chromium con depuración local 9333 en un perfil temporal independiente. El script abre y cierra su propia pestaña; no instala librerías. La prueba no equivale a verificar dispositivos físicos ni certificar accesibilidad integral.

## Aprendizaje

useData('about') lee el JSON y guarda carga, datos o error. La página valida el contrato y usa map para generar SeccionInstitucional en el orden recibido. Cada bloque obtiene sus títulos y párrafos por props.

Los Link internos cambian la ruta con React Router sin recargar todo el documento. Los enlaces externos de redes usan a con una URL HTTPS y salen del sitio. Layout envuelve todas las páginas y renderiza una sola instancia del footer con la configuración compartida.

main ya pertenece al layout. El h1 identifica Nosotros, cada section agrupa un tema con h2 y p, y el enlace de la flecha navega a Inicio. Estas etiquetas comunican estructura a navegadores y lectores de pantalla, independientemente de su apariencia.

CSS aplica márgenes, anchos máximos y una media query para adaptar los textos. El footer cambia de columnas a apilado con sus reglas existentes; no se duplicó para esta página.

Tres archivos para revisar: PaginaNosotros.jsx, public/data/about.json y components/layout/PiePagina.jsx.

Ejercicio manual: cambiá el orden de las dos secciones en about.json, recargá y comprobá qué ocurre. Después restaurá el orden original. No se resolvió ese ejercicio en los datos entregados.

La auditoría general queda pendiente de revisión y aprobación del usuario.
