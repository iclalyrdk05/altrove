/**
 * iOS/iPadOS Safari ignores `HTMLMediaElement.volume` entirely by design —
 * only the hardware volume buttons/Control Center set output level there,
 * not a web page. Used to swap an unresponsive volume slider for an honest
 * note instead, on channels backed by a real `<audio>` element.
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  // iPadOS 13+ reports as "MacIntel" in the UA, unlike an actual Mac — the
  // one reliable difference from JS is that it still has touch support.
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}
