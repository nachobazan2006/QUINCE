# Tipografía de Conocé Quince

## Resultado y criterio

Se corrigió únicamente el enlace Conocé Quince de la presentación de Home. Se revisaron AGENTS.md, documentación de identidad, componentes/CSS, archivos tipográficos del proyecto y el ZIP original vigente `Downloads/QUINCE/pagina-web-quince.zip`. No hay fuentes entregadas ni especificación tipográfica confirmada. Los originales Home desktop.jpg y Home.jpg se inspeccionaron mediante copias temporales; no se modificaron.

Se probó primero **Poppins Medium 500**, según la candidata indicada por el usuario. Las letras resultaron más gruesas que las del mockup al comparar recortes ampliados. Se contrastó entonces **Poppins Regular 400**, que conserva la geometría y se acerca más al grosor observado. Esta última es la elección final, todavía provisional: comparar JPEG no permite certificar la familia original del diseñador.

Las capturas de la candidata 500 se conservan en `tipografia-conoce-quince/candidato-500/`. El peso 400 también se probó temporalmente a 18/17 px antes del ajuste final; ese ensayo está en regular/. No se publican esas fuentes de prueba: la aplicación incluye **un solo archivo WOFF2, Poppins Regular Latin**, de 7.884 bytes. La fuente se sirve localmente, sin llamadas a Google Fonts al visitar la web.

Fuente original del recurso: [metadatos de Poppins en Google Fonts](https://github.com/google/fonts/blob/main/ofl/poppins/METADATA.pb). Archivo web Latin v24: https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrJJfecg.woff2. Licencia [SIL OFL de Poppins](https://github.com/google/fonts/blob/main/ofl/poppins/OFL.txt), incluida para distribución en `web/public/fonts/OFL-Poppins.txt`.

SHA-256 del WOFF2 utilizado: `7D93459D86585BFCDBB7E0376056226ADB25821EE54B96236FE2123E9560929F`.

## Ajuste aplicado

| Propiedad | Desktop, desde 1024 px | Mobile/tablet, hasta 1023 px |
| --- | --- | --- |
| Fuente | Poppins Regular, 400 | Poppins Regular, 400 |
| Tamaño | 16 px | 17 px |
| Interlineado | 24 px | 24 px |
| Letter spacing | 0, sin espaciado añadido | 0, sin espaciado añadido |
| Padding | 10 px vertical / 12 px horizontal | 10 px vertical / 12 px horizontal |
| Tamaño medido | 147,64 × 44 px | 155,36 × 44 px |
| Apariencia | Fondo negro, texto blanco, radio 999 px | Igual |

El JPEG normalizado a 1440 px da un botón de aproximadamente 148 × 42 px; Home mobile normalizado a 393 px da 156 × 44 px. Se mantiene el mínimo táctil de 44 px existente. Las dimensiones medidas del JPEG son una referencia de proporciones, no una especificación oficial de CSS.

## Alcance del código

- `PresentacionMarca.jsx` agrega la clase enlace-conoce-quince solo a la acción de la sección con id presentacion, sin depender del texto editable.
- `boton-conoce-quince.css` define @font-face y reglas de mayor especificidad limitadas a ese enlace. El nombre CSS Poppins Quince identifica localmente el recurso; el nombre PostScript renderizado es Poppins-Regular.
- `src/assets/fonts/poppins-regular-latin.woff2` se incluye con hash en el build. font-display: swap mantiene legible el enlace durante la carga y font-synthesis: none evita un peso simulado.
- No se modificaron base.css, las reglas globales de enlace-accion, los otros botones, los textos JSON ni el destino `/nosotros`.

## Comparación y pruebas

Se capturó antes/después en preview a 375, 393, 768, 1024 y 1440 px, se inspeccionaron los recortes de contexto mobile/desktop y las comparaciones ampliadas de referencia/Arial/Poppins.

- [Comparación mobile](tipografia-conoce-quince/comparacion-mobile.png).
- [Comparación desktop](tipografia-conoce-quince/comparacion-desktop.png).
- En ambas, las filas son referencia, Arial anterior y Poppins 400 final. Las imágenes se amplían para inspección; las diferencias de antialiasing entre JPEG y navegador no son equivalencia de píxel.
- [Mediciones finales](tipografia-conoce-quince/despues/resultados.json), con nombre real de fuente, peso, dimensiones y estilos de todos los otros CTA.

`node scripts/comprobar-boton-conoce.cjs despues` comprueba la carga real de Poppins-Regular mediante CSS.getPlatformFontsForNode, peso 400, color/fondo/radio, navegación a Nosotros, ausencia de desborde y errores JS. Compara además estilos y dimensiones de **todos los otros enlaces de acción** contra la captura previa: permanecen iguales, al igual que la fuente del body.

`npm.cmd run build` y `git diff --check`: correctos. El build contiene un WOFF2 de 7,88 kB y la licencia. No se añadieron dependencias ni se hicieron commits.

Para repetir las capturas se necesitan preview 4173 y Edge con depuración 9333. `comprobar-boton-conoce.cjs antes` debe ejecutarse sobre la versión anterior al ajuste si se quiere reconstruir la línea base. `comparar-boton-conoce.mjs` recibe la carpeta temporal que contiene Home.jpg y Home desktop.jpg.

## Aprendizaje

@font-face carga el archivo de fuente; font-family lo aplica al elemento elegido. Una clase específica permite corregir el enlace sin alterar componentes que comparten enlace-accion. font-weight elige el peso real y padding controla el espacio alrededor del texto.

Tres archivos para revisar: PresentacionMarca.jsx, styles/boton-conoce-quince.css y scripts/comprobar-boton-conoce.cjs.

Ejercicio: cambiá temporalmente el padding horizontal de este enlace en DevTools y observá cómo cambia su ancho sin modificar la fuente. Después restauralo.
