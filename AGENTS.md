# Repository Guidelines

## Proyecto y estructura
QUINCE utilizará React.js con Vite, React Router, CSS responsive y archivos JSON para el catálogo. Actualmente esta carpeta contiene dos archivos ZIP de recursos; todavía no hay código fuente, `package.json`, pruebas ni repositorio Git inicializado.

- `PAGINA WEB QUINCE-*.zip`: referencias desktop y mobile, y portadas de categorías.
- `FOTOS FINALES QUINCE-*.zip`: fotografías de productos organizadas por prenda.

Al implementar la aplicación, organizar componentes reutilizables en `src/components/`, pantallas en `src/pages/`, catálogo en `src/data/` y estilos en `src/styles/`. Estas rutas son una convención propuesta, no carpetas existentes.

## Desarrollo y comandos
No hay comandos ejecutables configurados actualmente. Cuando exista `package.json`, revisar sus scripts antes de ejecutar comandos. En una configuración Vite habitual:

- `npm install`: instalar las dependencias declaradas.
- `npm run dev`: iniciar el servidor local.
- `npm run build`: generar los archivos de producción.
- `npm run preview`: revisar la compilación localmente.

No asumir que existen scripts de lint o pruebas; utilizar únicamente los definidos por el proyecto.

## Diseño, código y datos
Consultar las referencias del diseñador antes de crear pantallas. Respetar colores, tipografías, espaciados y estilos; no inventar decisiones visuales. Adaptar cada sección a desktop y mobile.

Usar dos espacios para indentar, componentes React en PascalCase y funciones y variables en camelCase. Mantener componentes reutilizables para productos y categorías. Leer el contenido desde JSON: no escribir productos directamente en JSX ni inventar precios, disponibilidad u otra información comercial. Adoptar las herramientas de formato y lint que se configuren posteriormente.

## Recursos e imágenes
Utilizar los recursos locales suministrados. No sustituir fotografías reales por imágenes genéricas. Conservar los originales y optimizar las copias destinadas a producción, verificando calidad, dimensiones y peso.

## Verificación y entregas
Actualmente no existe un framework de pruebas ni un requisito de cobertura. Al agregar pruebas, seguir las convenciones del framework elegido. Antes de terminar, comprobar compilación, navegación, carga del catálogo, imágenes y presentación desktop/mobile según corresponda.

No hay historial Git para deducir convenciones de commits. Usar mensajes breves e imperativos. En cada pull request, explicar el cambio, vincular la tarea si existe e incluir capturas para cambios visuales y las verificaciones realizadas.

## Alcance del trabajo
Modificar solamente lo solicitado. No agregar funcionalidades sin aprobación. Al entregar, resumir los archivos modificados, las pruebas realizadas y cualquier limitación pendiente.
#Aprendizaje 
#Aprendizaje
Al finalizar cada implementación, agregá una sección breve titulada 'Aprendizaje'. Explicá qué conceptos de React, JavaScript o CSS aplicaste, qué archivos conviene que revise y proponé un pequeño ejercicio para que yo modifique algo manualmente. No hagas el ejercicio por mí. No conviertas la explicación en un tutorial largo: priorizá entender el código real del proyecto.

## semántica y estilo de código

- priorizar HTML semántico: header, nav, main,
  section, article, aside y footer solamente
  cuando correspondan por su significado real.
- respetar la jerarquía de títulos.
- utilizar botones para acciones y enlaces
  para navegación.
- mantener accesibilidad: alt descriptivos,
  labels, teclado y foco visible.
- usar nombres descriptivos en español.
- escribir comentarios breves, en criollo
  y comenzando en minúscula.
- comentar la intención o lógica difícil,
  no las instrucciones obvias.
- respetar PascalCase para componentes,
  camelCase para variables y funciones,
  kebab-case para clases CSS.
- mantener los datos separados en JSON.
- evitar duplicación y abstracciones innecesarias.
- no sacrificar fidelidad visual, rendimiento,
  responsive ni funcionamiento general.
  