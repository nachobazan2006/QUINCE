import { useParams } from 'react-router';
import useData from '../hooks/useData.js';
import DataState from '../components/common/DataState.jsx';
import NotFoundPage from './NotFoundPage.jsx';

export default function ProductPage() {
  const { slug } = useParams();
  const products = useData('products');
  return <DataState state={products}>{(data) => {
    const product = data.products.find((item) => item.slug === slug);
    return product ? <><h1>{product.name}</h1><p>Detalle pendiente de implementación.</p></> : <NotFoundPage />;
  }}</DataState>;
}
