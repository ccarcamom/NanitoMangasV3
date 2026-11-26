import { detectBubbles } from './bubbles'

const MAX_TRIES = 6

// loadImage(url) debe resolver a un ImageData (o similar) de la página.
export async function pickRandomPage(candidates, loadImage, rng = Math.random) {
  const pool = [...(candidates || [])]
  for (let t = 0; t < MAX_TRIES && pool.length; t++) {
    const c = pool.splice(Math.floor(rng() * pool.length), 1)[0]
    try {
      const bubbles = detectBubbles(await loadImage(c.url))
      if (bubbles.length) return { productId: c.productId, language: c.language, pageIndex: c.pageIndex, url: c.url, bubbles }
    } catch {
      // página que no carga: se descarta y se sortea otra
    }
  }
  return null
}
