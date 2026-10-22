import { NavLink, Outlet } from 'react-router'
import { Package, Receipt, Users } from '@phosphor-icons/react'

const LINKS = [
  ['productos', 'Productos', Package],
  ['usuarios', 'Usuarios', Users],
  ['pedidos', 'Pedidos', Receipt],
]

export default function AdminLayout() {
  return (
    <div className="container page admin">
      <nav className="admin__nav" aria-label="Administración">
        {LINKS.map(([to, label, Icon]) => (
          <NavLink key={to} to={`/admin/${to}`} className="admin__link">
            <Icon size={20} aria-hidden="true" />{label}
          </NavLink>
        ))}
      </nav>
      <div className="admin__content"><Outlet /></div>
    </div>
  )
}
