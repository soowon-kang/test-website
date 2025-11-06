
import { useForm } from 'react-hook-form'
import { MoneyInput } from '../components/MoneyInput'
import { ResultTable } from '../components/ResultTable'
import { Explainer } from '../components/Explainer'

type Form = {
  officialTotal: number   // 주택 공시가격 합계(원)
  share: number           // 본인 지분(0~1)
  jointElection: boolean  // 부부 공동명의 1주택 특례
  seniorCreditRate: number // 고령자 세액공제(0~0.4 예시)
  lthCreditRate: number    // 장기보유 세액공제(0~0.5 예시)
  propTaxCredit: number    // 재산세상당액 공제(원, 입력)
}

function gltProgressive(base: number) {
  // 간단 누진 예시 - 실제 규칙 JSON으로 교체 가능
  const brackets = [
    { up: 300_000_000, rate: 0.006, ded: 0 },
    { up: 600_000_000, rate: 0.008, ded: 600_000 * 1 }, // 예시
    { up: Infinity, rate: 0.01, ded: 2_000_000 }        // 예시
  ]
  for (const b of brackets) {
    if (base <= b.up) return Math.max(0, Math.round(base * b.rate - b.ded))
  }
  return 0
}

export function GltTab() {
  const { control, handleSubmit, register, watch } = useForm<Form>({
    defaultValues: {
      officialTotal: 1_200_000_000, share: 0.5, jointElection: false,
      seniorCreditRate: 0.0, lthCreditRate: 0.0, propTaxCredit: 0
    }
  })

  const v = watch()

  // 기본공제: 개인 9억, 특례(부부 공동명의 1주택) 12억 단일
  let baseVal: number
  let deduction: number
  if (v.jointElection) {
    baseVal = v.officialTotal
    deduction = 1_200_000_000
  } else {
    baseVal = Math.round((v.officialTotal ?? 0) * (v.share ?? 0))
    deduction = 900_000_000
  }

  const taxableBase = Math.max(0, baseVal - deduction)
  const incomeTax = gltProgressive(taxableBase)

  // 재산세상당액 공제
  const afterPropCredit = Math.max(0, incomeTax - (v.propTaxCredit ?? 0))

  // 고령/장기 세액공제 및 80% 상한 (예시)
  const combinedRate = Math.min((v.seniorCreditRate ?? 0) + (v.lthCreditRate ?? 0), 0.80)
  const afterCredits = Math.round(afterPropCredit * (1 - combinedRate))

  const onSubmit = (f: Form) => {}

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-3 gap-4 bg-white p-4 border rounded">
        <MoneyInput control={control} name="officialTotal" label="공시가격 합계" />
        <MoneyInput control={control} name="share" label="지분(0~1)" />
        <label className="flex items-center gap-2 self-end">
          <input type="checkbox" {...register('jointElection')} />
          <span>부부 공동명의 1주택 특례</span>
        </label>
        <MoneyInput control={control} name="propTaxCredit" label="재산세상당액 공제(원)" />
        <MoneyInput control={control} name="seniorCreditRate" label="고령 세액공제율(0~0.4)" />
        <MoneyInput control={control} name="lthCreditRate" label="장기보유 세액공제율(0~0.5)" />
        <button className="h-10 px-4 rounded bg-zinc-900 text-white" type="submit">계산</button>
      </form>

      <Explainer
        title="계산 과정/근거"
        summary={[
          v.jointElection ? "특례: 합산 1주택으로 보아 12억 공제" : "개별 과세: 개인 9억 공제",
          "산출세액 → 재산세상당액 공제 → 고령·장기 세액공제(최대 80%) 순서"
        ]}
        formulas={[
          "과세표준 = (지분 공시가격 또는 합산 공시가격) - 기본공제",
          "산출세액 = 누진세율 × 과세표준 - 누진공제",
          "최종세액 = max(0, (산출세액 - 재산세상당액) × (1 - (고령+장기))) ; 상한 80%"
        ]}
        order={["공제 적용", "누진세율 계산", "재산세상당액 공제", "고령/장기 공제(상한)"]}
        refs={[ { label: "종부세 안내(국세청)", url: "https://www.nts.go.kr/" } ]}
      />

      <ResultTable
        rows={[
          { key: 'base', label: '과세표준', amount: taxableBase },
          { key: 'itx', label: '산출세액', amount: incomeTax },
          { key: 'prop-credit', label: '재산세상당액 공제', amount: - (v.propTaxCredit ?? 0) },
          { key: 'after-credit', label: '고령/장기 공제 후', amount: afterCredits },
        ]}
        total={afterCredits}
      />
    </div>
  )
}
