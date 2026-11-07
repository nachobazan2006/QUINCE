# QUINCE — Listados dinámicos (Prompt 8)

## Resultado y alcance

Una sola página de listado sirve las colecciones desde sus rutas existentes. Rugby muestra ocho artículos, con dos columnas por debajo de 1024 px y cuatro desde 1024 px. Se encontró una referencia desktop explícita: `PANTALLAS DESKTOP/Home desktop-2.jpg`; su nombre no describe el contenido. Se inspeccionaron esa imagen, Listado Rugby mobile, Deportes mobile y los detalles desktop/mobile, sin implementar las fichas completas.

Los originales están dentro de los ZIP locales `pagina-web.quince.zip` y `fotos-finales-quince.zip`. Las fotografías, AGENTS.md y los componentes/CSS de header/footer permanecen intactos. No hay commits, deploy ni dependencias nuevas.

## Rutas y colecciones

| Ruta | Datos actuales | Presentación |
| --- | --- | --- |
| `/deportes/rugby` | 8 productos | Listado de las referencias desktop/mobile. |
| `/deportes/futbol` | 1 producto real | Misma grilla reutilizada. |
| `/deportes/hockey-femenino` | 2 productos reales | Misma grilla reutilizada. |
| `/urbano` | 1 producto real | Adaptación con el sistema de listado; sin inventar secciones interiores. |
| `/training`, `/instituciones`, `/deportes/hockey-masculino` | Sin registros verificados cargados | Estado de colección vacía; no significa falta de stock. |
| `/deportes` | Categorías deportivas y destacados existentes | Se conserva su landing aprobada. |
| `/productos/:slug` | 12 slugs técnicos consistentes | Página provisional existente: nombre y aviso de detalle pendiente. |
| Colección inexistente o padre incorrecto | Sin coincidencia | 404, conservando la URL, sin redirección a Inicio. |

Las páginas interiores originales de Training/Instituciones/Urbano siguen sin referencia específica. El Prompt 8 habilita su vista común de colección con `view: "collection"`; eso no resuelve ni acredita un diseño interior comercial definitivo. `designStatus` y los avisos históricos se conservan en los datos. No se asignaron productos ni jerarquías a esas líneas por mera semejanza de fotografías.

## Productos y fuentes verificadas

Se cargaron únicamente prendas visibles en los diseños. Los IDs y slugs normalizados se definieron para navegación; no son SKU comerciales. El orden del array es editorial y no se ordena alfabéticamente.

| Nombre usado | Colección | Foto principal de listado |
| --- | --- | --- |
| Camiseta Rugby Oldies | Rugby | P099 — `camiseta-celeste-listado` |
| Camiseta Rugby Body | Rugby | P092 — `camiseta-verde-frente` |
| Camiseta Rugby Ultrabooks | Rugby | P100 — `camiseta-rugby-ultrabooks-frente` |
| Camiseta Rugby London | Rugby | P058 — `camiseta-rugby-london-frente` |
| Short Rugby Shane | Rugby | P276 — `short-blanco-frente` |
| Short Rugby Durban | Rugby | P273 — `short-negro-listado` |
| Short Rugby Wave | Rugby | P277 — `short-azul-frente` |
| Medias Largas | Rugby | P163 — `medias-negras` |
| Camiseta Fútbol Air Fit | Fútbol | P062 — `camiseta-futbol-roja-frente` |
| Camiseta Hockey Force | Hockey femenino | P086 — `camiseta-hockey-force-frente` |
| Pollera Hockey con Calza | Hockey femenino | P198 — `pollera-roja-con-calza` |
| Bermuda c/corte Urban | Urbano | P002 — `bermuda-gris-frente` |

Los archivos de esa columna están en `web/public/images/productos/`, con sufijos `-480.webp` y `-960.webp`. El manifiesto conserva rutas originales completas, dimensiones, peso y hashes. No se reutilizó una misma foto principal para prendas distintas.

### Corrección del mapeo inicial

Se compararon recortes de las tarjetas originales con las tomas candidatas, a igual tamaño, además de inspección visual:

- London: P058 coincide con el cuello y postura; P061 presenta otra toma.
- Ultrabooks: P100 coincide con brazos/postura; P101 es otra toma cercana.
- Oldies: la tarjeta usa P099; P098 corresponde a la vista principal del detalle. P098 se conserva junto a P097/P096 en gallery, sin implementar una galería.
- Durban: la referencia usa P273 con torso descubierto; P272 muestra otra toma, con remera negra. No se recortó ni editó esa foto para simular la referencia.

La comparación orientativa de píxeles ayudó a seleccionar tomas, pero no demuestra igualdad binaria con un JPEG exportado. No se aplicaron filtros, ampliaciones ni recortes a los originales. Se agregaron ocho WebP (cuatro fuentes), reutilizando los 45 existentes. Resultado total del manifiesto: 25 fuentes y 53 variantes, 38.157.584 bytes originales seleccionados frente a 2.224.912 bytes de todas las variantes (94,17 % menos). Algunas copias anteriores permanecen para trazabilidad o futuras vistas, no como sustitutos de prendas distintas.

### Contradicciones preservadas como pendientes editoriales

El listado mobile identifica Oldies, Body, London y Wave; el desktop repite erróneamente Oldies/Body y llama Durban al short azul. Se usaron nombres mobile y de carpeta consistentes, sin copiar esas duplicaciones. El nombre Ultrabooks se completa desde la carpeta real porque mobile lo trunca. Peak/Body/Oldies para la camiseta celeste continúa como discrepancia comercial que deberá aprobar el cliente. No se cargó la descripción de campera del mockup de detalle.

## Arquitectura y datos

- CategoryPage usa los parámetros existentes, resuelve padre/hijo y entrega la categoría a PaginaListadoProductos. No hay archivos específicos para Rugby/Fútbol/Hockey.
- useProductos reutiliza useData y valida la estructura mínima del catálogo. Cada página solicita el archivo una vez por montaje; ninguna tarjeta hace fetch. El ciclo de desarrollo de StrictMode puede cancelar y repetir la solicitud al montar.
- obtenerProductosColeccion filtra por IDs de categoría y descendientes, preservando el orden del array. Las hojas no incorporan prendas de otras disciplinas. El helper admite la relación padre/hijo sin crear filtros interactivos.
- GrillaProductos transforma el array en TarjetaProducto mediante map y key estable por id. EncabezadoColeccion comparte el regreso y el h1 entre landings y listados.
- TarjetaProducto se reutiliza en listados y destacados de Home/Deportes. Recibe producto, categoría de presentación y nivel de título; usa h2 en el listado y h3 bajo el h2 de destacados. Link navega a la ficha provisional sin recargar el documento.
- La imagen principal conserva proporción y usa srcset/sizes. Las primeras dos se cargan eager; el resto lazy, con dimensiones explícitas. No se agregaron compra, favoritos, precios o estrellas.

`products.json` conserva la raíz products y los campos id, slug, name, categoryIds, image, gallery. Se omitieron descripciones, stock, talles, variantes y precios. gallery solo tiene vistas preparadas cuando están verificadas; vacía significa pendiente de incorporación, no ausencia del archivo en el ZIP.

Los destacados dejaron de duplicar nombres/imágenes en `home.json → sections[].items`: ahora `featuredProductIds` referencia los cuatro registros canónicos de products.json. Se actualizaron sus dos consumidores (Home y Deportes). Al publicar esta migración, código y ambos JSON deben corresponder a la misma versión; luego cambiar nombres u orden de registros no exige recompilar React. Los campos de categorías/IDs y sus slugs existentes se conservaron, agregando únicamente view para elegir el listado.

## Verificación ejecutada

1. `npm run dev -- --host 127.0.0.1 --port 5176 --strictPort`: inició correctamente.
2. `npm run build`: correcto, sin advertencias de compilación; dist contiene datos e imágenes.
3. `node scripts/verificar-catalogo.mjs`: 12 IDs/slugs/fotos principales únicos, relaciones válidas, destacados, ocho Rugby, Fútbol/Hockey/Urbano aislados y orden preservado.
4. `npm run assets:verify -- http://127.0.0.1:4173/`: 53 WebP decodificados, proporciones, hashes public/dist, seis JSON y rutas HTTP correctos.
5. `node scripts/comprobar-listados.cjs`: Edge real en desarrollo 5176 y preview 4173. Anchos 375, 393, 600, 768, 900, 1024, 1200 y 1440; columnas esperadas, sin desborde horizontal, orden de ocho tarjetas y destinos de sus enlaces. Segunda/tercera/cuarta colecciones, vacíos y 404 sin redirecciones. Se verificaron los 12 detalles provisionales y los cuatro destacados de Home/Deportes.
6. Navegación con teclado desde una tarjeta, regreso y selección entre Rugby/Fútbol/Hockey desde Deportes, sin recargar el documento.
7. Prueba de mantenimiento real: se cambió temporalmente el nombre de Oldies y se intercambiaron los dos primeros registros de products.json; el navegador reflejó ambos cambios. Se restauró el buffer original del archivo y se comprobó el orden/nombre originales. Si el usuario edita el archivo durante esa prueba, el script evita sobrescribir esa edición.
8. Respuestas interceptadas: JSON inválido, HTTP 404, raíz incorrecta y producto sin campos requeridos muestran errores; una respuesta demorada muestra carga; colección sin registros muestra estado vacío. No se escribieron esos casos inválidos en los archivos del proyecto.

Sin errores de consola de React registrados en las rutas saludables. Los HTTP 404 de prueba son fallos inducidos, no enlaces rotos de la implementación. No se midió Lighthouse ni se certificó WCAG.

### Repetir las pruebas de navegador

Se necesita Node y Edge/Chromium con depuración local en 9333, en un perfil temporal separado, más desarrollo en 5176 y preview en 4173. El script abre/cierra su propia pestaña. No instala librerías. Las URLs se pueden configurar con URL_DESARROLLO, URL_PREVIEW y URL_DEPURACION.

Ejemplo de inicio de Edge en PowerShell:

```powershell
Start-Process -FilePath 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -ArgumentList @('--headless=new', '--disable-gpu', '--remote-debugging-port=9333', "--user-data-dir=$env:TEMP\quince-pruebas") -WindowStyle Hidden
```

Desde web, con ambos servidores iniciados:

```powershell
node scripts/verificar-catalogo.mjs
node scripts/comprobar-listados.cjs
```

El verificador fija ocho artículos como contrato de la referencia actual; actualizar esa expectativa si el cliente aprueba ampliar el catálogo. La aplicación no tiene ese límite: renderiza todo el array filtrado.

## Comparación visual y diferencias

Capturas reales: [375](capturas-listados/rugby-375.png), [393](capturas-listados/rugby-393.png), [768](capturas-listados/rugby-768.png), [1024](capturas-listados/rugby-1024.png), [1440](capturas-listados/rugby-1440.png). Se inspeccionaron las de mobile y desktop contra R009/R005. Se ajustaron separación vertical, proporción de fotos y dos/cuatro columnas; no se modificaron header ni footer para acomodar las exportaciones.

Pendiente de aprobación humana: tipografías oficiales (Arial/Impact siguen siendo fallbacks), nombres comerciales contradictorios, espaciados finales y adaptación tablet. Las etiquetas largas se truncan visualmente en una línea como en mobile, conservando el texto completo en DOM/título accesible. Los otros listados reutilizan este diseño como adaptación, no como mockups específicos del diseñador. Training/Instituciones/Hockey masculino carecen de registros verificados; no se inventaron productos para completar sus grillas.

No hay fotos de Rugby pendientes de selección para este listado. Sí quedan por revisar las galerías adicionales, guía de talles, descripciones y las restantes asociaciones del catálogo original, que no se incorporaron masivamente.

## Archivos afectados

Nuevos componentes: PaginaListadoProductos.jsx, GrillaProductos.jsx, TarjetaProducto.jsx y EncabezadoColeccion.jsx. Nuevos hook/servicio: useProductos.js y catalogo.js. Estilos: productos.css. Scripts: verificar-catalogo.mjs y comprobar-listados.cjs.

Adaptados: CategoryPage.jsx, HomePage.jsx, ContenidoDeportes.jsx, ProductosDestacados.jsx e inicio.css, para reutilizar la tarjeta sin dos implementaciones paralelas. Datos: products.json, home.json, categories.json, selección y manifiesto de assets; ocho WebP adicionales. Documentación y capturas actualizadas. La edición previa de etiqueta en navigation.json se preservó; no fue necesaria una reestructuración de navegación en esta etapa.

## Aprendizaje

map transforma cada producto del array en una tarjeta. filter selecciona los que pertenecen a la colección sin ordenar el resto. key usa un ID estable para que React reconozca cada tarjeta aunque cambie de lugar. useParams obtiene la categoría/subcategoría desde la URL; sus slugs se resuelven contra categories.json. La tarjeta recibe props y se usa en varias páginas sin conocer cómo se descargó el JSON.

Para agregar un producto: crear un registro único en products.json con nombre real, slug único, categoryIds existentes, image preparada y gallery válida. Su posición en el array determina el orden del listado. Si debe aparecer destacado, agregar su ID a featuredProductIds en home.json. No inventar variantes/descripciones para completar campos opcionales. Validar datos y rutas antes de publicar.

Tres archivos para estudiar:

- `web/src/pages/PaginaListadoProductos.jsx`: carga y filtrado.
- `web/src/components/productos/TarjetaProducto.jsx`: props, Link, imagen y jerarquía de títulos.
- `web/public/data/products.json`: fuente única de productos, orden y relaciones.

Ejercicio manual: mové Medias Largas al primer lugar del array, recargá Rugby y observá qué pasa en Home. Después restaurá el orden original. No se resolvió el ejercicio por vos; es distinto de la prueba automatizada temporal ya realizada.

No se avanzó al Prompt 9: las fichas siguen siendo provisionales.
