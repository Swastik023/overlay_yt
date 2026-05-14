/** Overlay mode detection from URL query params.
 *  ?mode=overlay  → hides placeholders, maximizes transparency
 *  ?mode=demo     → default, shows placeholder content
 */
export function getOverlayMode(): 'overlay' | 'demo' {
  if (typeof window === 'undefined') return 'demo'
  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')
  return mode === 'overlay' ? 'overlay' : 'demo'
}

export function isOverlayMode(): boolean {
  return getOverlayMode() === 'overlay'
}
