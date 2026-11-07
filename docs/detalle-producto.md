# QUINCE — Detalle individual (Prompt 9)

Actualización Prompt 11: la guía sin recurso real se oculta, junto con el separador si no hay contenido debajo del nombre/categoría. Ya no se publica «(pendiente)». Este documento conserva el estado histórico del Prompt 9; ver [auditoria-visual-final.md](auditoria-visual-final.md) para las correcciones actuales.

## Implementación

La ruta existente `/productos/:slug` ahora utiliza una sola `PaginaDetalleProducto`. Lee products.json mediante useProductos y categories.json mediante useData, localiza la ficha y entrega datos por props. No hay solicitudes por miniatura ni por tarjeta. El layout conserva su único main; no se modificaron header, footer, originales, dependencias ni se hicieron commits.

Se leyó AGENTS.md completo y se consultaron los contratos de datos, auditoría visual, mapeo, listados, optimización, manifiesto y componentes anteriores. Se extrajeron copias de las dos referencias desde el ZIP de `Downloads/QUINCE` para inspeccionarlas visualmente: `PANTALLAS DESKTOP/Camiseta Peak.jpg` y `PANTALLAS QUINCE MOBILE/Detalle prenda.jpg`. Las copias de inspección se retiraron al finalizar; los ZIP permanecen intactos.

Componentes creados:

- `src/pages/PaginaDetalleProducto.jsx`: parámetros, carga/error, búsqueda, regreso a colección y producto no encontrado sin redirección.
- `src/components/productos/GaleriaProducto.jsx`: foto principal, miniaturas desktop, botones anterior/siguiente, recorrido circular, flechas del teclado, anuncio accesible y estado de fotografía ausente/fallida. Cambiar de producto reinicia la selección.
- `src/components/productos/InformacionProducto.jsx`: nombre, categoría, guía y descripción/características opcionales.
- `src/components/productos/ProductosRelacionados.jsx`: reutiliza TarjetaProducto; sin registros se omite.
- `src/styles/detalle-producto.css`: composición propia para desktop y mobile/tablet.

Archivos existentes modificados: App.jsx (misma ruta, nueva página), catalogo.js (selección de fotos y relacionados), useProductos.js (validación de imágenes y opcionales), products.json (variantes 1600 ya disponibles), comprobar-listados.cjs (actualiza la expectativa de detalle provisional a detalle real). ProductPage.jsx fue reemplazado por la página en español. Se agregaron comprobar-detalle.cjs, este informe, la actualización del contrato y cuatro capturas en docs/capturas-detalle/.

## JSON, productos y fotografías

Se consumen `web/public/data/products.json` y `categories.json`. Los JSON de navegación/footer continúan siendo responsabilidad del layout. No se añadieron productos ni nombres comerciales. El único cambio de catálogo agrega a las tres imágenes de gallery de Oldies sus variantes existentes de 1600 px, respaldadas por el manifiesto. No se generaron imágenes nuevas.

Se verificó la navegación de las 12 fichas existentes: Camiseta Rugby Oldies, Camiseta Rugby Body, Camiseta Rugby Ultrabooks, Camiseta Rugby London, Short Rugby Shane, Short Rugby Durban, Short Rugby Wave, Medias Largas, Camiseta Fútbol Air Fit, Camiseta Hockey Force, Pollera Hockey con Calza y Bermuda c/corte Urban. La verificación acredita los registros y recursos del catálogo actual, no una confirmación comercial nueva de sus nombres.

Galería Oldies: P098 frente con modelo (`camiseta-celeste-frente`), P097 espalda (`camiseta-celeste-dorso`), P096 prenda sin modelo (`camiseta-celeste-sin-modelo`); variantes 480/960/1600 WebP. P099 (`camiseta-celeste-listado`) conserva su función de tarjeta. La galería explícita manda sobre image; no se agrega automáticamente la toma del listado como una cuarta foto. En las otras once fichas se utiliza su única image actual, sin miniaturas ni flechas. Esto no afirma que no existan más tomas en los ZIP: todavía falta incorporarlas y verificar su asociación.

Las imágenes mantienen proporción, dimensiones declaradas, srcset y sizes. La principal carga eager; miniaturas y tarjetas lazy. La guía ausente es texto con aria-disabled y aclaración «pendiente», sin href ficticio ni foco engañoso.

## Criterios y pendientes

- Desktop conserva miniaturas a izquierda, foto grande, información a derecha, separador y cuatro tarjetas como máximo. Mobile/tablet apila foto e información, oculta miniaturas y relacionados como la referencia mobile. Conserva dos botones táctiles de 44 px para recorrer fotos reales; no hay carrusel complejo ni autoplay.
- Desde 1024 px se usa la composición desktop; hasta 1023 px la mobile. Tablet centra la fotografía con ancho máximo de 568 px para evitar una ampliación excesiva. No se entregó mockup tablet.
- `relatedProductIds`, si existe incluso vacío, es la fuente prioritaria. Sin ese campo se muestran hasta cuatro productos de la misma categoría, en orden de catálogo: continuidad de colección, sin afirmar una recomendación comercial específica. Se descartan el propio producto, duplicados e IDs inexistentes. No se rellena con productos de otra colección.
- El mockup desktop incluye la propia camiseta y nombres repetidos: no se reprodujeron esos errores. Oldies muestra Body, Ultrabooks, London y Shane por el criterio anterior. Fútbol/Urbano no tienen relacionados; Hockey femenino tiene uno.
- Peak / Rugby Body / Oldies para la camiseta celeste continúa pendiente de confirmación. Se usa el registro Oldies existente, consistente con listado y carpeta; no se renombró por el título del mockup.
- La descripción de campera, yoga y Unlimited no corresponde a esta prenda. Hoy no hay description ni characteristics aprobadas: se omite el bloque, sin inventar texto ni reservar una altura artificial. Al completar los campos aparece con «Descripción» desktop y «Características» mobile. Por esa ausencia la página y el inicio del footer son más cortos que la referencia.
- No se encontró guía de talles entre los recursos/documentación. Falta documento o URL real. La interfaz ya admite sizeGuide, sin tablas inventadas.
- Fuente exacta no entregada; se conservan Arial y los fallbacks existentes para títulos condensados. No se certifica equivalencia de píxel. Logo provisional, iconografía y navegación anteriores permanecen intactos.

## Verificación realizada

Desde web, con desarrollo en 5176, preview en 4173 y Edge headless con depuración local en 9333:

1. `npm.cmd run build`: correcto.
2. `node scripts/verificar-catalogo.mjs`: 12 productos, IDs/slugs/fotos únicos, referencias y colecciones correctas.
3. `npm.cmd run assets:verify -- http://127.0.0.1:4173/`: 53 WebP decodificados, proporciones, hashes public/dist, seis JSON y URLs correctas.
4. `node scripts/comprobar-detalle.cjs`: desarrollo y preview, entrada desde Rugby, 12 URLs directas, datos, miniaturas, anterior/siguiente y recorrido circular, flechas del teclado y Enter, toque emulado a 375 px, regreso, relacionados, navegación entre fichas y reinicio de galería, producto inexistente conservando URL, una sola imagen sin controles, principal eager, un único main, ausencia de desborde horizontal a 375/768/1024/1440. Sin excepciones JS ni console.error registrados.
5. El script cambia temporalmente name y description en el archivo real, recarga desarrollo y verifica ambos textos. Restaura el buffer original byte a byte; no sobrescribe una edición concurrente diferente. En un servidor publicado se modifica data/products.json allí mismo, sin recompilar JS; preview usa dist/data, no public/data.
6. Intercepción controlada de products.json: JSON inválido, HTTP 503, registro incompleto y respuesta demorada muestran error/carga. No se guardan esos errores en el catálogo.
7. `node scripts/comprobar-listados.cjs`: regresión aprobada en desarrollo y preview, ocho anchos, colecciones/vacíos, destacados, 404, teclado, mantenimiento JSON y lectura/esquema. Sus capturas regeneradas se restauraron para conservar los entregables previos.
8. Inspección visual de las cuatro capturas de detalle y comparación con ambos mockups originales. Imágenes proporcionadas, composición diferenciada y sin desbordes observados. No equivale a una prueba en teléfonos físicos ni certificación WCAG.

Para repetir: iniciar Vite y preview en los puertos indicados, y Edge con `--headless=new --remote-debugging-port=9333 --user-data-dir=<perfil-temporal-separado>`, luego ejecutar los scripts. El script de detalle abre y cierra su propia pestaña. No instala dependencias de navegador.

## Aprendizaje

React Router empareja `/productos/:slug`; useParams() entrega ese segmento como texto. `.find()` recorre products y devuelve el primer registro cuyo slug coincide; si no existe devuelve undefined y mostramos el estado de producto no encontrado.

useState() guarda el índice de la fotografía seleccionada. Un clic cambia ese índice y React vuelve a renderizar la imagen. El resto de los datos llega por props. TarjetaProducto recibe cada producto relacionado y su categoría, reutilizando la presentación y Link del catálogo.

Separar JSON y JSX permite corregir información sin editar componentes ni recompilar JavaScript cuando se reemplaza el JSON publicado. El archivo mantiene el contrato: un cambio arbitrario de estructura requiere adaptar el código.

Semántica: main ya pertenece al layout; article agrupa la ficha, section identifica galería/descripción/recomendaciones; h1 nombra el producto, h2 las secciones y h3 las tarjetas; button cambia fotografías y Link/a navega. Las imágenes tienen alt y los controles nombres accesibles, foco visible y estado seleccionado.

Tres archivos para estudiar: PaginaDetalleProducto.jsx, GaleriaProducto.jsx y ProductosRelacionados.jsx.

Ejercicio manual: en una copia local, agregá dos IDs válidos a relatedProductIds de un producto. Recargá y observá qué tarjetas aparecen y en qué orden. Después probá repetir uno de los IDs y comprobá el resultado. Restaurá tus cambios al terminar. No está resuelto en el catálogo entregado.

El Prompt 10 queda pendiente de revisión y aprobación.
