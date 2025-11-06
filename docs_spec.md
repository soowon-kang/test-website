
# GitHub Pages UI Spec — KR Real‑Estate Tax Calculator (2025)

본 문서는 **Cursor AI**가 즉시 구현할 수 있도록 작성된 **프론트엔드 UI/UX & 데이터 계약(Contract)** 사양입니다.  
목표: GitHub Pages(정적 사이트)에서 **취득세 / 양도소득세 / 재산세 / 종합부동산세** 계산기를 **탭(Tab)** UI로 제공하고, **입력 → 계산 → 근거/과정 → 결과표**를 한 화면에서 확인할 수 있도록 구현.

---

## 0. 기술 스택 (권장)
- React + Vite (+ TypeScript)
- TailwindCSS (+ shadcn/ui)
- React Hook Form + Zod
- GitHub Pages 배포(액션)
- 규칙 로딩: tax_rules/KR-2025/*.yaml → 빌드 전 JSON 변환 (prebuild 스크립트)

---

## 1. 정보 구조 (탭 구성)
상단 4개 탭:
1) 취득세
2) 양도소득세
3) 재산세
4) 종합부동산세

각 탭 공통 레이아웃:
- (A) 입력: 금액 input(3자리 콤마), checkbox/select, 지분 repeater
- (B) 계산 버튼 + 검증 메시지
- (C) 계산 과정/근거(Explainer)
- (D) 결과표(Result Table)

---

## 2. 입력 스펙

### 공통
- 지역 선택(Seoul/Songpa 등) → regions.yaml로 규제 플래그 자동 해석
- 공동소유(checkbox) + 지분 리스트: {name, share(0~1), householdKey?} (합=1.0)
- 전용면적(m²), 기준일(date)

### 취득세
- 취득가액, 취득유형(유상/증여/원시), 주택 수, 생애최초, 법인
- 6~9억 연속형 세율 + 85㎡ 농특 자동

### 양도소득세
- 취득가액, 양도가액, 필요경비, 보유기간, 거주기간, 1세대1주택 여부
- 고가 1주택 비율 과세: ratio = max((양도가액-12억)/양도가액, 0) (세대 기준→지분 적용)
- LTTD(보유 4% + 거주 4%, 각 10년, 최대 80%)

### 재산세
- 공시가격, 1주택(9억 이하) 특례 여부, 전년도 납부세액, 분납 시기

### 종합부동산세
- 개인별 지분 공시가격 합계 자동
- 공동명의 1주택 특례(선택), 고령자/장기보유 공제 입력

---

## 3. 계산 플로우

1) Zod 검증 → 2) 규칙 로딩(JSON) → 3) 지역 플래그 해석  
4) calc 모듈 순수함수 실행 → 5) Explainer 생성 → 6) 결과표 렌더

---

## 4. 결과표 규격

공통 컬럼: 항목, 금액(KRW), 비고/근거(아이콘 hover)  
- 취득세: 기본/지방교육/농특/(중과분)지방교육/(중과분)농특/합계  
- 양도세: 개인별 과세대상양도차익, LTTD, 기본공제, 과세표준, 산출세액, 지방소득세, 개인합/전체합  
- 재산세: 표준/특례 세액, 세부담상한, 도시지역분/지방교육세, 합계  
- 종부세: 공제(9억/12억), 과표, 산출세액, 재산세상당액 공제, (1주택) 세액공제, 합계

---

## 5. Explainer(근거/과정)

- 적용 규칙 버전: KR-2025.xx (파일/버전)
- 공식: 예) 6~9억 선형, 고가 1주택 비율 과세
- 순서: 세대 비율 → 지분 적용 → LTTD → 기본공제 → 누진세율
- 출처 링크: NTS/행안부/정책브리핑
- 일몰/주의: active_until 표시

---

## 6. 컴포넌트 구조(제안)
/src
  /components { Tabs, MoneyInput, ShareRepeater, RegionPicker, Explainer, ResultTable }
  /calc { acquisition.ts, capital_gain.ts, holding_local.ts, holding_glt.ts }
  /rules { loadRules.ts, regions.ts }
  /pages { index.tsx }

- calc는 순수함수. I/O/네트워크 없음.

---

## 7. JSON I/O 계약
type MoneyRow = { key: string; label: string; amount: number; note?: string; ref?: string };
type CalcResult = {
  version: string;
  rows: MoneyRow[];
  total: number;
  explainer: { summary: string[]; formulas: string[]; order: string[]; refs: {label:string;url:string}[] };
  perOwner?: Array<{ ownerId: string; rows: MoneyRow[]; total: number }>;
};

---

## 8. 접근성/사용성
- 탭 a11y(role="tablist"), 키보드 포커스
- 금액 포맷팅/유효성 메시지, 모바일 테이블 접기

---

## 9. Pages 배포
- Vite base를 리포명으로 설정
- Actions로 npm ci && npm run build 후 deploy-pages

예시: .github/workflows/pages.yml 포함

---

## 10. 수용 기준
- 4개 탭 계산 동작
- 입력→계산→근거→결과표 한 화면
- YAML 규칙 반영
- 고가 1주택(세대 비율)·연속형 세율·지분 분배·특례 모드 동작
- Pages 배포 성공 및 캐시 무효화

---

## 11. 개발 순서
1) 규칙 로더/지역 플래그  
2) calc 순수함수 + 단위테스트  
3) UI 조립 + Explainer 연결  
4) Pages 배포 파이프라인  
5) 모바일 QA 및 i18n 정리
