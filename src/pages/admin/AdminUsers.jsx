import { useSyncExternalStore } from 'react'
import * as data from '../../data/index.js'
import { formatDate } from '../../lib/dates.js'
import { rowsOrEmpty } from './AdminTable.jsx'

// `api` = { subscribeUsers, listUsers }; specs inject one over a fake storage. Only safe fields reach the DOM (never passwordHash).
export default function AdminUsers({ api = data }) {
  const users = useSyncExternalStore(api.subscribeUsers, api.listUsers).map(({ id, name, email, role, rut, createdAt }) => ({ id, name, email, role, rut, createdAt }))
  return (
    <section>
      <h1 className="page__title">Usuarios</h1>
      {rowsOrEmpty(users, 'No hay usuarios', 'Usuarios',
        ['Nombre', 'Correo', 'Rol', 'RUT', 'Registro'],
        (u) => (
          <tr key={u.id}>
            <td>{u.name}</td><td>{u.email}</td><td>{u.role === 'admin' ? 'Administrador' : 'Cliente'}</td>
            <td>{u.rut || '-'}</td><td>{formatDate(u.createdAt)}</td>
          </tr>
        ))}
    </section>
  )
}
