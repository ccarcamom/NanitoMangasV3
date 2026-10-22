import {
  isValidEmail, isValidPassword, normalizeRut, isValidRut, luhnCheck, isValidExpiry, isValidCvv,
} from './validators.js';

describe('validators', () => {
  it('isValidEmail', () => {
    expect(isValidEmail('a@b.cl')).toBe(true);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('a b@c.cl')).toBe(false);
  });

  it('isValidPassword', () => {
    expect(isValidPassword('Abcdef12')).toBe(true);
    expect(isValidPassword('abcdefgh')).toBe(false);
    expect(isValidPassword('Ab1')).toBe(false);
  });

  it('normalizeRut', () => {
    expect(normalizeRut('12.345.678-5')).toBe('12345678-5');
    expect(normalizeRut('7.000.013-k')).toBe('7000013-K');
    expect(normalizeRut('abc')).toBeNull();
  });

  it('isValidRut', () => {
    expect(isValidRut('12.345.678-5')).toBe(true);
    expect(isValidRut('12345678-5')).toBe(true);
    expect(isValidRut('11.111.111-1')).toBe(true);
    expect(isValidRut('12345678-9')).toBe(false);
    expect(isValidRut('7.000.013-K')).toBe(true);
    expect(isValidRut('7000013-k')).toBe(true);
    expect(isValidRut('')).toBe(false);
  });

  it('luhnCheck', () => {
    expect(luhnCheck('4242 4242 4242 4242')).toBe(true);
    expect(luhnCheck('4242424242424241')).toBe(false);
    expect(luhnCheck('')).toBe(false);
  });

  it('isValidExpiry', () => {
    const now = new Date(2026, 9, 21);
    expect(isValidExpiry('12/99', now)).toBe(true);
    expect(isValidExpiry('01/20', now)).toBe(false);
    expect(isValidExpiry('13/30', now)).toBe(false);
    expect(isValidExpiry('10/26', now)).toBe(true);
    expect(isValidExpiry('09/26', now)).toBe(false);
  });

  it('isValidCvv', () => {
    expect(isValidCvv('123')).toBe(true);
    expect(isValidCvv('1234')).toBe(true);
    expect(isValidCvv('12')).toBe(false);
    expect(isValidCvv('12a')).toBe(false);
  });
});
