
export type RuleBundle = {
  version?: string
  [k: string]: any
}

export async function loadRuleJson(name: string) {
  try {
    // ✅ base-aware URL
    const url = new URL(`${import.meta.env.BASE_URL}rules/${name}.json`, window.location.href).toString()
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}