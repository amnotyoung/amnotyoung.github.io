window.ODA_MODULES = [
  {
    id: "m01",
    number: "01",
    label: "TOOLS & ENVIRONMENTS",
    title: "Python과 STATA, 두 환경을 연결한다",
    summary: "외부망의 AI·Colab 실험과 폐쇄망의 STATA 재현을 하나의 분석 생애주기로 설계합니다. 도구의 우열이 아니라 환경, 검증 가능성, 인수인계까지 고려해 선택합니다.",
    duration: "약 25분 · 환경 설계 실습",
    slideStart: 1,
    goals: [
      "학습용 외부망과 적용용 폐쇄망의 역할을 구분한다.",
      "같은 분석을 Python과 STATA에서 재현하는 기준을 세운다.",
      "데이터·코드·로그를 묶은 오프라인 반입 패키지를 설계한다.",
    ],
    sections: [
      {
        eyebrow: "01 · ONE WORKFLOW, TWO ENVIRONMENTS",
        title: "두 도구를 쓰는 이유는 현실의 업무 환경이 둘이기 때문이다",
        paragraphs: [
          "외부망에서는 검색, 생성형 AI, Colab, 공개 API를 사용할 수 있습니다. 질문을 빠르게 바꾸고 코드를 설명받으며 여러 분석 후보를 시험하기 좋습니다. 반면 실제 사업자료가 있는 폐쇄망에서는 인터넷이나 AI를 사용할 수 없고, 설치된 통계 패키지와 승인된 파일만으로 결과를 재현해야 합니다.",
          "따라서 목표는 Python 사용자를 STATA 사용자로 바꾸거나 그 반대로 만드는 것이 아닙니다. 외부망에서 학습한 분석 논리를 검토 가능한 코드로 고정하고, 폐쇄망에서 같은 표본과 모형으로 다시 실행하는 연결 구조를 만드는 것입니다.",
          "이때 AI가 만든 코드는 초안입니다. 실행된다는 사실은 문법 오류가 없다는 뜻일 뿐, 변수 단위·표본 선택·통계 가정이 맞다는 보장은 아닙니다. 분석가는 데이터 설명서와 출력 로그를 기준으로 코드를 승인합니다.",
        ],
        cards: [
          { title: "외부망 · 학습", text: "AI와 Colab으로 분석 질문을 구체화하고, 공개 데이터로 코드를 시험하며, 낯선 문법을 설명받습니다." },
          { title: "연결 구간 · 검토", text: "변수 정의, 표본 수, 결측 처리, 모형식과 기대 출력값을 사람이 확인하고 기록합니다." },
          { title: "폐쇄망 · 적용", text: "승인된 CSV와 STATA .do 파일을 반입해 오프라인 실행하고, 로그와 결과표를 남깁니다." },
        ],
        callout: {
          label: "원칙",
          text: "외부망에서 코드를 ‘만드는 것’보다 폐쇄망에서 동일한 결과를 ‘다시 만드는 것’이 완료 조건입니다.",
        },
      },
      {
        eyebrow: "02 · TOOL SELECTION",
        title: "분석 단계에 따라 도구의 강점이 달라진다",
        paragraphs: [
          "Python은 데이터 수집, 반복 자동화, 시각화, 머신러닝으로 자연스럽게 확장됩니다. STATA는 정형화된 통계 명령, 패널 분석, 출력 로그와 오프라인 재현이 간결합니다. 어느 한쪽이 항상 우월한 것이 아니라 현재 단계의 제약과 산출물에 맞는 도구가 있습니다.",
          "두 도구의 출력 모양은 달라도 동일한 데이터·표본·모형을 사용했다면 핵심 계수와 표본 수는 거의 같아야 합니다. 숫자가 다르면 소프트웨어 차이라고 넘기지 말고 결측 삭제, 기준범주, 가중치, 표준오차 설정부터 비교합니다.",
        ],
        table: {
          headers: ["업무", "Python · Colab", "STATA · 폐쇄망", "선택 기준"],
          rows: [
            ["공개 API 수집", "라이브러리와 반복문에 강함", "사전 수집 파일이 현실적", "최신성·자동화가 필요하면 Python"],
            ["정제·탐색", "유연한 변환과 시각화", "명령이 짧고 로그가 명확", "팀의 검토 역량을 우선"],
            ["회귀·패널", "statsmodels·linearmodels", "regress·xtreg의 표준 흐름", "같은 모형을 양쪽에서 대조"],
            ["머신러닝", "scikit-learn 생태계", "주력 영역은 아님", "예측 과제는 Python"],
            ["오프라인 재현", "환경 패키징이 추가로 필요", "단일 .do 파일로 간결", "폐쇄망 설치 현황을 우선"],
          ],
      },
      },
      {
        eyebrow: "03 · HANDOFF PIPELINE",
        title: "외부망의 실험을 폐쇄망의 재현으로 넘기는 여섯 단계",
        paragraphs: [
          "분석을 넘길 때 코드만 복사하면 데이터 버전과 실행 순서가 사라집니다. 질문, 입력, 처리, 출력, 검증 기준을 함께 묶어야 다른 사람이 같은 결과를 낼 수 있습니다.",
        ],
        steps: [
          { title: "질문을 한 문장으로 고정", text: "예: 국가의 1인당 GDP와 기대수명은 어떤 관계가 있는가? 결과변수·설명변수·분석단위를 명시합니다." },
          { title: "외부망에서 작은 표본으로 실험", text: "Colab에서 데이터 구조와 분포를 먼저 보고, 후보 모형을 실행합니다." },
          { title: "분석 사양을 기록", text: "변수 단위, 결측 처리, 로그변환, 기준범주, 고정효과와 표준오차 방식을 README에 적습니다." },
          { title: "STATA 코드로 교차 재현", text: "동일한 CSV로 관측치 수, 평균, 회귀계수와 적합도를 비교합니다." },
          { title: "반입 패키지를 동결", text: "원자료, .do 파일, 데이터 사전, 예상 결과와 체크섬을 하나의 폴더 또는 ZIP으로 묶습니다." },
          { title: "폐쇄망에서 로그를 남김", text: "00_master.do 하나로 전체 순서를 실행하고 날짜가 포함된 log 파일을 보관합니다." },
        ],
      },
      {
        eyebrow: "04 · REPRODUCIBLE PACKAGE",
        title: "폴더 구조가 분석 절차를 설명하게 만든다",
        paragraphs: [
          "재현 가능한 패키지는 ‘어떤 파일부터 열어야 하나’를 묻지 않게 합니다. 진입점은 하나이고, 원자료는 수정하지 않으며, 중간산출물과 최종표를 구분합니다. 수작업으로 셀을 수정한 파일은 원본과 다른 이름으로 저장하고 변경 이유를 기록합니다.",
        ],
        example: {
          title: "권장 오프라인 패키지",
          description: "00_master.do가 하위 스크립트를 순서대로 호출하고 모든 로그를 남깁니다.",
          code: `stata-practice/\n├── README.md\n├── data/\n│   └── wdi_panel.csv\n├── stata/\n│   ├── 00_master.do\n│   ├── 01_load_clean.do\n│   ├── 02_crosstab.do\n│   ├── 03_group_compare.do\n│   ├── 04_regression.do\n│   └── 05_panel_fe.do\n└── output/\n    ├── run.log\n    └── result_table.csv`,
        },
        callout: {
          label: "인수인계",
          text: "README에는 데이터 출처·수집일·변수 단위·실행 순서·STATA 버전·예상 관측치 수·핵심 결과값을 적습니다.",
        },
      },
      {
        eyebrow: "05 · ASK AI BETTER",
        title: "문법을 대신 묻되 분석 결정은 넘기지 않는다",
        paragraphs: [
          "좋은 요청은 ‘회귀 돌려줘’가 아니라 데이터의 열 이름과 단위, 원하는 모형식, 결측 처리, 필요한 검증 출력을 함께 줍니다. 그리고 Python과 STATA 코드를 동시에 요청해 두 구현의 차이를 설명하게 하면 검토 지점을 빠르게 찾을 수 있습니다.",
          "AI가 임의로 변수를 대체하거나 결측을 평균으로 채우지 않도록 금지 조건을 명시합니다. 결과 해석에는 ‘관계’와 ‘인과’를 구분하고, 표본 수와 가정을 함께 보고하도록 요구합니다.",
        ],
        example: {
          title: "양쪽 코드와 검증표를 함께 요청하기",
          description: "실행 환경과 금지 조건을 명확히 한 프롬프트 예시입니다.",
          code: `wdi_panel.csv에서 life_exp를 결과변수, log(gdp_pc)를 설명변수로 회귀하라.\n1) 결측값은 임의 대체하지 말고 완전사례만 사용한다.\n2) Python(statsmodels)과 STATA 코드를 각각 작성한다.\n3) 두 코드가 표본 수, 계수, R²를 어떻게 대조하는지 표로 설명한다.\n4) 계수를 10% GDP 증가의 기대수명 차이로 환산한다.\n5) 이 결과를 인과효과로 부를 수 없는 이유를 세 가지 적는다.`,
        },
      },
    ],
    practice: {
      title: "동일한 기술통계를 두 환경에서 재현하기",
      description: "wdi_panel.csv를 Python과 STATA에서 각각 읽고 관측치 수와 평균을 비교합니다.",
      steps: [
        "Python에서 행·열 수, 연도 범위, gdp_pc와 life_exp의 결측 수를 출력한다.",
        "STATA에서 describe, summarize, misstable summarize를 실행한다.",
        "두 환경의 관측치 수와 변수 평균이 같은지 비교표를 만든다.",
        "다르면 데이터 경로, 숫자형 변환, 결측값 표기부터 원인을 기록한다.",
      ],
      checklist: [
        "분석 질문과 분석단위를 한 문장으로 적었다.",
        "같은 원본 CSV를 두 환경에서 사용했다.",
        "행 수·결측 수·평균이 일치하는지 확인했다.",
        "폐쇄망 반입에 필요한 파일과 실행 순서를 적었다.",
      ],
    },
    resources: [
      { title: "강의 슬라이드 1장부터", text: "두 도구와 두 환경의 전체 흐름", url: "https://amnotyoung.github.io/oda-ai-stats/slides/viewer.html#1" },
      { title: "STATA 오프라인 패키지", text: "데이터와 6개 .do 파일을 ZIP으로 받기", url: "https://github.com/amnotyoung/oda-ai-stats/raw/main/stata-practice.zip" },
      { title: "프로젝트 README", text: "과정 구조와 실행 링크 확인", url: "https://github.com/amnotyoung/oda-ai-stats" },
    ],
  },
  {
    id: "m02",
    number: "02",
    label: "LOAD & CLEAN",
    title: "WDI 실데이터를 불러오고 정제한다",
    summary: "World Bank WDI의 2000~2022년 국가×연도 패널을 읽고, 변수 단위·결측·범위·중복을 점검한 뒤 Python과 STATA에서 동일한 분석 표본을 만듭니다.",
    duration: "약 40분 · 데이터 정제 실습",
    slideStart: 12,
    goals: [
      "4,991개 관측치의 패널 구조와 변수 단위를 설명한다.",
      "결측값을 무조건 채우지 않고 분석 목적에 맞게 처리한다.",
      "Python과 STATA에서 같은 정제 결과를 재현한다.",
    ],
    sections: [
      {
        eyebrow: "01 · DATASET AT A GLANCE",
        title: "4,991개 국가×연도 관측치가 분석의 출발점이다",
        paragraphs: [
          "실습자료는 World Bank 공식 API에서 수집한 WDI 패널입니다. 2000년부터 2022년까지 23개 연도, 217개 경제권이 포함되어 총 4,991행입니다. 경제권마다 모든 연도가 있으므로 행 수는 217×23과 같습니다.",
          "한 행은 국가 하나가 아니라 특정 경제권의 특정 연도입니다. 따라서 전체 평균은 ‘217개 국가 평균’이 아니라 각 경제권이 23번씩 나타나는 국가×연도 평균입니다. 교차표나 집단 수를 낼 때는 질문이 국가 수인지 국가×연도 수인지 먼저 정해야 합니다.",
        ],
        table: {
          headers: ["변수", "의미·단위", "결측", "실제 범위"],
          rows: [
            ["economy / economy_name", "경제권 코드·이름", "0", "217개 경제권"],
            ["year", "관측 연도", "0", "2000~2022"],
            ["region", "World Bank 지역", "0", "범주형"],
            ["income_group", "World Bank 소득그룹", "0", "범주형"],
            ["gdp_pc", "1인당 GDP, 현재 US$", "153", "109.59~226,052.00"],
            ["life_exp", "출생 시 기대수명, 년", "0", "14.66~86.15"],
            ["under5_mort", "5세 미만 사망률, 1천 명당", "483", "1.4~489.3"],
            ["pop", "총인구, 명", "0", "9,544~1,425,423,212"],
            ["prim_enroll", "초등 총취학률, %", "1,168", "21.46~183.99"],
          ],
        },
        callout: {
          label: "단위 주의",
          text: "총취학률은 해당 학령 인구가 분모이므로 유급·조기입학·늦은 입학 때문에 100%를 넘을 수 있습니다. 183.99를 곧바로 오류로 삭제하면 안 됩니다.",
        },
      },
      {
        eyebrow: "02 · LOAD AND AUDIT",
        title: "분석 전에 구조·결측·중복을 한 번에 점검한다",
        paragraphs: [
          "파일이 열렸다고 바로 회귀하지 않습니다. 첫 점검은 행·열 수, 변수형, 연도 범위, 범주값, 결측 개수, 국가×연도 키의 유일성입니다. 이 결과를 분석 로그의 첫 부분에 남기면 이후 표본 수가 줄어든 이유를 추적할 수 있습니다.",
          "CSV 경로가 웹 주소인지 로컬 파일인지와 무관하게 이후 점검 코드는 같아야 합니다. 폐쇄망에서는 RAW 값을 로컬 상대경로로만 바꾸고 나머지 코드를 유지합니다.",
        ],
        example: {
          title: "Python으로 구조와 패널 키 점검",
          description: "중복이 0인지, 연도 범위와 결측 수가 예상값과 같은지 확인합니다.",
          code: `import pandas as pd\n\nRAW = "data/wdi_panel.csv"\ndf = pd.read_csv(RAW)\n\nprint(df.shape)                         # (4991, 10)\nprint(df.year.min(), df.year.max())     # 2000 2022\nprint(df.economy.nunique())             # 217\nprint(df.isna().sum())\nprint(df.duplicated(["economy", "year"]).sum())  # 0\nprint(df.describe(include="all").T)`,
        },
      },
      {
        eyebrow: "03 · SAME CHECK IN STATA",
        title: "STATA에서도 같은 질문을 같은 순서로 묻는다",
        paragraphs: [
          "STATA의 describe는 변수형과 라벨을, summarize는 범위와 평균을, misstable summarize는 결측을 보여줍니다. isid economy year가 통과하면 국가×연도 조합이 유일하다는 뜻입니다. 문자열 코드가 패널 식별자로 바로 쓰이지 않으면 encode로 숫자 식별자를 만듭니다.",
          "정제 과정마다 count를 실행해 몇 행이 남았는지 기록합니다. 나중에 Python 결과와 회귀계수가 다를 때 첫 비교 대상은 계수가 아니라 표본 수입니다.",
        ],
        example: {
          title: "STATA로 동일한 데이터 감사",
          description: "원본을 읽고 구조·결측·범위를 확인한 뒤 패널 키를 검증합니다.",
          code: `clear all\nset more off\nimport delimited "data/wdi_panel.csv", clear varnames(1)\n\ndescribe\nsummarize year gdp_pc life_exp under5_mort pop prim_enroll\nmisstable summarize\nisid economy year\ntab income_group, missing\ntab region, missing`,
        },
      },
      {
        eyebrow: "04 · CLEAN WITHOUT HIDING MISSINGNESS",
        title: "결측은 데이터의 특성이지 자동으로 메울 빈칸이 아니다",
        paragraphs: [
          "이 과정의 기본 회귀는 gdp_pc와 life_exp가 모두 있는 완전사례를 사용합니다. life_exp에는 결측이 없고 gdp_pc 153건이 결측이므로 분석 표본은 4,838건입니다. prim_enroll까지 모형에 넣으면 1,168건의 결측 때문에 표본이 더 줄어듭니다.",
          "평균 대체는 표본 수를 보존하지만 분산과 변수 관계를 왜곡할 수 있습니다. 삭제·대체·다중대체 중 무엇을 쓰든 결측 발생 이유와 민감도 분석이 필요합니다. 입문 실습에서는 임의 대체를 하지 않고, 각 분석이 실제로 사용한 표본 수를 명시합니다.",
          "GDP와 인구는 오른쪽 꼬리가 매우 길어 로그변환을 만듭니다. 값이 0 이하이면 로그를 취할 수 있으므로 변환 전 범위를 점검해야 합니다. 이 데이터의 gdp_pc와 pop 최솟값은 모두 양수입니다.",
        ],
        example: {
          title: "분석 표본과 로그변수 만들기",
          description: "원본 df는 보존하고 analysis에 필요한 행만 복사합니다.",
          code: `import numpy as np\n\nanalysis = df.dropna(subset=["gdp_pc", "life_exp"]).copy()\nanalysis["log_gdp"] = np.log(analysis["gdp_pc"])\nanalysis["log_pop"] = np.log(analysis["pop"])\n\nprint(len(analysis))                    # 4838\nprint(analysis[["log_gdp", "log_pop"]].describe())`,
        },
        callout: {
          label: "규칙",
          text: "원자료를 덮어쓰지 말고, 어떤 조건으로 몇 행이 제외됐는지를 코드와 결과표에 함께 남깁니다.",
        },
      },
      {
        eyebrow: "05 · FIRST DESCRIPTIVE RESULT",
        title: "소득그룹 평균은 패턴을 보여주지만 원인을 증명하지 않는다",
        paragraphs: [
          "국가×연도 전체를 소득그룹별로 묶으면 기대수명 평균은 저소득 57.8년, 중저소득 64.5년, 미분류 66.1년, 중고소득 71.3년, 고소득 77.8년입니다. 소득그룹이 높을수록 평균 기대수명이 긴 뚜렷한 기울기가 보입니다.",
          "그러나 이 차이를 ‘소득그룹 상승이 기대수명을 그만큼 늘렸다’고 읽을 수는 없습니다. 의료체계, 교육, 분쟁, 지역, 역사적 조건이 동시에 다르고, 한 경제권이 여러 연도에 반복됩니다. 여기서 할 수 있는 말은 표본 안의 기술적 연관성입니다.",
        ],
        table: {
          headers: ["소득그룹", "기대수명 평균", "해석"],
          rows: [
            ["저소득", "57.8년", "국가×연도 관측치 평균"],
            ["중저소득", "64.5년", "저소득보다 6.7년 높음"],
            ["미분류", "66.1년", "경제권 성격을 별도 확인"],
            ["중고소득", "71.3년", "중저소득보다 6.8년 높음"],
            ["고소득", "77.8년", "저소득보다 20.0년 높음"],
          ],
        },
      },
    ],
    practice: {
      title: "분석 전 데이터 감사표 만들기",
      description: "Python과 STATA 결과를 나란히 놓고 불일치 원인을 추적합니다.",
      steps: [
        "원본의 행·열 수, 경제권 수, 연도 범위를 확인한다.",
        "5개 수치변수의 결측 수, 최솟값, 최댓값을 표로 만든다.",
        "economy×year 중복을 검사하고 범주형 변수의 고유값을 확인한다.",
        "gdp_pc와 life_exp 완전사례 4,838건을 만들고 log_gdp를 생성한다.",
        "Python과 STATA의 결과가 다르면 첫 불일치 단계부터 기록한다.",
      ],
      checklist: [
        "한 행의 분석단위를 국가×연도로 설명할 수 있다.",
        "변수의 단위와 범위를 데이터 사전에서 확인했다.",
        "결측을 임의로 0이나 평균으로 바꾸지 않았다.",
        "정제 전후 관측치 수를 기록했다.",
        "로그변환 전 0 이하 값의 존재를 확인했다.",
      ],
    },
    resources: [
      { title: "Colab 01 · 불러오기와 정제", text: "브라우저에서 Python 실습 실행", url: "https://colab.research.google.com/github/amnotyoung/oda-ai-stats/blob/main/notebooks/01_load_clean.ipynb" },
      { title: "STATA 01 · load_clean.do", text: "동일한 점검과 정제 코드", url: "https://github.com/amnotyoung/oda-ai-stats/blob/main/stata/01_load_clean.do" },
      { title: "WDI 패널 CSV", text: "실습 원자료 직접 보기", url: "https://github.com/amnotyoung/oda-ai-stats/blob/main/data/wdi_panel.csv" },
      { title: "강의 슬라이드 12장부터", text: "데이터 구조와 정제 설명", url: "https://amnotyoung.github.io/oda-ai-stats/slides/viewer.html#12" },
    ],
  },
  {
    id: "m03",
    number: "03",
    label: "CORE ANALYSIS",
    title: "교차표·검정·회귀를 같은 데이터로 비교한다",
    summary: "분포, 집단 차이, 변수 관계라는 서로 다른 질문에 교차표·Welch t검정·ANOVA·회귀를 적용하고, 실제 결과를 올바른 분석단위와 언어로 해석합니다.",
    duration: "약 55분 · 핵심 통계 실습",
    slideStart: 20,
    goals: [
      "질문의 형태에 맞는 통계 분석을 선택한다.",
      "p값과 효과크기, 통계적 유의성과 실질적 의미를 구분한다.",
      "Preston 회귀계수를 원 단위로 환산하고 인과 해석을 피한다.",
    ],
    sections: [
      {
        eyebrow: "01 · QUESTION BEFORE COMMAND",
        title: "통계 명령보다 먼저 답하려는 질문을 분류한다",
        paragraphs: [
          "지역별 소득그룹의 구성은 어떻게 다른가, 두 지역의 기대수명 평균은 다른가, 여러 소득그룹 평균은 같은가, GDP와 기대수명은 어떤 관계인가. 네 질문은 같은 데이터에서 출발하지만 필요한 분석은 각각 교차표, t검정, ANOVA, 회귀입니다.",
          "질문이 바뀌면 분석단위도 달라질 수 있습니다. ‘각 지역에 몇 개 경제권이 있는가’라면 economy별 한 행만 남겨야 합니다. 원본 4,991행으로 교차표를 만들면 국가 수가 아니라 국가×연도 관측치 수를 세게 됩니다.",
        ],
        table: {
          headers: ["질문", "분석", "핵심 출력", "주의점"],
          rows: [
            ["범주 구성은?", "교차표", "빈도·행/열 비율", "국가와 국가×연도 구분"],
            ["두 집단 평균은?", "Welch t검정", "평균차·t·p·신뢰구간", "등분산을 강제하지 않음"],
            ["여러 집단 평균은?", "ANOVA", "F·p", "어느 집단이 다른지는 별도 검정"],
            ["연속변수 관계는?", "회귀", "계수·표준오차·R²·N", "관계는 인과효과가 아님"],
          ],
        },
      },
      {
        eyebrow: "02 · CROSSTAB",
        title: "경제권 수를 셀 때는 23개 연도 중 한 행만 남긴다",
        paragraphs: [
          "region과 income_group은 한 경제권 안에서 반복되는 범주입니다. 경제권 구성표를 만들려면 먼저 economy를 기준으로 중복을 제거한 217행을 사용합니다. 연도별 상태 변화를 분석하는 경우라면 특정 연도를 선택하거나 전환 시점을 따로 정의해야 합니다.",
          "빈도표만 보면 큰 지역이 항상 커 보입니다. 구성비를 함께 보고 ‘지역 안에서 소득그룹 비율’인지 ‘소득그룹 안에서 지역 비율’인지 분모를 제목에 명시합니다.",
        ],
        example: {
          title: "Python과 STATA의 경제권 구성 교차표",
          description: "첫 표는 빈도, 둘째 표는 지역 내 행 비율입니다.",
          code: `# Python\ncountries = df.drop_duplicates("economy")\ncounts = pd.crosstab(countries["region"], countries["income_group"])\nrow_pct = pd.crosstab(\n    countries["region"], countries["income_group"], normalize="index"\n).mul(100).round(1)\n\n* STATA\nbysort economy (year): keep if _n == 1\ntab region income_group, row`,
        },
      },
      {
        eyebrow: "03 · GROUP COMPARISON",
        title: "사하라 이남 아프리카의 평균 기대수명은 15.5년 낮게 관측된다",
        paragraphs: [
          "국가×연도 표본에서 사하라 이남 아프리카의 기대수명 평균은 58.7년, 그 외 지역은 74.2년입니다. Welch t검정의 평균차는 -15.5년, t 통계량은 약 -67.2이며 p값은 표시 정밀도에서 0에 가깝습니다. 두 집단 평균이 같다는 귀무가설과 데이터가 매우 맞지 않는다는 뜻입니다.",
          "하지만 한 국가의 연도별 관측치는 서로 독립적이지 않습니다. 단순 t검정은 이 의존성을 반영하지 않으므로 이 결과는 교육용 기술 비교입니다. 최종 추론에서는 국가 수준 군집표준오차, 패널 구조, 시간 추세를 고려해야 합니다.",
          "소득그룹 5개 평균을 ANOVA로 비교하면 F≈1,877.4, p값은 0에 가깝습니다. 이는 적어도 한 그룹 평균이 다르다는 뜻이지 모든 쌍이 다르거나 소득그룹이 원인이라는 뜻은 아닙니다. 어떤 쌍이 다른지 보려면 다중비교 보정이 포함된 사후검정이 필요합니다.",
        ],
        table: {
          headers: ["분석", "실제 결과", "말할 수 있는 것", "말할 수 없는 것"],
          rows: [
            ["Welch t검정", "58.7 vs 74.2, Δ=-15.5, t=-67.2", "표본 평균 차이가 큼", "지역의 순수 인과효과"],
            ["일원 ANOVA", "F≈1,877.4, p<0.001", "그룹 평균이 모두 같지는 않음", "어느 쌍이 왜 다른지"],
          ],
        },
        example: {
          title: "Welch t검정과 ANOVA",
          description: "equal_var=False로 등분산 가정을 강제하지 않습니다.",
          code: `from scipy import stats\n\nssa = df.loc[df.region.eq("Sub-Saharan Africa"), "life_exp"].dropna()\nother = df.loc[~df.region.eq("Sub-Saharan Africa"), "life_exp"].dropna()\nt, p = stats.ttest_ind(ssa, other, equal_var=False)\nprint(ssa.mean(), other.mean(), t, p)\n\ngroups = [g.life_exp.dropna() for _, g in df.groupby("income_group")]\nf, p_anova = stats.f_oneway(*groups)\nprint(f, p_anova)`,
        },
      },
      {
        eyebrow: "04 · PRESTON CURVE",
        title: "GDP를 로그로 바꾸면 기대수명과의 완만해지는 관계가 보인다",
        paragraphs: [
          "1인당 GDP와 기대수명의 관계는 직선보다 초기에 가파르고 소득이 높아질수록 완만해지는 Preston 곡선에 가깝습니다. GDP 원값은 극단적으로 오른쪽으로 치우쳐 있으므로 자연로그를 취해 경제권 간 비율 차이를 다루고 산점도의 관계를 더 선형에 가깝게 만듭니다.",
          "완전사례 4,838건의 단순 회귀에서 log_gdp 계수는 4.586, 절편은 31.275, R²는 0.679입니다. log_gdp가 1 증가하는 것은 GDP가 e배가 되는 것이므로 기대수명은 평균 4.59년 높게 관측됩니다. GDP 10% 증가로 환산하면 4.586×ln(1.1)≈0.44년입니다.",
          "이 0.44년은 동일 국가의 GDP를 정책으로 10% 올리면 생기는 효과가 아닙니다. 지역, 보건투자, 교육, 제도, 연도 추세가 빠져 있고 국가 간 차이와 국가 내 변화가 섞인 상관관계입니다.",
        ],
        table: {
          headers: ["항목", "추정값", "읽는 법"],
          rows: [
            ["표본 수 N", "4,838", "gdp_pc·life_exp 완전사례"],
            ["절편", "31.275", "log GDP=0일 때의 수학적 기준점"],
            ["log_gdp 계수", "4.586", "GDP e배와 기대수명 +4.59년의 연관"],
            ["GDP 10% 환산", "약 +0.44년", "4.586×ln(1.1)"],
            ["R²", "0.679", "표본 내 변동의 67.9% 설명"],
          ],
        },
        example: {
          title: "동일한 Preston 회귀 실행",
          description: "Python의 statsmodels와 STATA regress에서 N·계수·R²를 대조합니다.",
          code: `# Python\nimport numpy as np\nimport statsmodels.formula.api as smf\nreg = df.dropna(subset=["gdp_pc", "life_exp"]).copy()\nreg["log_gdp"] = np.log(reg["gdp_pc"])\nmodel = smf.ols("life_exp ~ log_gdp", data=reg).fit()\nprint(model.summary())\n\n* STATA\ndrop if missing(gdp_pc, life_exp)\ngenerate log_gdp = ln(gdp_pc)\nregress life_exp log_gdp`,
        },
      },
      {
        eyebrow: "05 · INTERPRETATION DISCIPLINE",
        title: "p값이 작아도 질문에 답한 것은 아닐 수 있다",
        paragraphs: [
          "표본이 크면 작은 차이도 통계적으로 유의해질 수 있습니다. 따라서 평균차나 회귀계수의 크기, 신뢰구간, 단위, 표본 수를 p값과 함께 제시합니다. ‘유의하다’는 표현만 남기면 정책적으로 얼마나 중요한지 알 수 없습니다.",
          "분석 결과 문장은 표본, 방향, 크기, 불확실성, 한계를 포함하면 좋습니다. 예를 들어 ‘2000~2022년 국가×연도 표본에서 1인당 GDP가 10% 높은 관측치는 기대수명이 평균 약 0.44년 높았으며, 이는 관찰연구의 연관성으로 인과효과를 뜻하지 않는다’처럼 씁니다.",
        ],
        callout: {
          label: "보고 문장",
          text: "숫자를 내는 데서 끝내지 말고 분석단위, 단위 환산, 표본 수, 인과 해석의 한계를 한 문단에 함께 적습니다.",
        },
      },
    ],
    practice: {
      title: "하나의 질문을 두 도구에서 끝까지 검증하기",
      description: "교차표·검정·회귀 중 하나를 선택해 코드, 결과, 해석을 한 페이지로 만듭니다.",
      steps: [
        "질문과 필요한 분석단위를 먼저 적고 사용할 변수를 선택한다.",
        "Python에서 분석을 실행하고 N, 효과크기, p값 또는 R²를 기록한다.",
        "동일한 표본과 모형을 STATA에서 실행해 핵심 수치를 대조한다.",
        "분석 결과를 관계 언어로 해석하고 인과로 오해할 문장을 수정한다.",
        "표본 의존성, 결측, 다중비교 등 다음 분석에서 보완할 한계를 적는다.",
      ],
      checklist: [
        "질문에 맞는 분석을 선택했다.",
        "국가 수와 국가×연도 수를 혼동하지 않았다.",
        "p값과 함께 효과크기와 표본 수를 적었다.",
        "로그계수를 원래 단위로 환산했다.",
        "상관관계를 인과효과로 표현하지 않았다.",
      ],
    },
    resources: [
      { title: "Colab 02 · 핵심 통계 분석", text: "교차표·검정·회귀 전체 실습", url: "https://colab.research.google.com/github/amnotyoung/oda-ai-stats/blob/main/notebooks/02_core_analysis.ipynb" },
      { title: "STATA 02~04", text: "교차표·집단비교·회귀 코드 모음", url: "https://github.com/amnotyoung/oda-ai-stats/tree/main/stata" },
      { title: "강의 슬라이드 20장부터", text: "핵심 분석 설명과 출력", url: "https://amnotyoung.github.io/oda-ai-stats/slides/viewer.html#20" },
    ],
  },
  {
    id: "m04",
    number: "04",
    label: "CAUSAL & MACHINE LEARNING",
    title: "고정효과로 통제하고 머신러닝으로 확장한다",
    summary: "국가·연도 고정효과가 GDP 계수를 어떻게 바꾸는지 확인하고, Python의 API 수집과 랜덤포레스트 예측으로 확장하되 인과추론과 예측을 엄격히 구분합니다.",
    duration: "약 60분 · 패널·머신러닝 실습",
    slideStart: 27,
    goals: [
      "pooled OLS와 국가·연도 고정효과의 질문 차이를 설명한다.",
      "고정효과가 들어가도 자동으로 인과효과가 되지 않는 이유를 말한다.",
      "예측 성능과 변수 중요도를 정책 효과로 오해하지 않는다.",
    ],
    sections: [
      {
        eyebrow: "01 · BETWEEN AND WITHIN",
        title: "국가 간 차이와 한 국가 안의 변화를 분리한다",
        paragraphs: [
          "pooled OLS는 부유한 국가와 가난한 국가의 차이, 한 국가의 시간 변화, 세계 공통 추세를 모두 섞어 하나의 기울기로 추정합니다. 국가 고정효과는 시간에 따라 변하지 않는 지리·문화·역사·제도 같은 국가 특성을 제거하고, 같은 국가 안에서 GDP가 달라질 때 기대수명이 어떻게 함께 변했는지 봅니다.",
          "연도 고정효과를 추가하면 의학기술 발전, 세계 경기, 국제 보건 캠페인처럼 모든 국가에 공통인 연도 충격도 제거합니다. 계수의 질문이 달라지기 때문에 값이 작아지는 것은 실패가 아니라 단순 회귀가 무엇을 섞고 있었는지를 보여주는 정보입니다.",
        ],
        cards: [
          { title: "Pooled OLS", text: "국가 간 차이와 국가 내 변화가 모두 섞인 전체 표본의 연관성입니다." },
          { title: "국가 고정효과", text: "시간불변 국가 특성을 제거하고 같은 국가 안의 변화를 사용합니다." },
          { title: "이원 고정효과", text: "국가 특성과 모든 국가에 공통인 연도 충격을 함께 통제합니다." },
        ],
      },
      {
        eyebrow: "02 · COEFFICIENT JOURNEY",
        title: "GDP 계수는 4.59에서 1.26으로 줄어든다",
        paragraphs: [
          "동일한 WDI 패널에서 log_gdp 계수는 pooled OLS 4.59, 국가 고정효과 3.54, 국가+연도 고정효과 1.26으로 줄어듭니다. 국가 간 구조적 차이와 공통 시간 추세를 통제할수록 GDP와 기대수명의 부분적 연관성이 작아집니다.",
          "이 결과는 STATA 19와 Python linearmodels에서 교차 확인한 값입니다. 표준오차는 국가 수준으로 군집화해 같은 국가의 연도별 오차가 서로 관련될 수 있음을 반영합니다. 결과표에는 계수뿐 아니라 어떤 고정효과와 표준오차를 사용했는지 반드시 표시합니다.",
        ],
        table: {
          headers: ["모형", "log_gdp 계수", "주로 사용하는 변동", "통제"],
          rows: [
            ["Pooled OLS", "4.59", "국가 간 + 국가 내", "없음"],
            ["국가 FE", "3.54", "국가 내 시간 변화", "시간불변 국가 특성"],
            ["국가+연도 FE", "1.26", "공통 추세를 제외한 국가 내 변화", "국가 특성 + 연도 충격"],
          ],
        },
        example: {
          title: "Python과 STATA의 이원 고정효과",
          description: "국가별 군집표준오차를 사용하고 같은 변수 정의를 유지합니다.",
          code: `# Python: linearmodels\nfrom linearmodels.panel import PanelOLS\npanel = analysis.set_index(["economy", "year"])\ntwfe = PanelOLS.from_formula(\n    "life_exp ~ 1 + log_gdp + EntityEffects + TimeEffects", data=panel\n).fit(cov_type="clustered", cluster_entity=True)\nprint(twfe.summary)\n\n* STATA\nencode economy, gen(country_id)\nxtset country_id year\nxtreg life_exp log_gdp i.year, fe vce(cluster country_id)`,
        },
      },
      {
        eyebrow: "03 · CAUSAL CAUTION",
        title: "고정효과는 인과추론의 엔진이지 인과성 인증서가 아니다",
        paragraphs: [
          "고정효과는 관찰되지 않은 모든 차이를 없애지 않습니다. 시간에 따라 변하는 보건예산, 분쟁, 정책개혁, 전염병이 GDP와 기대수명에 동시에 영향을 주면 여전히 누락변수 편향이 남습니다. 기대수명이 높아 생산성이 오르는 역인과도 가능합니다.",
          "DiD 역시 명령어를 실행한다고 설계가 완성되지 않습니다. 처치가 없었더라면 처치군과 비교군의 결과 추세가 평행했을 것이라는 가정, 처치 시점, 선행효과, 비교군 오염을 검토해야 합니다. 단계적 도입에서는 전통적 이원 고정효과 추정량의 가중 문제도 확인합니다.",
        ],
        table: {
          headers: ["확인 질문", "왜 필요한가"],
          rows: [
            ["정책 전 추세가 비슷한가?", "평행추세 가정의 관찰 가능한 단서를 확인"],
            ["처치 이전에 효과가 보이는가?", "선행효과·사전 차이·모형 오류 탐지"],
            ["동시에 바뀐 정책이 있는가?", "시간가변 교란요인 점검"],
            ["비교군이 처치에 노출되지 않았는가?", "파급효과와 오염 확인"],
            ["표준오차를 적절히 군집화했는가?", "반복관측의 의존성 반영"],
          ],
        },
        callout: {
          label: "판단",
          text: "인과 해석은 회귀식의 이름이 아니라 사업 배정 과정, 비교집단, 시간 구조, 가정 검증에서 나옵니다.",
        },
      },
      {
        eyebrow: "04 · PYTHON STRENGTH: LIVE DATA",
        title: "공개 API에서 수집·정제·분석을 한 흐름으로 자동화한다",
        paragraphs: [
          "Python의 강점은 통계 모형 자체보다 데이터 수집과 분석을 한 스크립트로 연결할 때 두드러집니다. wbgapi 같은 라이브러리로 WDI 지표를 직접 가져오고, 수집일과 지표 코드를 기록해 반복 실행할 수 있습니다.",
          "다만 라이브 API는 시간이 지나면 값이 개정될 수 있고 네트워크 실패나 메타데이터 변화가 생길 수 있습니다. 최종 분석에는 원본 응답 또는 고정 CSV를 보관해 결과 버전을 동결합니다.",
        ],
        example: {
          title: "World Bank API 수집 예시",
          description: "지표 코드와 연도 범위를 명시하고 반환 구조를 바로 점검합니다.",
          code: `import wbgapi as wb\n\nindicators = {\n    "NY.GDP.PCAP.CD": "gdp_pc",\n    "SP.DYN.LE00.IN": "life_exp",\n}\nlive = wb.data.DataFrame(\n    list(indicators), economy="all", time=range(2000, 2023), labels=True\n)\nprint(live.shape)\nprint(live.head())`,
        },
      },
      {
        eyebrow: "05 · PREDICTION IS NOT POLICY EFFECT",
        title: "랜덤포레스트는 잘 맞히지만 왜 바뀌는지는 말하지 않는다",
        paragraphs: [
          "결측이 없는 3,774개 관측치와 13개 특성을 사용해 75:25 무작위 분할을 한 결과, 랜덤포레스트의 테스트 R²는 0.959, 동일 특성의 선형회귀는 0.818이었습니다. 비선형성과 변수 간 상호작용을 포착한 랜덤포레스트가 이 표본의 기대수명을 더 정확히 예측했습니다.",
          "변수 중요도는 사하라 이남 아프리카 더미 0.529, log_gdp 0.298, log_pop 0.112, prim_enroll 0.039 순이었습니다. 이는 예측 오차를 줄이는 데 해당 변수가 얼마나 사용됐는지를 보여줄 뿐, 지역이나 GDP의 인과효과 크기가 아닙니다.",
          "또한 무작위 행 분할은 같은 국가의 다른 연도가 학습과 테스트에 동시에 들어갈 수 있어 성능이 낙관적일 수 있습니다. 실제 신규 국가 예측에는 국가 단위 GroupKFold, 미래 예측에는 시간 기준 분할을 사용해야 합니다. 여기의 0.959는 입문용 동일분포 테스트 성능입니다.",
        ],
        table: {
          headers: ["항목", "검산 결과", "해석 주의"],
          rows: [
            ["모형 표본", "3,774 × 13", "완전사례와 더미변수 기준"],
            ["Random Forest 테스트 R²", "0.959", "무작위 분할의 예측 성능"],
            ["선형회귀 테스트 R²", "0.818", "동일 특성 기준 비교"],
            ["최상위 중요도", "SSA 0.529, log_gdp 0.298", "인과효과가 아님"],
          ],
        },
        example: {
          title: "랜덤포레스트와 선형회귀 비교",
          description: "같은 훈련·테스트 표본으로 두 모델의 테스트 R²를 비교합니다.",
          code: `from sklearn.ensemble import RandomForestRegressor\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.model_selection import train_test_split\n\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.25, random_state=42\n)\nrf = RandomForestRegressor(n_estimators=300, random_state=42)\nrf.fit(X_train, y_train)\nols = LinearRegression().fit(X_train, y_train)\nprint("RF", rf.score(X_test, y_test))   # 0.959\nprint("OLS", ols.score(X_test, y_test)) # 0.818`,
        },
      },
    ],
    practice: {
      title: "설명 모형과 예측 모형을 같은 표로 비교하기",
      description: "고정효과와 랜덤포레스트가 각각 어떤 질문에 답하는지 구분합니다.",
      steps: [
        "pooled OLS, 국가 FE, 이원 FE의 log_gdp 계수를 한 표로 만든다.",
        "각 모형이 제거하는 변동과 여전히 남는 교란을 한 줄씩 적는다.",
        "랜덤포레스트와 선형회귀의 동일 테스트 표본 R²를 비교한다.",
        "무작위 분할을 국가 단위 또는 시간 단위 분할로 바꾸고 성능 변화를 본다.",
        "변수 중요도를 인과효과로 오해한 문장을 찾아 예측 언어로 고친다.",
      ],
      checklist: [
        "국가 간 차이와 국가 내 변화를 구분했다.",
        "고정효과와 군집표준오차 설정을 결과표에 적었다.",
        "누락된 시간가변 교란요인을 검토했다.",
        "학습·테스트 분할이 실제 사용 장면과 맞는지 확인했다.",
        "예측 중요도를 정책 효과로 표현하지 않았다.",
      ],
    },
    resources: [
      { title: "Colab 03 · 패널 고정효과", text: "pooled·국가 FE·이원 FE 비교", url: "https://colab.research.google.com/github/amnotyoung/oda-ai-stats/blob/main/notebooks/03_panel_fe.ipynb" },
      { title: "Colab 04 · Python의 강점", text: "API 수집과 머신러닝 실습", url: "https://colab.research.google.com/github/amnotyoung/oda-ai-stats/blob/main/notebooks/04_python_strength.ipynb" },
      { title: "STATA 05 · panel_fe.do", text: "폐쇄망 패널 고정효과 코드", url: "https://github.com/amnotyoung/oda-ai-stats/blob/main/stata/05_panel_fe.do" },
      { title: "강의 슬라이드 27장부터", text: "인과추론과 머신러닝 설명", url: "https://amnotyoung.github.io/oda-ai-stats/slides/viewer.html#27" },
    ],
  },
  {
    id: "m05",
    number: "05",
    label: "HUMAN VERIFICATION",
    title: "AI가 낮춘 난이도를 사람의 검증력으로 보완한다",
    summary: "AI가 만든 그럴듯한 오류를 시각화, 도메인 지식, 동료 회람으로 찾아냅니다. 데이터 출처부터 해석 문장까지 책임 있게 검증하는 최종 점검 절차를 만듭니다.",
    duration: "약 45분 · 오류 탐지 실습",
    slideStart: 35,
    goals: [
      "시각화로 단위 오류와 이상치를 탐지한다.",
      "도메인 지식으로 통계적으로 그럴듯한 결과를 반박한다.",
      "분석 전 과정을 한 페이지 검토 메모로 동료에게 넘긴다.",
    ],
    sections: [
      {
        eyebrow: "01 · THE LAST MILE",
        title: "AI는 분석 속도를 높이지만 책임을 대신 지지 않는다",
        paragraphs: [
          "생성형 AI는 낯선 문법을 설명하고 분석 코드를 빠르게 만들 수 있습니다. 동시에 변수 단위를 틀리거나 존재하지 않는 열을 가정하고, 결측을 몰래 삭제하며, 상관관계를 인과효과처럼 해석하는 코드도 빠르게 완성할 수 있습니다.",
          "따라서 최종 품질은 코드 생성 능력보다 검증 절차에 달려 있습니다. 사람이 확인해야 하는 범위는 오류 메시지뿐 아니라 데이터 출처, 분석 표본, 단위, 모형 가정, 출력의 재현성, 정책 해석까지입니다.",
        ],
        cards: [
          { title: "시각화", text: "분포, 이상치, 비선형 관계와 데이터 입력 오류를 눈으로 확인합니다." },
          { title: "도메인 지식", text: "국가·사업·지표의 현실적 범위를 이용해 그럴듯한 오류를 반박합니다." },
          { title: "동료 회람", text: "분석자가 당연하게 여긴 가정과 누락을 다른 사람이 질문하게 만듭니다." },
        ],
      },
      {
        eyebrow: "02 · PLANT AN ERROR",
        title: "베트남 GDP에 1,000을 곱하면 표는 조용하지만 그림은 소리친다",
        paragraphs: [
          "오류 탐지 실습에서는 베트남의 2021년 gdp_pc 한 값에 1,000을 곱합니다. CSV는 여전히 열리고 회귀도 실행되지만 이 값은 세계 최고 수준을 훨씬 벗어나 산점도의 축을 눌러버립니다. 단순 평균표만 봤다면 놓칠 수 있는 단위 오류입니다.",
          "이상치가 보였다고 바로 삭제하지 않습니다. 원자료, World Bank 원 지표, 전후 연도, 통화와 단위를 확인해 데이터 오류인지 실제 극단값인지 판정합니다. 발견→원인 확인→수정 또는 보존→결정 기록의 순서를 지킵니다.",
        ],
        example: {
          title: "의도적 오류를 만들고 상위값 확인",
          description: "실습용 복사본 bad에서만 값을 바꾸고 원본 df는 보존합니다.",
          code: `bad = df.copy()\nmask = bad.economy_name.str.contains("Vietnam", case=False) & bad.year.eq(2021)\nbad.loc[mask, "gdp_pc"] *= 1000\n\nprint(bad.nlargest(10, "gdp_pc")[["economy_name", "year", "gdp_pc"]])\n\nimport seaborn as sns\nimport matplotlib.pyplot as plt\nsns.scatterplot(data=bad, x="gdp_pc", y="life_exp", alpha=.35)\nplt.xscale("log")\nplt.show()`,
        },
        callout: {
          label: "삭제 금지",
          text: "극단값은 오류일 수도 중요한 현상일 수도 있습니다. 출처와 단위를 확인하기 전에는 자동 삭제하지 않습니다.",
        },
      },
      {
        eyebrow: "03 · THREE VISUAL CHECKS",
        title: "산점도·히스토그램·박스플롯은 서로 다른 오류를 드러낸다",
        paragraphs: [
          "산점도는 변수 관계와 영향력이 큰 점을, 히스토그램은 분포의 치우침과 비정상적인 봉우리를, 박스플롯은 그룹별 중앙값과 극단값을 보여줍니다. 한 그래프로 모든 품질 문제를 찾을 수 없으므로 세 그림을 기본 점검 세트로 만듭니다.",
          "로그축을 쓰면 넓은 범위가 보이기 쉬워지지만 원 단위의 오류를 감출 수도 있습니다. 원축과 로그축을 모두 확인하고, 그림 제목에 단위와 분석 표본을 적습니다. 결측행이 시각화에서 자동 제외됐는지도 개수로 확인합니다.",
        ],
        table: {
          headers: ["그림", "잘 찾는 문제", "확인 질문"],
          rows: [
            ["산점도", "비선형성·영향점·관계 방향", "몇 점이 회귀선을 지배하는가?"],
            ["히스토그램", "치우침·단위 혼합·비정상 봉우리", "로그변환이나 그룹 분리가 필요한가?"],
            ["박스플롯", "그룹별 분포·극단값", "극단값이 특정 지역·연도에 몰리는가?"],
          ],
        },
      },
      {
        eyebrow: "04 · END-TO-END REVIEW",
        title: "데이터 출처에서 의사결정 문장까지 일곱 번 멈춘다",
        paragraphs: [
          "검증은 분석이 끝난 뒤 한 번 하는 행사가 아닙니다. 질문을 정할 때부터 출처, 구조, 변환, 모형, 출력, 해석, 재현을 단계별로 확인합니다. 각 단계의 승인 흔적이 있으면 나중에 결과가 바뀌어도 어디서 달라졌는지 추적할 수 있습니다.",
        ],
        steps: [
          { title: "질문", text: "결과변수, 처치 또는 설명변수, 분석단위, 기간과 대상 집단을 명시합니다." },
          { title: "출처", text: "공식 원문, 수집일, 지표 코드, 라이선스와 개정 가능성을 기록합니다." },
          { title: "구조", text: "행의 단위, 키의 유일성, 결측, 단위, 범주와 범위를 확인합니다." },
          { title: "변환", text: "삭제·대체·로그·더미·병합으로 표본이 어떻게 바뀌었는지 남깁니다." },
          { title: "모형", text: "가정, 비교집단, 고정효과, 표준오차, 검증 분할이 질문과 맞는지 봅니다." },
          { title: "해석", text: "효과크기와 불확실성을 원 단위로 쓰고 관계·예측·인과를 구분합니다." },
          { title: "재현", text: "깨끗한 환경에서 처음부터 실행하고 동료가 같은 결과를 얻는지 확인합니다." },
        ],
      },
      {
        eyebrow: "05 · REVIEW MEMO",
        title: "동료가 10분 안에 반박할 수 있는 한 페이지를 만든다",
        paragraphs: [
          "동료 회람 자료는 긴 코드 전체가 아니라 의사결정에 필요한 핵심을 압축합니다. 질문, 데이터 버전, 표본 생성 규칙, 모형식, 핵심 수치, 한계, 재현 경로를 한 페이지에 넣고 ‘동의하나요?’ 대신 구체적인 반박 질문을 적습니다.",
          "예를 들어 ‘GDP 결측 153건을 제외한 4,838건이 특정 지역에 편중되지 않았는가?’, ‘국가·연도 고정효과 후 계수 1.26을 여전히 인과효과로 부를 근거가 있는가?’, ‘무작위 테스트 분할이 신규 국가 예측 상황을 모사하는가?’처럼 질문합니다.",
        ],
        example: {
          title: "한 페이지 검토 메모 골격",
          description: "숫자와 한계를 함께 제시해 동료가 빠르게 재현하고 반박하게 합니다.",
          code: `분석 질문: __________________________________________\n데이터: WDI 2000~2022, 217개 경제권, 원본 4,991행\n분석 표본: __________________________________________\n주요 변환: __________________________________________\n모형·표준오차: ______________________________________\n핵심 결과: 계수 ______ / 신뢰구간 ______ / N ______\n해석 문장: __________________________________________\n인과·예측 한계: _____________________________________\n재현 명령: __________________________________________\n동료에게 묻는 반박 질문 3개: _________________________`,
        },
      },
      {
        eyebrow: "06 · USE THE RIGHT EVIDENCE",
        title: "모니터링 결과와 영향평가 결과를 구분한다",
        paragraphs: [
          "사업 전후 지표가 좋아졌거나 목표치를 달성했다는 사실은 사업 성과 모니터링의 중요한 증거입니다. 그러나 사업이 없었어도 얼마나 변했을지를 보여주는 반사실이 없으면 그 변화 전체를 사업의 영향으로 귀속할 수 없습니다.",
          "기술통계와 예측모형은 현황 파악, 위험 선별, 추가 조사 대상 선정에 유용합니다. 인과효과를 주장하려면 RCT, 적절한 비교집단을 둔 DiD, 회귀불연속 등 사업 배정 방식과 데이터 구조에 맞는 식별전략이 필요합니다. 분석 목적에 맞지 않는 강한 표현을 줄이는 것도 검증의 일부입니다.",
        ],
        table: {
          headers: ["증거", "주로 답하는 질문", "피해야 할 과장"],
          rows: [
            ["기술통계·시각화", "무슨 일이 관찰됐는가?", "왜 그렇게 됐는지 단정"],
            ["예측모형", "새 관측치를 얼마나 잘 맞히는가?", "중요 변수를 정책 원인으로 단정"],
            ["성과 모니터링", "목표와 산출물이 달성됐는가?", "모든 변화를 사업 영향으로 귀속"],
            ["영향평가", "사업 때문에 얼마나 달라졌는가?", "식별 가정 검토 없이 인과 주장"],
          ],
        },
        callout: {
          label: "최종 원칙",
          text: "AI로 분석의 진입장벽은 낮추되, 데이터와 해석, 의사결정의 책임은 사람에게 남깁니다.",
        },
      },
    ],
    practice: {
      title: "오류를 심고 찾아내는 3인 검증 실습",
      description: "한 사람은 오류를 만들고, 한 사람은 그림으로 찾고, 한 사람은 해석을 반박합니다.",
      steps: [
        "원본 복사본의 특정 국가·연도 값에 단위 오류 또는 결측 코딩 오류를 하나 심는다.",
        "산점도, 히스토그램, 박스플롯을 그려 이상 신호를 찾고 위치를 기록한다.",
        "전후 연도와 지표의 현실적 범위를 이용해 오류 가능성을 설명한다.",
        "원자료를 확인해 수정 또는 보존 결정을 내리고 이유를 로그에 남긴다.",
        "한 페이지 검토 메모를 동료에게 넘겨 표본·모형·해석 반박을 받는다.",
      ],
      checklist: [
        "공식 출처와 데이터 버전을 기록했다.",
        "원축·로그축과 세 종류의 기본 그림을 확인했다.",
        "극단값을 근거 없이 삭제하지 않았다.",
        "관계·예측·인과 문장을 구분했다.",
        "깨끗한 환경에서 처음부터 재실행했다.",
        "동료의 반박 질문과 답변을 보관했다.",
      ],
    },
    resources: [
      { title: "Colab 05 · 인간의 검증력", text: "오류 심기와 시각적 탐지 실습", url: "https://colab.research.google.com/github/amnotyoung/oda-ai-stats/blob/main/notebooks/05_human_verification.ipynb" },
      { title: "검증 체크리스트", text: "분석 전·중·후 점검 항목", url: "https://github.com/amnotyoung/oda-ai-stats/blob/main/handouts/verification_checklist.md" },
      { title: "AI 프롬프트 패턴", text: "설명·변환·검증 요청 예시", url: "https://github.com/amnotyoung/oda-ai-stats/blob/main/handouts/prompt_patterns.md" },
      { title: "강의 슬라이드 35장부터", text: "인간의 검증력과 마무리", url: "https://amnotyoung.github.io/oda-ai-stats/slides/viewer.html#35" },
    ],
  },
];
