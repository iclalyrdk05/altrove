export function getCesiumIonToken(): string | null {
  const token = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined
  return token && token.trim().length > 0 ? token.trim() : null
}
