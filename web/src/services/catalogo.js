export function obtenerProductosColeccion(productos, categorias, categoriaId) {
  const incluidos = new Set([categoriaId]);
  // incluimos los hijos sin cambiar el orden editorial del archivo de productos
  let cantidadAnterior;
  do {
    cantidadAnterior = incluidos.size;
    categorias.forEach(categoria => {
      if (incluidos.has(categoria.parentId)) incluidos.add(categoria.id);
    });
  } while (cantidadAnterior !== incluidos.size);
  return productos.filter(producto => producto.categoryIds.some(id => incluidos.has(id)));
}

export function obtenerCategoriaPrincipal(producto, categorias) {
  let categoria = categorias.find(item => item.id === producto.categoryIds[0]);
  const visitados = new Set();
  while (categoria?.parentId && !visitados.has(categoria.id)) {
    visitados.add(categoria.id);
    categoria = categorias.find(item => item.id === categoria.parentId);
  }
  return categoria;
}

export function obtenerImagenesDetalle(producto) {
  // la galería verificada tiene su propia toma principal; image queda como respaldo
  const imagenes = producto.gallery.length ? producto.gallery : [producto.image];
  return imagenes.filter((imagen, indice, lista) => imagen?.src
    && lista.findIndex(item => item?.src === imagen.src) === indice);
}

export function obtenerProductosRelacionados(producto, productos) {
  // compartir colección ofrece continuidad de navegación, sin afirmar una relación comercial
  const candidatos = Array.isArray(producto.relatedProductIds)
    ? producto.relatedProductIds.map(id => productos.find(item => item.id === id))
    : productos.filter(item => item.categoryIds.some(id => producto.categoryIds.includes(id)));
  const incluidos = new Set([producto.id]);
  return candidatos.filter(item => {
    if (!item?.id || !item.slug || incluidos.has(item.id)) return false;
    incluidos.add(item.id);
    return true;
  }).slice(0, 4);
}
