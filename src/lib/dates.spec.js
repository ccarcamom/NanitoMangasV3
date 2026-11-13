import { formatDate, newestFirst } from './dates.js'

describe('dates', () => {
  it('formatDate usa el formato chileno', () => {
    expect(formatDate('2026-10-21T12:00:00.000Z')).toBe('21-10-2026')
  })

  it('newestFirst ordena por fecha y desempata por id mayor', () => {
    const list = [
      { id: 'NM-000001', createdAt: '2026-10-20T10:00:00.000Z' },
      { id: 'NM-000002', createdAt: '2026-10-21T10:00:00.000Z' },
      { id: 'NM-000003', createdAt: '2026-10-21T10:00:00.000Z' },
    ]
    expect([...list].sort(newestFirst).map((o) => o.id)).toEqual(['NM-000003', 'NM-000002', 'NM-000001'])
  })
})
