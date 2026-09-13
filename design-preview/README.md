# ANY 홈 디자인 미리보기

`docs/design-web.md` v0.2를 적용한 독립 홈 시안. 홈 정식 적용 전의 승인된 시안을 보존한다. 현재 공개 홈은 저장소 루트의 `index.html`이다.

## 실행

저장소 루트에서 실행한다. 하위 페이지 링크가 루트 기준이므로 이 폴더만 별도로 서빙하지 않는다.

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

브라우저에서 <http://127.0.0.1:8765/design-preview/>를 연다.

## 범위

- ANY 원본 흑백 로고, Pretendard 로컬 폰트, 흰 바탕·녹색 UI·작은 라임 포인트
- 짧은 제목, 세 분야, 자료 목록, 연락 링크
- 자료 8개의 검색·유형 필터·빈 결과·초기화
- 모바일 펼침 메뉴, Tab 탐색, Escape 닫기 및 포커스 복귀
- 하위 페이지 링크는 기존 사이트 화면으로 이동
- 기본 자료는 정적 HTML로 제공하고 JavaScript가 켜지면 검색 UI 활성화
- 카운터·추적 요청 없음. 검색엔진용 `noindex, nofollow` 지정

콘텐츠는 작성 시점 로컬 `data/courses.json`, `data/columns.json`과 기존 홈의 두 공개 도구에서 가져온 스냅숏이다. 배포 사이트의 최신 자료를 자동 동기화하는 구현은 아니다.

## 자산 출처

- `../assets/any/any-logo-mono-reference.jpg`: [any-branding 원본](https://github.com/amnotyoung/any-branding/blob/HEAD/../assets/any/brand/any-logo-mono-reference.jpg), 원본 픽셀 그대로 사용
- 로고 JPG 360×360px, 짙은 도형의 측정 경계 약 x54–299 / y133–217. 파일 표시 폭 100px일 때 도형 약 68px, 모바일 80px일 때 도형 약 54px
- `../assets/any/PretendardVariable.woff2`: [Pretendard v1.3.9](https://github.com/orioncactus/pretendard/tree/v1.3.9), SIL OFL 1.1, `../assets/any/Pretendard-LICENSE.txt` 동봉

폰트는 시안용 전체 가변 파일 약 2MB이다. 정식 적용 전에는 필요한 문자 범위와 로딩 전략에 맞는 배포 최적화를 검토한다.

## 검수 기록 · 2026-09-13

v0.2: 중복 슬로건·안내·칼럼 영역 제거, 자료당 링크 하나로 통합, 선택 정보 중심 설명과 간격 축소. 320–1440px 가로 넘침 없음, 자료 8개 각각 링크 1개, 필터·빈 결과·초기화 재확인.

- 320, 390, 768, 1024, 1440 CSS px: 문서 가로 넘침 없음, Pretendard 로드 확인
- 데스크톱 첫 화면, 모바일 첫 화면 및 카테고리 시각 확인
- 칼럼 분류 2개 → 책임 검색 2개 → 없는 검색어 0개 → 초기화 8개 확인
- 모바일 메뉴 펼침, Tab으로 첫 링크 이동, Escape 닫기와 토글 포커스 복귀 확인
- 브라우저 오류·경고 로그 없음

확대·스크린리더·인쇄·다른 브라우저까지 포함한 전체 접근성 적합성 검수는 아직 수행하지 않았다.
