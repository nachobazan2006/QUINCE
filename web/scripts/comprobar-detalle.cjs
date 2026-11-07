const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function comprobar() {
  const web = path.resolve(__dirname, '..');
  const ruta = path.join(web, 'public/data/products.json');
  const original = await fs.readFile(ruta);
  const catalogo = JSON.parse(original);
  const carpeta = process.env.CARPETA_CAPTURAS || path.resolve(web, '../docs/capturas-detalle');
  await fs.mkdir(carpeta, { recursive: true });
  const pestana = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
  const conexion = new WebSocket(pestana.webSocketDebuggerUrl);
  await new Promise(resolver => conexion.addEventListener('open', resolver, { once: true }));
  const pendientes = new Map();
  const errores = [];
  let id = 0;
  let prueba = null;
  let modificado = null;
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
      const respuesta = prueba;
      if (respuesta.demora) await new Promise(resolver => setTimeout(resolver, respuesta.demora));
      try {
        await emitir('Fetch.fulfillRequest', { requestId: mensaje.params.requestId, responseCode: respuesta.estado,
          responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(respuesta.cuerpo).toString('base64') });
      } catch (error) {
        // StrictMode puede cancelar la primera solicitud mientras probamos la demora
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
  async function visitar(url, condicion = `document.querySelector('.detalle-producto')`) {
    await evaluar('document.body.innerHTML = ""');
    await emitir('Page.navigate', { url });
    await esperar(condicion);
  }
  const slug = catalogo.products[0].slug;
  try {
    await emitir('Page.enable'); await emitir('Runtime.enable');
    for (const origen of ['http://127.0.0.1:5176', 'http://127.0.0.1:4173']) {
      for (const width of [375, 768, 1024, 1440]) {
        await emitir('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
        await visitar(origen + '/deportes/rugby', `document.querySelectorAll('.grilla-productos article').length === ${catalogo.products.filter(p => p.categoryIds.includes('rugby')).length}`);
        await evaluar(`document.querySelector('.grilla-productos a').click()`);
        await esperar(`document.querySelector('.detalle-producto')`);
        assert.equal(await evaluar('document.querySelector("main h1").textContent'), catalogo.products[0].name);
        assert.equal(await evaluar('document.querySelectorAll("main").length'), 1);
        assert.equal(await evaluar('document.documentElement.scrollWidth <= innerWidth'), true);
        assert.equal(await evaluar('document.querySelector(".volver-detalle").getAttribute("href")'), '/deportes/rugby');
        assert.equal(await evaluar('document.querySelector(".foto-principal-producto img").loading'), 'eager');
        assert.equal(await evaluar('document.querySelectorAll(".miniaturas-producto button").length'), 3);
        assert.equal(await evaluar('getComputedStyle(document.querySelector(".productos-relacionados")).display === "none"'), width < 1024);
        const ids = await evaluar(`[...document.querySelectorAll('.grilla-relacionados article')].map(item => item.dataset.producto)`);
        assert.equal(ids.length, 4); assert.equal(new Set(ids).size, 4); assert(!ids.includes(catalogo.products[0].id));
        await evaluar(`document.querySelector('[aria-label="Ver siguiente imagen"]').click()`);
        await esperar(`document.querySelector('.estado-galeria').textContent === 'Imagen 2 de 3'`);
        await evaluar(`document.querySelector('[aria-label="Ver imagen anterior"]').click()`);
        await esperar(`document.querySelector('.estado-galeria').textContent === 'Imagen 1 de 3'`);
        await evaluar(`document.querySelector('[aria-label="Ver imagen anterior"]').click()`);
        await esperar(`document.querySelector('.estado-galeria').textContent === 'Imagen 3 de 3'`);
        if (width >= 1024) {
          await evaluar(`document.querySelector('.miniaturas-producto button').click(); document.querySelector('.miniaturas-producto button').focus()`);
          await emitir('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight' });
          await esperar(`document.querySelector('.estado-galeria').textContent === 'Imagen 2 de 3'`);
          await emitir('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight' });
        }
        await evaluar(`document.querySelector('[aria-label="Ver siguiente imagen"]').focus()`);
        const antesEnter = await evaluar(`document.querySelector('.estado-galeria').textContent`);
        await emitir('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
        await emitir('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
        assert.notEqual(await evaluar(`document.querySelector('.estado-galeria').textContent`), antesEnter);
        await evaluar(`document.querySelector('.miniaturas-producto button').click(); document.activeElement.blur()`);
        if (width === 375) {
          await emitir('Emulation.setTouchEmulationEnabled', { enabled: true });
          const punto = await evaluar(`(() => { const r = document.querySelector('[aria-label="Ver siguiente imagen"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
          await emitir('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [punto] });
          await emitir('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
          await esperar(`document.querySelector('.estado-galeria').textContent === 'Imagen 2 de 3'`);
          await emitir('Emulation.setTouchEmulationEnabled', { enabled: false });
          await evaluar(`document.querySelector('[aria-label="Ver imagen anterior"]').click()`);
        }
        await esperar(`document.querySelector('.foto-principal-producto img').naturalWidth > 0`);
        if (origen.endsWith('4173')) {
          await evaluar(`Promise.all([...document.querySelectorAll('img')].filter(img => img.getBoundingClientRect().width > 0).map(img => { img.loading = 'eager'; return img.decode(); }))`);
          await evaluar('window.scrollTo(0, 0)');
          const medidas = await emitir('Page.getLayoutMetrics');
          const foto = await emitir('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
            clip: { x: 0, y: 0, width, height: medidas.cssContentSize.height, scale: 1 } });
          await fs.writeFile(path.join(carpeta, `detalle-${width}.png`), Buffer.from(foto.data, 'base64'));
        }
        await evaluar(`document.querySelector('.volver-detalle').click()`);
        await esperar(`location.pathname === '/deportes/rugby' && document.querySelector('.grilla-productos')`);
      }
      for (const producto of catalogo.products) {
        await visitar(origen + '/productos/' + producto.slug);
        assert.equal(await evaluar('document.querySelector("main h1").textContent'), producto.name);
        if (!producto.gallery.length) assert.equal(await evaluar('document.querySelector(".controles-galeria")'), null);
      }
      await visitar(origen + '/productos/no-existe', `document.querySelector('main h1')?.textContent.includes('Producto no encontrado')`);
      assert.equal(await evaluar('location.pathname'), '/productos/no-existe');
      await visitar(origen + '/productos/camiseta-rugby-body');
      await evaluar(`document.querySelector('.grilla-relacionados a').click()`);
      await esperar(`location.pathname === '/productos/${slug}' && document.querySelector('.estado-galeria')?.textContent === 'Imagen 1 de 3'`);
    }
    const copia = structuredClone(catalogo);
    copia.products[0].name = 'Nombre temporal de prueba';
    copia.products[0].description = 'Descripción temporal de prueba desde JSON.';
    modificado = Buffer.from(JSON.stringify(copia, null, 2) + '\n');
    await fs.writeFile(ruta, modificado);
    await visitar('http://127.0.0.1:5176/productos/' + slug);
    assert.equal(await evaluar('document.querySelector("main h1").textContent'), copia.products[0].name);
    assert.equal(await evaluar('document.querySelector(".descripcion-producto p").textContent'), copia.products[0].description);
    await fs.writeFile(ruta, original); modificado = null;
    for (const respuesta of [
      { estado: 200, cuerpo: '{', error: 'JSON inválido' },
      { estado: 503, cuerpo: '{}', error: 'HTTP 503' },
      { estado: 200, cuerpo: '{"products":[{}]}', error: 'campos obligatorios' },
      { estado: 200, cuerpo: JSON.stringify(catalogo), demora: 1200 },
    ]) {
      prueba = respuesta;
      await emitir('Fetch.enable', { patterns: [{ urlPattern: '*data/products.json' }] });
      await visitar('http://127.0.0.1:5176/productos/' + slug, respuesta.error
        ? `document.querySelector('[role="alert"]')?.textContent.includes('${respuesta.error}')`
        : `document.querySelector('[role="status"]')?.textContent.includes('Cargando')`);
      if (!respuesta.error) await esperar(`document.querySelector('.detalle-producto')`);
      await emitir('Fetch.disable');
    }
    assert.equal(errores.length, 0, JSON.stringify(errores));
    assert((await fs.readFile(ruta)).equals(original), 'El JSON debe quedar restaurado');
    console.log('OK: desarrollo y preview, 12 fichas, Rugby, galería, teclado, relacionados, volver, 404, una foto, 4 anchos sin desborde, JSON editable/restaurado, carga y errores. Sin errores JS de consola.');
  } finally {
    if (modificado && (await fs.readFile(ruta)).equals(modificado)) await fs.writeFile(ruta, original);
    conexion.close();
    await fetch('http://127.0.0.1:9333/json/close/' + pestana.id);
  }
}
comprobar().catch(error => { console.error(error); process.exitCode = 1; });
