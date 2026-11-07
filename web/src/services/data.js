// Paths are relative to Vite's base, including when hosted in a subdirectory.
export function resourceUrl(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

export async function readData(file, signal) {
  const response = await fetch(resourceUrl(`data/${file}.json`), {
    signal,
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`No se pudo leer ${file} (HTTP ${response.status}).`);
  // A SPA fallback must not silently masquerade as a JSON response.
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error(`La respuesta de ${file} no es un archivo JSON.`);
  }
  try {
    return await response.json();
  } catch {
    throw new Error(`El archivo ${file} contiene JSON inválido.`);
  }
}
