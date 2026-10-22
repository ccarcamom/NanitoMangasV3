export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const isValidPassword = (v) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v);

export function normalizeRut(v) {
  const s = String(v).replace(/[.\s]/g, '').toUpperCase();
  const m = /^(\d{7,8})-?([\dK])$/.exec(s);
  return m ? `${m[1]}-${m[2]}` : null;
}

export function isValidRut(v) {
  const n = normalizeRut(v);
  if (!n) return false;
  const [body, dv] = n.split('-');
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const r = 11 - (sum % 11);
  return (r === 11 ? '0' : r === 10 ? 'K' : String(r)) === dv;
}

export function luhnCheck(card) {
  const d = String(card).replace(/\s/g, '');
  if (!/^\d{12,19}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(v, now = new Date()) {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const month = Number(m[1]);
  if (month < 1 || month > 12) return false;
  return 2000 + Number(m[2]) > now.getFullYear()
    || (2000 + Number(m[2]) === now.getFullYear() && month >= now.getMonth() + 1);
}

export const isValidCvv = (v) => /^\d{3,4}$/.test(v);
