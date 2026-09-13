# amnotyoung Open Archive

공개 강의, 개발협력·조달·건축 프로젝트와 기술·사회 주간 칼럼을 목적별로 연결하는 사이트 대문입니다.

사이트: <https://amnotyoung.github.io/>

## 디자인 명세

[ANY 웹사이트 디자인 명세 초안](docs/design-web.md)은 브랜드 시각 원칙을 웹의 탐색·읽기·반응형 화면에 맞게 확장한 제안입니다. 공통 규칙과 사이트 적용안을 구분합니다. 홈에 v0.2의 색상·서체·간명성 원칙을 적용했습니다.

홈 목록은 `data/courses.json`, `data/columns.json`, `data/home.json`에서 생성합니다. 짧은 소개는 `data/home.json`의 `summaries`에서 관리하며, 항목이 없으면 원래 설명을 사용합니다. 배포 시 목록을 자동 생성합니다.

```sh
node scripts/build-home.mjs
node scripts/build-home.mjs --check
node scripts/validate-columns.mjs
node scripts/validate-view-counts.mjs
```

홈 스타일과 검색·메뉴는 `home.css`, `home.js`, 브랜드 자산은 `assets/any/`에 있습니다. 교육·칼럼 등 하위 페이지는 기존 화면을 유지합니다. `/design-preview/`는 검색 제외·카운터 없는 초기 시안입니다.

## 카테고리

- AI·데이터 교육: <https://amnotyoung.github.io/courses/>
- 개발협력·해외조달: 동향, 사업 포트폴리오, 국가별 조달·건축 제도와 사례 데이터 <https://amnotyoung.github.io/development-cooperation/>
- 주간 칼럼: <https://amnotyoung.github.io/columns/>

## 주간 칼럼 추가하기

각 글은 `columns/YYYY-Www/index.html`에 저장하고 `columns/index.html`의 최신 글과
목록을 갱신합니다. 기술과 사회, 조직, 국제개발협력을 한 주의 뉴스와 독서 관점으로
연결하는 장문 원고를 싣습니다.

## 방문·조회 카운트

모든 공개 페이지는 개인정보를 저장하지 않는 Hits 카운터로 사이트 누적 방문을 기록합니다.
칼럼 글은 별도 경로로 조회를 기록하며, 칼럼 목록은 `data/pageviews.json`의 읽기 전용
집계값만 표시해 목록 방문이 글 조회수에 포함되지 않도록 했습니다. GitHub Pages 예약 배포가
매시간 공개 집계값을 갱신합니다. 표시 숫자는 고유 사용자 수가 아니라 누적 페이지 방문 횟수입니다.

## AI·데이터 교육 과정 추가하기

새 강의는 `data/courses.json`에 항목을 추가하면 강의 아카이브 첫 화면에 자동으로 나타납니다.

필수 정보는 제목, 소개, 대상, 태그, 강의 URL, 저장소 URL, 강의 단위 수와 슬라이드 수입니다. `filters`에는 `work`, `claude`, `data`, `stats` 가운데 해당하는 값을 넣습니다.

## 현재 수록된 자료

- KOICA 해외사무소 AI·데이터 활용 교육
- 점심시간 Claude Code 캠프
- 데이터 고급 통계 분석 실무 활용
- AI, 개인의 도구에서 조직을 잇는 시스템으로
- GitHub 온보딩: 22장 슬라이드, 조작형 데모 4개, 한국어 자막 영상 30초

각 강의에는 웹에서 읽는 과정 페이지와 필요한 경우 기존 슬라이드·PDF로 이동하는 선택지가 함께 제공됩니다. KOICA 과정은 9개 장, ODA 통계 과정은 5개 모듈을 독립된 학습 문서로 제공하며, AI 협업 과정은 9개 모듈을 한 페이지에서 검색하고 골라 읽을 수 있습니다. 각 문서에는 개념 설명, 실제 데이터와 코드, 해석, 실습, 검증 체크리스트가 포함됩니다.
