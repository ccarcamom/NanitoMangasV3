import { useRef } from 'react'
import { useReveal } from '../hooks/useReveal.js'
import { banners as seedBanners } from '../data/seed.js'
import { useProducts } from '../hooks/useProducts.js'
import { useCart } from '../context/CartContext.jsx'
import HeroBanner from '../components/shop/HeroBanner.jsx'
import ProductCarousel from '../components/shop/ProductCarousel.jsx'
import InfoStrip from '../components/layout/InfoStrip.jsx'

const rows = [
  ['Novedades', 'isNew', '/novedades'],
  ['Más vendidos', 'isBestSeller', '/categoria/mangas'],
  ['De vuelta en stock', 'isRestock'],
]

export default function Home({ products: given, banners = seedBanners }) {
  const { data: stored } = useProducts()
  const products = given ?? stored
  const { add } = useCart()
  const body = useRef(null)
  useReveal(body)
  return (
    <>
      <HeroBanner banners={banners} />
      <div ref={body}>
      <div data-reveal><InfoStrip /></div>
      {rows.map(([title, flag, seeAllTo]) => {
        const list = products.filter((p) => p[flag])
        return list.length > 0 && (
          <div key={title} className="container" data-reveal>
            <ProductCarousel title={title} products={list} onAdd={add} seeAllTo={seeAllTo} />
          </div>
        )
      })}
      </div>
    </>
  )
}
