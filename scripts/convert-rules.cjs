
/**
 * Convert YAML rules under tax_rules/KR-2025/*.yaml to public/rules/*.json at build time.
 * If YAML not present, this script is a no-op.
 */
const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

const srcDir = path.resolve('tax_rules/KR-2025')
const outDir = path.resolve('public/rules')
fs.mkdirSync(outDir, { recursive: true })

if (!fs.existsSync(srcDir)) {
  console.log('[convert-rules] No tax_rules/KR-2025 directory — skipping.')
  process.exit(0)
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
for (const f of files) {
  const p = path.join(srcDir, f)
  const y = fs.readFileSync(p, 'utf8')
  const data = YAML.parse(y)
  const out = path.join(outDir, f.replace(/\.ya?ml$/, '.json'))
  fs.writeFileSync(out, JSON.stringify(data, null, 2), 'utf8')
  console.log(`[convert-rules] Wrote ${out}`)
}
