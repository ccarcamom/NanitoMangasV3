import EmptyState from '../../components/common/EmptyState.jsx'

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
