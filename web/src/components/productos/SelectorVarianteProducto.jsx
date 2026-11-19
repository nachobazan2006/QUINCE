export default function SelectorVarianteProducto({ variantes, varianteActiva, alSeleccionar }) {
  if (variantes.length < 2) return null;

  return <section className="selector-variante-producto" aria-label="Variante del producto">
    <p className="titulo-selector-variante" id="etiqueta-color-variante">Color: <span>{varianteActiva?.label}</span></p>
    <div className="opciones-variante-producto" role="group" aria-label="Elegir color">
      {variantes.map(variante => <button key={variante.id} type="button"
        className="opcion-variante-producto" style={{ '--color-variante': variante.swatch }}
        aria-pressed={variante.id === varianteActiva?.id}
        aria-label={`Seleccionar color ${variante.label}`}
        onClick={() => alSeleccionar(variante.id)}>
        <span className="muestra-color-variante" aria-hidden="true" />
      </button>)}
    </div>
  </section>;
}
