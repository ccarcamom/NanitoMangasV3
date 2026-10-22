import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { Container, Nav, Navbar, NavDropdown, Offcanvas } from 'react-bootstrap'
import { CaretDown, List, SignOut, User } from '@phosphor-icons/react'
import { categories } from '../../data/seed.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import SearchBar from './SearchBar.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import CartButton from './CartButton.jsx'

const genres = categories.find((c) => c.id === 'mangas').genres

const links = [
  ['/categoria/funko', 'Funko Pop'],
  ['/categoria/accesorios', 'Accesorios'],
  ['/ofertas', 'Ofertas'],
  ['/novedades', 'Novedades'],
  ['/contacto', 'Contacto'],
]

export default function Header() {
  const { count } = useCart()
  const { user, ready, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('') // compartido: los dos buscadores no pierden el texto al cruzar el breakpoint

  useEffect(() => { setOpen(false) }, [pathname, search]) // cierra el menú móvil al navegar

  const goSearch = (q) => navigate(`/buscar?q=${encodeURIComponent(q)}`)

  return (
    <Navbar as="header" expand="lg" expanded={open} onToggle={setOpen} className="site-header">
      <Container className="site-header__top">
        <Navbar.Toggle aria-controls="main-menu" label="Abrir menú" className="icon-btn d-lg-none">
          <List size={26} aria-hidden="true" />
        </Navbar.Toggle>
        <Link to="/" className="site-logo">NanitoMangas<span className="site-logo__dot" aria-hidden="true">.</span></Link>
        <SearchBar className="d-none d-lg-flex flex-grow-1" value={query} onChange={setQuery} onSearch={goSearch} />
        <div className="site-icons">
          {!ready ? (
            // reserva el ancho de "Nombre + Salir" sin mostrar "Ingresar" antes de conocer la sesión
            <span className="account-link account-link--pending invisible" aria-hidden="true"><User size={22} /></span>
          ) : user ? (
            <>
              <Link to="/cuenta" className="account-link" title={user.name}>
                <User size={22} aria-hidden="true" /><span className="account-link__name account-link__label">{user.name.trim().split(/\s+/)[0]}</span>
              </Link>
              <button type="button" className="icon-btn account-exit" onClick={logout} aria-label="Salir" title="Salir"><SignOut size={22} aria-hidden="true" /></button>
            </>
          ) : (
            <Link to="/ingresar" className="account-link"><User size={22} aria-hidden="true" /><span className="account-link__label">Ingresar</span></Link>
          )}
          <ThemeToggle />
          <CartButton count={count} />
        </div>
      </Container>
      <Container className="d-lg-none pb-3">
        <SearchBar className="w-100" value={query} onChange={setQuery} onSearch={goSearch} />
      </Container>
      <Container>
        <Navbar.Offcanvas id="main-menu" aria-labelledby="main-menu-title" placement="start">
          <Offcanvas.Header closeButton closeLabel="Cerrar menú">
            <Offcanvas.Title id="main-menu-title" className="site-logo">Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav as="nav" aria-label="Menú principal" className="main-nav">
              <Nav.Link as={NavLink} to="/" end>Inicio</Nav.Link>
              <NavDropdown
                id="nav-mangas"
                title={<>Mangas <CaretDown size={11} weight="bold" aria-hidden="true" /></>}
                active={pathname.startsWith('/categoria/mangas')}
              >
                {genres.map((g) => (
                  <NavDropdown.Item key={g.id} as={Link} to={`/categoria/mangas?genero=${g.id}`}>{g.name}</NavDropdown.Item>
                ))}
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/categoria/mangas">Ver todo</NavDropdown.Item>
              </NavDropdown>
              {links.map(([to, label]) => <Nav.Link key={to} as={NavLink} to={to}>{label}</Nav.Link>)}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  )
}
