const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function comprobar() {
  const pestana = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
  const conexion = new WebSocket(pestana.webSocketDebuggerUrl);
  await new Promise(resolver => conexion.addEventListener('open', resolver, { once: true }));
  const pendientes = new Map();
  const errores = [];
  let id = 0;
  function emitir(method, params = {}) {
    return new Promise((resolver, rechazar) => {
      pendientes.set(++id, { resolver, rechazar });
      conexion.send(JSON.stringify({ id, method, params }));
    });
  }
  conexion.addEventListener('message', evento => {
    const mensaje = JSON.parse(evento.data);
    if (mensaje.id) {
      const pendiente = pendientes.get(mensaje.id);
      pendientes.delete(mensaje.id);
      mensaje.error ? pendiente.rechazar(mensaje.error) : pendiente.resolver(mensaje.result);
    } else if (mensaje.method === 'Runtime.exceptionThrown'
      || (mensaje.method === 'Runtime.consoleAPICalled' && mensaje.params.type === 'error')) errores.push(mensaje.params);
  });
  async function evaluar(expression) {
    const resultado = await emitir('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert(!resultado.exceptionDetails, JSON.stringify(resultado.exceptionDetails));
    return resultado.result.value;
  }
  const esperarTiempo = ms => new Promise(resolver => setTimeout(resolver, ms));
  async function esperar(expresion) {
    for (let intento = 0; intento < 160; intento++) {
      if (await evaluar(`Boolean(${expresion})`)) return;
      await esperarTiempo(50);
    }
    throw Error('Tiempo agotado: ' + expresion);
  }
  const seleccion = `[...document.querySelectorAll('.indicadores-rotacion button')].findIndex(b => b.getAttribute('aria-pressed') === 'true')`;
  try {
    await emitir('Page.enable'); await emitir('Runtime.enable');
    await emitir('Page.bringToFront');
    await emitir('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await emitir('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await emitir('Page.navigate', { url: 'http://127.0.0.1:4173/' });
    await esperar(`document.querySelector('.portada-deportes-rotativa')`);
    assert.equal(await evaluar(`document.querySelector('button[aria-label*="Pausar"],button[aria-label*="Reanudar"]')`), null);
    assert.equal(await evaluar('document.querySelectorAll(".indicadores-rotacion button").length'), 5);
    assert.equal(await evaluar('document.querySelectorAll(".portada-deportes-rotativa img").length'), 1);
    assert.equal(await evaluar(seleccion), 0);
    await esperarTiempo(5300);
    assert.equal(await evaluar(seleccion), 1, 'La primera rotación debe ocurrir a los cinco segundos');
    await esperar(`document.querySelectorAll('.foto-deporte img')[1]?.naturalWidth > 0`);
    await evaluar(`document.querySelectorAll('.indicadores-rotacion button')[4].click()`);
    assert.equal(await evaluar(seleccion), 4);
    await esperar(`document.querySelectorAll('.foto-deporte')[4].querySelector('img')?.naturalWidth > 0`);
    await evaluar(`document.querySelector('.indicadores-rotacion button').focus()`);
    await esperarTiempo(5200);
    assert.equal(await evaluar(seleccion), 4, 'El foco debe suspender la rotación');
    await evaluar('document.activeElement.blur()');
    await esperarTiempo(5300);
    assert.equal(await evaluar(seleccion), 0, 'Debe volver a la portada inicial al completar el ciclo');
    const punto = await evaluar(`(() => {const r=document.querySelector('.portada-deportes-rotativa').getBoundingClientRect();return {x:r.x+20,y:r.y+20};})()`);
    await emitir('Input.dispatchMouseEvent', { type: 'mouseMoved', ...punto });
    await esperarTiempo(5200);
    assert.equal(await evaluar(seleccion), 0, 'El mouse debe suspender la rotación');
    await emitir('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1400, y: 50 });
    await emitir('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await esperar(`getComputedStyle(document.querySelector('.fotos-deportes')).transitionDuration === '0s'`);
    await esperarTiempo(5200);
    assert.equal(await evaluar(seleccion), 0, 'El movimiento reducido debe impedir autoplay');
    await emitir('Emulation.setDeviceMetricsOverride', { width: 375, height: 900, deviceScaleFactor: 1, mobile: true });
    await emitir('Emulation.setTouchEmulationEnabled', { enabled: true });
    const puntoTactil = await evaluar(`(() => { const r=document.querySelectorAll('.indicadores-rotacion button')[2].getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    await emitir('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [puntoTactil] });
    await emitir('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await esperar(`${seleccion} === 2`);
    assert.equal(await evaluar('document.documentElement.scrollWidth <= innerWidth'), true);
    await evaluar(`document.querySelectorAll('.foto-deporte')[2].querySelector('img').decode()`);
    const medidas = await emitir('Page.getLayoutMetrics');
    const foto = await emitir('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: 375, height: medidas.cssContentSize.height, scale: 1 } });
    await fs.writeFile(path.resolve(__dirname, '../../docs/auditoria-final/despues/home-deporte-seleccionado-375.png'), Buffer.from(foto.data, 'base64'));
    assert.equal(errores.length, 0, JSON.stringify(errores));
    console.log('OK: sin botón de pausa, portada inicial, rotación real a 5 s, ciclo, indicadores, carga por visita, pausa automática por foco/mouse, movimiento reducido y toque mobile. Sin errores JS.');
  } finally {
    conexion.close();
    await fetch('http://127.0.0.1:9333/json/close/' + pestana.id);
  }
}
comprobar().catch(error => { console.error(error); process.exitCode = 1; });
