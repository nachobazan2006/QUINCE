# QUINCE — Optimización de imágenes (Prompt 3)

## Alcance y selección

El inventario de Fase 1 examinó 304 imágenes: 274 fotografías de catálogo, 19 portadas verticales, una macro horizontal y 10 capturas de pantallas. Los originales siguen dentro de los dos ZIP de la raíz; no hay una carpeta fotográfica extraída independiente. Se consultaron las referencias, el inventario y el mapeo; se volvieron a visualizar las referencias/portadas y una muestra de las copias preparadas.

Se seleccionaron únicamente **19 archivos identificados con confianza alta**: cuatro portadas Home, cuatro disciplinas deportivas, una macro institucional, ocho fotografías de tarjetas/listado y dos vistas adicionales de la camiseta celeste. Los nombres de salida describen lo visible; no validan nombres comerciales. Las 10 capturas completas quedan fuera de publicación.

Pendientes: cuatro motivos de confianza media (Force, pollera, Ultrabooks y London, con alternativas locales), once portadas sin ubicación confirmada y las fotografías que no tienen uso identificado en las pantallas. No se procesaron los 274 archivos en masa. Tampoco se extrajeron logos o iconos de las capturas: siguen faltando sus archivos independientes, fuentes y guía de talles. No se crearon carpetas vacías para aparentar que esos recursos existen.

## Estrategia aplicada

- WebP calidad 84, esfuerzo 6, mediante sharp 0.35.5 como única dependencia de desarrollo adicional. [Opciones WebP](https://sharp.pixelplumbing.com/api-output/#webp) y [redimensionado](https://sharp.pixelplumbing.com/api-resize/) consultados en la documentación oficial.
- Base de 480 px para tarjetas/mobile; 960 px para producto; 1600 px adicionales solo para las tres vistas de detalle de la camiseta celeste.
- Portadas: 480 px y ancho original (636–706 px según archivo), nunca ampliadas. Macro horizontal: 480 y 786 px. Las imágenes de producto seleccionadas parten de 1792 × 2400.
- Se conserva la proporción, sin recortar, girar, recomponer, aplicar filtros ni alterar el diseño de logos. El degradado incorporado en las portadas se conserva; no se agrega otro.
- WebP es compresión con pérdida: no conserva identidad de píxel con JPEG. Se inspeccionaron visualmente la portada Deportes, la camiseta celeste y la macro de chomba en sus copias; sin deformaciones o recortes observados. Las 41 variantes se decodificaron y se verificó su proporción automáticamente. La aprobación visual final a tamaño de pantalla corresponde a la fase de diseño.
- No hay transparencias ni SVG en la selección actual. No se generan SVG ficticios. Si llegan logos vectoriales, conservarlos como tales; revisar transparencia si se incorporan PNG.

## Resultados medidos

| Medida | Resultado |
| --- | ---: |
| Fuentes seleccionadas y procesadas | 19 |
| Copias WebP generadas | 41 |
| Peso de las 19 fuentes, una vez cada una | 25.247.762 bytes (25,25 MB; 24,08 MiB) |
| Peso de todas las variantes juntas | 1.687.512 bytes (1,69 MB; 1,61 MiB) |
| Ahorro comparando esos conjuntos | 93,32 % |
| Segunda ejecución | 0 conversiones; 41 archivos reutilizados |

El ahorro no compara contra los 551 MiB completos ni representa el peso descargado de una página. En la implementación visual se elegirá una variante por contexto, eventualmente mediante `srcset`/`sizes`, sin descargar todas a la vez. No se impone todavía un presupuesto de carga por pantalla.

## Archivos y trazabilidad

```text
web/public/images/
├── .gitkeep
├── portadas/       # 4 fuentes, 8 variantes
├── categorias/     # 4 fuentes, 8 variantes
├── productos/      # 10 fuentes, 23 variantes
└── institucional/  # 1 fuente, 2 variantes
web/scripts/
├── seleccion-assets.json
├── extraer-originales.ps1
├── optimizar-imagenes.mjs
└── verificar-assets.mjs
docs/manifiesto-assets.json
```

El manifiesto tiene propiedades en español: versión, herramienta, hashes de contenedores, resumen y recursos. Cada recurso conserva ID de auditoría, ruta ZIP/entrada exacta, tipo, sección y estado de identificación; sus metadatos originales incluyen dimensiones/formato/bytes/SHA-256. Cada variante registra ruta pública, dimensiones, formato, bytes y SHA-256. `clave` identifica fuente, tamaños, opciones y versiones de herramientas para reutilizar conversiones válidas.

No requiere archivos temporales de auditorías previas. La selección contiene las rutas reales. El extractor abre los ZIP en modo lectura, copia únicamente las entradas seleccionadas a una carpeta temporal única y el optimizador elimina solo esa carpeta al terminar. Los ZIP se verifican por SHA-256 antes y después. También se comprobó `AGENTS.md` contra el hash tomado al comenzar esta tarea: sin cambios.

## Uso reproducible

Desde `web/`, en Windows con Node y PowerShell disponibles:

```powershell
npm.cmd install
npm.cmd run assets:optimize
npm.cmd run build
npm.cmd run assets:verify
# Opcional, con preview iniciado:
npm.cmd run assets:verify -- http://127.0.0.1:4173/
```

El script controla IDs/nombres duplicados, limita destinos a `public/images`, evita sobrescribir archivos ajenos al manifiesto y reutiliza las copias cuyo hash y configuración coinciden. Si se modifica calidad, tamaños o versión de sharp, regenera solo las variantes afectadas. No limpia automáticamente variantes retiradas de la selección: revisar su uso antes de eliminar cualquier copia derivada. Los originales nunca se eliminan.

Para incorporar una foto nueva: ubicar su entrada exacta, inspeccionarla y documentar el uso; agregar un registro con ID único, ZIP, ruta original, nombre descriptivo sin espacios/tildes, sección, anchos útiles y estado alto en `seleccion-assets.json`. Mantener las fuentes originales disponibles. Ejecutar los comandos, revisar la copia visualmente y asociarla al registro JSON real solo cuando exista. Si cambia la raíz de entrada o el formato contenedor, adaptar el extractor explícitamente; hoy lee ZIP locales, no carpetas arbitrarias.

## Integración de datos

Se completó `image` de Deportes y Rugby en `categories.json`, conservando el contrato `src`, `alt`, `width`, `height`. `src` usa `images/...` relativo a `public/`, compatible con `resourceUrl()` y `BASE_URL`. No se usa `public/images/...` como URL.

`products.json` continúa vacío: preparar una fotografía no autoriza inventar una ficha. `home.json` mantiene colecciones vacías hasta aprobar secciones/contenidos, y `about.json` no recibe una foto sin evidencia para esa página. La macro identificada corresponde a Home mobile, no a Nosotros. El manifiesto permite asociar luego cada copia con el JSON adecuado. Las galerías seguirán el array `gallery` ya documentado; no se implementó una galería visual ni se cambiaron consumidores JSX.

## Diagnóstico de navegación y reparación de datos

En `Layout.jsx`, el menú muestra `item.label` recibido desde `navigation.json`; no hay etiqueta Inicio fija en JSX. Se comprobó en Edge que el texto renderizado coincide exactamente con la etiqueta actual editada por el usuario tanto en desarrollo (5173) como en preview (4173). El H1 sigue siendo Inicio, de forma independiente. No se reprodujo un defecto de lectura y no se modificó el servicio ni la etiqueta del usuario.

El layout carga navegación al montarse: editar un JSON no garantiza actualización automática mientras la SPA permanece abierta. Recargar vuelve a solicitarlo. Preview sirve la copia de `dist/data`, por lo que un cambio en `public/data` requiere nuevo build para verlo allí; en producción se puede actualizar directamente el JSON publicado. No se puede demostrar retrospectivamente cuál de esas situaciones causó la observación anterior.

Sí se encontró un defecto en el contenido editado de `home.json`: incluía etiquetas HTML fuera de sintaxis JSON. Se retiró ese fragmento, conservando las dos colecciones vacías. Un JSON almacena datos; el H1 pertenece al componente JSX. El mecanismo de error ya existente detectaba correctamente el JSON inválido.

## Verificaciones y pendientes

- Build correcto y sin advertencias de compilación; 41 WebP presentes en `dist/images/`.
- Las 41 copias abren, mantienen proporciones y coinciden por hash entre manifiesto, `public` y `dist`; ninguna amplía el original.
- Las 41 URLs devuelven HTTP 200 y tipo `image/webp` tanto en desarrollo como en preview; los cinco JSON son válidos y coinciden con las copias compiladas. Referencias `src` existentes verificadas.
- Edge: navegación, accesos directos, 404, JSON real, lectura de etiqueta, independencia del H1 y estados de error; sin excepciones JavaScript. Revisión básica de Inicio a 393 px sin desborde. No equivale a probar los diseños finales.
- npm informó cero vulnerabilidades durante la instalación de sharp, con avisos del npm antiguo y exclusión de binarios opcionales de otras plataformas. No se modificó npm global.

Podemos comenzar la Fase 2 tras revisión. Siguen pendientes la aprobación de tomas medias, nombres y textos comerciales, identidad visual independiente, talles, destinos y diferencias responsive documentadas. No se implementaron pantallas, deploy ni commits.

## Aprendizaje

Un **asset** es un recurso del sitio, por ejemplo una foto o un logo. Optimizar fotos reduce bytes y tiempo de descarga. WebP suele ofrecer buen detalle con menos peso; la calidad elegida implica compresión y debe revisarse visualmente.

Guardar un archivo en `public/` hace que Vite lo publique; no lo muestra automáticamente. El JSON guarda una ruta relativa en `image.src`; un componente futuro recibirá esa imagen por props y resolverá el `src` con `resourceUrl()`. Cuanto mayor sea el peso descargado, más tardará en llegar el contenido, especialmente en conexiones móviles.

Revisar `web/scripts/seleccion-assets.json`, `web/scripts/optimizar-imagenes.mjs`, `docs/manifiesto-assets.json` y `web/public/data/categories.json`.

Ejercicio manual: elegí un recurso del manifiesto, encontrá sus dos variantes y compará sus dimensiones y bytes. Luego ubicá cuál usa `categories.json`. No cambies aún archivos originales ni agregues productos para hacer el ejercicio.
