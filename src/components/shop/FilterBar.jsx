const SORTS = [
  ['name', 'Nombre'],
  ['price-asc', 'Precio: menor a mayor'],
  ['price-desc', 'Precio: mayor a menor'],
]

export default function FilterBar({ genres, sort, genre, onChange }) {
  const chip = (id, label) => (
    <button key={id ?? 'all'} type="button" className={`chip${(genre ?? null) === id ? ' is-active' : ''}`} aria-pressed={(genre ?? null) === id} onClick={() => onChange({ genre: id })}>{label}</button>
  )
  return (
    <div className="filter-bar">
      {genres.length > 0 && (
        <div className="filter-bar__chips">
          {chip(null, 'Todos')}
          {genres.map((g) => chip(g.id, g.name))}
        </div>
      )}
      <label className="filter-bar__sort">
        <span className="visually-hidden">Ordenar por</span>
        <select className="form-select" value={sort} onChange={(e) => onChange({ sort: e.target.value })}>
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
    </div>
  )
}
