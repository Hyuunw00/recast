# recast

영어 회화 복습 앱(iOS). ChatGPT 음성 세션이 끝나면 나오는 "막힌 것" 목록을 붙여넣으면 Q&A 쉐도잉 세트로 저장하고, 간격 반복 주기에 맞춰 폰 알림으로 불러내 따라 말하기·녹음·셀프 체크를 시킨다. 현재 단계는 `docs/STATUS.md`를 먼저 읽는다.

## 로드맵 (순서 고정)
1. 붙여넣기 → 파싱 → Q·Me·Native·Pattern 세트 저장
2. 세션 화면: Q 읽어주기 → Native 보여주고 읽어주기 → 3–5회 따라 말하며 녹음 → 내 녹음 재생 → 됐다/다시
3. 간격 반복(1·3·7·14일)과 로컬 알림
4. 기록: 연속 일수, "다시"가 잦은 패턴, 다음 세션용 패턴 3개 복사 버튼

상세는 `docs/roadmap.md`. 다음 단계 기능을 미리 만들지 않는다.

## 원칙
- 입력은 붙여넣기 한 번. 사용자가 카드를 손으로 만들지 않는다
- 서버 없음. 알림은 로컬, 데이터는 기기 안. 녹음은 세트당 마지막 1개만 보관
- 판정보다 "들었고 말했다"가 먼저. 발음 점수는 만들지 않는다
- 사용자는 테오 1명. 스토어 출시 없이 개발 빌드로 본인 폰에 설치해 쓰는 것이 1차 목표

## 환경
- Expo SDK 54 고정 (Xcode 16.2). climbdex와 같은 함정: 로컬 모듈 설정은 `platforms: ["ios"]`, podspec 타깃 15.1, pod는 homebrew `pod`
- 읽어주기는 expo-speech, 녹음·재생은 expo-audio, 저장은 expo-sqlite, 알림은 expo-notifications 로컬 스케줄(3단계에서 설치)
- 빌드: `npx expo run:ios --device <UDID>`. Metro: `npm start`
- 함정: 8081에 climbdex Metro가 떠 있으면 `expo run:ios`가 자기 Metro를 띄우지 않고 앱이 climbdex 번들을 받아 "App entry not found"가 뜬다. climbdex Metro를 끄거나 `--port`를 바꾼다
- 함정: 회사 맥 시뮬레이터에서는 녹음이 안 된다("Failed to prepare recorder", 시뮬레이터 오디오 입력 문제). 녹음·재생은 실기기에서 확인한다
- 함정: Expo 패키지는 `npx expo install`로 넣는다. `npm install`이나 peer 자동 설치는 SDK와 안 맞는 버전(57.x)을 끌어와 네이티브 모듈이 중복된다. 설치 후 `npx expo-doctor`
- 파서 테스트: `npm test` (Node 내장 러너, `src/*.test.ts`). 타입 검사: `npm run typecheck` (테스트 파일은 제외)

## 세션 규칙
- 두 기기(회사 맥·개인 노트북)에서 번갈아 작업. 결정은 대화가 아니라 `docs/`에 남긴다
- 작업을 끝낼 때마다 `docs/STATUS.md` 갱신: 마지막에 한 일, 다음에 할 일, 막힌 것
- 코드에 설명용 주석을 넣지 않는다
- 커밋·푸시는 사용자가 지시할 때만
