# QUINCE — Auditoría visual y responsive final (Prompt 11)

Actualización posterior: se ajustó únicamente la tipografía del CTA Conocé Quince, comparando Poppins Medium 500 y Regular 400. Se eligió Regular 400 por su mayor proximidad visual al trazo del mockup; no es una identificación confirmada por el diseñador. Ver [tipografia-conoce-quince.md](tipografia-conoce-quince.md). Las capturas de la auditoría inferior documentan el estado anterior a ese ajuste puntual.

Fecha: 7 de noviembre de 2026. Resultado técnico: correcciones comprobadas, compilación correcta y revisión visual del cliente pendiente. No se hicieron commits, deploy ni se avanzó al Prompt 12.

## Alcance, estado inicial y método

Se leyó AGENTS.md íntegramente y se revisaron auditoría original, mapeo, manifiesto, contratos de datos, documentación de Home/categorías/listados/detalle/Nosotros, componentes, CSS, JSON y rutas. Había cambios sin commit de los Prompts 9 y 10; se informó antes de corregir y se conservaron. El estado registrado está en [estado-previo.txt](auditoria-final/estado-previo.txt). Las correcciones sobre esos archivos se hicieron de forma puntual, sin restauraciones contra HEAD.

Se localizaron las diez pantallas originales dentro del ZIP PAGINA WEB QUINCE de Downloads/QUINCE y se extrajeron copias de lectura a una carpeta temporal, sin modificar originales ni incorporarlos al sitio. Se inspeccionaron visualmente las diez. La comparación usa JPEG normalizado a un ancho común: desktop original 3024 px, mobile normalmente 393 px y Home mobile 786 px. Estas escalas no acreditan un tamaño CSS oficial ni igualdad de píxel.

Se ejecutó la aplicación en Vite 5176 y preview 4173 con Edge headless y depuración local 9333. Se capturaron las rutas reales y se inspeccionaron imágenes completas y hojas de contacto. Cada pasada de cobertura evalúa **24 rutas × 12 anchos = 288 combinaciones**. El menú móvil se evaluó además como estado compartido: 24 rutas más el menú, no 24 diseños originales distintos.

Anchos: **360, 375, 390, 393, 600, 768, 900, 1023, 1024, 1025, 1280 y 1440 px**, viewport de 900 px de alto y DPR 1. Incluye los siete mínimos pedidos y los bordes del breakpoint. Las cifras de validación automatizada se diferencian de la comparación visual: no se inspeccionaron manualmente las 288 combinaciones una por una.

## Inventario y referencias reales

Los nombres siguientes corresponden a carpetas dentro de PAGINA WEB QUINCE. No hay referencias interiores específicas de Training, Urbano, Instituciones, Fútbol ni Hockey.

| Vista/ruta | Referencia desktop | Referencia mobile | Alcance de la comparación |
| --- | --- | --- | --- |
| Home `/` | PANTALLAS DESKTOP/Home desktop.jpg | PANTALLAS QUINCE MOBILE/Home.jpg | Cuatro portadas, introducción, destacados, equipo, macro exclusiva mobile, contacto y footer. |
| Deportes `/deportes` | PANTALLAS DESKTOP/Home desktop-1.jpg | PANTALLAS QUINCE MOBILE/Deportes.jpg | Portadas de cuatro disciplinas, destacados y regreso. |
| Rugby `/deportes/rugby` | PANTALLAS DESKTOP/Home desktop-2.jpg | PANTALLAS QUINCE MOBILE/Listado Rugby.jpg | Ocho prendas, orden, fotos, cuatro/dos columnas y etiquetas. |
| `/deportes/futbol`, `/deportes/hockey-femenino`, `/urbano` | Sin diseño interior explícito | Sin diseño interior explícito | Adaptación del listado reutilizable; 1, 2 y 1 productos respectivamente. No se acredita fidelidad a una pantalla inexistente. |
| `/training`, `/instituciones`, `/deportes/hockey-masculino` | Solo portadas/categorías en otras pantallas | Solo portadas/categorías en otras pantallas | Colecciones vacías coherentes; no se inventaron productos ni pantallas comerciales. |
| `/productos/camiseta-rugby-oldies` | PANTALLAS DESKTOP/Camiseta Peak.jpg | PANTALLAS QUINCE MOBILE/Detalle prenda.jpg | Galería, proporción, información y relacionados; contenido comercial contradictorio separado del layout. |
| Otras once fichas `/productos/:slug` | Mismo patrón de detalle; sin mockup individual | Mismo patrón; sin mockup individual | Fotos reales del catálogo; una toma por ficha, sin controles ficticios. |
| `/nosotros` | No entregada | PANTALLAS QUINCE MOBILE/Nosotros.jpg | Dos bloques y espacio blanco; desktop inferido, una columna de lectura. |
| Menú móvil | Navegación horizontal en referencias anteriores | PANTALLAS QUINCE MOBILE/Menú.jpg | Apertura, cierre, superposición de viewport, foco y navegación. |
| Header/footer/contacto | Footers y encabezados de las cuatro pantallas desktop | Encabezados y footers de las seis mobile | Elementos compartidos, redes suministradas y CTA sin destino. No hay diseño de página Contacto. |
| `/contacto`, `/productos/no-existe` | Sin referencia de error | Sin referencia de error | Conservan URL y estado 404; no se creó una página de contacto ficticia. |

Se comprobaron las doce fichas: Oldies, Body, Ultrabooks, London, Shane, Durban, Wave, Medias Largas, Air Fit, Force, Pollera con Calza y Bermuda Urban. Los slugs exactos y las mediciones por ruta están en resultados.json.

## Hallazgos y correcciones

Resumen de **14 hallazgos agrupados**: 0 críticos, 3 altos, 7 medios y 4 bajos. **6 corregidos**; 8 dependen de recursos o aprobación. La rotación de Deportes es un cambio autorizado adicional y no se cuenta como defecto del diseño estático.

| ID / Pantalla | Resolución evaluada | Referencia original | Problema detectado | Prioridad | Corrección aplicada | Estado final | Verificación realizada |
| --- | --- | --- | --- | --- | --- | --- | --- |
| H01 Home / Deportes | 600, 1024, 1025; regresión en 12 anchos | Home y Deportes desktop/mobile | Botón de portada e indicadores se superponían en tarjetas estrechas. | Alto | Posición del texto y margin-top del CTA ajustados solo en tablet y escritorio 1024–1279; selector de Deportes con especificidad suficiente. | Corregido | Capturas, rectángulos de controles y matriz final sin superposiciones. |
| H02 Detalle | 375/393/768/1024/1440 y resto de matriz | Camiseta Peak / Detalle prenda | «Guía de talles (pendiente)» exponía un estado interno y parecía una navegación disponible. | Medio | Se oculta la guía si no hay recurso válido; separador solo si hay guía o descripción real. | Corregido | 12 fichas, captura antes/después y cero rótulos pendientes públicos en las 288 combinaciones. |
| H03 Tarjetas | 360–1440 | Home, Deportes y Listado Rugby | Nombres con peso demasiado liviano; al ajustar el peso se verificó truncado innecesario de nombres cortos en mobile. | Medio | Peso 600 de la fuente existente y tamaño 14 px en títulos de grilla mobile; se mantiene elipsis para nombres largos y texto completo en DOM/title. | Corregido | Comparaciones de Rugby y destacados; orden, destinos y datos preservados. |
| H04 Home inferior | 360/375/390/393, tablet | Home mobile | El espacio entre categoría de destacado y Hacemos tu equipo era excesivo. | Medio | Padding inferior de destacados 32→16 px y superior de equipo 32→16 px, únicamente en Home mobile/tablet. | Corregido | La transición se reduce 32 px; captura comparativa y mediciones de bloques. Deportes conserva su espaciado propio. |
| H05 Footer redes | 360–1023; control 1024/1440 | Footers mobile y desktop | Iconos mobile desplazados a derecha y separados de más al centrar cada icono en su área táctil. | Medio | Alineación al inicio y gap 0 solo en redes del footer mobile, manteniendo blancos táctiles de 44×44. | Corregido | Footer en las rutas, capturas y enlaces sociales existentes conservados. Desktop sin cambio de disposición. |
| H06 CTA / navegación | 375/1440 y revisión DOM | Home / footers | Tooltips «Destino pendiente de confirmación» exponían información interna. | Bajo | Se retiraron esos title; se conserva texto y aria-disabled sin crear enlaces falsos. Fallback de tarjeta: Imagen no disponible. | Corregido | Revisión de componentes y navegación; sin destinos inventados. |
| H07 Tipografía / identidad | Todas | Diez referencias | No se entregaron fuentes oficiales; logo provisional previamente aprobado. Persisten diferencias de trazo, salto de línea y tamaño aparente. | Medio | No se instalaron fuentes ni se sustituyó la identidad arbitrariamente. Se conservan Arial/Impact y logo existentes. | Pendiente por falta de recursos | Comparación real realizada; no se declara equivalencia tipográfica ni aprobación final. |
| H08 Detalle / contenido | Todas | Camiseta Peak / Detalle prenda | Faltan descripciones aprobadas, guía real y más galerías verificadas. | Alto | No se copió el texto de campera/yoga ni se inventaron tomas. La ausencia reduce la longitud de página respecto del mockup. | Pendiente por falta de recursos | Catálogo y manifiesto; galería Oldies de tres vistas, once fichas de una foto. |
| H09 Contacto / cotización | Todas | Home y footer | Contacto, Cotizar mi equipo y Hablemos carecen de destino. | Alto | Conservan configuración null y presentación no navegable; Instagram/Facebook mantienen URLs entregadas por el usuario. | Pendiente por falta de recursos | Revisión de JSON y href; `/contacto` responde con el 404 existente. No se certifica disponibilidad remota de redes. |
| H10 Nombres / categorías | Todas | Rugby y detalle desktop/mobile | Peak/Body/Oldies, repeticiones del diseñador y Training/Fitness no son equivalencias comerciales confirmadas. | Medio | Se preservaron nombres únicos del catálogo y vínculos existentes; no se duplicó un producto para imitar etiquetas erróneas. | Pendiente de aprobación del cliente | Orden/fotos/IDs verificados y discrepancias registradas en TXT. |
| H11 Nosotros | 375/393/768/1024/1440 | Nosotros mobile | Fecha 2009, trayectoria y más de 100 clubes necesitan validación. | Medio | Se conserva «+10 AÑOS» solicitado expresamente y los párrafos del diseñador; no se calculó otra cifra. | Pendiente de aprobación del cliente | JSON y comparación visual. No es validación comercial independiente. |
| H12 Flechas / puntos Deportes | 1024/1280/1440 | Deportes desktop | El original sugiere avance con flechas y puntos ornamentales, sin aportar más categorías o productos. | Bajo | Se conservan desplazamiento manual y catálogo real. No se añadieron flechas sin contenido ni galerías ficticias a las otras tarjetas. | Pendiente de aprobación del cliente | No se dedujo un comportamiento nuevo para Deportes desde una captura estática. |
| H13 Menú / header | 375/393/768/1024/1440 | Menú mobile y headers desktop | Inicio adicional y submenú de disciplinas no están en el JPEG del diseñador, pero pertenecen a la navegación vigente. | Bajo | Se preservaron datos y funcionamiento anteriores. | Pendiente de aprobación del cliente | Apertura/cierre, rutas, foco, Escape y teclado probados. |
| H14 Vistas sin mockup / tablet | 600/768/900/1023/1024 y extremos | Solo referencias disponibles en inventario | No hay especificación exacta de interiores de otras líneas, tablet ni Nosotros desktop. | Bajo | Adaptaciones existentes simples; ninguna referencia inventada. | Pendiente por falta de recursos | Presentación y responsive comprobados, fidelidad exacta no verificable sin referencia adicional. |

## Rotación de Deportes autorizada durante la auditoría

El usuario confirmó: **rotar deportes dentro de la tarjeta Deportes cada 5 segundos**, sin desplazar automáticamente toda la fila Home. Se implementó PortadaDeportes, utilizado solo cuando home.json configura carousel para sports.

Secuencia: portada grupal original, Rugby, Hockey femenino, Hockey masculino y Fútbol. Se utilizan las imágenes optimizadas y childIds ya existentes de categories.json. Hay cinco indicadores porque hay cinco imágenes reales; el mockup original tenía cuatro puntos. La etiqueta Deportes, su bajada y el CTA Ver deportes conservan su función de categoría.

Incluye selección manual por indicadores. Por pedido posterior del usuario se retiró el botón de pausa, su estado y sus estilos. Se detiene automáticamente por mouse, foco, pestaña oculta, tarjeta fuera de vista y movimiento reducido. No hay autoplay con prefers-reduced-motion. Cada imagen se incorpora al visitarla; no se solicitan todas las tomas al cargar la página. La transición de 400 ms se limita a este desplazamiento solicitado y se desactiva con movimiento reducido.

La fotografía se recorre dentro de su marco; Training, Urbano e Instituciones permanecen quietos. El desplazamiento horizontal manual de categorías en mobile sigue disponible. Los cinco puntos corresponden a las cinco imágenes reales. No hay botón de pausa.

## Evidencia y alcance visual

- [Antes](auditoria-final/antes/) y [después](auditoria-final/despues/): 66 capturas por pasada —63 de rutas y 3 del menú—, más una de deporte seleccionado manualmente.
- [Resultados anteriores](auditoria-final/antes/resultados.json) y [finales](auditoria-final/despues/resultados.json): mediciones por ruta/ancho, errores, imágenes, composición y, en la pasada final, superposiciones.
- [Comparaciones](auditoria-final/comparaciones/): referencia, antes y después en ese orden cuando existe original; para Nosotros desktop solo antes/después. Las hojas de contacto agrupan todas las rutas a 375 y 1440.
- Comparaciones principales: [Home mobile](auditoria-final/comparaciones/home-375.png), [Home desktop](auditoria-final/comparaciones/home-1440.png), [Deportes](auditoria-final/comparaciones/deportes-375.png), [Rugby](auditoria-final/comparaciones/deportes-rugby-375.png), [detalle](auditoria-final/comparaciones/productos-camiseta-rugby-oldies-375.png), [Nosotros](auditoria-final/comparaciones/nosotros-375.png) y [menú](auditoria-final/comparaciones/menu-375.png).

Se inspeccionaron las capturas principales y las hojas de las 24 rutas en mobile/desktop; también vistas intermedias y los controles de portadas a 1024. El menú se compara sobre el viewport: una captura de página completa puede incluir contenido debajo de sus 900 px aunque el modal cubra correctamente la pantalla.

Las capturas se generan con movimiento reducido para hacer reproducible la comparación inicial. La rotación se prueba aparte con tiempo real. Durante las capturas se fuerzan a cargar fotos lazy para registrar la página completa; eso no representa una medición de carga inicial de producción. No se usaron los JPEG como fondos ni se modificaron fuentes originales.

No verificable con las herramientas actuales: teléfonos físicos, motores Safari/Firefox, fidelidad en otras densidades y disponibilidad de los perfiles sociales remotos. No se certificó WCAG, Lighthouse ni una aprobación comercial. Los errores visuales corregidos no resuelven datos faltantes ni referencias ausentes.

## Validaciones posteriores

1. Build final: `npm.cmd run build`, correcto.
2. `node scripts/auditar-visual.cjs despues`: 24 rutas / 288 combinaciones, cero desbordes, imágenes rotas/deformadas, rótulos internos pendientes, superposiciones comprobadas y errores JS registrados.
3. `node scripts/verificar-catalogo.mjs`: 12 productos únicos, relaciones, destacados y colecciones correctos.
4. `npm.cmd run assets:verify -- http://127.0.0.1:4173/`: 53 WebP, proporciones, hashes, seis JSON y URLs correctos. No se redujo calidad ni se intercambiaron fotos para mejorar composición.
5. `comprobar-listados.cjs`, `comprobar-detalle.cjs`, `comprobar-nosotros.cjs`: navegación en desarrollo/preview, rutas directas, regreso, galerías, teclado/toque emulado, relacionados, vacíos, errores de datos y edición temporal JSON restaurada. Las capturas de regresión se desvían mediante CARPETA_CAPTURAS a auditoria-final/regresion, conservando entregables anteriores.
6. `comprobar-carrusel.cjs`: ausencia de botón de pausa, rotación real a 5 s, ciclo, indicadores, suspensión automática por mouse/foco, movimiento reducido, toque mobile, sin errores JS. Captura del deporte seleccionado guardada.
7. `git diff --check`: correcto. Datos de prueba restaurados; no se hicieron commits.

Para repetir: Vite 5176, preview 4173 y Edge con depuración 9333 en perfil temporal independiente. Ejecutar scripts de navegador secuencialmente; no editar JSON en paralelo con las pruebas temporales de mantenimiento. preparar-comparaciones.mjs recibe como argumento la carpeta con las copias de referencia. Todos los artefactos están fuera de web/public y de dist, excluidos de la compilación de producción.

## Archivos de esta etapa

- Nuevos: components/inicio/PortadaDeportes.jsx, scripts/auditar-visual.cjs, scripts/comprobar-carrusel.cjs y scripts/preparar-comparaciones.mjs, este informe y carpeta de evidencia.
- Home: HomePage.jsx, PortadaInicio.jsx, inicio.css y home.json, para la rotación autorizada y los espaciados.
- Detalle/tarjetas: InformacionProducto.jsx, detalle-producto.css, TarjetaProducto.jsx y productos.css.
- Compartidos: EnlaceAccion.jsx, PiePagina.jsx y Navegacion.jsx solo para retirar tooltips internos; layout.css solo para alineación de iconos mobile.
- Pruebas previas: comprobar-listados.cjs, comprobar-detalle.cjs y comprobar-nosotros.cjs permiten dirigir capturas fuera de entregables anteriores; se actualizó la expectativa de tooltip retirado.
- Documentación: modelos-datos.md, detalle-producto.md e inconsistencias-a-resolver.txt. Los cambios históricos de los Prompts 9/10 siguen sin commit y no forman todos parte de esta auditoría.

## Aprendizaje

Una auditoría visual compara lo renderizado por el navegador con una referencia, registra diferencias concretas y vuelve a capturar tras corregir. Leer CSS sin mirar la pantalla no demuestra fidelidad.

Los breakpoints activan reglas CSS bajo ciertas condiciones. El cambio principal de QUINCE está en 1024 px; también se comprobaron 1023 y 1025 para detectar defectos cerca del límite. Se usaron ajustes limitados al tramo que fallaba, no un rediseño global.

Tres correcciones reales:

1. Las portadas estrechas superponían CTA y puntos: se redujo el margen del botón y se reposicionó el texto en sus breakpoints. Los rectángulos ya no se cruzan.
2. Home acumulaba 32 px de espacio de más en una transición: se corrigieron los padding de los dos bloques contiguos, únicamente dentro de pagina-inicio.
3. El footer centraba los iconos dentro de áreas táctiles separadas por gap: se alinearon al inicio y se retiró ese gap sin reducir los 44 px de área táctil.

Con object-fit: cover la imagen llena el marco conservando proporción; object-position decide qué parte se conserva al recortar. No cambia el tamaño del marco ni deforma la foto. Se mantuvo el centrado de portadas verificado y contain en la galería para mostrar prendas completas.

Para detectar efectos en otras páginas hay que revisar los selectores y todos sus consumidores: TarjetaProducto aparece en Home, Deportes, listados y relacionados. Por eso el cambio tipográfico se comprobó en esas familias. Las reglas específicas de Home no alteran los espacios de Deportes.

Un margen excesivo o un peso tipográfico incorrecto es visual. Un enlace roto, una galería que no cambia de foto o un JSON que no carga es funcional. Un botón tapado por indicadores afecta ambas cosas; un teléfono o una descripción ausentes son recursos pendientes y no deben inventarse para cerrar la captura.

Archivos para estudiar: styles/inicio.css, components/inicio/PortadaDeportes.jsx y scripts/auditar-visual.cjs.

Ejercicio manual: con DevTools, modificá temporalmente el margin-top de accion-portada a 1024 px y observá qué pasa con los indicadores. Después deshacé el cambio y compará con 1440 px. No modifiques las fotografías para corregir ese espaciado.

## Revisión solicitada

Revisar Home mobile/desktop, el ritmo de Home inferior, peso/tamaño de nombres, footer mobile y la rotación de Deportes (5 s, cinco fotos, sin botón de pausa). Confirmar posteriormente fuentes/logo finales, contenidos comerciales e institucionales, Training/Fitness y destinos de contacto. Las adaptaciones sin mockup no se dan por aprobadas. **No se avanza al Prompt 12 hasta tu aprobación visual.**
