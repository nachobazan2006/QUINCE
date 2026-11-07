export default function DataState({ state, children }) {
  if (state.loading) return <p role="status">Cargando…</p>;
  if (state.error) return <p role="alert">{state.error.message}</p>;
  return children(state.data);
}
