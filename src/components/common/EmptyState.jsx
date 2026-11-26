import { MagnifyingGlass } from '@phosphor-icons/react'

export default function EmptyState({ title, action }) {
  return (
    <div className="empty-state">
      <MagnifyingGlass size={48} className="empty-state__icon" aria-hidden="true" />
      <h2 className="h4 mb-0">{title}</h2>
      {action}
    </div>
  )
}
