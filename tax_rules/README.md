
# KR Tax Rules Schema — KR-2025

이 디렉터리는 **대한민국 2025년 부동산 세제/규제 파라미터**를 코드와 분리해 관리합니다.  
Cursor AI/pytest가 바로 이해하고 활용할 수 있도록 **일관된 스키마**와 예시, 적용 순서를 제공합니다.

## 디렉터리 구조
```
tax_rules/
└─ KR-2025/
   ├─ regions.yaml         # 규제지역(조정대상/투기과열/토지거래허가구역/과밀억제권역) 플래그
   ├─ acquisition.yaml     # 취득세 (주택수/규제플래그/감면·농특세·지방교육세·신고기한)
   ├─ capital_gain.yaml    # 양도소득세 (세율·누진공제·중과·장기보유특별공제·비과세)
   ├─ holding_local.yaml   # 재산세 (공정시장가액비율·누진세율·세부담상한·분납)
   └─ holding_glt.yaml     # 종합부동산세 (공제·과세표준/세율·재산세상당액공제·특례)
```

## 공통 메타 필드
- `version`: `"KR-YYYY.MM[.DD][-suffix]"` (예: `"KR-2025.10.16-regions"`)
- `effective.from/to`: 적용 기간(yyyy-mm-dd)
- `sources[]`: 공식 출처(URL/설명) — 국세청(NTS), 행안부/위택스, 정부 보도자료 등
- `meta.updated_at`: 규칙 파일 업데이트 일자
- `meta.law_refs[]`: 관련 법령·시행령 조항 명시

---

## regions.yaml 핵심 
**복합 규제 플래그 모델**을 채택합니다. 하나의 지역이 여러 규제를 **동시에** 가질 수 있습니다.
```yaml
regions:
  seoul:
    districts:
      "*": { controlled: true, spec_overheated: true, land_permit: true, over_populated: true }
  gyeonggi:
    districts:
      seongnam-bundang: { controlled: true, spec_overheated: true, land_permit: true }
      # … (정책 공표에 따른 12개 지역)
fallback:
  default: { controlled: false, spec_overheated: false, land_permit: false, over_populated: false }
```
- 플래그:
  - `controlled` = 조정대상지역
  - `spec_overheated` = 투기과열지구
  - `land_permit` = 토지거래허가구역
  - `over_populated` = 과밀억제권역(주택매매 규제와 직접 연동되진 않지만 보존)

> **로더 가이드**: `utils/regions.py`는 `normalize_region("Seoul-Songpa") → ("seoul","songpa")`로 표준화하고,  
> `get_region_flags(city,district)`로 플래그 dict를 반환합니다.  
> (하위 호환) 단일 Enum이 필요한 모듈에게는 `SPEC_OVERHEATED > CONTROLLED > NON_REGULATED` 우선순위로 투영합니다.

---

## acquisition.yaml 핵심
- `standard_purchase.base_rate_formula`: **취득가액에 따른 기본세율**
  - **6억원 이하**: `rate = 0.01`
  - **6억원 초과~9억원 이하**: **연속형(선형) 세율**
    \[세율\] = `round(((price / 100000000) * (2/3) - 3) / 100, 4)`  
    - 결과 세율은 **소수점 넷째 자리 반올림(0.0001)**  
    - 지방교육세: `rate * 0.1`  
    - 농어촌특별세: **전용 85㎡ 초과 시** `0.002`, 그 외 `0.0`
  - **9억원 초과**: `rate = 0.03`, 지방교육세 `0.003`, 농특세(85㎡ 초과) `0.002`
- `surcharges`: 다주택/법인 중과 및 **중과분 부가세목**(지방교육세 0.004, 농특세 0.006/0.010)
- `reliefs.first_time_buyer`: **생애최초**(적용기한, 취득가액 상한, 전입·거주 요건, 감면한도 등)
- `filing_and_payment`: 신고·납부 기한(취득/등기일 다음달 말), 필요 서류

> 계산 순서(개요):  
> 1) 기본세율 산출(연속형 포함) → 2) 감면 적용(있다면) → 3) 부가세목(지방교육세/농특세) → 4) 중과 적용 시 중과분 부가세목

---

## capital_gain.yaml 핵심
- `rates.brackets[]`: 과세표준 구간·세율·**누진공제**
- `surcharges.multi_home`: 다주택 중과(필요 시 `active_until`로 한시적 배제)
- `deductions.basic_deduction`: 기본공제(연 250만 원)
- `deductions.long_term_general` (일반자산): 3년 6% 시작, 매년 2%p, 최대 30%
- `deductions.long_term_single_home` (1세대1주택): **보유연 4% + 거주연 4%**, 각 최대 10년, 합계 최대 **80%**
- `non_taxable_conditions.single_home_exemption`: 고가주택 기준(예: 12억), 보유/거주 요건

> 계산 순서(개요):  
> 1) 비과세 판정(1세대1주택 등) → 2) 과세표준 산정(양도차익−공제) → 3) 세율·누진공제 → 4) 중과/배제 → 5) 장특공

---

## holding_local.yaml 핵심 (재산세)
- `rates.fair_market_ratio`: **공정시장가액비율**(예: 60%)
- `rates.residential.standard`: 일반 주택 **누진세율**
- `rates.residential.single_home_special`: **공시가격 9억 이하 1주택** 완화세율 + 엘리지빌리티
- `caps.burden_limit`: **세부담상한**(전년도 대비 cap, 가격대별)
- `payment.residential.installment_months`: 7·9월 분납 규칙
- `additional_taxes`: 도시지역분·지방교육세 등 부가 항목

> 계산 순서(개요):  
> 1) 과세표준 = 공시가격 × 공정시장가액비율 → 2) 표준/특례 세율 적용 → 3) 세부담상한 적용 → 4) 부가세목 반영

---

## holding_glt.yaml 핵심 (종합부동산세, 주택분)
- `base.deduction`: **일반 9억 / 1세대1주택 12억 / 법인 0원**
- `base.fair_market_ratio`: 주택분 **60%**
- `rates.two_homes_or_less` / `rates.three_homes_or_more`: 구간별 **세율·누진공제**
- `credits.property_tax_credit`: **재산세상당액 공제** 로직(표준세율 기준) 힌트
- `credits.single_home_tax_credit`: **고령자/장기보유 세액공제** 및 합산 80% 상한
- `payment`: 과세기준일·합산배제 신고/정기고지 기간

> 계산 순서(개요):  
> 1) 공제(9억/12억) 후 과세표준 산정 → 2) 세율·누진공제 → 3) 재산세상당액 공제 → 4) (1주택) 세액공제 상한 적용

---

## 검증/로딩 가이드 (의사코드)
```python
rules = load_rules("tax_rules/KR-2025/capital_gain.yaml")
assert rules.version.startswith("KR-2025")
validate_effective(rules.effective)

# 예: 1세대1주택 장특공(dual-rate)
lttd = min(owned_years*0.04 + resided_years*0.04, 0.80)

# 예: 취득세 6~9억 구간 선형세율
rate = round(((price / 100000000) * (2/3) - 3) / 100, 4)
```

## 변경관리
- 공식 페이지 변경/개정 시 `version`과 `meta.updated_at` 갱신
- 스냅샷 테스트로 계산 결과 고정 → 규칙 변경 시 의도된 차이만 승인
- `regions.yaml`은 정책 변경(해제/축소/확대) 시 버전 날짜를 반영해 갱신

## 주의
- 본 디렉터리의 **수치/지정**은 운영 전 반드시 **NTS/행안부/정부 공고**로 교차검증해야 합니다.
- 규칙 변경 시, **테스트 케이스·스냅샷·문서**를 함께 갱신하세요.


---

## 📎 부록: 주택 취득세(표 해석 반영) 적용 방법

- `rules.standard_purchase.brackets`는 **과세표준(사실상 취득가액)** 기준 **계단형 세율**을 담습니다.  
  - 6억 이하: 1.0% (+ 지방교육세 0.1%)  
  - 6~9억: 6.5/7/7.5/8/8.5/9억 구간에 각각 1.33/1.67/2.0/2.33/2.67/3.0%  
  - 9억 초과: 3.0%  
  - **85㎡ 초과 시** 농어촌특별세 0.2% 적용(표 기재).

- `original_acquisition`(원시취득): 2.8% + 지방교육세 0.16% + 농특 0.2%  
- `gratuitous_acquisition`(증여): 3.5% + 지방교육세 0.2% + 농특 0.2%

- **중과(다주택·법인)**:  
  - 법인 유상취득 12%(전지역)  
  - (조정지역) 2주택 8%, 3주택 이상 12%  
  - (비조정) 3주택 8%, 4주택 이상 12%  
  - **지방교육세**: 8%/12% 중과 모두 0.4%  
  - **농특세**: 8% 중과 0.6%, 12% 중과 1%

- **신고·납부 기한**: 취득일/등기일이 속한 달의 **다음 달 말일**

> ⚠️ 수치는 제공된 요약표 이미지 해석 기반의 **업무용 포맷팅**이며, 운영 반영 전 반드시 **위택스/지자체 공식 수치로 검증**하고 스냅샷 테스트를 갱신하세요.

---

## 📎 부록: 재산세(주택) 규칙 사용 가이드

- `rates.fair_market_ratio`: 과세표준 산정용 **공정시장가액비율**(예: 60%)
- `rates.residential.standard.brackets`: 일반 주택(다주택·법인 포함) **표준 누진세율**
- `rates.residential.single_home_special`: **공시가격 9억 이하 1주택자** 완화세율(엘리지빌리티 포함)
- `caps.burden_limit`: 전년도 대비 **세부담상한** (가격대별 cap)
- `payment.residential.installment_months`: 7·9월 분납 구조
- `additional_taxes`: 도시지역분/지방교육세 등 부가세목 설정

> 계산 절차(개요):  
> 1) 과세표준 = 공시가격 × 공정시장가액비율 → 구간별 세율 적용(표준/특례 중 선택)  
> 2) 세부담상한 적용: `min(당해연도 산출세액, 전년도 납부세액 × cap_ratio)`  
> 3) 도시지역분·지방교육세 등 부가세목 순차 반영


