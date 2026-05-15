let cached = null

export async function loadConfig() {
  if (cached) return cached
  const res = await fetch(`${import.meta.env.BASE_URL}config.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`config.json 로드 실패: ${res.status}`)
  cached = await res.json()
  return cached
}

export function isFastMode() {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('fast') === '1'
}
