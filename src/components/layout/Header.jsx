import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { Container, Nav, Navbar, NavDropdown, Offcanvas } from 'react-bootstrap'
import { CaretDown, IdentificationBadge, List, SignOut, Storefront, User } from '@phosphor-icons/react'
import { getCategory } from '../../lib/catalog.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import SearchBar from './SearchBar.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import CartButton from './CartButton.jsx'

const genres = getCategory('mangas').genres

const links = [
  ['/categoria/funko', 'Funko Pop'],
  ['/categoria/figuras', 'Figuras'],
  ['/categoria/accesorios', 'Accesorios'],
  ['/ofertas', 'Ofertas'],
  ['/novedades', 'Novedades'],
  ['/contacto', 'Contacto'],
]

const PANELS = { ADMIN: '/admin', VENDEDOR: '/vendedor' }

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
        <Link to="/" className="site-logo">NanitoMangas<img className="site-logo__mascot" src="/img/happy.png" alt="" width="30" height="40" /></Link>
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
              {PANELS[user.role] && (
                <Link to={PANELS[user.role]} className="account-link"><Storefront size={22} aria-hidden="true" /><span className="account-link__label">Panel</span></Link>
              )}
              <button type="button" className="icon-btn account-exit" onClick={logout} aria-label="Salir" title="Salir"><SignOut size={22} aria-hidden="true" /></button>
            </>
          ) : (
            <>
              <Link to="/ingresar" className="account-link"><User size={22} aria-hidden="true" /><span className="account-link__label">Ingresar</span></Link>
              <Link to="/ingresar/personal" className="account-link account-link--staff d-none d-lg-inline-flex"><IdentificationBadge size={22} aria-hidden="true" /><span className="account-link__label">Personal</span></Link>
            </>
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
              <NavDropdown
                id="nav-memes"
                title={<>Memes <CaretDown size={11} weight="bold" aria-hidden="true" /></>}
                active={pathname.startsWith('/memes')}
              >
                <NavDropdown.Item as={Link} to="/memes/crear">Crear</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/memes/biblioteca">Biblioteca</NavDropdown.Item>
              </NavDropdown>
              {links.map(([to, label]) => <Nav.Link key={to} as={NavLink} to={to}>{label}</Nav.Link>)}
              {ready && !user && <Nav.Link as={NavLink} to="/ingresar/personal" className="d-lg-none">Acceso de personal</Nav.Link>}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  )
}
