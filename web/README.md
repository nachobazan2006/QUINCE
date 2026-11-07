# QUINCE — Base React

Actualización etapas 5–7: Home superior/inferior y Deportes ya tienen implementación visual; las páginas internas de Training/Urbano/Instituciones están bloqueadas por falta de diseño. Ver el [informe vigente](../docs/etapas-5-6-7.md), sus capturas y la lista de aprobaciones. Las descripciones de infraestructura siguientes conservan el estado histórico del Prompt 2. El servidor de revisión de estas etapas se inició en http://127.0.0.1:5175/; preview en 4173.

Infraestructura del Prompt 2. Pantallas mínimas de navegación; el diseño final y el catálogo siguen pendientes. Se preservaron `AGENTS.md`, la auditoría y ambos ZIP en la raíz. No se crearon directorios vacíos de referencias ni se copiaron los 551 MiB a `public/`.

## Ejecución

Requisito: Node 22.12 o superior compatible con Vite (ver `package.json`). Entorno comprobado: Node 22.19.0, Windows. Desde `web/`:

```powershell
npm install
npm run dev
npm run build
npm run preview
```

Si PowerShell bloquea `npm.ps1`, usar `npm.cmd` en esos comandos. `dev` sirve el proyecto para editar; `build` genera `dist/`; `preview` sirve esa compilación localmente. Preview no es el servidor definitivo de producción.

## Árbol de archivos fuente creados

```text
web/
├── .gitignore
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── public/
│   ├── data/
│   │   ├── navigation.json
│   │   ├── home.json
│   │   ├── categories.json
│   │   ├── products.json
│   │   └── about.json
│   └── images/.gitkeep
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── components/
    │   ├── common/DataState.jsx
    │   └── layout/Layout.jsx
    ├── hooks/useData.js
    ├── services/data.js
    ├── styles/base.css
    └── pages/
        ├── HomePage.jsx
        ├── CategoryPage.jsx
        ├── ProductPage.jsx
        ├── AboutPage.jsx
        └── NotFoundPage.jsx
```

`node_modules/` y `dist/` se generan y se ignoran en Git. La carpeta de componentes comerciales se creará cuando se implementen tarjetas o galerías; hoy no contiene archivos innecesarios.

## Dependencias y decisiones

- React y React DOM 19.3.1: componentes funcionales y renderizado.
- React Router 7.18.5: modo declarativo (`BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`, `Outlet`, `useParams` importados de `react-router`). La rama estable 7 es compatible con el Node instalado; Router 8 requiere Node >=22.22.0.
- Vite 8.3.6 y plugin React 6.2.1: desarrollo, JSX/Fast Refresh y compilación. Son dependencias de desarrollo.

No se agregaron bibliotecas visuales, estado global ni herramientas de pruebas al proyecto. Versiones fijadas y lockfile para registrar la instalación. Instalación ejecutada con npm 6.14.18 del entorno: terminó correctamente, con avisos por binarios opcionales de otras plataformas y deprecación de `util._extend`; no se cambió el npm global. El intento previo de invocar npm 10 mediante npx no se utilizó para instalar el proyecto. La auditoría incluida en la instalación informó cero vulnerabilidades en ese momento; no es una garantía permanente.

Fuentes técnicas consultadas: [Vite](https://vite.dev/guide/) y [React Router declarativo](https://reactrouter.com/start/declarative/installation). Requisitos de versiones contrastados con metadatos de npm al instalar.

## Rutas

| Patrón | Estado actual |
| --- | --- |
| `/` | Lee `home.json` y muestra cantidad de secciones y aviso provisional. |
| `/:categorySlug` | Busca una categoría raíz válida; `/deportes` funciona. |
| `/:categorySlug/:subcategorySlug` | Valida relación padre/hija; `/deportes/rugby` lee el catálogo vacío. |
| `/productos/:slug` | Busca por slug en JSON. Actualmente todo producto devuelve la pantalla 404 porque no se inventaron fichas. |
| `/nosotros` | Lee `about.json`; no publica los textos comerciales cuestionados. |
| `*` y entidades no encontradas | Vista 404 con enlace de regreso. |

No se crearon pantallas para Training/Fitness, Urbano, Instituciones o Contacto: sus destinos y contenido siguen pendientes. La navegación provisional contiene únicamente Inicio, Deportes > Rugby y Nosotros. No representa el header definitivo.

## Datos y flujo

Ver [modelos de datos](../docs/modelos-datos.md). `useData('home')` llama a `readData`, que solicita `public/data/home.json` mediante `fetch`; el hook guarda carga/datos/error y cancela solicitudes al desmontarse. `DataState` recibe el estado por props; una función hija recibe los datos y los pasa a componentes de contenido. Las tarjetas futuras podrán recibir datos sin hacer fetch por su cuenta.

Los JSON no se importan desde JSX ni se incorporan al bundle JavaScript. `cache: 'no-store'` solicita una versión actualizada en cada lectura. Al actualizar JSON en el hosting, se verá en la próxima carga de esa página; no hay sondeo en tiempo real. La caché del CDN/hosting deberá respetar esa política. No almacenar secretos en archivos públicos.

## Compilación y hosting

Entregar el **contenido de `web/dist/`**, que incluye `index.html`, assets compilados y `data/*.json`. No entregar `node_modules`, ZIP originales ni código fuente como paquete de producción. No hay ejecutable de escritorio.

Para alojar bajo una subcarpeta, por ejemplo `/quince/`, cambiar `base` en `vite.config.js` antes de compilar, o ejecutar `npm run build -- --base=/quince/`. `BrowserRouter.basename` y las URLs de fetch usan `import.meta.env.BASE_URL`. Los enlaces del router son internos y relativos a esa base; las rutas de imágenes futuras se resolverán con `resourceUrl()`.

El servidor estático debe servir los archivos reales primero y devolver `index.html` para rutas SPA internas, por ejemplo `/deportes/rugby`. **No devolver HTML para JSON o assets inexistentes**: allí corresponde HTTP 404. Configuración concreta pendiente del hosting; no se configuró uno. La vista 404 del cliente no determina por sí misma el código HTTP del servidor.

## Validación ejecutada

- Instalación de dependencias completada; `npm run build` correcto, salida en `dist/`.
- `npm run dev` arrancó en `127.0.0.1:5173`; preview en `127.0.0.1:4173`.
- Edge headless, tanto desarrollo como preview: lectura real de Home y de los cinco JSON; enlaces Inicio → Deportes → Rugby; acceso directo a Nosotros; producto desconocido, categoría desconocida, subcategoría desconocida y ruta profunda desconocida → vista 404.
- Ancho 393 px: sin desborde horizontal en Inicio provisional. No equivale a validación del diseño responsive futuro.
- Intercepción temporal de respuestas en el navegador: JSON inválido, HTTP 404 y HTML servido como JSON muestran sus errores. Tras desactivar la intercepción, Home vuelve a leer correctamente. Sin modificar datos reales ni agregar productos ficticios.
- Sin excepciones JavaScript registradas durante esas comprobaciones. Sin advertencias de compilación.

La automatización de comprobación quedó en `%TEMP%/quince-audit/check-web.cjs`, fuera del proyecto, utilizando Edge/DevTools y Node existentes. No se instaló un framework de pruebas. No se probaron todavía productos reales, fidelidad visual ni un hosting de producción. Los campos de datos deben respetar el contrato documentado; no se incluyó un validador integral de esquemas.

## Aprendizaje

Vite sirve los módulos mientras editás y prepara los archivos finales al compilar. `main.jsx` encuentra el elemento HTML `root`, monta React y configura el router. `App.jsx` relaciona URLs con componentes de página. React Router cambia la vista al navegar con enlaces sin recargar todo el documento; por eso el hosting debe soportar rutas internas.

El camino del contenido es JSON público → `fetch` en el servicio → estado del hook → props del componente. `npm run dev` permite editar con actualización rápida; `npm run build` produce los archivos que se publicarán y no inicia un servidor.

Tres archivos para estudiar: `src/main.jsx`, `src/App.jsx` y `src/hooks/useData.js`.

Ejercicio manual: cambiá solamente la etiqueta de Inicio en `public/data/navigation.json`, recargá y observá qué cambia y qué no cambia en la URL. No se resolvió el ejercicio por vos.
