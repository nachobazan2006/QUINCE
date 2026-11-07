import useData from './useData.js';

function esProductoValido(producto) {
  return producto && typeof producto.id === 'string' && typeof producto.name === 'string'
    && typeof producto.slug === 'string' && Array.isArray(producto.categoryIds)
    && producto.categoryIds.every(id => typeof id === 'string') && Array.isArray(producto.gallery)
    && (producto.image === null || (producto.image && typeof producto.image.src === 'string'));
}

export default function useProductos() {
  const estado = useData('products');
  if (!estado.loading && !estado.error && !Array.isArray(estado.data?.products)) {
    return { ...estado, error: new Error('El catálogo no contiene una lista de productos válida.') };
  }
  if (!estado.loading && !estado.error && estado.data.products.some(producto => !esProductoValido(producto))) {
    return { ...estado, error: new Error('Hay un producto con campos obligatorios inválidos en el catálogo.') };
  }
  return estado;
}
