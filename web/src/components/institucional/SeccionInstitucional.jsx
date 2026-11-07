import { useId } from 'react';

export default function SeccionInstitucional({ seccion }) {
  const idTitulo = useId();
  return <section className="seccion-institucional" aria-labelledby={idTitulo}>
    <h2 id={idTitulo}>{seccion.heading}</h2>
    {seccion.paragraphs.map((parrafo, indice) => <p key={indice}>{parrafo}</p>)}
  </section>;
}
