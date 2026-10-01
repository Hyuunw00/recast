# STATUS

## 마지막에 한 일 (2026-10-01, 회사 맥)
- Expo SDK 54 프로젝트 생성. 설치: expo-dev-client, expo-sqlite, expo-speech, expo-audio (expo-av는 SDK 54에서 deprecated라 expo-audio로 정함). expo-notifications는 3단계로 미룸(이유는 `docs/roadmap.md` 3번)
- 1단계 코드 작성: 파서(`src/parse.ts`, 새 형식·구형식·none), 저장(`src/db.ts`, SQLite), 붙여넣기 화면(`App.tsx`)
- 테오가 ChatGPT에서 복사한 구형식은 불릿(`- `)과 `##`이 빠진 채로 붙는다. 파서가 불릿 없는 구형식 줄도 받도록 고침
- 붙여넣기 화면 UI 개편: 안내 문구, 찾은 문장을 카드(Q·Native·내가 한 말·Pattern)로 미리보기, 하단 고정 저장 버튼, 저장 후 확인 배너, 지우기. recast Metro(8082)로 시뮬레이터에서 빈 상태·카드 상태가 그려지는 것까지 확인
- 검증된 것: `npm test` 8개 통과, `npm run typecheck` 통과, `npx expo-doctor` 18/18, 시뮬레이터(iPhone 16 Pro) 네이티브 빌드·설치 성공, JS 번들링 성공(`expo export`)
- 검증 안 된 것: 저장 버튼을 눌러 DB에 들어가고 앱 재시작 후에도 수가 유지되는지(시뮬레이터를 탭할 수단이 없어 Claude는 못 눌러봄), 키보드가 올라온 상태의 레이아웃
- 8081은 climbdex Metro가 쓰고 있어 recast는 `npx expo start --dev-client --port 8082`로 띄움
- ChatGPT 지침 Ending 교체안(`docs/chatgpt-ending-prompt.md`)을 테오가 ChatGPT에 반영했는지는 여전히 미확인

## 다음에 할 일
- 시뮬레이터에서 1단계 마저 확인: `docs/sample-input.md`의 두 형식을 붙여넣어 "찾은 문장 5개" 표시, 저장 후 배너와 하단 세션·문장 수 증가, 앱 재시작 후에도 수가 유지되는지
- 실기기 빌드(`npm run ios:device`). 번들 ID `com.hyunw00theo.recast`가 무료 팀 서명에 통과하는지 확인
- 지침 반영 후 실제 출력 1개를 `docs/sample-input.md`의 새 형식 블록에 붙여 `npm test`로 파서 검증
- 1단계 확인이 끝나면 2단계(세션 화면)

## 막힌 것
- 없음
