import { sha256Hex } from './crypto.js'
import { ADMIN_PASSWORD, ADMIN_SEED_HASH } from '../data/seed.js'

describe('sha256Hex', () => {
  it('calcula el hash de abc', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
  it('coincide con ADMIN_SEED_HASH', async () => {
    expect(await sha256Hex(ADMIN_PASSWORD)).toBe(ADMIN_SEED_HASH)
    expect(await sha256Hex('Admin1234')).toBe(ADMIN_SEED_HASH)
  })
})
