// Utilidades centralizadas de fecha para evitar bugs de zona horaria.
//
// Por qué existe este archivo: `new Date().toISOString()` siempre convierte
// a UTC. Para un usuario en Argentina (UTC-3), a partir de las 21:00 hora
// local esa conversión ya cae en el día siguiente en UTC, lo que hacía que
// "la fecha de hoy" quedara mal calculada al registrar operaciones.
// De la misma forma, `new Date('YYYY-MM-DD')` interpreta ese string como
// medianoche UTC, y al mostrarlo con toLocaleDateString() en una zona
// horaria negativa retrocede un día. Estas funciones evitan ambos casos
// trabajando siempre con los componentes de fecha en horario local.

/** Fecha de hoy en horario local, como string 'YYYY-MM-DD'. */
export function fechaLocalHoy() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Formatea una fecha recibida del backend ('YYYY-MM-DD', o un datetime ISO
 * que empiece así) a 'DD/MM/AAAA', parseando los componentes directamente
 * en vez de pasar por `new Date(string)` (que la interpretaría como UTC).
 */
export function formatearFechaLocal(fechaStr) {
  if (!fechaStr) return ''
  const soloFecha = String(fechaStr).slice(0, 10)
  const partes = soloFecha.split('-')
  if (partes.length !== 3) return fechaStr
  const [y, m, d] = partes.map(Number)
  if (!y || !m || !d) return fechaStr
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
}
