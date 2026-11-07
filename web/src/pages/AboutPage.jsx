import useData from '../hooks/useData.js';
import DataState from '../components/common/DataState.jsx';

export default function AboutPage() {
  const about = useData('about');
  return <DataState state={about}>{(data) => <>
    <h1>{data.title}</h1><p>Contenido institucional pendiente de validación.</p>
  </>}</DataState>;
}
