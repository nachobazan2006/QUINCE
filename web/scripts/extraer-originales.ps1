$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$seleccion = Get-Content -Raw -Encoding UTF8 $env:QUINCE_SELECCION | ConvertFrom-Json
foreach ($grupo in ($seleccion | Group-Object archivoZip)) {
  $archivo = [IO.Compression.ZipFile]::OpenRead((Join-Path $env:QUINCE_RAIZ $grupo.Name))
  try {
    foreach ($recurso in $grupo.Group) {
      if ($recurso.id -notmatch '^[a-z0-9-]+$') { throw 'ID inseguro' }
      $entrada = $archivo.GetEntry($recurso.rutaOriginal)
      if (!$entrada) { throw ('Original no encontrado: ' + $recurso.rutaOriginal) }
      $destino = Join-Path $env:QUINCE_TEMP ($recurso.id + '.original')
      $origen = $entrada.Open()
      $salida = [IO.File]::Open($destino, [IO.FileMode]::CreateNew)
      try { $origen.CopyTo($salida) } finally { $salida.Dispose(); $origen.Dispose() }
    }
  } finally { $archivo.Dispose() }
}
