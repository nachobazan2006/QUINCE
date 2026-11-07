# Importación incremental del catálogo — Prompt 13B

## Resultado comprobado

Se analizaron las 81 carpetas y 274 JPEG de la auditoría 13A proporcionada en la conversación. Se calcularon hashes y metadatos y se inspeccionaron las catorce hojas de contacto que cubren todas las fotografías. Se conservaron los originales externos y los cambios de trabajo anteriores, sin commits ni publicación.

| Indicador | Resultado comprobado |
| --- | ---: |
| Carpetas analizadas | 81 |
| Fotografías examinadas | 274 (266 binarias únicas) |
| Productos originales conservados | 12 |
| Productos nuevos incorporados | 12 |
| Productos públicos finales | 24 |
| Galerías existentes ampliadas | 9 |
| De ellas, completadas respecto de las tomas de la carpeta | 8 |
| Galería ampliada parcialmente con tomas seguras | 1, pollera roja |
| Galería Oldies | Intacta |
| WebP previos reutilizados sin sobrescritura | 53 |
| Fotografías nuevas procesadas | 60 |
| WebP nuevos | 120, tamaños 480/960 sin ampliación |
| Peso agregado de WebP | 4.449.374 bytes, 4,45 MB |
| WebP totales del manifiesto | 173 |
| Carpetas de productos nuevos pendientes | 57 |
| Casos documentados incluyendo fichas existentes | 60 |
| Duplicados detectados y excluidos | 8 archivos repetidos en 2 pares de carpetas |

Los 57 pendientes son carpetas, no una cantidad comercial confirmada de productos. Pueden representar alias, variantes o varios productos; no se ofrece una estimación como si fuera un total validado. Los otros tres casos de revisión son BODY, Shane y las fotos negras de la pollera.

## Productos incorporados automáticamente

Se conservó como nombre el rótulo de la carpeta del cliente, sin inventar nombres comerciales ni corregir sus abreviaturas. Se generaron slugs técnicos normalizados. Las fotos se inspeccionaron para comprobar coherencia de diseño entre vistas; no se clasificó por el club del escudo.

| Categoría existente | Carpetas incorporadas | Total final de productos de la categoría |
| --- | --- | ---: |
| hockey-femenino | CAMISETA DE HOCKEY DAMA OLIMPIC; CAMISETA HOCKEY DAMA AMSTERDAM; CAMISETA HOCKEY DAMA ARQUERO; CAMISETA HOCKEY DAMA C_MANGAS VALEN; CAMISETA HOCKEY DAMA C_MANGAS WIND | 7 |
| hockey-masculino | CAMISETA HOCKEY MASCULINO; SHORT HOCKEY MASCULINO | 2 |
| futbol | SHORT FUTBOL AIR-FIT; SHORT FUTBOL BOX | 3 |
| urban | CHUPIN URBAN; CHUPIN URBAN MUJER; MOCHILA URBAN | 4 |
| rugby | Sin productos nuevos; se conservaron los ocho anteriores | 8 |

Training e Instituciones permanecen vacías. No se crearon categorías Básquet, Running o Fitness ni se equiparó Fitness con Training. Las carpetas genéricas, aun con un escudo reconocible, necesitan una decisión comercial antes de publicarse.

## Galerías y casos apartados

Completadas: Bermuda Urban, London, Air Fit, Force, Ultrabooks, Medias Largas, Durban y Wave. Se mantuvieron los objetos image originales. Al ampliar un gallery vacío se puso primero esa misma imagen principal, porque la página utiliza gallery como secuencia del detalle. Las nuevas tomas se agregaron después; no se reemplazaron fotos aprobadas.

Pollera con Calza: se incorporaron solo las otras tomas rojas. Las dos fotos de pollera negra permanecen excluidas. BODY conserva únicamente la camiseta verde: las otras tres tomas son bordó. Shane conserva su foto actual: el otro short blanco lleva un escudo distinto. Oldies no fue modificado.

Fútbol BOX no fue importada: combina una camiseta estampada negro/naranja con una lisa blanca. COOL tampoco: su primer dorso no coincide con los demás diseños. Varias camperas, rompevientos y otras carpetas tienen mezclas que se registraron junto con la decisión humana necesaria.

El detalle por carpeta, nombres de todas sus fotografías, motivo, clasificación y decisión está en [catalogo-pendiente-revision.md](catalogo-pendiente-revision.md). Nada de esos nuevos candidatos se agregó al JSON público.

## Recuperación y trazabilidad

Antes de modificar el catálogo se guardaron copias exclusivas, no sobrescribibles, en [respaldo-inicial](catalogo-importacion/respaldo-inicial/): products.json, categories.json, manifiesto-assets.json, seleccion-assets.json, optimizar-imagenes.mjs y extraer-originales.ps1.

Para recuperar el estado anterior del catálogo y manifiesto, detener primero las tareas de importación y copiar los correspondientes archivos del respaldo a sus ubicaciones originales. Los WebP antiguos siguen intactos; los nuevos pueden conservarse sin referenciar mientras se revisa la recuperación. No es necesario borrar imágenes para restaurar los JSON. El respaldo corresponde al estado previo a esta importación y contiene los cambios anteriores del usuario.

El [plan-importacion.json](catalogo-importacion/plan-importacion.json) se generó antes de cambiar products.json. Registra carpetas relativas, fotografías, SHA-256, categorías, decisiones, colisiones y recursos previos. Se validaron identificadores, slugs, categorías, hashes, límites de rutas y destinos nuevos antes de codificar imágenes. Una discrepancia o destino ocupado detiene la aplicación del plan.

Los 25 registros históricos y archivosOriginalesSha256 se conservaron idénticos. Los hashes de los ZIP actuales se añadieron separadamente en contenedoresActuales; las fotografías nuevas tienen origen relativo configurable, hash, dimensiones, tamaño, variantes y productoIds. Los nombres nuevos contienen parte del SHA-256, sin depender del nombre comercial o de Downloads.

La selección histórica del Prompt 3 se conserva; el plan incremental es la selección vigente adicional. El optimizador existente admite ahora --plan y utiliza el motor incremental seguro. Su modo histórico permanece para trazabilidad y no debe ejecutarse sin adaptar su configuración antigua. El flujo incremental no necesita ZIP fijos ni copiar todos los originales al proyecto.

## Ejecución reproducible

Desde web, usando una carpeta de originales accesible en cualquier ubicación:

```powershell
node scripts/optimizar-imagenes.mjs --plan ../docs/catalogo-importacion/plan-importacion.json --origen 'RUTA_A_LA_CARPETA_ORIGINAL' --contenedores 'RUTA_A_LOS_ZIP'
```

--contenedores es opcional y documenta hashes actuales sin modificar los contenedores. --origen es obligatorio para verificar los originales. No se incluyen rutas de esta computadora en los datos públicos.

Se ejecutó el mismo plan por segunda vez: **0 fuentes procesadas, 0 WebP generados, 0 productos nuevos y 0 ampliaciones de galería**. Los resultados se guardaron en resultado-aplicado.json y resultado-repeticion.json dentro de catalogo-importacion/. El proceso no confunde un cambio de contenedor con un cambio de fotografía.

Limitación operativa: no ejecutar dos importaciones ni editar los JSON simultáneamente. El proceso comprueba que los JSON no hayan cambiado antes de escribir, pero no es una base de datos transaccional. Un corte durante el procesamiento puede dejar copias nuevas sin referenciar; se conserva el respaldo para recuperación y no se borran recursos automáticamente.

## Validaciones ejecutadas

- Sintaxis JSON, categorías, unicidad de IDs/slugs/fotos principales y referencias: correctas.
- Los primeros doce productos conservan orden, ID, slug, nombre, image y datos comerciales. Oldies, BODY y Shane permanecen idénticos.
- Las 274 fotografías originales mantienen sus hashes del inventario; las categorías conservan el archivo original byte a byte. Los ZIP actuales mantienen los hashes documentados.
- `node scripts/verificar-catalogo.mjs`: correcto, adaptado para catálogo incremental y comparación contra el respaldo.
- `npm run build`: correcto.
- `npm run assets:verify -- http://127.0.0.1:4173/`: 173 WebP decodificados, hashes/dimensiones/proporciones, datos public/dist y referencias HTTP correctas.
- `comprobar-detalle.cjs`: recorrió las fichas actuales en desarrollo y preview, galería/teclado/toque, relacionados, regreso, 404, JSON editable/restaurado y cuatro anchos, sin errores JS.
- `comprobar-importacion.cjs`: las 21 fichas nuevas o ampliadas a 375/1440, fotografías, nombres y anterior/siguiente de galería; sin desborde ni errores JS.
- Se inspeccionaron capturas reales de Hockey masculino, Chupín Urban, Short Fútbol BOX, Force y pollera roja. La muestra comprueba la presentación; no constituye una confirmación comercial independiente de todo el catálogo.
- Pruebas antiguas de listados se adaptaron a cantidades dinámicas y a Hockey masculino ahora poblado; no se declaran ejecutadas en esta etapa.

No se modificaron componentes visuales, CSS, AGENTS.md, originales, categorías, precios, stock, talles ni descripciones. No se hizo deploy, commit ni ZIP final.

## Aprendizaje

Cada carpeta fue un candidato, no un producto automático. Se eligieron solamente las que tenían categoría inequívoca y fotos coherentes. El registro público conserva el esquema id/slug/name/categoryIds/image/gallery que ya consume React.

Los WebP se buscaron por hash del original y se verificaron por hash del resultado. Si ya existían, se reutilizaron. Así cambiar el nombre del ZIP no obliga a comprimir otra vez.

Los duplicados se detectaron comparando contenido SHA-256, no nombres parecidos. Para no mezclar prendas se revisaron todas las hojas: por eso la camiseta verde no recibió las fotos bordó y la pollera roja no recibió las negras.

La repetición encuentra los mismos IDs y hashes; no vuelve a agregar registros, rutas ni galerías. Se comprobó con una segunda ejecución real sin novedades.

Para incorporar otro producto después: confirmar carpeta, categoría existente y tomas; preparar una nueva decisión de alta confianza con rutas y hashes; validar colisiones; ejecutar el plan y los verificadores. El plan actual es una selección revisada de esta entrega, no un clasificador que aprueba automáticamente cualquier carpeta futura. Las hojas y el inventario pueden regenerarse con preparar-importacion.mjs pasando la ruta de entrada; el respaldo inicial no se sobrescribe.

Archivos principales: scripts/planificar-catalogo.mjs (criterio), scripts/importar-catalogo.mjs (reutilización y escritura segura), public/data/products.json (resultado), docs/manifiesto-assets.json (trazabilidad).

Ejercicio: elegí un producto nuevo y seguí el SHA-256 de una foto desde el inventario hasta su recurso del manifiesto y su ruta en products.json, sin modificar los datos.

El catálogo funciona y compila; faltan decisiones humanas para el resto de carpetas. No se avanza a otras etapas.
