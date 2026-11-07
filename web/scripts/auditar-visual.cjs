const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');

async function auditar() {
  const fase = process.argv[2] || 'despues';
  assert(['antes', 'despues'].includes(fase));
  const web = path.resolve(__dirname, '..');
  const salida = path.resolve(web, '../docs/auditoria-final', fase);
  await fs.mkdir(salida, { recursive: true });
  const catalogo = JSON.parse(await fs.readFile(path.join(web, 'public/data/products.json'), 'utf8'));
  const rutas = ['/', '/deportes', '/training', '/urbano', '/instituciones', '/deportes/rugby',
    '/deportes/futbol', '/deportes/hockey-femenino', '/deportes/hockey-masculino', '/nosotros',
    ...catalogo.products.map(producto => '/productos/' + producto.slug), '/contacto', '/productos/no-existe'];
  const anchos = [360, 375, 390, 393, 600, 768, 900, 1023, 1024, 1025, 1280, 1440];
  const principales = ['/', '/deportes', '/deportes/rugby', '/nosotros', '/productos/camiseta-rugby-oldies'];
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
  async function capturar(nombre) {
    await evaluar(`Promise.all([...document.images].map(imagen => { imagen.loading = 'eager'; return imagen.decode().catch(() => null); }))`);
    await evaluar('window.scrollTo(0, 0); document.activeElement?.blur()');
    const medidas = await emitir('Page.getLayoutMetrics');
    const esMenu = nombre.startsWith('menu-');
    const imagen = await emitir('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !esMenu,
      clip: { x: 0, y: 0, width: medidas.cssContentSize.width, height: esMenu ? 900 : medidas.cssContentSize.height, scale: 1 } });
    await fs.writeFile(path.join(salida, nombre + '.png'), Buffer.from(imagen.data, 'base64'));
  }
  try {
    await emitir('Page.enable'); await emitir('Runtime.enable');
    await emitir('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    for (const ruta of rutas) {
      for (const width of anchos) {
        await emitir('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
        await evaluar('document.body.innerHTML = ""');
        await emitir('Page.navigate', { url: 'http://127.0.0.1:4173' + ruta });
        await esperar(`document.querySelector('main h1') && document.querySelector('footer') && ![...document.querySelectorAll('[role="status"]')].some(e => e.textContent.includes('Cargando'))`);
        await evaluar(`Promise.all([...document.images].filter(img => img.getBoundingClientRect().width > 0).map(img => { img.loading = 'eager'; return img.decode().catch(() => null); }))`);
        const medicion = await evaluar(`(() => {
          const caja = selector => { const e = document.querySelector(selector); if (!e) return null; const r = e.getBoundingClientRect(); return { x:r.x,y:r.y,width:r.width,height:r.height }; };
          const imagenes = [...document.images].filter(img => img.getBoundingClientRect().width > 0);
          return { desborde: document.documentElement.scrollWidth > innerWidth,
            h1: document.querySelector('main h1').textContent, cantidadMain: document.querySelectorAll('main').length,
            rotas: imagenes.filter(img => !img.naturalWidth).map(img => img.src),
            deformadas: imagenes.filter(img => Math.abs(img.getBoundingClientRect().width / img.getBoundingClientRect().height - img.naturalWidth / img.naturalHeight) > .03 && getComputedStyle(img).objectFit === 'fill').map(img => img.src),
            superposiciones: [...document.querySelectorAll('.categoria-portada')].filter(tarjeta => {
              const accion = tarjeta.querySelector('.accion-portada')?.getBoundingClientRect();
              if (!accion) return false;
              return [...tarjeta.querySelectorAll('.indicadores-rotacion,.indicadores-escritorio')].some(e => {
                const r = e.getBoundingClientRect();
                return r.width > 0 && r.height > 0 && r.left < accion.right && r.right > accion.left && r.top < accion.bottom && r.bottom > accion.top;
              });
            }).map(e => e.querySelector('h2').textContent),
            pendientesPublicos: /\\(pendiente\\)|pendiente de implementación/i.test(document.querySelector('main').innerText),
            columnas: document.querySelector('.grilla-productos') ? getComputedStyle(document.querySelector('.grilla-productos')).gridTemplateColumns : null,
            principal: caja('.foto-principal-producto'), portada: caja('.categoria-portada'), destacados: caja('.destacados-inicio'), pie: caja('footer'),
            bloques: [...document.querySelectorAll('.pagina-inicio > section')].map(e => ({ clase:e.className,y:e.offsetTop,alto:e.offsetHeight })),
            imagenes: imagenes.map(img => ({ src:img.getAttribute('src'),actual:img.currentSrc,ancho:img.getBoundingClientRect().width,fit:getComputedStyle(img).objectFit,posicion:getComputedStyle(img).objectPosition })) };
        })()`);
        resultados.push({ ruta, width, ...medicion });
        if ([375,1440].includes(width) || (principales.includes(ruta) && [393,768,1024].includes(width))) {
          await capturar((ruta === '/' ? 'home' : ruta.slice(1).replaceAll('/', '-')) + '-' + width);
        }
        if (ruta === '/' && [375,393,768].includes(width)) {
          await evaluar(`document.querySelector('.abrir-menu').click()`);
          await esperar(`document.querySelector('.menu-movil').open`);
          await capturar('menu-' + width);
          await evaluar(`document.querySelector('.cerrar-menu').click()`);
        }
      }
      console.log('Auditado ' + ruta);
    }
    await fs.writeFile(path.join(salida, 'resultados.json'), JSON.stringify({ fase, rutas: rutas.length, anchos, errores, resultados }, null, 2));
    console.log(JSON.stringify({ rutas: rutas.length, evaluaciones: resultados.length, errores: errores.length,
      desbordes: resultados.filter(r => r.desborde).length, imagenesRotas: resultados.filter(r => r.rotas.length).length,
      imagenesDeformadas: resultados.filter(r => r.deformadas.length).length, superposiciones: resultados.filter(r => r.superposiciones.length).length,
      textosPendientes: resultados.filter(r => r.pendientesPublicos).length }));
    assert.equal(errores.length, 0);
    assert(!resultados.some(r => r.desborde || r.rotas.length || r.deformadas.length));
    if (fase === 'despues') assert(!resultados.some(r => r.pendientesPublicos || r.superposiciones.length));
  } finally {
    conexion.close();
    await fetch('http://127.0.0.1:9333/json/close/' + pestana.id);
  }
}
auditar().catch(error => { console.error(error); process.exitCode = 1; });
