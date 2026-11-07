const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function comprobar() {
  const web = path.resolve(__dirname, '..');
  const ruta = path.join(web, 'public/data/about.json');
  const original = await fs.readFile(ruta);
  const datos = JSON.parse(original);
  const pie = JSON.parse(await fs.readFile(path.join(web, 'public/data/footer.json'), 'utf8'));
  const carpeta = process.env.CARPETA_CAPTURAS || path.resolve(web, '../docs/capturas-nosotros');
  await fs.mkdir(carpeta, { recursive: true });
  const pestana = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
  const conexion = new WebSocket(pestana.webSocketDebuggerUrl);
  await new Promise(resolver => conexion.addEventListener('open', resolver, { once: true }));
  let id = 0;
  let modificado = null;
  let respuestaPrueba = null;
  const pendientes = new Map();
  const errores = [];
  function emitir(method, params = {}) {
    return new Promise((resolver, rechazar) => {
      pendientes.set(++id, { resolver, rechazar });
      conexion.send(JSON.stringify({ id, method, params }));
    });
  }
  conexion.addEventListener('message', async evento => {
    const mensaje = JSON.parse(evento.data);
    if (mensaje.id) {
      const pendiente = pendientes.get(mensaje.id);
      pendientes.delete(mensaje.id);
      mensaje.error ? pendiente.rechazar(mensaje.error) : pendiente.resolver(mensaje.result);
    } else if (mensaje.method === 'Runtime.exceptionThrown'
      || (mensaje.method === 'Runtime.consoleAPICalled' && mensaje.params.type === 'error')) errores.push(mensaje.params);
    else if (mensaje.method === 'Fetch.requestPaused') {
      try {
        await emitir('Fetch.fulfillRequest', { requestId: mensaje.params.requestId, responseCode: 200,
          responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
          body: Buffer.from(respuestaPrueba).toString('base64') });
      } catch (error) {
        // el modo estricto puede cancelar la primera solicitud al montar
        if (!error.message?.includes('Invalid InterceptionId')) throw error;
      }
    }
  });
  async function evaluar(expression) {
    const resultado = await emitir('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert(!resultado.exceptionDetails, JSON.stringify(resultado.exceptionDetails));
    return resultado.result.value;
  }
  async function esperar(expresion) {
    for (let intento = 0; intento < 160; intento++) {
      if (await evaluar(`Boolean(${expresion})`)) return;
      await new Promise(resolver => setTimeout(resolver, 50));
    }
    throw Error('Tiempo agotado: ' + expresion);
  }
  async function visitar(url, condicion = `document.querySelectorAll('.seccion-institucional').length === 2`) {
    await evaluar('document.body.innerHTML = ""');
    await emitir('Page.navigate', { url });
    await esperar(condicion);
  }
  try {
    await emitir('Page.enable'); await emitir('Runtime.enable');
    for (const origen of ['http://127.0.0.1:5176', 'http://127.0.0.1:4173']) {
      for (const width of [375, 393, 768, 1024, 1440]) {
        await emitir('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
        await visitar(origen + '/nosotros');
        assert.equal(await evaluar('document.querySelector("main h1").textContent'), datos.title);
        assert.deepEqual(await evaluar(`[...document.querySelectorAll('.seccion-institucional h2')].map(e => e.textContent)`), datos.sections.map(e => e.heading));
        assert.deepEqual(await evaluar(`[...document.querySelectorAll('.seccion-institucional p')].map(e => e.textContent)`), datos.sections.flatMap(e => e.paragraphs));
        assert.equal(await evaluar('document.querySelectorAll("main").length'), 1);
        assert.equal(await evaluar('document.querySelectorAll("main h1").length'), 1);
        assert.equal(await evaluar('document.documentElement.scrollWidth <= innerWidth'), true);
        assert.equal(await evaluar(`document.querySelector('.cabecera-categoria a').getAttribute('href')`), '/');
        assert.deepEqual(await evaluar(`[...document.querySelectorAll('footer .redes-sociales a')].map(e => e.href)`), pie.redes.map(e => e.href));
        assert.deepEqual(await evaluar(`[...document.querySelectorAll('.barra-social a')].map(e => e.href)`), pie.redes.map(e => e.href));
        assert.equal(await evaluar(`document.querySelector('footer [aria-disabled="true"]') !== null`), true);
        assert.equal(await evaluar(`document.querySelector('a[href="/contacto"],a[href="#"],a[href="null"]')`), null);
        assert.equal(await evaluar(`document.querySelectorAll('footer').length`), 1);
        if (origen.endsWith('4173')) {
          await evaluar(`Promise.all([...document.querySelectorAll('img')].map(img => img.decode()))`);
          const medidas = await emitir('Page.getLayoutMetrics');
          const imagen = await emitir('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
            clip: { x: 0, y: 0, width, height: medidas.cssContentSize.height, scale: 1 } });
          await fs.writeFile(path.join(carpeta, `nosotros-${width}.png`), Buffer.from(imagen.data, 'base64'));
        }
        await evaluar(`window.__pruebaNosotros = true; document.querySelector('.cabecera-categoria a').click()`);
        await esperar(`location.pathname === '/' && document.querySelector('.pagina-inicio')`);
        if (width < 1024) {
          await evaluar(`document.querySelector('.abrir-menu').click()`);
          await esperar(`document.querySelector('.menu-movil').open`);
          await evaluar(`document.querySelector('.menu-movil a[href="/nosotros"]').click()`);
        } else await evaluar(`document.querySelector('.navegacion-escritorio a[href="/nosotros"]').click()`);
        await esperar(`location.pathname === '/nosotros' && document.querySelector('.seccion-institucional')`);
        assert.equal(await evaluar('window.__pruebaNosotros'), true);
        assert.equal(await evaluar(`document.querySelector('.menu-movil').open`), false);
        await evaluar(`document.querySelector('.cabecera-categoria a').click()`);
        await esperar(`document.querySelector('.pagina-inicio')`);
        await evaluar(`document.querySelector('footer a[href="/nosotros"]').click()`);
        await esperar(`location.pathname === '/nosotros' && document.querySelector('.seccion-institucional')`);
      }
      await visitar(origen + '/contacto', `document.querySelector('main h1')?.textContent.includes('404')`);
      assert.equal(await evaluar('location.pathname'), '/contacto');
    }
    const copia = structuredClone(datos);
    copia.sections[0].paragraphs[0] = 'Texto institucional temporal desde JSON.';
    modificado = Buffer.from(JSON.stringify(copia, null, 2) + '\n');
    await fs.writeFile(ruta, modificado);
    await visitar('http://127.0.0.1:5176/nosotros');
    assert.equal(await evaluar('document.querySelector(".seccion-institucional p").textContent'), copia.sections[0].paragraphs[0]);
    await fs.writeFile(ruta, original); modificado = null;
    for (const cuerpo of ['{', '{"title":"Nosotros","sections":[{}]}']) {
      respuestaPrueba = cuerpo;
      await emitir('Fetch.enable', { patterns: [{ urlPattern: '*data/about.json' }] });
      await visitar('http://127.0.0.1:5176/nosotros', `document.querySelector('main [role="alert"]')`);
      await emitir('Fetch.disable');
    }
    assert.equal(errores.length, 0, JSON.stringify(errores));
    assert((await fs.readFile(ruta)).equals(original));
    console.log('OK: Nosotros directo/header/footer/volver en desarrollo y preview; 375/393/768/1024/1440 sin desborde; textos JSON; redes configuradas; contacto pendiente/404; edición restaurada; errores controlados; sin errores JS de consola.');
  } finally {
    if (modificado && (await fs.readFile(ruta)).equals(modificado)) await fs.writeFile(ruta, original);
    conexion.close();
    await fetch('http://127.0.0.1:9333/json/close/' + pestana.id);
  }
}
comprobar().catch(error => { console.error(error); process.exitCode = 1; });
