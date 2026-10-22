import { CreditCard, InstagramLogo, Storefront } from '@phosphor-icons/react'

const items = [
  [CreditCard, 'Medios de pago', 'Crédito, débito y transferencia'],
  [Storefront, 'Retiro en tienda', 'Listo en 48 horas'],
  [InstagramLogo, 'Síguenos', 'Instagram y TikTok'],
]

export default function InfoStrip() {
  return (
    <section className="info-strip container" aria-label="Información de la tienda">
      {items.map(([Icon, title, text]) => (
        <div key={title} className="info-strip__item">
          <Icon size={26} className="info-strip__icon" aria-hidden="true" />
          <div><strong className="info-strip__title">{title}</strong>{text}</div>
        </div>
      ))}
    </section>
  )
}
