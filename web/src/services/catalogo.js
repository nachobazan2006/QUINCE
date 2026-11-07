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
