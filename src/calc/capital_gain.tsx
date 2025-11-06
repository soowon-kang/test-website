
import { useForm } from 'react-hook-form'
import { MoneyInput } from '../components/MoneyInput'
import { ResultTable } from '../components/ResultTable'
import { Explainer } from '../components/Explainer'

type Form = {
  buy: number
  sell: number
  expense: number
  ownYears: number
  resYears: number
  share: number
}

function lttdRateSingleHome(ownYears: number, resYears: number) {
  const r = Math.min(ownYears, 10) * 0.04 + Math.min(resYears, 10) * 0.04
  return Math.min(r, 0.80)
}

function progressiveTax(base: number) {
  const brackets = [
    { up: 14_000_000, rate: 0.06, ded: 0 },
    { up: 50_000_000, rate: 0.15, ded: 1_260_000 },
    { up: 88_000_000, rate: 0.24, ded: 5_760_000 },
    { up: 150_000_000, rate: 0.35, ded: 15_900_000 },
    { up: 300_000_000, rate: 0.38, ded: 37_600_000 },
    { up: 500_000_000, rate: 0.40, ded: 65_400_000 },
    { up: 1_000_000_000, rate: 0.42, ded: 105_400_000 },
    { up: Infinity, rate: 0.45, ded: 154_400_000 },
  ]
  for (const b of brackets) {
    if (base <= b.up) return Math.max(0, Math.round(base * b.rate - b.ded))
  }
  return 0
}

export function CapitalGainTab() {
  const { control, handleSubmit, watch } = useForm<Form>({
    defaultValues: { buy: 500_000_000, sell: 1_500_000_000, expense: 0, ownYears: 5, resYears: 2, share: 0.6 }
  })

  const v = watch()
  const grossGainTotal = (v.sell - v.buy - (v.expense ?? 0))
  const householdRatio = Math.max((v.sell - 1_200_000_000) / v.sell, 0)
  const ownerGrossGain = Math.round(grossGainTotal * (v.share ?? 0))
  const ownerTaxableAfterRatio = Math.round(ownerGrossGain * householdRatio)
  const lttd = Math.round(ownerTaxableAfterRatio * lttdRateSingleHome(v.ownYears ?? 0, v.resYears ?? 0))
  const baseDed = 2_500_000
  const taxBase = Math.max(0, ownerTaxableAfterRatio - lttd - baseDed)
  const incomeTax = progressiveTax(taxBase)
  const localTax = Math.round(incomeTax * 0.10)
  const total = incomeTax + localTax

  const onSubmit = (f: Form) => {}

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-3 gap-4 bg-white p-4 border rounded">
        <MoneyInput control={control} name="buy" label="취득가액" />
        <MoneyInput control={control} name="sell" label="양도가액" />
        <MoneyInput control={control} name="expense" label="필요경비" />
        <MoneyInput control={control} name="ownYears" label="보유기간(년)" />
        <MoneyInput control={control} name="resYears" label="거주기간(년)" />
        <MoneyInput control={control} name="share" label="지분(0~1)" />
        <button className="self-end h-10 px-4 rounded bg-zinc-900 text-white" type="submit">계산</button>
      </form>

      <Explainer
        title="계산 과정/근거"
        summary={[
          "세대 기준 고가 1주택 비율 과세를 먼저 산출",
          "개인 지분 양도차익에 비율 적용 → 장특공 → 기본공제 → 누진세율 순서"
        ]}
        formulas={[
          "ratio = max((양도가액 - 12억) / 양도가액, 0)",
          "LTTD = min(보유년*4% + 거주년*4%, 80%)"
        ]}
        order={["세대 비율", "지분 적용", "장기보유특별공제", "기본공제 250만원", "누진세율·누진공제"]}
        refs={[
          { label: "NTS 양도소득세율", url: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2312&cntntsId=7711" },
          { label: "NTS 장기보유특별공제", url: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2311&cntntsId=7710" }
        ]}
      />

      <ResultTable
        rows={[
          { key: 'gross', label: '지분 양도차익', amount: ownerGrossGain },
          { key: 'ratio', label: '과세대상양도차익(세대 비율 적용 후)', amount: ownerTaxableAfterRatio },
          { key: 'lttd', label: '장기보유특별공제', amount: lttd * -1 },
          { key: 'base', label: '과세표준', amount: taxBase },
          { key: 'itx', label: '양도소득세', amount: incomeTax },
          { key: 'ltx', label: '지방소득세(10%)', amount: localTax },
        ]}
        total={total}
      />
    </div>
  )
}
