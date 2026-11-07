const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function comprobar() {
  const fase = process.argv[2] || 'despues';
  assert(['antes', 'despues'].includes(fase));
  const carpeta = path.resolve(__dirname, '../../docs/tipografia-conoce-quince', fase);
  await fs.mkdir(carpeta, { recursive: true });
  const pestana = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
  const conexion = new WebSocket(pestana.webSocketDebuggerUrl);
  await new Promise(resolver => conexion.addEventListener('open', resolver, { once: true }));
  let id = 0;
  const pendientes = new Map();
  const errores = [];
  const resultados = [];
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
  async function esperar(expresion) {
    for (let intento = 0; intento < 180; intento++) {
      if (await evaluar(`Boolean(${expresion})`)) return;
      await new Promise(resolver => setTimeout(resolver, 50));
    }
    throw Error('Tiempo agotado: ' + expresion);
  }
  try {
    await emitir('Runtime.enable'); await emitir('Page.enable'); await emitir('DOM.enable'); await emitir('CSS.enable');
    await emitir('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    for (const width of [375, 393, 768, 1024, 1440]) {
      await emitir('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
      await evaluar('document.body.innerHTML = ""');
      await emitir('Page.navigate', { url: 'http://127.0.0.1:4173/' });
      await esperar(`document.querySelector('.pagina-inicio .presentacion-marca .enlace-accion') && document.querySelector('.presentacion-oscura .enlace-accion')`);
      await evaluar(`document.fonts.ready`);
      const medicion = await evaluar(`(() => {
        const medir = enlace => { const e = getComputedStyle(enlace), r = enlace.getBoundingClientRect();
          return { texto:enlace.textContent, familia:e.fontFamily,peso:e.fontWeight,tamano:e.fontSize,interlineado:e.lineHeight,espaciado:e.letterSpacing,padding:e.padding,
            ancho:r.width,alto:r.height,color:e.color,fondo:e.backgroundColor,radio:e.borderRadius,href:enlace.getAttribute('href') }; };
        const boton = document.querySelector('.pagina-inicio .presentacion-marca .enlace-accion');
        return { width:innerWidth,desborde:document.documentElement.scrollWidth > innerWidth,boton:medir(boton),
          otros:[...document.querySelectorAll('.enlace-accion')].filter(e => e !== boton).map(medir),
          cuerpo:getComputedStyle(document.body).fontFamily };
      })()`);
      const documento = await emitir('DOM.getDocument');
      const elemento = await emitir('DOM.querySelector', { nodeId: documento.root.nodeId, selector: '.pagina-inicio .presentacion-marca .enlace-accion' });
      const fuentes = await emitir('CSS.getPlatformFontsForNode', { nodeId: elemento.nodeId });
      resultados.push({ ...medicion, fuentes: fuentes.fonts });
      assert.equal(medicion.desborde, false);
      assert.equal(medicion.boton.href, '/nosotros');
      if (fase === 'despues') {
        assert(fuentes.fonts.some(fuente => fuente.postScriptName === 'Poppins-Regular' && fuente.isCustomFont), JSON.stringify(fuentes));
        assert.equal(medicion.boton.peso, '400');
        assert.equal(medicion.boton.fondo, 'rgb(0, 0, 0)');
        assert.equal(medicion.boton.color, 'rgb(255, 255, 255)');
        assert.equal(medicion.boton.radio, '999px');
        const anterior = JSON.parse(await fs.readFile(path.resolve(carpeta, '../antes/resultados.json'), 'utf8')).find(r => r.width === width);
        assert.deepEqual(medicion.otros, anterior.otros, 'Los demás botones deben conservar todos sus estilos y dimensiones');
        assert.equal(medicion.cuerpo, anterior.cuerpo);
      }
      await evaluar(`document.querySelector('.pagina-inicio .presentacion-marca').scrollIntoView({block:'center'})`);
      const posicion = await evaluar(`(() => {const e=document.querySelector('.pagina-inicio .presentacion-marca'),r=e.getBoundingClientRect(),b=e.querySelector('.enlace-accion').getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height,boton:{x:b.x,y:b.y+scrollY,width:b.width,height:b.height}}})()`);
      for (const [nombre, clip] of [['contexto', posicion], ['boton', posicion.boton]]) {
        const foto = await emitir('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
          clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale: 1 } });
        await fs.writeFile(path.join(carpeta, `${nombre}-${width}.png`), Buffer.from(foto.data, 'base64'));
      }
      await evaluar(`document.querySelector('.pagina-inicio .presentacion-marca .enlace-accion').click()`);
      await esperar(`location.pathname === '/nosotros' && document.querySelector('.pagina-nosotros h1')`);
    }
    await fs.writeFile(path.join(carpeta, 'resultados.json'), JSON.stringify(resultados, null, 2));
    assert.equal(errores.length, 0, JSON.stringify(errores));
    console.log(JSON.stringify(resultados.map(r => ({ width:r.width,boton:r.boton,fuentes:r.fuentes })), null, 2));
    console.log('OK: cinco anchos sin desborde, enlace Nosotros, fuente renderizada comprobada y ausencia de errores JS.');
  } finally {
    conexion.close();
    await fetch('http://127.0.0.1:9333/json/close/' + pestana.id);
  }
}
comprobar().catch(error => { console.error(error); process.exitCode = 1; });
