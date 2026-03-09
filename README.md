# 🏢 아파트 분양 웹사이트

OpenAI API를 활용한 AI 챗봇이 포함된 아파트 분양 홍보 사이트입니다.

## 📋 주요 기능

- ✨ 반응형 디자인
- 🌓 다크/라이트 모드
- 💬 OpenAI API 기반 AI 챗봇
- 📝 방문 상담 신청 폼
- 🏠 4개 아파트 분양 정보

## 🚀 시작하기

### 1. 파일 구조

```
아파트/
├── index.html          # 메인 HTML
├── styles.css          # 스타일시트
├── script.js           # 메인 스크립트
├── config.js           # 설정 파일 (API 키 포함)
└── README.md           # 이 파일
```

### 2. OpenAI API 키 설정

#### 방법 1: API 키 발급

1. [OpenAI Platform](https://platform.openai.com/signup)에서 계정 생성
2. [API Keys](https://platform.openai.com/api-keys) 페이지에서 새 API 키 생성
3. 생성된 키 복사

#### 방법 2: config.js 파일 수정

`config.js` 파일을 열고 `OPENAI_API_KEY`에 본인의 API 키를 입력하세요:

```javascript
const CONFIG = {
    OPENAI_API_KEY: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',  // 여기에 API 키 입력
    // ... 나머지 설정
};
```

### 3. 실행하기

1. `index.html` 파일을 웹 브라우저에서 열기
2. 우측 하단 💬 버튼 클릭
3. AI 챗봇과 대화 시작!

## 💡 챗봇 기능

### AI 모드 (API 키 설정 시)

- 🤖 OpenAI GPT-3.5 Turbo 모델 사용
- 💬 자연스러운 대화 가능
- 🧠 문맥 이해 및 맞춤형 답변
- 📚 대화 내역 기억 (최근 20개)

### 기본 모드 (API 키 미설정 시)

- 📝 키워드 기반 응답
- ⚡ 빠른 응답 속도
- 🔒 인터넷 연결 불필요

## ⚙️ 설정 옵션 (config.js)

```javascript
const CONFIG = {
    OPENAI_API_KEY: '',           // OpenAI API 키
    MODEL: 'gpt-3.5-turbo',       // 사용할 모델
    MAX_TOKENS: 500,              // 최대 토큰 수
    TEMPERATURE: 0.7,             // 창의성 (0.0 ~ 1.0)
    SYSTEM_PROMPT: '...'          // 시스템 프롬프트
};
```

## 🔒 보안 주의사항

### ⚠️ 중요: API 키 보안

**현재 `config.js`는 API 키가 비어있어 안전하게 GitHub에 업로드 가능합니다!**

- ✅ `config.js`: API 키 없음 (GitHub 업로드 가능)
- 🔒 `API_KEY_BACKUP.txt`: 실제 API 키 포함 (로컬 전용, .gitignore에 등록됨)
- ✅ `.gitignore`: `API_KEY_BACKUP.txt` 자동 제외

**로컬에서 API 사용하는 방법:**
1. `API_KEY_BACKUP.txt` 파일에서 API 키 복사
2. `config.js` 파일 열기
3. `OPENAI_API_KEY: ''` 부분에 키 붙여넣기
4. 저장하고 사용
5. **GitHub 업로드 전에 다시 빈 문자열로 변경!**

### GitHub 업로드 시

`.gitignore` 파일을 만들고 다음 내용 추가:

```
config.js
```

그리고 `config.example.js` 파일을 만들어서 예제 제공:

```javascript
const CONFIG = {
    OPENAI_API_KEY: 'your-api-key-here',
    // ... 나머지 설정
};
```

## 🌐 GitHub Pages로 배포하기

### 주의: API 키 문제

GitHub Pages는 정적 호스팅이므로 `config.js`의 API 키가 **공개**됩니다.

### 해결 방법:

#### 옵션 1: 기본 모드로 배포
- `config.js`에서 `OPENAI_API_KEY`를 빈 문자열로 설정
- 키워드 기반 응답으로 동작

#### 옵션 2: 백엔드 서버 구축 (권장)
- Node.js, Python 등으로 백엔드 API 서버 생성
- API 키를 서버에서 관리
- 프론트엔드는 백엔드 API 호출

#### 옵션 3: Netlify Functions, Vercel 등 사용
- 서버리스 함수로 API 키 보호
- 환경 변수로 안전하게 관리

## 📞 분양 문의

- 전화: 1588-0000
- 이메일: contact@apartment.co.kr
- 운영시간: 평일 09:00-18:00, 주말 10:00-17:00

## 📄 라이선스

이 프로젝트는 개인/상업적 용도로 자유롭게 사용 가능합니다.

## 🛠️ 기술 스택

- HTML5
- CSS3 (Variables, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- OpenAI API (GPT-3.5 Turbo)

---

**만든이**: 아파트 분양 센터  
**버전**: 1.0.0  
**최종 업데이트**: 2026-03-08
