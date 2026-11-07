# QUINCE — Contrato inicial de JSON

Implementado en `web/public/data/` para el Prompt 2. Complementa la propuesta de arquitectura de Fase 1; los documentos originales de auditoría se conservan como evidencia histórica. No se cargaron nombres de productos dudosos ni información comercial inventada.

Este contrato incorpora las actualizaciones hasta Prompt 8. Para fuentes, contradicciones de nombres y pruebas de catálogo ver [listados-productos.md](listados-productos.md).

## Reglas comunes

JSON UTF-8 válido, sin comentarios ni comas finales. Las claves raíz son obligatorias aunque las colecciones estén vacías. IDs estables y únicos; slugs únicos por nivel y con formato minúscula-guiones; relaciones mediante IDs, no mediante nombres. Mantener orden editorial en arrays. Los opcionales pueden omitirse; los campos de imagen pueden ser `null` mientras falte un recurso aprobado. No usar cero o cadenas ficticias para suplir precios/datos pendientes.

Las URLs de navegación interna empiezan con `/` y las resuelve React Router dentro de la base configurada. Las rutas de imágenes son relativas al directorio público, por ejemplo `images/...`, sin anteponer `/`; resolverlas mediante `resourceUrl` al implementarlas. Ningún componente visual necesita conocer la ruta del ZIP original.

## navigation.json

Actual: `{ "items": [...] }`, con Inicio, Deportes > Rugby y Nosotros, respaldados por las pantallas. Cada nodo tiene campos obligatorios `id`, `label`, `href` (ruta interna) y `children` (array de nodos, vacío si no hay hijos). El orden del array define la presentación. No agregar destinos comerciales no resueltos.

Actualización Prompt 4: se muestran además Training, Urbano e Instituciones, presentes en las referencias, con `href: null` hasta confirmar su destino. `href` acepta una ruta interna o null; null produce texto no interactivo, no un enlace simulado. Se conservan IDs, rutas y etiquetas editadas anteriormente.

## footer.json (Prompt 4)

Claves obligatorias: `marca` (label e image, objeto src/width/height o null), `grupos` (array de id, label e items), `tituloRedes`, `redes` (array de id, label e href), y `copyright` (array de líneas). Los items de grupo tienen id, label y href. `href: null` indica destino pendiente; en redes, una URL externa real; en grupos, ruta interna. La marca y las redes se comparten con el header. Logo provisional autorizado por el usuario; textos y orden del footer tomados de las referencias. Ver [header-footer.md](header-footer.md).

## home.json

Claves obligatorias actuales: title, sections y featuredProductIds. sections contiene los bloques implementados y featuredProductIds referencia productos canónicos; los arrays pueden estar vacíos si no hay contenido verificado.

Modelo para futuras secciones, sin registros hoy: `id` y `type` obligatorios; tipos previstos `categories`, `institutional` y `contact`. Según tipo: `categoryIds` para la colección; `heading` y `body` para bloques de texto; `action` opcional con `label` y `href`; `image` opcional. Los campos por tipo se incorporarán al aprobar su contenido. `featuredProductIds` referencia productos existentes por ID, sin duplicar sus fichas.

## categories.json

Raíz: `{ "categories": [...] }`, con las líneas y disciplinas documentadas. Cada registro requiere `id`, `slug`, `name`, `parentId` (ID o `null` para raíz) e `image` (objeto o `null`). `description` es opcional y solo se agrega si se valida. La jerarquía actual cubre categoría y subcategoría, que son los dos niveles implementados en el router. No extender niveles sin adaptar rutas.

## products.json

Raíz: `{ "products": [...] }`, con doce registros reales en el Prompt 8. Cada ficha debe incluir:

- Obligatorios: `id`, `slug`, `name`, `categoryIds` (IDs existentes), `image` (objeto o `null`) y `gallery` (array ordenado de imágenes, puede estar vacío).
- Opcionales: `description`, `characteristics` (array de textos aprobados), `sizeGuide` (enlace a recurso real) y `relatedProductIds` (IDs existentes).
- Imagen: `src`, `alt`, `width` y `height` obligatorios cuando hay objeto; `view` opcional para frente/espalda/detalle. El orden de `gallery` es el orden de presentación; no crear interacción de galería en esta fase.

No se definieron precios, stock, talles seleccionables, variantes o SKU: falta información validada y no son necesarios para las pantallas actuales. Las carpetas con distintas prendas no se convierten automáticamente en variantes. Sin registros, `/productos/cualquier-slug` muestra 404 por diseño.

## Actualización de etapas 5–7

`home.json` ahora tiene `title` (h1 de la página para lectores) y `sections` ordenadas. `featuredProductIds` se conserva vacío por compatibilidad: no se cargaron fichas completas. Tipos de sección implementados:

- `categories`: id, type, categoryIds; resuelve nombres/imágenes/CTA desde categories.json.
- `institutional`: id, type, heading, body, action. Incluye presentación y bloque equipo.
- `featured`: id, type, heading. Desde Prompt 8, obtiene los registros mediante featuredProductIds de la raíz; no duplica nombres o fotos en items.
- `image`: id, type, image, visibility (`mobile` para la macro representada en esa versión).
- `contact`: id, type, heading, body, variant (`dark`) y action.

Las acciones tienen label y href (ruta interna confirmada o null si falta destino). Null no genera un enlace ficticio. Las imágenes admiten `variants`, un array opcional de src/width usado para construir srcset; los campos src/alt/width/height existentes se conservan. Las rutas siguen siendo relativas a public/ y compatibles con BASE_URL.

Las categorías ahora admiten subtitle, action, designStatus (`ready`/`pending`) y pendingMessage. Deportes tiene childIds ordenados y featuredSectionId, que referencia una sección de home.json sin duplicar sus tarjetas. Las otras tres líneas tienen imagen confirmada y designStatus pending; esto no acredita un diseño interior. La jerarquía de subcategorías deportivas procede de las cuatro portadas visibles. Los nombres del menú siguen independientes de los nombres del catálogo: la etiqueta del ejercicio no modifica el título comercial de Rugby.

El [informe por etapas](etapas-5-6-7.md) conserva el estado histórico anterior al catálogo del Prompt 8.

## Actualización vigente — Prompt 8

`products.json → products` ahora contiene 12 prendas reales. Se conservan id, slug, name, categoryIds, image y gallery; no hay precios, stock, talles ni descripciones inventadas. Los slugs son identificadores técnicos normalizados para la ruta provisional existente `/productos/:slug`. Las categorías se relacionan por ID; el orden de products es el orden del listado, sin ordenamiento alfabético.

`home.json → featuredProductIds` es ahora la fuente de los cuatro destacados. Se retiraron las copias editoriales de nombre/imagen en `sections[].items` y se adaptaron ambos consumidores (Home y Deportes). No se deben publicar esos nuevos JSON con una compilación anterior que todavía espere items. Las imágenes/etiquetas se obtienen del registro único de producto; para destacados, la etiqueta secundaria muestra la categoría raíz, conservando el diseño anterior.

Las categorías agregan `view: "collection"` para elegir el listado reutilizable. Deportes conserva la landing. El campo histórico designStatus sigue expresando disponibilidad del diseño original; una colección vacía no acredita un diseño interior comercial ni implica stock agotado. La selección por categoría incluye descendientes cuando corresponde y no mezcla hojas hermanas.

gallery solo incorpora vistas preparadas y verificadas de Oldies (P098/P097/P096). La foto de su tarjeta es P099. Un array vacío en las otras fichas significa que esa galería no fue incorporada todavía; no afirma que falten fotos dentro de los ZIP.

Ver contrato, pruebas y [guía para agregar productos](listados-productos.md). El hook controla raíz y campos mínimos; `verificar-catalogo.mjs` revisa IDs, relaciones, referencias y expectativas de la colección actual.

## about.json (sin cambios)

Actual: `{ "title": "Nosotros", "sections": [] }`. `title` y `sections` obligatorios. Cada sección futura necesita `id`, `heading` y `paragraphs` (array de textos). No se publicaron las afirmaciones sobre trayectoria o clubes ni descripciones extrañas al producto.

## Edición en producción

Vite copia los seis archivos JSON a `dist/data/`. Se pueden reemplazar en el servidor sin recompilar JavaScript siempre que respeten este contrato. Mantener referencias coherentes entre navegación, categorías y productos; editar archivos de forma atómica y validar JSON antes de subirlos. Los errores HTTP, de tipo de respuesta o de sintaxis JSON se muestran en pantalla. Un cambio arbitrario de esquema requiere adaptar código; el catálogo valida campos mínimos y el script verifica relaciones, sin un validador integral de todos los datos en tiempo de ejecución.

Quedan para aprobación: Training/Fitness, nombres de prendas, destinos comerciales, guía de talles, textos institucionales, selección fotográfica y layouts no entregados. No se generaron `assets.json`, `site.json` ni guías vacías porque aún no hay componentes que los consuman.
