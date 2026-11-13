export const formatDate = (iso) => new Date(iso).toLocaleDateString('es-CL')

// Más nuevo primero; a igual fecha, el id mayor (NM-000009 antes que NM-000008).
export const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)
