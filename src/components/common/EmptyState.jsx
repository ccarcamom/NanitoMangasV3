import { MagnifyingGlass } from '@phosphor-icons/react'

export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <MagnifyingGlass size={48} className="empty-state__icon" aria-hidden="true" />
      <h2 className="h4 mb-0">{title}</h2>
      {text && <p className="text-secondary mb-0">{text}</p>}
      {action}
    </div>
  )
}
