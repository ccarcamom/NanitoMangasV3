import { act } from '@testing-library/react'

// Deja que terminen las cargas asíncronas (productos, sesión) después de montar.
export const flush = () => act(async () => {})
