import { resourceUrl } from '../../services/data.js';

export default function ImagenAdaptable({ imagen, prioritaria = false, sizes = '100vw', className }) {
  return <img className={className} src={resourceUrl(imagen.src)} alt={imagen.alt}
    width={imagen.width} height={imagen.height}
    srcSet={imagen.variants?.map(variante => `${resourceUrl(variante.src)} ${variante.width}w`).join(', ')}
    sizes={sizes} loading={prioritaria ? 'eager' : 'lazy'} fetchPriority={prioritaria ? 'high' : 'auto'}
    decoding="async" />;
}
