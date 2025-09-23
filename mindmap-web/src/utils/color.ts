export function stringToColor(input?: string): string {
  if (!input) {
    return '#93c5fd'
  }

  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 80%)`
}
