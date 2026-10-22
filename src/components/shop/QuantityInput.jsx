import { Minus, Plus } from '@phosphor-icons/react'

export default function QuantityInput({ value, max, onChange }) {
  const top = Math.max(1, Math.floor(max) || 1)
  const disabled = !(max >= 1)
  const clamp = (raw) => {
    const n = Math.floor(Number(raw))
    return Number.isFinite(n) && n >= 1 ? Math.min(n, top) : 1
  }
  return (
    <div className="qty-input">
      <button type="button" className="icon-btn" aria-label="Restar uno" disabled={disabled || value <= 1} onClick={() => onChange(clamp(value - 1))}><Minus size={16} aria-hidden="true" /></button>
      <input type="number" className="qty-input__field" aria-label="Cantidad" value={value} min={1} max={top} step={1} disabled={disabled} onChange={(e) => onChange(clamp(e.target.value))} />
      <button type="button" className="icon-btn" aria-label="Sumar uno" disabled={disabled || value >= top} onClick={() => onChange(clamp(value + 1))}><Plus size={16} aria-hidden="true" /></button>
    </div>
  )
}
