export const FONTS = ['Montserrat', 'Lato', 'Impact', 'Georgia', 'Courier New']
export const MAX_TEXT = 200
export const MIN_SIZE = 8
export const MAX_SIZE = 72

export const bubbleError = (b) => {
  if ((b.text ?? '').length > MAX_TEXT) return `El texto admite hasta ${MAX_TEXT} caracteres`
  const s = Number(b.fontSize)
  if (!Number.isFinite(s) || s < MIN_SIZE || s > MAX_SIZE) return `El tamaño va de ${MIN_SIZE} a ${MAX_SIZE}`
  return null
}

export default function FontColorControls({ value, onChange }) {
  const error = bubbleError(value)
  const textTooLong = value.text.length > MAX_TEXT
  const sizeBad = error && !textTooLong
  const set = (key) => (e) => onChange({ [key]: e.target.value })
  return (
    <div className="meme-controls">
      <label className="form-label" htmlFor="meme-text">Texto</label>
      <textarea id="meme-text" className="form-control" rows={3} maxLength={MAX_TEXT} value={value.text} onChange={set('text')} aria-invalid={textTooLong} aria-describedby="meme-error" />
      <p className="meme-controls__count" aria-hidden="true">{value.text.length}/{MAX_TEXT}</p>
      <div className="meme-controls__row">
        <div>
          <label className="form-label" htmlFor="meme-font">Fuente</label>
          <select id="meme-font" className="form-select" value={value.fontFamily} onChange={set('fontFamily')}>
            {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor="meme-size">Tamaño</label>
          <input id="meme-size" type="number" className="form-control" min={MIN_SIZE} max={MAX_SIZE} value={value.fontSize} onChange={set('fontSize')} aria-invalid={Boolean(sizeBad)} aria-describedby="meme-error" />
        </div>
        <div>
          <label className="form-label" htmlFor="meme-color">Color del texto</label>
          <input id="meme-color" type="color" className="form-control form-control-color" value={value.color} onChange={set('color')} />
        </div>
        <div>
          <label className="form-label" htmlFor="meme-bg">Color de fondo</label>
          <input id="meme-bg" type="color" className="form-control form-control-color" value={value.background} onChange={set('background')} />
        </div>
      </div>
      <p id="meme-error" className="meme-controls__error" role="alert">{error}</p>
    </div>
  )
}
