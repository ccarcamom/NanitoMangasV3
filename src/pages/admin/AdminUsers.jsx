import { useState } from 'react'
import { Trash } from '@phosphor-icons/react'
import * as defaultApi from '../../api/index.js'
import { useAsync } from '../../hooks/useAsync.js'
import { formatDate } from '../../lib/dates.js'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import { loadingOrError, rowsOrEmpty } from './AdminTable.jsx'

const ROLES = [['CLIENTE', 'Cliente'], ['VENDEDOR', 'Vendedor'], ['ADMIN', 'Administrador']]

// `api` = { listUsers, updateUser, deleteUser }; specs inject a fake. Only safe fields reach the DOM (never passwordHash).
export default function AdminUsers({ api = defaultApi }) {
  const state = useAsync(api.listUsers, api)
  const [target, setTarget] = useState(null)
  const [failure, setFailure] = useState(null)
  const [busy, setBusy] = useState(null) // id de la fila con una petición en curso
  const status = loadingOrError(state, 'los usuarios')

  const run = async (action, message) => {
    setFailure(null)
    try {
      await action()
    } catch (err) {
      setFailure(message(err))
    }
  }
  const change = async (u, patch) => {
    setBusy(u.id)
    await run(async () => {
      const saved = await api.updateUser(u.id, { role: u.role, active: u.active !== false, ...patch })
      state.setData(state.data.map((x) => (x.id === u.id ? { ...x, ...saved } : x)))
    }, (err) => {
      if (err.code === 'FORBIDDEN_SELF_OR_SEED') return 'No puedes cambiar tu propio rol ni modificar a un usuario de semilla.'
      return err.status === 403 ? 'No tienes permiso para modificar usuarios.' : 'No pudimos actualizar el usuario'
    })
    setBusy(null)
  }
  const confirmDelete = () => {
    const u = target
    setTarget(null)
    return run(async () => {
      await api.deleteUser(u.id)
      state.setData(state.data.filter((x) => x.id !== u.id))
    }, (err) => (err.code === 'FORBIDDEN_SELF_OR_SEED'
      ? 'No se puede eliminar tu propia cuenta ni un usuario base del sistema'
      : 'No pudimos eliminar el usuario'))
  }

  return (
    <section>
      <h1 className="page__title">Usuarios</h1>
      {failure && <div className="alert-nm" role="alert"><p className="mb-0">{failure}</p></div>}
      {status ?? rowsOrEmpty(state.data, 'No hay usuarios', 'Usuarios',
        ['Nombre', 'Correo', 'Rol', 'Activo', 'RUT', 'Registro', 'Acciones'],
        (u) => (
          <tr key={u.id}>
            <td>{u.name}</td><td>{u.email}</td>
            <td>
              <select className="form-select form-select-sm" aria-label={`Rol de ${u.name}`} value={u.role} disabled={busy === u.id} onChange={(e) => change(u, { role: e.target.value })}>
                {ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </td>
            <td><input type="checkbox" className="form-check-input" aria-label={`Activo ${u.name}`} checked={u.active !== false} disabled={busy === u.id} onChange={(e) => change(u, { active: e.target.checked })} /></td>
            <td>{u.rut || '-'}</td><td>{formatDate(u.createdAt)}</td>
            <td className="admin__actions">
              <button type="button" className="btn btn-outline-secondary btn-sm" aria-label={`Eliminar ${u.name}`} title="Eliminar" onClick={() => setTarget(u)}>
                <Trash size={16} aria-hidden="true" />
              </button>
            </td>
          </tr>
        ))}
      <ConfirmDialog
        show={target !== null}
        title="Eliminar usuario"
        message={target && `¿Eliminar a ${target.name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </section>
  )
}
