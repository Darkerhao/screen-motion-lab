export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

export function withAlpha(hex: string, alpha: number) {
  const value = hex.replace('#', '')
  const normalized = value.length === 3
    ? value.split('').map((character) => character + character).join('')
    : value

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${clamp(alpha)})`
}
