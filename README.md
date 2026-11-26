# amnotyoung Open Archive

공개 강의, 개발협력·조달·건축 프로젝트를 목적별로 연결하는 사이트 대문입니다.

사이트: <https://amnotyoung.github.io/>

## 디자인 명세

[ANY 웹사이트 디자인 명세 초안](docs/design-web.md)은 브랜드 시각 원칙을 웹의 탐색·읽기·반응형 화면에 맞게 확장한 제안입니다. 공통 규칙과 사이트 적용안을 구분합니다. 홈에 v0.2의 색상·서체·간명성 원칙을 적용했습니다.

홈 목록은 `data/courses.json`, `data/collections.json`에서 생성합니다. 짧은 소개는 `data/home.json`의 `summaries`에서 관리하며, 항목이 없으면 원래 설명을 사용합니다. 공개 도구는 공개 저장소 목록과 같은 데이터에서 가져옵니다. 배포 시 목록을 자동 생성합니다.

```sh
node scripts/build-home.mjs
node scripts/build-collections.mjs
node scripts/build-home.mjs --check
node scripts/build-collections.mjs --check
node scripts/validate-branding.mjs
node scripts/validate-view-counts.mjs
```

홈과 교육·개발협력·공개 저장소 목록은 `home.css`, `home.js`의 공통 디자인·검색·메뉴를 사용합니다. 목록 전용 배치는 `collections.css`, 브랜드 자산은 `assets/any/`에 있습니다. 목록 데이터는 배포 시 `scripts/build-collections.mjs`로 갱신하며, 프로젝트·저장소 정보는 `data/collections.json`에서 관리합니다. `/design-preview/`는 검색 제외·카운터 없는 초기 시안입니다.

교육 과정과 장·모듈 문서는 기존 학습 레이아웃 위에 `courses/learning-brand.css`와 `courses/learning-brand.js`를 로드합니다. 공통 헤더·모바일 메뉴·색상·서체·푸터는 이 두 파일에서 관리하고, KOICA·ODA 통계의 장 목차와 완료 상태는 각 과정 스크립트에서 유지합니다. 공통 자산은 상대경로로 참조해 개별 HTML 파일을 직접 열어도 표시되며, 이때 디렉터리 링크는 `index.html`로 연결됩니다.

## 카테고리

- AI·데이터 교육: <https://amnotyoung.github.io/courses/>
- 개발협력·해외조달: 사업 위치 지도, 국가별 조달·건축 제도와 사례 데이터 <https://amnotyoung.github.io/development-cooperation/>

## 방문·조회 카운트

모든 공개 페이지는 개인정보를 저장하지 않는 Hits 카운터로 사이트 누적 방문을 기록합니다.
GitHub Pages 예약 배포가 매시간 사이트 누적 방문 횟수를 갱신합니다.

## AI·데이터 교육 과정 추가하기

새 강의는 `data/courses.json`에 항목을 추가하면 강의 아카이브 첫 화면에 자동으로 나타납니다.

필수 정보는 제목, 소개, 대상, 태그, 강의 URL, 저장소 URL, 강의 단위 수와 슬라이드 수입니다. `filters`에는 `work`, `claude`, `data`, `stats` 가운데 해당하는 값을 넣습니다.

## 현재 수록된 자료

- KOICA 해외사무소 AI·데이터 활용 교육
- 점심시간 Claude Code 캠프
- 데이터 고급 통계 분석 실무 활용
- AI, 개인의 도구에서 조직을 잇는 시스템으로
- GitHub 온보딩: 22장 슬라이드, 조작형 데모 4개, 한국어 자막 영상 30초
- AI로 하는 사업 실행관리·보고 실무

각 강의에는 웹에서 읽는 과정 페이지와 필요한 경우 기존 슬라이드·PDF로 이동하는 선택지가 함께 제공됩니다. KOICA 과정은 9개 장, ODA 통계 과정은 5개 모듈을 독립된 학습 문서로 제공하며, AI 협업 과정은 9개 모듈을 한 페이지에서 검색하고 골라 읽을 수 있습니다. 각 문서에는 개념 설명, 실제 데이터와 코드, 해석, 실습, 검증 체크리스트가 포함됩니다.
