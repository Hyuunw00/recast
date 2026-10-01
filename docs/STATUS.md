# STATUS

## 마지막에 한 일 (2026-10-01, 회사 맥)
- Expo SDK 54 프로젝트 생성. 설치: expo-dev-client, expo-sqlite, expo-speech, expo-audio (expo-av는 SDK 54에서 deprecated라 expo-audio로 정함). expo-notifications는 3단계로 미룸(이유는 `docs/roadmap.md` 3번)
- 1단계 코드 작성: 파서(`src/parse.ts`, 새 형식·구형식·none), 저장(`src/db.ts`, SQLite), 붙여넣기 화면(`App.tsx`)
- 테오가 ChatGPT에서 복사한 구형식은 불릿(`- `)과 `##`이 빠진 채로 붙는다. 파서가 불릿 없는 구형식 줄도 받도록 고침
- 붙여넣기 화면 UI 개편: 안내 문구, 찾은 문장을 카드(Q·Native·내가 한 말·Pattern)로 미리보기, 하단 고정 저장 버튼, 저장 후 확인 배너, 지우기
- "저장한 세트" 탭 추가(`src/History.tsx`): 세션을 최신순으로, 추가한 날짜·문장 수·문장 카드·다음 복습일 표시. 화면 위 "추가 / 저장한 세트" 전환. 삭제·수정은 없음
- 레포 생성·푸시: https://github.com/Hyuunw00/recast (비공개, 개인 계정). 이 레포의 git 작성자·푸시 인증은 climbdex처럼 레포 전용 설정(Hyuunw00)
- 검증된 것: `npm test` 8개 통과, `npm run typecheck` 통과, `npx expo-doctor` 18/18, 시뮬레이터(iPhone 16 Pro) 빌드·설치, recast Metro(8082)로 추가 탭·저장한 세트 탭 렌더링. 테오가 시뮬레이터에서 새 형식 5개를 저장했고 저장한 세트 탭에 그대로 나옴(10월 1일, 다음 복습 10월 2일)
- 문장 카드에 읽어주기·녹음 추가(테오 요청으로 2단계 일부를 앞당김). 스피커 버튼: Native를 기기 TTS(expo-speech, en-US, Enhanced 음성이 있으면 그것)로 읽음, 추가 탭 미리보기와 저장한 세트 양쪽. 저장한 세트 카드에는 녹음 / 녹음 끝내기 / 내 녹음 듣기. 녹음은 `Documents/rec-<항목 id>.m4a`에 항목당 마지막 1개만 덮어씀(DB 칸 없음, 파일 유무로 판단). 코드: `src/audio.ts`, `src/ItemCard.tsx`, `src/History.tsx`
- 추가 설치: expo-file-system, @expo/vector-icons, expo-font (전부 기존 네이티브 빌드에 이미 들어 있던 버전이라 재빌드 없이 동작). 마이크 권한 문구를 `app.json`에 한국어로 넣음 → 다음 네이티브 빌드부터 반영
- 검증 안 된 것: **녹음·재생·읽어주기 소리 전부**. 화면에 버튼이 그려지는 것만 확인. 이 맥의 시뮬레이터에서는 `prepareToRecordAsync`가 "Failed to prepare recorder"로 실패함(시스템 로그상 시뮬레이터 오디오 서버 호출이 30초씩 시간 초과, 앱 코드 문제로 보이지 않음). 실기기에서 확인해야 함. 그 외: 키보드가 올라온 상태의 레이아웃, "none" 저장 후 "막힌 것 없는 날" 표시
- 8081은 climbdex Metro가 쓰고 있어 recast는 `npx expo start --dev-client --port 8082`로 띄움
- ChatGPT 지침 Ending 교체안(`docs/chatgpt-ending-prompt.md`)을 테오가 ChatGPT에 반영했는지는 여전히 미확인

## 다음에 할 일
- 실기기 빌드(`npm run ios:device`). 번들 ID `com.hyunw00theo.recast`가 무료 팀 서명에 통과하는지 확인. 실기기에서 스피커 → 녹음 → 녹음 끝내기 → 내 녹음 듣기, 앱 재시작 후에도 녹음이 남는지, 무음 스위치 상태에서 소리가 나는지 확인
- 지침 반영 후 실제 출력 1개를 `docs/sample-input.md`의 새 형식 블록에 붙여 `npm test`로 파서 검증
- 2단계(세션 화면)

## 막힌 것
- 없음
