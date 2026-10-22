import { useId } from 'react'
import { Modal } from 'react-bootstrap'

export default function ConfirmDialog({
  show, title = 'Confirmar acción', message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onCancel,
}) {
  const titleId = useId()
  return (
    <Modal show={show} onHide={onCancel} centered aria-labelledby={titleId}>
      <Modal.Header closeButton closeLabel="Cerrar"><Modal.Title id={titleId} as="h2" className="h5">{title}</Modal.Title></Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>{cancelLabel}</button>
        <button type="button" className="btn btn-primary" onClick={onConfirm}>{confirmLabel}</button>
      </Modal.Footer>
    </Modal>
  )
}
