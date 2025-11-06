
import { useForm } from 'react-hook-form'
import { MoneyInput } from '../components/MoneyInput'
import { ResultTable } from '../components/ResultTable'
import { Explainer } from '../components/Explainer'

type Form = {
  price: number
  area: number
}

function baseRate(price: number): number {
  // KR: 6억 이하 1%, 6~9억 연속형, 9억 초과 3%
  const p = price
  if (p <= 600_000_000) return 0.01
  if (p <= 900_000_000) {
    const rate = ((p / 100_000_000) * (2/3) - 3) / 100
    return Math.round(rate * 1e4) / 1e4
  }
  return 0.03
}

export function AcquisitionTab() {
  const { control, handleSubmit, watch } = useForm<Form>({
    defaultValues: { price: 900_000_000, area: 84 }
  })
  const price = watch('price') ?? 0
  const area = watch('area') ?? 0

  const onSubmit = (v: Form) => {}

  const rate = baseRate(price)
  const edu = rate * 0.1
  const nongspec = area > 85 ? 0.002 : 0.0

  const tax = Math.round(price * rate)
  const eduTax = Math.round(price * edu)
  const nsTax = Math.round(price * nongspec)
  const total = tax + eduTax + nsTax

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-3 gap-4 bg-white p-4 border rounded">
        <MoneyInput control={control} name="price" label="취득가액" />
        <MoneyInput control={control} name="area" label="전용면적(㎡)" />
        <button className="self-end h-10 px-4 rounded bg-zinc-900 text-white" type="submit">계산</button>
      </form>

      <Explainer
        title="계산 과정/근거"
        summary={[ "6~9억 구간은 연속형(선형) 세율을 적용", area > 85 ? "85㎡ 초과 → 농특세 0.2% 적용" : "85㎡ 이하 → 농특세 없음" ]}
        formulas={[ "rate = round( ((price/1e8)*(2/3) - 3) / 100, 4 )", "지방교육세 = 취득세율 × 10%", "농특세 = 0.2% (85㎡ 초과)" ]}
        order={[ "기본세율 산출", "부가세목(교육세/농특세)", "합계 계산" ]}
        refs={[ { label: "행안부/위택스 취득세", url: "https://www.wetax.go.kr/" } ]}
      />

      <ResultTable
        rows={[
          { key: 'base', label: '기본 취득세', amount: tax },
          { key: 'edu', label: '지방교육세', amount: eduTax },
          { key: 'ns', label: '농어촌특별세', amount: nsTax },
        ]}
        total={total}
      />
    </div>
  )
}
