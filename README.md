# QUINCE

Sitio oficial de QUINCE en desarrollo con React, Vite, React Router, CSS y datos JSON públicos.

## Estado del progreso

- Auditoría visual, arquitectura y preparación de recursos realizadas.
- Header, navegación responsive y footer implementados.
- Home superior/inferior y página Deportes implementadas, pendientes de aprobación visual.
- Training, Urbano e Instituciones tienen rutas/datos preparados; sus interiores esperan referencias del diseñador.
- Prompt 8: listados dinámicos con 12 productos reales, tarjeta compartida con destacados y estados de carga/error/vacío. Rugby tiene ocho artículos, Fútbol uno, Hockey femenino dos y Urbano uno.
- Las fichas individuales siguen siendo provisionales; no se desarrollaron su diseño completo, filtros ni compra. Quedan tres pasos del plan de implementación informado al iniciar el Prompt 8.

Ver [informe de etapas 5–7](docs/etapas-5-6-7.md), [guía de datos](docs/modelos-datos.md) y [documentación de la aplicación](web/README.md).

Informe vigente de listados, capturas y aprendizaje: [Prompt 8](docs/listados-productos.md). Verificación de catálogo: desde web, `node scripts/verificar-catalogo.mjs`. Las pruebas de navegador reproducibles y sus requisitos están documentados en ese informe.

## Ejecutar localmente

Node 22.12 o superior compatible con las dependencias del proyecto.

```sh
cd web
npm install
npm run dev
```

En PowerShell, usar `npm.cmd` si la política de ejecución bloquea `npm.ps1`.

```sh
npm run build
npm run assets:verify
npm run preview
```

La compilación queda en `web/dist/`. El verificador comprueba imágenes, JSON y referencias de la compilación. El hosting definitivo deberá servir index.html para rutas SPA internas, conservando las respuestas de archivos estáticos/JSON.

## Recursos y datos

`web/public/data/` contiene los textos, navegación y relaciones editables. `web/public/images/` contiene las copias optimizadas utilizadas por la web. Los cambios en JSON de desarrollo requieren recargar; preview usa la copia generada por el último build.

Los ZIP originales del cliente no se versionan por su tamaño. Para ejecutar de nuevo `npm run assets:optimize`, colocar en la raíz las copias originales `pagina-web.quince.zip` y `fotos-finales-quince.zip`, sin alterarlas. Sus rutas y hashes están documentados en `docs/manifiesto-assets.json`. No hacen falta esos ZIP para instalar, desarrollar o compilar las imágenes ya preparadas.

No se suben node_modules, dist ni archivos de entorno. El logo PNG provisional del cliente y las capturas de validación se conservan para documentar el progreso. El repositorio es una entrega de desarrollo; no implica publicación del sitio ni aprobación final de diseño/contenido.
