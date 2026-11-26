import { NavLink } from 'react-router'

export default function MemeNav() {
  return (
    <nav aria-label="Memes" className="meme-nav">
      <NavLink to="/memes/crear">Crear</NavLink>
      <NavLink to="/memes/biblioteca">Biblioteca</NavLink>
    </nav>
  )
}
