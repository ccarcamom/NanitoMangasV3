import { Link } from 'react-router'
import {
  Bank, Clock, CreditCard, EnvelopeSimple, FacebookLogo, InstagramLogo, MapPin, Money, Phone, TiktokLogo,
} from '@phosphor-icons/react'

// shortcut: datos de contacto y redes de relleno, reemplazar por los reales antes de publicar.
const contact = [
  [MapPin, 'Av. Providencia 1234, Santiago'],
  [Phone, '+56 9 1234 5678'],
  [EnvelopeSimple, 'contacto@nanitomangas.cl'],
  [Clock, 'Lunes a sábado, 10:00 a 19:00'],
]
const social = [
  [InstagramLogo, 'Instagram', 'https://www.instagram.com/'],
  [TiktokLogo, 'TikTok', 'https://www.tiktok.com/'],
  [FacebookLogo, 'Facebook', 'https://www.facebook.com/'],
]
const payments = [
  [CreditCard, 'Tarjetas de crédito y débito'],
  [Bank, 'Transferencia bancaria'],
  [Money, 'Efectivo al retirar en tienda'],
]

const IconRow = ({ icon: Icon, children }) => (
  <li className="site-footer__row"><Icon size={18} aria-hidden="true" />{children}</li>
)

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4">{/* en celular: Información y Redes a media columna; contacto y pagos a todo el ancho */}
          <div className="col-6 col-lg-3">
            <h2 className="site-footer__title">Información</h2>
            <ul className="site-footer__list">
              <li>Envíos a todo Chile</li>
              <li>Retiro en tienda gratis</li>
              <li>Cambios hasta 10 días</li>
              <li><Link to="/contacto">Escríbenos</Link></li>
            </ul>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 order-last order-sm-0">
            <h2 className="site-footer__title">Contáctenos</h2>
            <ul className="site-footer__list">
              {contact.map(([icon, text]) => <IconRow key={text} icon={icon}>{text}</IconRow>)}
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h2 className="site-footer__title">Redes</h2>
            <ul className="site-footer__list">
              {social.map(([icon, name, href]) => (
                <IconRow key={name} icon={icon}><a href={href} target="_blank" rel="noopener noreferrer">{name}</a></IconRow>
              ))}
            </ul>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <h2 className="site-footer__title">Medios de pago</h2>
            <ul className="site-footer__list">
              {payments.map(([icon, text]) => <IconRow key={text} icon={icon}>{text}</IconRow>)}
            </ul>
          </div>
        </div>
        <p className="site-footer__legal">© 2026 NanitoMangas</p>
      </div>
    </footer>
  )
}
