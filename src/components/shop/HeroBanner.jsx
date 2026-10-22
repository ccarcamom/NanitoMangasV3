import { Link } from 'react-router'
import { Carousel } from 'react-bootstrap'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'

export default function HeroBanner({ banners }) {
  return (
    <section className="container hero" aria-label="Destacados">
      <Carousel
        interval={null}
        indicators={banners.length > 1}
        controls={banners.length > 1}
        prevLabel="Anterior"
        nextLabel="Siguiente"
        prevIcon={<CaretLeft size={22} weight="bold" aria-hidden="true" />}
        nextIcon={<CaretRight size={22} weight="bold" aria-hidden="true" />}
      >
        {banners.map((b, i) => {
          const Title = i === 0 ? 'h1' : 'h2' // un solo h1 en la página
          return (
            <Carousel.Item key={b.id}>
              <div className="hero__slide">
                <div className="hero__text">
                  <Title className="hero__title">{b.title}</Title>
                  <p className="hero__lead">{b.text}</p>
                  <Link to={b.to} className="btn btn-primary">{b.ctaLabel}</Link>
                </div>
                <img className="hero__img" src={b.image} alt={b.title} width="1000" height="660" loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : undefined} />
              </div>
            </Carousel.Item>
          )
        })}
      </Carousel>
    </section>
  )
}
