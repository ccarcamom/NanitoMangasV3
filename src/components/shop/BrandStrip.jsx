export default function BrandStrip({ brands }) {
  return (
    <section className="container brand-strip" aria-labelledby="brands-title">
      <h2 id="brands-title" className="h3">Nuestras editoriales</h2>
      <ul className="brand-strip__list">
        {brands.map((name) => <li key={name} className="brand-strip__tile">{name}</li>)}
      </ul>
    </section>
  )
}
