import EmptyState from '../../components/common/EmptyState.jsx'

// "Cargando…" o error con reintento mientras no hay datos; null cuando ya se puede dibujar.
export const loadingOrError = ({ loading, error, reload }, what) => {
  if (loading) return <EmptyState title="Cargando…" />
  if (error) return <EmptyState title={`No pudimos cargar ${what}`} action={<button type="button" className="btn btn-primary" onClick={reload}>Reintentar</button>} />
  return null
}

// Shared read-only table: EmptyState when no rows, otherwise a responsive table.
export const rowsOrEmpty = (rows, emptyTitle, label, headers, renderRow) => (
  rows.length === 0 ? <EmptyState title={emptyTitle} /> : (
    <div className="table-responsive">
      <table className="table align-middle admin__table" aria-label={label}>
        <thead><tr>{headers.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    </div>
  )
)
