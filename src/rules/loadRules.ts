
export type RuleBundle = {
  version?: string
  [k: string]: any
}

export async function loadRuleJson(name: string): Promise<RuleBundle | null> {
  try {
    const res = await fetch(`/rules/${name}.json`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
