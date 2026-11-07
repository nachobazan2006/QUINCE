const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
async function comprobar() {
  const web = path.resolve(__dirname, '..');
  const rutaPlan = path.resolve(web, process.argv[2] || '../docs/catalogo-importacion/plan-importacion.json');
  const plan = JSON.parse(await fs.readFile(rutaPlan));
  const productos = JSON.parse(await fs.readFile(path.join(web, 'public/data/products.json'))).products;
  const categorias = JSON.parse(await fs.readFile(path.join(web, 'public/data/categories.json'))).categories;
  const carpeta = path.join(path.dirname(rutaPlan), 'capturas');
  await fs.mkdir(carpeta, { recursive: true });
  const pestana = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
  const conexion = new WebSocket(pestana.webSocketDebuggerUrl);
  await new Promise(resolver => conexion.addEventListener('open', resolver, { once: true }));
  let id = 0;
  const pendientes = new Map(), errores = [];
  const emitir = (method, params = {}) => new Promise((resolver, rechazar) => {
    pendientes.set(++id, { resolver, rechazar }); conexion.send(JSON.stringify({ id, method, params }));
  });
  conexion.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id) { const p = pendientes.get(m.id); pendientes.delete(m.id); m.error ? p.rechazar(m.error) : p.resolver(m.result); }
    else if (m.method === 'Runtime.exceptionThrown' || m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errores.push(m.params);
  });
  async function evaluar(expression) {
    const r = await emitir('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert(!r.exceptionDetails, JSON.stringify(r.exceptionDetails)); return r.result.value;
  }
  async function esperar(expresion) {
    for (let i = 0; i < 160; i++) { if (await evaluar(`Boolean(${expresion})`)) return; await new Promise(r => setTimeout(r, 50)); }
    throw Error(expresion);
  }
  try {
    await emitir('Page.enable'); await emitir('Runtime.enable');
    for (const width of [375, 1440]) {
      await emitir('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
      for (const p of plan.aprobados) {
        const producto = productos.find(item => item.id === p.id);
        await evaluar('document.body.innerHTML = ""');
        await emitir('Page.navigate', { url: 'http://127.0.0.1:4173/productos/' + producto.slug });
        await esperar(`document.querySelector('main h1')?.textContent === ${JSON.stringify(producto.name)} && document.querySelector('.foto-principal-producto img')?.naturalWidth > 0`);
        assert.equal(await evaluar('document.documentElement.scrollWidth <= innerWidth'), true);
        assert.equal(await evaluar(`document.querySelector('.categoria-detalle').textContent`), categorias.find(c => c.id === p.categoria).name);
        const fotos = producto.gallery;
        assert.equal(await evaluar('document.querySelectorAll(".miniaturas-producto button").length'), fotos.length > 1 ? fotos.length : 0);
        if (fotos.length > 1) {
          await evaluar(`document.querySelector('[aria-label="Ver siguiente imagen"]').click()`);
          await esperar(`document.querySelector('.estado-galeria').textContent === 'Imagen 2 de ${fotos.length}'`);
          await esperar(`document.querySelector('.foto-principal-producto img')?.naturalWidth > 0`);
          await evaluar(`document.querySelector('[aria-label="Ver imagen anterior"]').click()`);
          await esperar(`document.querySelector('.estado-galeria').textContent === 'Imagen 1 de ${fotos.length}'`);
        } else {
          assert.equal(await evaluar('document.querySelectorAll(".controles-galeria button").length'), 0);
        }
        if (['camiseta-de-hockey-dama-cool', 'calza-larga-ionex', 'buzo-canguro-basic', 'pantalon-cargo-gabardina', 'short-fitness-c-calza-mujer', 'buzo-medio-cierre', 'camiseta-futbol-box', 'campera-canguro-c-corte-reglan-rugby', 'campera-canguro-c-corte-reglan-training'].includes(p.id)) {
          await evaluar(`document.querySelector('.foto-principal-producto img').decode()`);
          const m = await emitir('Page.getLayoutMetrics');
          const foto = await emitir('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
            clip: { x: 0, y: 0, width, height: m.cssContentSize.height, scale: 1 } });
          await fs.writeFile(path.join(carpeta, `${p.id}-${width}.png`), Buffer.from(foto.data, 'base64'));
        }
      }
    }
    assert.equal(errores.length, 0, JSON.stringify(errores));
    console.log(`OK: ${plan.aprobados.length} fichas modificadas/importadas, 375 y 1440 px, fotos, galería anterior/siguiente, nombres, sin desborde ni errores JS.`);
  } finally { conexion.close(); await fetch('http://127.0.0.1:9333/json/close/' + pestana.id); }
}
comprobar().catch(e => { console.error(e); process.exitCode = 1; });
