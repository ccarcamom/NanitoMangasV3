import { Outlet } from 'react-router'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <Header />
      <main id="contenido" className="site-main" tabIndex={-1}><Outlet /></main>
      <Footer />
    </>
  )
}
