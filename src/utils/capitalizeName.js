/** Primera letra de cada palabra en mayúscula (nombres propios). */
export function capitalizeName(value) {
  if (!value) return ''
  return value
    .split(' ')
    .map((part) => {
      if (!part) return part
      return part.charAt(0).toLocaleUpperCase('es') + part.slice(1).toLocaleLowerCase('es')
    })
    .join(' ')
}
