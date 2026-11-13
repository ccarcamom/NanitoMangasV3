// Props comunes de un FormField: `values` es el objeto del formulario, `onChange` recibe el objeto nuevo.
export const bindFields = (values, errors, onChange, prefix = '') => (k) => ({
  id: `${prefix}${k}`,
  name: k,
  value: values[k],
  error: errors[k],
  onChange: (e) => onChange({ ...values, [k]: e.target.value }),
})

// Enfoca el primer campo con error, en el orden de `ids`. Devuelve true si había alguno.
export const focusFirstError = (errors, ids) => {
  const first = Object.keys(ids).find((k) => errors[k])
  if (first) document.getElementById(ids[first])?.focus()
  return Boolean(first)
}
