
# KR Real‑Estate Tax Calculator — GitHub Pages Bundle

## 사용법
1) 이 폴더 내용을 저장소 루트에 복사
2) `tax_rules/KR-2025/*.yaml`이 레포 루트에 있어야 build 시 JSON으로 변환됩니다.
3) 로컬 실행
```bash
npm ci
npm run dev
```
4) GitHub Pages 배포
- 기본 브랜치 `main`에 푸시하면 `.github/workflows/pages.yml`이 빌드/배포합니다.
- 저장소 Settings → Pages에서 `GitHub Actions` 선택
- **Vite base 경로**: 저장소명이 `RealEstate-Simulator`라면, Actions `build` 단계의 `GHP_BASE`를 `"/RealEstate-Simulator/"`로 설정하세요.

## 구조
- `src/calc/*`: 순수함수 기반 탭 컴포넌트(데모 포함)
- `src/rules/loadRules.ts`: `public/rules/*.json` 로드
- `scripts/convert-rules.cjs`: `tax_rules/KR-2025/*.yaml` → `public/rules/*.json` 변환 (prebuild)
- `public/rules/*.json`: 변환된 룰 (Pages에 함께 배포)

## 주의
- 현재는 취득세/양도세 데모 계산 로직만 포함. 재산세/종부세는 규칙 연동 후 구현하세요.
- 생산 운영 시 규칙 파일의 버전/효력일 검증, 예외처리를 강화하세요.
