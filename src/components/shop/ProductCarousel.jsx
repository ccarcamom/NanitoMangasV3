import { useRef } from 'react'
import { Link } from 'react-router'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import ProductCard from './ProductCard.jsx'

export default function ProductCarousel({ title, products, onAdd, seeAllTo }) {
  const track = useRef(null)
  const scroll = (dir) => track.current?.scrollBy({ left: dir * track.current.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  return (
    <section className="carousel-section">
      <div className="carousel-head">
        <h2 className="h3 mb-0">{title}</h2>
        {seeAllTo && <Link to={seeAllTo} className="carousel-head__all">Ver todo</Link>}
        <div className="carousel-head__nav">
          <button type="button" className="icon-btn" aria-label="Anterior" onClick={() => scroll(-1)}><CaretLeft size={20} aria-hidden="true" /></button>
          <button type="button" className="icon-btn" aria-label="Siguiente" onClick={() => scroll(1)}><CaretRight size={20} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="carousel-track" ref={track}>
        {products.map((p) => (
          <div key={p.id} className="carousel-item-nm">
            <ProductCard product={p} onAdd={onAdd} />
          </div>
        ))}
      </div>
    </section>
  )
}
