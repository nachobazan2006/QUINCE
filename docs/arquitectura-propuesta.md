# QUINCE — Arquitectura propuesta

## Estado y alcance

Propuesta documental para React con Vite, React Router y CSS responsive. No hay código, dependencias, configuración ni datos funcionales creados. Las páginas y controles se derivan de [auditoria-visual.md](auditoria-visual.md); las asociaciones fotográficas y sus dudas están en [mapeo-imagenes.md](mapeo-imagenes.md).

## Páginas y rutas a validar

| Página propuesta | Ruta orientativa, no creada | Evidencia | Límite |
| --- | --- | --- | --- |
| Inicio | `/` | Home desktop/mobile | Confirmar diferencias de macro y secuencia horizontal. |
| Colección de categorías | `/deportes` | Deportes desktop/mobile | Reutilizar patrón para otras secciones solo tras aprobar sus contenidos/layouts. |
| Listado | `/deportes/rugby` | Listado Rugby desktop/mobile | No extender automáticamente a filtros, búsqueda, ordenación o paginación. |
| Detalle | `/productos/:slug` | Detalle desktop/mobile | Identidad Peak/Body/Oldies pendiente; no fijar aún slug comercial. |
| Nosotros | `/nosotros` | Solo mobile | Layout desktop y textos finales pendientes. |

Training, Fitness, Urbano, Instituciones y Contacto aparecen en navegación, portadas o CTA, pero no tienen pantallas completas entregadas. Sus rutas y destinos deben acordarse; no generar páginas vacías ni enlaces simulados. No se observan carrito, pago, login ni stock: no forman parte de la propuesta.

Estructura posterior recomendada: `src/pages/`, `src/components/`, `src/data/`, `src/styles/` y un directorio de recursos web derivados cuya ubicación se definirá en la fase técnica. Los ZIP originales son fuentes, no archivos para cargar íntegramente en el navegador.

## Información que necesitarán los JSON

Los nombres siguientes son propuestas de archivos, **no archivos creados**. Los valores comerciales se incorporarán únicamente cuando estén confirmados. Las incidencias editoriales permanecerán en documentación hasta resolverlas; no publicar textos de ejemplo como contenido final.

| Datos propuestos | Campos necesarios | Fuente/decisión pendiente |
| --- | --- | --- |
| `site.json` | Marca, logoAssetId, idioma, grupos de footer, textos de copyright, enlaces sociales con label/url, CTA compartidos | Logo y URLs aún no suministrados. Confirmar año configurable. |
| `navigation.json` | id, label, destination, orden, parentId opcional; listas diferenciadas de header/footer | Resolver Training/Fitness y destinos. No convertir carpetas en navegación automáticamente. |
| `home.json` | Portadas ordenadas por categoryId/assetId, título, bajada y CTA; bloques institucionales; featuredProductIds; imagen macro y visibilidad por diseño aprobado | Textos visibles sirven como fuente a revisar; destinos no demostrados. |
| `categories.json` | id estable, slug aprobado, name, parentId, coverAssetId, description solo si existe, orden, productIds o relación equivalente | Distinguir línea, disciplina y tipo de prenda. Colegios/Universidades no tienen jerarquía confirmada. |
| `products.json` | id interno estable, slug aprobado, name, categoryIds, primaryImageId, gallery ordenada, descripción/características aprobadas, sizeGuideId opcional, relatedProductIds explícitos | Nombres inconsistentes; relación producto/foto no se deriva del nombre de carpeta únicamente. |
| `assets.json` | id, origen ZIP/ruta interna para trazabilidad, ruta web derivada futura, width, height, alt contextual, tipo de vista, focalPoint si se aprueba recorte | Separar archivo original del derivado web. Dimensiones disponibles en inventario. No generar derivados aún. |
| `institutional.json` | id de página/bloque, heading, paragraphs, orden y CTA si está aprobado | Revisar 2009/10 años/más de 100 clubes y descripción de campera. |
| `size-guides.json`, si se entrega | id, título, producto/categoría aplicable, unidad, columnas y filas reales o referencia al documento original | No hay tabla ni medidas aportadas. No inventarlas. |

### Modelo de producto y galería

Separar `id` técnico de `name` comercial y `slug`: las carpetas contienen erratas y no son identificadores comerciales confiables. Conservar trazabilidad del nombre original. Cada foto de galería necesita `assetId`, orden y rol observado —frente, espalda, prenda sin modelo o detalle—; los textos alternativos describirán la prenda visible sin inventar composición textil.

Las carpetas BODY, BOX y otras contienen prendas o colores diferentes. No asumir que todas sus imágenes forman una galería coherente ni que representan variantes a la venta. Validar agrupación foto por foto antes de cargar el catálogo. Los duplicados entre carpetas requieren decidir si son alias o productos distintos; no fusionarlos automáticamente.

No incorporar precios, moneda, disponibilidad, talles, colores seleccionables, SKU, composición o descripciones comerciales hasta recibir datos reales. No sustituir ausencia por cero, «disponible» o un precio ficticio. La guía visible permite proponer un vínculo opcional, no crear una tabla inventada.

## Componentes reutilizables y contratos de props

| Componente | Props conceptuales | Responsabilidad respaldada por diseño |
| --- | --- | --- |
| `SiteHeader` / `MainNavigation` / `MobileMenu` | logo, items, open, onClose | Navegación horizontal o menú mobile con cierre; comportamiento accesible por especificar. |
| `SocialLinks` / `SiteFooter` | links, groups, logo, copyright | Misma información en columnas o apilada. |
| `BackHeading` | title, destination | Flecha de regreso y título; decidir regreso jerárquico o historial con fallback. |
| `CategoryCard` / `CategoryCollection` | categories, image, title, subtitle, action | Portadas con textos sobrepuestos; colección horizontal adaptada. |
| `ProductCard` | product, image, categoryLabel, destination | Foto, nombre y categoría; sin precio ni compra. |
| `ProductGrid` | products | Cuatro columnas desktop/dos mobile según las referencias. |
| `FeaturedProducts` | title, products | Reutiliza tarjeta en una lista horizontal; avance pendiente. |
| `ProductGallery` | images, activeImageId, onSelect | Foto principal y miniaturas/flechas desktop; solución mobile pendiente de aprobar. |
| `ProductDetails` / `SizeGuideLink` | product, description, sizeGuide | Nombre/categoría y texto real; enlace cuando exista guía válida. |
| `RelatedProducts` | products, title | Relacionados explícitos desktop; confirmar tratamiento mobile. |
| `InstitutionalBlock` / `ContactCallout` | heading, body, action, image opcional | Variantes observadas claras/oscuras y bloque de imagen Home mobile. |
| `InstitutionalContent` | sections | Texto institucional de Nosotros sin datos comerciales inventados. |

Componer Inicio, Categorías, Listado, Detalle y Nosotros con estos bloques. Pasar datos mediante props; evitar duplicar productos en JSX o mantener copias divergentes entre Home, listado y relacionados. El JSON debe conservar el orden editorial, no depender del orden del sistema de archivos.

## Responsive: especificación y propuestas pendientes

**Respaldado por capturas:** navegación cambia a hamburguesa, Rugby pasa de cuatro a dos columnas, footer se apila, detalle coloca información debajo de la foto y Home cambia su alineación e incorpora una macro. No inferir que mobile es una reducción uniforme de desktop.

**Propuesta técnica por aprobar:** breakpoints según contenido; tratamiento tablet; scroll horizontal frente a carrusel controlado; equivalencia de indicadores y flechas; navegación de galería en mobile; presencia de relacionados; límites de truncado y nombres completos accesibles. No hay evidencia de autoplay, sticky header, zoom, transiciones ni gestos específicos.

Posteriormente prever semántica, foco visible, teclado, etiquetas para controles, contraste medido, textos alternativos y estados de datos faltantes. Son criterios de implementación, no estados diseñados ni funcionalidades comerciales adicionales. La escala de las exportaciones debe aclararse antes de fijar medidas CSS.

## Decisiones antes de programar

1. Aprobar mapa de navegación, equivalencia Training/Fitness y destinos de contacto, cotización y redes.
2. Confirmar nombres comerciales, identidad de la camiseta celeste, agrupación de variantes y relacionados.
3. Reemplazar descripción de campera y validar afirmaciones institucionales con el cliente.
4. Obtener logo independiente, fuentes autorizadas y guía de talles; acordar iconografía.
5. Confirmar tomas de confianza media y recortes; política para portadas de resolución limitada.
6. Acordar diferencias desktop/mobile y layouts no entregados; solicitar originales editables/especificación de fuentes, colores y escala si existen.
7. En una fase posterior autorizada, definir derivados responsivos, rutas públicas y presupuesto de peso por uso, sin alterar originales.

## Preparación para la siguiente fase

Hay material suficiente para **iniciar la configuración técnica de React tras la revisión y aprobación del usuario**. Los bloqueos son editoriales y de fidelidad visual: impiden cerrar una implementación publicable, pero no preparar el entorno. Esta fase no instala dependencias, no crea configuración, no realiza commits y no inicia automáticamente la Fase 2.
