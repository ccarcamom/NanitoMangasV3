import { NavLink, Outlet } from 'react-router'
import { Package, Receipt } from '@phosphor-icons/react'

const LINKS = [
  ['productos', 'Productos', Package],
  ['pedidos', 'Pedidos', Receipt],
]

export default function VendedorLayout() {
  return (
    <div className="container page admin">
      <nav className="admin__nav" aria-label="Vendedor">
        {LINKS.map(([to, label, Icon]) => (
          <NavLink key={to} to={`/vendedor/${to}`} className="admin__link">
            <Icon size={20} aria-hidden="true" />{label}
          </NavLink>
        ))}
      </nav>
      <div className="admin__content"><Outlet /></div>
    </div>
  )
}
