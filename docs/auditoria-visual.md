# QUINCE — Auditoría visual

## Alcance y evidencia

Auditoría estática del 6 de noviembre de 2026. Se leyó `AGENTS.md` en UTF-8 y se inspeccionaron visualmente las diez pantallas, las veinte portadas y hojas de contacto de las 274 fotografías. No se implementó ni ejecutó una aplicación. Las capturas no demuestran animaciones, enlaces funcionales ni accesibilidad.

La raíz contiene `AGENTS.md` y dos ZIP; las carpetas originales **sí están disponibles dentro de los ZIP**, no como directorios extraídos. No falta el paquete de aproximadamente 551 MiB. Las rutas y los identificadores de evidencia R/P se resuelven en [inventario-assets.md](inventario-assets.md). No se modificaron los originales.

## Pantallas identificadas

Son **10 archivos de pantalla, cuatro desktop y seis mobile**, que cubren cinco páginas y un estado de navegación. Las veinte portadas son recursos, no veinte páginas diseñadas.

| Evidencia | Archivo bajo `PAGINA WEB QUINCE/` | Resolución | Vista y estructura observada |
| --- | --- | --- | --- |
| R003 | `PANTALLAS DESKTOP/Home desktop.jpg` | 3024 × 5208 | Inicio: barra social, header, cuatro portadas, presentación institucional gris, cuatro destacados, bloque «Hacemos tu equipo», contacto negro, footer y copyright. |
| R004 | `PANTALLAS DESKTOP/Home desktop-1.jpg` | 3024 × 3520 | **Deportes**, pese al nombre: volver/título, cuatro portadas de disciplinas, destacados, footer. |
| R005 | `PANTALLAS DESKTOP/Home desktop-2.jpg` | 3024 × 3520 | **Rugby**: volver/título, ocho productos en cuatro columnas y dos filas, footer. |
| R002 | `PANTALLAS DESKTOP/Camiseta Peak.jpg` | 3024 × 4130 | Detalle: volver, tres miniaturas verticales, foto principal con flechas, título/categoría/guía/descripción a la derecha; cuatro relacionados y footer. |
| R008 | `PANTALLAS QUINCE MOBILE/Home.jpg` | 786 × 5368 | Inicio: header compacto, portada con siguiente tarjeta parcialmente visible, presentación gris alineada a izquierda, destacados horizontales, cotización, macro de chomba, contacto negro y footer apilado. |
| R006 | `PANTALLAS QUINCE MOBILE/Deportes.jpg` | 393 × 1833 | Volver/título, portada Rugby con parte de la siguiente, indicadores, destacados horizontales y footer. |
| R009 | `PANTALLAS QUINCE MOBILE/Listado Rugby.jpg` | 393 × 1919 | Ocho productos en dos columnas y cuatro filas; nombres, categoría y footer. |
| R007 | `PANTALLAS QUINCE MOBILE/Detalle prenda.jpg` | 393 × 1598 | Volver, una foto, nombre/categoría, guía de talles, características y footer. |
| R010 | `PANTALLAS QUINCE MOBILE/Menú.jpg` | 393 × 849 | Estado de menú abierto: logo, cierre X y cinco enlaces verticales sobre blanco. |
| R011 | `PANTALLAS QUINCE MOBILE/Nosotros.jpg` | 393 × 1386 | Volver, dos bloques institucionales, amplio vacío inferior y footer. |

No se entregaron pantallas específicas de Contacto, Training/Fitness, Urbano, Instituciones, otras disciplinas ni Nosotros desktop. Las portadas demuestran recursos para algunas de esas secciones, no sus layouts completos.

## Sistema visual observado

- **Header desktop:** franja negra con Instagram/Facebook; debajo logo a izquierda y enlaces horizontales Deportes, Training, Urbano, Instituciones y Nosotros. No se ven buscador, carrito, login ni precios.
- **Header mobile:** logo y hamburguesa; no aparece la franja social superior. Menú abierto independiente de la página; no se puede inferir si empuja o superpone el contenido, su animación ni su posición al hacer scroll.
- **Footer:** fondo gris claro, logo y grupos «Explorá», «Quince», «Seguinos»; iconos Instagram/Facebook. Desktop en columnas, mobile apilado. Copyright separado sobre blanco: ©2026 Quince y derechos reservados.
- **Color:** blanco dominante; negro en texto, barra social y bloque de contacto; gris claro en paneles/footer; gris medio en categorías; azul en guía de talles. Los colores de las prendas pertenecen a las fotografías, no a una paleta UI adicional. Los HEX oficiales no están documentados.
- **Tipografía:** cuerpo sans serif geométrico, títulos de sección negros, condensados y pesados en mayúsculas; títulos de producto más amplios y en caja mixta. La familia exacta y sus pesos no se pueden certificar desde JPEG; no hay fuentes entregadas.
- **Tarjetas:** fotografías sin marco ornamental ni radios visibles, nombre debajo y categoría gris. No se observan precios ni selectores. En mobile algunos títulos se recortan con puntos suspensivos.
- **Portadas:** formato vertical cercano a 0,62:1, oscurecimiento inferior y textos blancos superpuestos; CTA de contorno claro con forma de cápsula. El degradado ya está incorporado en las portadas suministradas: evitar duplicarlo luego.
- **Botones:** cápsulas negras sobre fondos claros, blancas en contacto negro y translúcidas con borde sobre portadas. Flechas de galería/listas desktop dentro de círculos blancos. No hay evidencia de hover, foco o estados deshabilitados.
- **Fotografía de producto:** predominantemente 1792 × 2400 (aprox. 3:4), fondos claros de estudio. Miniaturas y foto principal mantienen orientación vertical; los recortes deben definirse por uso, sin estirar ni cortar prendas arbitrariamente.
- **Alineación y ritmo:** grillas desktop de cuatro columnas, espacios blancos generosos, encabezados de sección alineados al inicio de la grilla y bloques institucionales de Home centrados. Mobile privilegia alineación izquierda y márgenes laterales cercanos a 16 px en imágenes de 393 px. En Rugby mobile el espacio entre columnas es cercano a 10 px. Son mediciones de captura, no tokens aprobados.

La captura Home mobile tiene 786 px de ancho, mientras las demás tienen 393 px: parece exportada a doble escala, pero debe confirmarse. No convertir sus píxeles directamente en tamaños CSS. Tampoco asumir que 3024 px de exportación equivalen al viewport desktop.

## Comparación responsive

| Elemento | Desktop observado | Mobile observado | Pendiente técnico |
| --- | --- | --- | --- |
| Navegación | Enlaces horizontales y barra social | Hamburguesa; menú vertical con X | Breakpoint, manejo de foco, cierre por teclado y scroll. |
| Portadas Home/Deportes | Cuatro visibles | Una y parte de la siguiente; puntos | Scroll o carrusel, avance manual, significado de puntos por tarjeta. No se demuestra autoplay. |
| Destacados | Cuatro productos; Deportes muestra flecha | Una tarjeta ancha y siguiente parcial | Mecanismo de avance y orden completo. |
| Listado Rugby | Cuatro columnas | Dos columnas | Tablet y ancho mínimo de tarjeta. No hay filtros ni paginación diseñados. |
| Detalle | Galería de miniaturas + principal + información; relacionados | Foto única y datos debajo; no se ven miniaturas, flechas ni relacionados | Confirmar si se omiten realmente o falta diseñar su adaptación. No agregar zoom por inferencia. |
| Home institucional | Texto/CTA centrados | Texto/CTA a izquierda | Escala tipográfica y espaciado intermedio. |
| Macro de chomba | No aparece en Home desktop | Aparece antes del bloque negro de contacto | Confirmar visibilidad exclusiva mobile o actualización pendiente desktop. |
| Footer | Columnas | Grupos apilados | Anchos intermedios y enlaces definitivos. |

## Contradicciones y faltantes que requieren validación

1. La misma camiseta celeste se titula **Peak** en detalle desktop, **Rugby Body** en detalle mobile y **Oldies** en listado; la carpeta real es OLDIES. El nombre comercial definitivo requiere confirmación.
2. London y Ultrabooks aparecen con nombres repetidos de Oldies/Body en desktop; el short azul Wave figura Durban en desktop y Wave en mobile. La foto no valida el rótulo comercial.
3. La descripción del detalle menciona yoga, colección Unlimited y una campera impermeable: no describe la camiseta. Desktop usa «Descripción» y mobile «Características», con texto de distinta extensión. No publicar ese texto sin revisión.
4. Menú principal dice Training; footer dice Fitness. Ambas portadas existen, con prendas distintas. Aclarar si son secciones independientes o nombres a unificar.
5. Nosotros afirma «10 años», nacimiento en 2009 y «más de 100 clubes». El copyright es 2026; revisar vigencia y aprobación de esas afirmaciones, sin corregir cifras por cuenta propia.
6. Se ve «Guía de talles», pero no hay tabla/documento ni pantalla de apertura. Los CTA de contacto/cotización y redes no incluyen destinos verificables.
7. Logo e iconos están visibles en las capturas, pero no se entregaron archivos independientes de identidad ni tipografías. No extraer la marca desde una captura como solución final sin aprobación.

## Componentes derivados de la evidencia

`SiteHeader`, `MainNavigation`, `MobileMenu`, `SocialLinks`, `SiteFooter`, `BackHeading`, `CategoryCard`, `CategoryCollection`, `ProductCard`, `ProductGrid`, `FeaturedProducts`, `ProductGallery`, `ProductDetails`, `SizeGuideLink`, `RelatedProducts`, `InstitutionalBlock`, `ContactCallout` e `InstitutionalContent`. Contratos de props y datos propuestos en [arquitectura-propuesta.md](arquitectura-propuesta.md).

Los controles de teclado, estados de carga/error, texto alternativo, contraste y destinos necesitan especificación técnica posterior. Esta auditoría no certifica WCAG ni rendimiento.
