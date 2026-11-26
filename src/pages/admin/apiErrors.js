// Mensaje para una falla al guardar/borrar un producto, según el status que devolvió la API.
export const productFailure = (err, generic) => {
  if (err?.status === 403) return 'No tienes permiso para modificar este producto.'
  if (err?.status === 404) return 'El producto ya no existe.'
  const detail = typeof err?.detail === 'string' ? err.detail : err?.detail?.message
  if ((err?.status === 400 || err?.status === 409) && detail) return detail
  return generic
}
