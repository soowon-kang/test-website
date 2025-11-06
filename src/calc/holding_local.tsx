
import { useForm } from 'react-hook-form'
import { MoneyInput } from '../components/MoneyInput'
import { ResultTable } from '../components/ResultTable'
import { Explainer } from '../components/Explainer'

type Form = {
  official: number      // 공시가격(원)
  lastYearPaid: number  // 전년도 납부세액(원) - 세부담상한 비교용
  singleHomeSpecial: boolean  // 1주택(9억 이하 특례) 여부
}

type Bracket = { up: number, rate: number }
const fallbackFairRatio = 0.6
const fallbackBrackets: Bracket[] = [
  { up: 60_000_000, rate: 0.001 },   // 0.1%
  { up: 150_000_000, rate: 0.0015 }, // 0.15%
  { up: 300_000_000, rate: 0.0025 }, // 0.25%
  { up: Infinity, rate: 0.004 }      // 0.4%
]
const fallbackCaps = { general: 1.0, singleHome: 0.75, multiHome: 1.3 } // 예시: 100%/75%/130%

function calcProgressive(amount: number, brackets: Bracket[]) {
  let remaining = amount
  let prev = 0
  let tax = 0
  for (const b of brackets) {
    const band = Math.min(remaining, b.up - prev)
    if (band <= 0) break
    tax += band * b.rate
    remaining -= band
    prev = b.up
  }
  return Math.round(tax)
}

export function PropertyTaxTab() {
  const { control, handleSubmit, register, watch } = useForm<Form>({
    defaultValues: { official: 600_000_000, lastYearPaid: 0, singleHomeSpecial: false }
  })

  const v = watch()
  const fairRatio = fallbackFairRatio
  const brackets = fallbackBrackets

  const taxBase = Math.round((v.official ?? 0) * fairRatio)
  const standardTax = calcProgressive(taxBase, brackets)

  // 세부담상한(간단): 전년도 납부세액 × cap
  const capRatio = v.singleHomeSpecial ? fallbackCaps.singleHome : fallbackCaps.general
  const burdenLimited = Math.max(standardTax, Math.round((v.lastYearPaid ?? 0) * capRatio))

  // 부가세목(예시): 지방교육세 20% of property tax, 도시지역분 10% (숫자는 UI 데모 목적)
  const localEdu = Math.round(burdenLimited * 0.20)
  const urban = Math.round(burdenLimited * 0.10)
  const total = burdenLimited + localEdu + urban

  const onSubmit = (f: Form) => {}

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-4 gap-4 bg-white p-4 border rounded">
        <MoneyInput control={control} name="official" label="공시가격" />
        <MoneyInput control={control} name="lastYearPaid" label="전년도 납부세액" />
        <label className="flex items-center gap-2 self-end">
          <input type="checkbox" {...register('singleHomeSpecial')} />
          <span>1주택(9억 이하) 특례</span>
        </label>
        <button className="h-10 px-4 rounded bg-zinc-900 text-white" type="submit">계산</button>
      </form>

      <Explainer
        title="계산 과정/근거"
        summary={[
          `과세표준 = 공시가격 × 공정시장가액비율(${(fairRatio*100).toFixed(0)}%)`,
          "누진세율 적용 후 세부담상한 비교",
          "지방교육세/도시지역분 부가"
        ]}
        formulas={[
          "tax_base = official × fair_market_ratio",
          "progressive(property brackets)",
          "burden_limit = max(standard_tax, last_year_paid × cap)"
        ]}
        order={["과세표준 산출", "누진세율 적용", "세부담상한 적용", "부가세목 가산"]}
        refs={[ { label: "지방세(재산세) 안내", url: "https://www.wetax.go.kr/" } ]}
      />

      <ResultTable
        rows={[
          { key: 'std', label: '산출세액(표준세율)', amount: standardTax },
          { key: 'cap', label: '세부담상한 적용 후', amount: burdenLimited },
          { key: 'edu', label: '지방교육세(예시 20%)', amount: localEdu },
          { key: 'urban', label: '도시지역분(예시 10%)', amount: urban },
        ]}
        total={total}
      />
    </div>
  )
}
