import { Link } from 'react-router';
import { resourceUrl } from '../../services/data.js';

export default function Marca({ marca, onClick }) {
  return <Link className="marca" to="/" onClick={onClick} aria-label={`${marca.label}: inicio`}>
    {marca.image ? <img src={resourceUrl(marca.image.src)} width={marca.image.width}
      height={marca.image.height} alt={marca.label} />
      : <span className="marca-provisional" title="Logo oficial pendiente">{marca.label}</span>}
  </Link>;
}
