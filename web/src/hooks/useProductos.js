import useData from './useData.js';

function esImagenValida(imagen) {
  return imagen && typeof imagen.src === 'string' && typeof imagen.alt === 'string'
    && imagen.width > 0 && imagen.height > 0
    && (imagen.variants === undefined || (Array.isArray(imagen.variants)
      && imagen.variants.every(variante => typeof variante?.src === 'string' && variante.width > 0)));
}

function esProductoValido(producto) {
  return producto && typeof producto.id === 'string' && typeof producto.name === 'string'
    && typeof producto.slug === 'string' && Array.isArray(producto.categoryIds)
    && producto.categoryIds.every(id => typeof id === 'string') && Array.isArray(producto.gallery)
    && (producto.image === null || esImagenValida(producto.image))
    && producto.gallery.every(esImagenValida)
    && (producto.description === undefined || typeof producto.description === 'string')
    && (producto.characteristics === undefined || (Array.isArray(producto.characteristics)
      && producto.characteristics.every(texto => typeof texto === 'string')))
    && (producto.sizeGuide === undefined || producto.sizeGuide === null || typeof producto.sizeGuide === 'string')
    && (producto.relatedProductIds === undefined || (Array.isArray(producto.relatedProductIds)
      && producto.relatedProductIds.every(id => typeof id === 'string')));
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
