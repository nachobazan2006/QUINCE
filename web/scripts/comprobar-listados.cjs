const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function comprobar() {
  const desarrollo = process.env.URL_DESARROLLO || 'http://127.0.0.1:5176';
  const preview = process.env.URL_PREVIEW || 'http://127.0.0.1:4173';
  const depuracion = process.env.URL_DEPURACION || 'http://127.0.0.1:9333';
  const web = path.resolve(__dirname, '..');
  const carpeta = path.resolve(web, '../docs/capturas-listados');
  const rutaProductos = path.join(web, 'public/data/products.json');
  const original = await fs.readFile(rutaProductos);
  const catalogo = JSON.parse(original);
  const rugby = catalogo.products.filter(producto => producto.categoryIds.includes('rugby'));
  await fs.mkdir(carpeta, { recursive: true });
  const respuesta = await fetch(`${depuracion}/json/new?about:blank`, { method: 'PUT' });
  assert(respuesta.ok, 'Se necesita Edge/Chromium con depuración local activa');
  const pestana = await respuesta.json();
  const conexion = new WebSocket(pestana.webSocketDebuggerUrl);
  await new Promise(resolver => conexion.addEventListener('open', resolver, { once: true }));
  let siguienteId = 0;
  let interceptar = null;
  let modificado = null;
  const pendientes = new Map();
  const errores = [];
  function emitir(method, params = {}) {
    return new Promise((resolver, rechazar) => {
      pendientes.set(++siguienteId, { resolver, rechazar });
      conexion.send(JSON.stringify({ id: siguienteId, method, params }));
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
      const prueba = interceptar;
      if (prueba.demora) await new Promise(resolver => setTimeout(resolver, prueba.demora));
      await emitir('Fetch.fulfillRequest', { requestId: mensaje.params.requestId, responseCode: prueba.estado,
        responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
        body: Buffer.from(prueba.cuerpo).toString('base64') });
    }
  });
  async function evaluar(expression) {
    const resultado = await emitir('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert(!resultado.exceptionDetails, JSON.stringify(resultado.exceptionDetails));
    return resultado.result.value;
  }
  async function esperar(expresion) {
    for (let intento = 0; intento < 200; intento++) {
      if (await evaluar(expresion)) return;
      await new Promise(resolver => setTimeout(resolver, 50));
    }
    throw Error(`Tiempo de espera agotado: ${expresion}`);
  }
  async function visitar(url, expresion) {
    // vaciamos la captura anterior para no aprobar una condición con el DOM de otra ruta
    await evaluar('document.body.innerHTML = ""');
    await emitir('Page.navigate', { url });
    await esperar(expresion);
  }
  async function ancho(width) {
    await emitir('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
  }
  async function capturar(nombre) {
    const cantidad = await evaluar('document.querySelectorAll(".grilla-productos img").length');
    for (let indice = 0; indice < cantidad; indice++) {
      await evaluar(`document.querySelectorAll('.grilla-productos img')[${indice}].scrollIntoView()`);
      await esperar(`document.querySelectorAll('.grilla-productos img')[${indice}].naturalWidth > 0`);
    }
    await evaluar(`Promise.all([...document.querySelectorAll('.grilla-productos img')].map(imagen => imagen.decode()))`);
    await evaluar('window.scrollTo(0, 0)');
    await evaluar('new Promise(resolver => setTimeout(resolver, 250))');
    const medidas = await emitir('Page.getLayoutMetrics');
    const imagen = await emitir('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: medidas.cssContentSize.width, height: medidas.cssContentSize.height, scale: 1 } });
    await fs.writeFile(path.join(carpeta, nombre + '.png'), Buffer.from(imagen.data, 'base64'));
  }
  try {
    await emitir('Runtime.enable');
    await emitir('Page.enable');
    await emitir('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    for (const origen of [desarrollo, preview]) {
      for (const medida of [375, 393, 600, 768, 900, 1024, 1200, 1440]) {
        await ancho(medida);
        await visitar(origen + '/deportes/rugby', `document.querySelectorAll('.grilla-productos article').length === 8`);
        assert.equal(await evaluar('document.documentElement.scrollWidth <= innerWidth'), true);
        assert.equal(await evaluar(`getComputedStyle(document.querySelector('.grilla-productos')).gridTemplateColumns.split(' ').length`), medida < 1024 ? 2 : 4);
        assert.deepEqual(await evaluar(`[...document.querySelectorAll('.grilla-productos article')].map(tarjeta => tarjeta.dataset.producto)`), rugby.map(producto => producto.id));
        assert.deepEqual(await evaluar(`[...document.querySelectorAll('.grilla-productos a')].map(enlace => enlace.getAttribute('href'))`), rugby.map(producto => '/productos/' + producto.slug));
        assert.equal(await evaluar('document.querySelectorAll("main h1").length'), 1);
        assert.equal(await evaluar(`document.querySelector('.cabecera-categoria a').getAttribute('href')`), '/deportes');
        assert.equal(await evaluar(`document.querySelector('.grilla-productos img').loading`), 'eager');
        assert.equal(await evaluar(`document.querySelectorAll('.grilla-productos img')[7].loading`), 'lazy');
        if (origen === preview && [375, 393, 768, 1024, 1440].includes(medida)) await capturar('rugby-' + medida);
      }
      for (const [ruta, cantidad, nombre] of [
        ['/deportes/futbol', 1, 'Fútbol'], ['/deportes/hockey-femenino', 2, 'Hockey femenino'], ['/urbano', 1, 'Urbano'],
      ]) {
        await visitar(origen + ruta, `document.querySelectorAll('.grilla-productos article').length === ${cantidad}`);
        assert.equal(await evaluar('document.querySelector("main h1").textContent'), nombre);
        const ids = await evaluar(`[...document.querySelectorAll('.grilla-productos article')].map(tarjeta => tarjeta.dataset.producto)`);
        assert(!ids.some(id => rugby.some(producto => producto.id === id)), 'Se mezclaron colecciones');
        const destinos = await evaluar(`[...document.querySelectorAll('.grilla-productos a')].map(enlace => enlace.getAttribute('href'))`);
        assert.deepEqual(destinos, ids.map(id => '/productos/' + catalogo.products.find(producto => producto.id === id).slug));
      }
      for (const ruta of ['/training', '/instituciones', '/deportes/hockey-masculino']) {
        await visitar(origen + ruta, `document.querySelector('.estado-coleccion')?.textContent.includes('Todavía no')`);
      }
      for (const ruta of ['/deportes/no-existe', '/urbano/rugby', '/no-existe', '/productos/no-existe']) {
        await visitar(origen + ruta, `document.querySelector('main h1')?.textContent.includes('404')`);
        assert.equal(await evaluar('location.pathname'), ruta);
      }
      for (const producto of catalogo.products) {
        await visitar(origen + '/productos/' + producto.slug, `document.querySelector('main h1')?.textContent === ${JSON.stringify(producto.name)}`);
        assert(await evaluar(`document.querySelector('main').textContent.includes('Detalle pendiente')`));
      }
      for (const ruta of ['/', '/deportes']) {
        await visitar(origen + ruta, `document.querySelectorAll('.tarjeta-destacado').length === 4`);
        const inicio = await (await fetch(origen + '/data/home.json')).json();
        assert.deepEqual(await evaluar(`[...document.querySelectorAll('.tarjeta-destacado')].map(tarjeta => tarjeta.dataset.producto)`), inicio.featuredProductIds);
      }
      await evaluar('window.__pruebaNavegacion = true');
      for (const disciplina of ['futbol', 'hockey-femenino', 'rugby']) {
        await evaluar(`document.querySelector('.categoria-portada a[href="/deportes/${disciplina}"]').click()`);
        await esperar(`location.pathname === '/deportes/${disciplina}' && document.querySelector('.grilla-productos') !== null`);
        assert.equal(await evaluar('window.__pruebaNavegacion'), true, 'El enlace recargó el documento');
        await evaluar(`document.querySelector('.cabecera-categoria a').click()`);
        await esperar(`location.pathname === '/deportes' && document.querySelectorAll('.categoria-portada').length === 4`);
      }
      await visitar(origen + '/deportes/rugby', `document.querySelectorAll('.grilla-productos article').length === 8`);
      await evaluar(`document.querySelector('.grilla-productos a').focus()`);
      await emitir('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
      await emitir('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await esperar(`location.pathname === '/productos/camiseta-rugby-oldies'`);
      console.log(`OK ${origen}: ocho anchos, Rugby, colecciones aisladas/vacías, 404, doce detalles provisionales y destacados.`);
    }
    // probamos una edición real y restauramos exactamente los bytes originales, incluso si falla la prueba
    const prueba = JSON.parse(original);
    prueba.products[0].name = 'Prueba temporal de nombre';
    [prueba.products[0], prueba.products[1]] = [prueba.products[1], prueba.products[0]];
    modificado = Buffer.from(JSON.stringify(prueba, null, 2) + '\n');
    await fs.writeFile(rutaProductos, modificado);
    await visitar(desarrollo + '/deportes/rugby', `document.querySelectorAll('.grilla-productos article').length === 8`);
    assert.deepEqual(await evaluar(`[...document.querySelectorAll('.grilla-productos h2')].slice(0, 2).map(titulo => titulo.textContent)`), ['Camiseta Rugby Body', 'Prueba temporal de nombre']);
    assert((await fs.readFile(rutaProductos)).equals(modificado), 'El archivo cambió durante la prueba; revisar antes de restaurar');
    await fs.writeFile(rutaProductos, original);
    modificado = null;
    await visitar(desarrollo + '/deportes/rugby', `document.querySelector('.grilla-productos h2')?.textContent === 'Camiseta Rugby Oldies'`);
    console.log('OK mantenimiento: nombre y orden editados en JSON, reflejados y restaurados byte a byte.');
    await emitir('Fetch.enable', { patterns: [{ urlPattern: '*/data/products.json', requestStage: 'Request' }] });
    for (const caso of [
      { estado: 200, cuerpo: '{', esperado: 'JSON inválido' },
      { estado: 404, cuerpo: '{}', esperado: 'HTTP 404' },
      { estado: 200, cuerpo: '{"products":{}}', esperado: 'lista de productos válida' },
      { estado: 200, cuerpo: '{"products":[{}]}', esperado: 'campos obligatorios inválidos' },
    ]) {
      interceptar = caso;
      await visitar(preview + '/deportes/rugby', `document.querySelector('main [role="alert"]')?.textContent.includes(${JSON.stringify(caso.esperado)})`);
    }
    interceptar = { estado: 200, cuerpo: original.toString(), demora: 1000 };
    await visitar(preview + '/deportes/rugby', `document.querySelector('main [role="status"]')?.textContent.includes('Cargando')`);
    await esperar(`document.querySelectorAll('.grilla-productos article').length === 8`);
    await emitir('Fetch.disable');
    assert.equal(errores.length, 0, JSON.stringify(errores));
    console.log('OK carga, errores de lectura/sintaxis/esquema y ausencia de errores de consola de React.');
  } finally {
    if (modificado) {
      const actual = await fs.readFile(rutaProductos);
      if (actual.equals(modificado)) await fs.writeFile(rutaProductos, original);
      else console.error('El JSON recibió otro cambio: no se sobrescribió esa edición.');
    }
    await emitir('Fetch.disable').catch(() => {});
    await emitir('Page.close').catch(() => {});
    conexion.close();
  }
}
comprobar().catch(error => { console.error(error); process.exitCode = 1; });
