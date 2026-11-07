# QUINCE — Informe de etapas 5, 6 y 7

## Alcance y fuentes

Se leyó AGENTS.md completo, incluida la nueva sección de semántica y estilo. Se consultaron auditoría, arquitectura, modelos de datos, inventario, mapeo, manifiesto, optimización y documentación del header/footer. Se inspeccionaron visualmente las copias originales de Home desktop, Home mobile y Deportes desktop/mobile, extraídas en la auditoría. Los contenedores actuales son `pagina-web.quince.zip` y `fotos-finales-quince.zip`.

Se respetó la autorización de avanzar consecutivamente por las tres etapas. No se hicieron commits, deploy, fichas de producto, filtros ni funcionalidades de venta. El header y footer aprobados conservan componentes y CSS; solo se actualizaron destinos y subcategorías en sus datos al preparar las rutas de etapa 7.

## Etapa 5 — Home superior

### Implementado

Cuatro portadas reales: Deportes, Training, Urbano e Instituciones. Desktop usa una tira de CSS Grid de cuatro columnas con separación estrecha, proporción vertical y textos/CTA superpuestos. El degradado ya incorporado en las fotografías se conserva; no se agregó otro. Mobile muestra una tarjeta protagonista y parte de la siguiente, con scroll-snap, gesto horizontal nativo, botones de indicadores y navegación por flechas/Home/End al enfocar la tira. Sin autoplay. El desplazamiento solicitado por botones respeta prefers-reduced-motion.

Tablet usa dos columnas desplazables como propuesta técnica: no hay referencia específica de tablet. Desde 1024 px se muestran las cuatro. El bloque introductorio gris conserva el texto de la referencia, centrado desktop y alineado a izquierda mobile; Conocé Quince enlaza a `/nosotros`.

Componentes: `PortadaInicio`, `PresentacionMarca`, `ImagenAdaptable` y `EnlaceAccion`. Se adaptó HomePage sin cambiar su ruta ni el layout aprobado. CSS de página elimina únicamente el padding del main que impedía el fondo gris de lado a lado; no modifica header/footer.

### Datos y fotografías

`home.json`: título, orden de secciones, IDs de categorías y bloque introductorio. `categories.json`: nombres, subtítulos, CTA y objetos de imagen con variantes. No hay textos comerciales ni rutas de fotos dentro del JSX. Portadas R017, R029, R031 y R023 del manifiesto, ya preparadas en Prompt 3. Primera imagen eager/high; otras lazy y con srcset/sizes, dimensiones reservadas y sin duplicar árboles desktop/mobile.

### Validación y diferencias

Build correcto antes de continuar a etapa 6. Edge en desarrollo/preview: 375, 600, 768, 900, 1024, 1200 y 1440 px, carrusel por indicadores, enlace Deportes, lectura de JSON e imagen principal, un H1 y ausencia de desborde horizontal. Se guardaron capturas de etapa 5 y se inspeccionaron las de 375/1440 contra los mockups.

Pendientes visuales: fuente oficial no entregada; Arial para cuerpo e Impact para títulos condensados son fallbacks, no identificación de fuentes originales. Los puntos desktop son ornamentales como en la captura estática; los controles mobile sí cambian de categoría. No se inventó una galería distinta por portada para justificar esos puntos. Las exportaciones no fijan una altura CSS exacta.

Aprendizaje: Grid distribuye columnas; mobile cambia el ancho de cada columna y permite scroll horizontal, sin apilar las cuatro. cover llena el marco conservando proporción y puede recortar bordes; contain muestra la imagen entera, con posibles espacios vacíos. Se usan marcos proporcionales y recortes mínimos coherentes con las referencias. El estado activa refleja la tarjeta visible y el scroll también lo actualiza al mover la tira.

Archivos para estudiar: `web/src/pages/HomePage.jsx`, `web/src/components/inicio/PortadaInicio.jsx`, `web/src/styles/inicio.css`.

## Etapa 6 — Home inferior

### Implementado

Cuatro destacados en desktop y tira horizontal en mobile/tablet, bloque Hacemos tu equipo, macro de chomba exclusivamente bajo breakpoint mobile/tablet y bloque negro Contanos qué necesitás. Se respetaron los textos de las capturas y su orden. No se agregaron precios, talles, stock ni descripciones.

ProductosDestacados se reutiliza en Home y Deportes. Cada tarjeta es un article con foto, h3 y categoría; no simula un enlace a una ficha no implementada. Las fotos inferiores tienen carga diferida. La imagen macro queda oculta en desktop y se carga diferida, evitando solicitarla como recurso prioritario.

### Identificación resuelta y datos

La revisión ampliada distinguió **P086**, frente recto de Force, de P085, toma de tres cuartos. Para la pollera, **P198** coincide con la mano derecha levantando el borde y mostrando la calza; P195 y P199 no muestran ese gesto. Se actualizó la confianza a alta por esa evidencia visual. No se confundió una prenda identificada con una validación de todas sus variantes comerciales.

Se agregaron esas dos entradas a la selección reproducible y se actualizaron los nombres de contenedores, que habían sido renombrados por el usuario. El optimizador produjo cuatro WebP nuevos y reutilizó los 41 previos. Resultado actual: 21 fuentes, 45 variantes, 29.381.794 bytes de fuentes seleccionadas frente a 1.842.988 bytes de todas las variantes juntas (93,73 % menos). Ver manifiesto, que incluye hashes originales y derivados; los ZIP se verificaron antes/después del proceso.

Datos editoriales de destacados en `home.json`, no fichas en `products.json`: nombres exactos visibles en el diseño, IDs técnicos, categoryId y objeto de imagen. `products.json` sigue vacío; no se crearon slugs comerciales ni rutas individuales ficticias. Las fotos son P062 (Air Fit), P086 (Force), P198 (pollera) y P002 (bermuda); macro R028.

### Validación y bloqueos

Antes de etapa 7: build correcto, 45 variantes y seis JSON verificados public/dist/HTTP; Home y carrusel reprobados en siete anchos y ambos servidores. Se inspeccionaron capturas desktop/mobile de etapa 6 contra originales, tras desplazar la página para cargar las fotos diferidas.

**Cotizar mi equipo y Hablemos no tienen destino confirmado**. Sus rótulos y aspecto están implementados, pero se muestran como texto con estado deshabilitado, sin href ficticio. Su funcionalidad queda bloqueada hasta recibir URL/canal aprobado. La macro aparece solo en mobile según referencia; esa diferencia todavía requiere aprobación visual. El trazo de fuentes provisionales sigue impidiendo afirmar fidelidad tipográfica final.

Archivos para estudiar: `web/src/components/inicio/ProductosDestacados.jsx`, `web/src/components/inicio/PresentacionMarca.jsx`, `web/public/data/home.json`.

## Etapa 7 — Categorías

### Implementado y reutilización

Deportes: regreso a Inicio, título, portadas Rugby, Hockey femenino, Hockey masculino y Fútbol; mismos destacados editoriales de Home. Usa PortadaInicio, ProductosDestacados y el nuevo ContenidoDeportes. Los espacios de las cuatro columnas se ajustaron a su referencia específica, más amplios que los de Home. Los indicadores desktop se muestran por tarjeta como en el mockup; la flecha que parece anticipar contenido adicional no se habilitó sin definir ese contenido.

Se preservó `/deportes/rugby` y la etiqueta del ejercicio en navegación; el título de categoría sigue viniendo de categories.json. Se agregaron las tres disciplinas visibles restantes y rutas `/deportes/hockey-femenino`, `/deportes/hockey-masculino`, `/deportes/futbol`. Sus listados siguen pendientes; no se desarrolló un catálogo de fichas por anticipado.

Se habilitaron `/training`, `/urbano`, `/instituciones`, con registros reales de categorías/portadas y vínculos desde Home/menú. Footer habilita Urbano e Instituciones; Fitness sigue sin alias a Training, porque esa equivalencia no está confirmada.

### Bloqueo parcial explícito

**Training, Urbano e Instituciones NO tienen diseño interior implementado.** Tras revisar toda la documentación y las referencias, solo hay portadas para esas líneas. Las rutas muestran su nombre y un aviso técnico proveniente de JSON. Es continuidad técnica, no una propuesta visual definitiva ni una sección comercial terminada. El trabajo dependiente de esos diseños se detuvo; Deportes y las demás tareas respaldadas continuaron.

No se asignaron arbitrariamente Buzos, Remeras, Colegios o Universidades como hijos de esas líneas. Tampoco se sustituyó la falta de pantallas con una grilla genérica. Las fotografías asociadas están disponibles en datos y en la portada principal, pero no justifican por sí solas un layout interior.

### Datos, imágenes y pruebas

`categories.json` contiene relaciones parentId, childIds ordenados para Deportes, designStatus, mensaje técnico pendiente y referencia al ID de sección de destacados. `home.json` conserva una única fuente de destacados. Se actualizaron `navigation.json` y destinos confirmados de `footer.json`, sin cambiar IDs o rutas anteriores. Imágenes deportivas R026, R021, R022 y R019, sin imágenes nuevas de terceros.

Verificación final en Edge para desarrollo 5175 y preview 4173: Home/Deportes en siete anchos, cuatro portadas y cuatro destacados, lectura de imagen principal, indicadores mobile, cierre de menú, navegación a Rugby, rutas interiores pendientes, Nosotros y 404 de ruta/producto inexistentes. Se interceptó temporalmente home.json con otro título introductorio y se comprobó el cambio sin recompilar ni escribir datos de prueba. Sin errores de consola registrados.

Build final correcto; `npm run assets:verify -- http://127.0.0.1:4173/` correcto. Dev se inició mediante `npm run dev -- --host 127.0.0.1 --port 5175 --strictPort`. No se instalaron librerías adicionales. Automatizaciones usadas: `%TEMP%/quince-audit/check-inicio.cjs` y `check-etapas.cjs`; el verificador de recursos sí queda versionable dentro del proyecto. No hay medición Lighthouse ni certificación WCAG.

Archivos para estudiar: `web/src/pages/CategoryPage.jsx`, `web/src/components/categorias/ContenidoDeportes.jsx`, `web/public/data/categories.json`.

## Capturas finales y comparación visual

Se generaron y revisaron capturas reales contra las referencias; no son mockups generados. Las de tablet muestran una adaptación propuesta porque no hay diseño específico para ese ancho.

- Home: [375](capturas-etapas/final-home-375.png), [768](capturas-etapas/final-home-768.png), [1024](capturas-etapas/final-home-1024.png), [1440](capturas-etapas/final-home-1440.png).
- Deportes: [375](capturas-etapas/final-deportes-375.png), [768](capturas-etapas/final-deportes-768.png), [1024](capturas-etapas/final-deportes-1024.png), [1440](capturas-etapas/final-deportes-1440.png).

La estructura, orden, fotos, fondos y alineaciones corresponden a las referencias. La tipografía provisional, escala de exportaciones y el Inicio adicional del header aprobado producen diferencias; no se declara aprobación visual definitiva. Las fotos originales siguen intactas.

## Archivos afectados

Nuevos: `ImagenAdaptable.jsx`, `EnlaceAccion.jsx`, `PortadaInicio.jsx`, `PresentacionMarca.jsx`, `ProductosDestacados.jsx`, `ContenidoDeportes.jsx`, `inicio.css`, `categorias.css`, cuatro WebP de dos fotos confirmadas, este informe y capturas por etapa.

Modificados: HomePage.jsx, CategoryPage.jsx, home.json, categories.json, navigation.json, footer.json, selección de assets, manifiesto y documentación de datos/mapeo/inventario. El código de header, menú y footer no se reestructuró.

## Aprendizaje y ejercicio

El flujo sigue siendo JSON → fetch/hook → props → componentes. section agrupa cada bloque con su título, article identifica cada portada/tarjeta, h1 da identidad a la página y h2/h3 organizan secciones y tarjetas. Los enlaces navegan; los botones de indicadores y las flechas del teclado cambian el estado/scroll del carrusel. No se usaron divs como botones ni imágenes para reemplazar pantallas completas.

Ejercicio manual: cambiá solo el subtítulo de Deportes en categories.json, recargá Home y verificá que cambia el texto sobre la foto sin alterar imagen ni destino. Después observá cómo PortadaInicio recibe ese dato por props. No se resolvió el ejercicio por vos.

## Aprobaciones necesarias antes del Prompt 8

1. Composición, espaciados, tipografía provisional y adaptación tablet de Home y Deportes.
2. Confirmación editorial de las tomas P086/P198 y de los cuatro nombres de destacados.
3. Destinos de Cotizar mi equipo y Hablemos.
4. Diseños interiores y jerarquías de Training, Urbano e Instituciones; relación Training/Fitness.
5. Alcance de los indicadores/flechas desktop y si existen más categorías para avanzar.
6. Logo/fuentes definitivos y las diferencias responsive pendientes de auditoría.

No se avanzó al Prompt 8.
