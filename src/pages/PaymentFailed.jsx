import { Link, useLocation } from 'react-router'

const MESSAGES = {
  CARD_DECLINED: 'Tu banco rechazó el pago.',
  CARD_INVALID: 'Los datos de la tarjeta no son válidos.',
}

export default function PaymentFailed() {
  const reason = useLocation().state?.reason
  return (
    <section className="container page page--narrow">
      <h1 className="page__title">No se pudo realizar el pago</h1>
      <p className="lead">{MESSAGES[reason] ?? 'El pago no se completó.'}</p>
      <p className="text-secondary">Tu carro sigue intacto: no se creó ningún pedido ni se hizo ningún cobro.</p>
      <div className="page__actions">
        <Link to="/checkout" className="btn btn-primary">Reintentar pago</Link>
        <Link to="/carro" className="btn btn-outline-secondary">Volver al carro</Link>
      </div>
    </section>
  )
}
