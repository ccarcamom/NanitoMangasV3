import { useState } from 'react'
import { isValidEmail } from '../lib/validators.js'
import FormField from '../components/forms/FormField.jsx'
import { bindFields } from '../components/forms/formHelpers.js'

const empty = { nombre: '', correo: '', mensaje: '' }
const validate = (v) => ({
  ...(!v.nombre.trim() && { nombre: 'Ingresa tu nombre.' }),
  ...(!isValidEmail(v.correo.trim()) && { correo: 'Ingresa un correo válido.' }),
  ...(v.mensaje.trim().length < 10 && { mensaje: 'El mensaje debe tener al menos 10 caracteres.' }),
})

export default function Contact() {
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const bind = bindFields(values, errors, setValues)

  const submit = (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) return
    // shortcut: el mensaje no se envía a ningún lado (sin backend), solo se confirma.
    setValues(empty)
    setSent(true)
  }

  return (
    <section className="container page page--narrow">
      <h1 className="page__title">Contacto</h1>
      {sent && (
        <div className="notice" role="status">
          <h2 className="h5">Gracias, recibimos tu mensaje</h2>
          <p className="mb-0">Te responderemos al correo que indicaste.</p>
        </div>
      )}
      <form className="contact-form" onSubmit={submit} noValidate onChange={() => setSent(false)}>
        <FormField label="Nombre" autoComplete="name" {...bind('nombre')} />
        <FormField label="Correo" type="email" autoComplete="email" {...bind('correo')} />
        <FormField label="Mensaje" as="textarea" rows={5} {...bind('mensaje')} />
        <button type="submit" className="btn btn-primary">Enviar mensaje</button>
      </form>
    </section>
  )
}
