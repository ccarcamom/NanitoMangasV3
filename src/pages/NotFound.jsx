import { Link } from 'react-router'
import { SmileySad } from '@phosphor-icons/react'

export default function NotFound() {
  return (
    <section className="container empty-state">
      <SmileySad size={56} className="empty-state__icon" aria-hidden="true" />
      <h1 className="h2">Página no encontrada</h1>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </section>
  )
}
