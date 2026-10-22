import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'

// Con `value`/`onChange` es controlado (estado en el padre); sin ellos lleva su propio estado.
export default function SearchBar({ onSearch, className = '', value, onChange }) {
  const [own, setOwn] = useState('')
  const q = value ?? own
  const setQ = onChange ?? setOwn

  const submit = (e) => {
    e.preventDefault()
    const term = q.trim()
    if (term) onSearch(term)
  }

  return (
    <form role="search" className={`search-pill ${className}`} onSubmit={submit}>
      <button type="submit" className="search-pill__btn" aria-label="Buscar">
        <MagnifyingGlass size={18} aria-hidden="true" />
      </button>
      <input
        type="search"
        className="search-pill__input"
        aria-label="Buscar productos"
        placeholder="Busca mangas, Funko Pop, figuras, accesorios…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </form>
  )
}
