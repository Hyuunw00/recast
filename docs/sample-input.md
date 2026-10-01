# 입력 샘플

## 기존 형식 (지침 수정 전, 실제 출력 예)
```
## 막힌 것
- "it's so troublesome to on and off the videos" → it's troublesome to turn the videos on and off
- "my apps just calculate the starting point and end point" → my app detects the starting and ending points
- "my app's function is to follow your dynamic movements" → my app makes the screen follow your movements
- "when they get want to stamp" → when they want to get a stamp
- "I recast my friends climbers to test my app" → I ask my climbing friends to test my app
```
파서는 이 구형식도 받아야 한다(Q 없음 → 비워두고, Pattern 없음 → Native에서 임시 생성 또는 공란).

## 새 형식 (지침 수정 후 기대 출력, 위 예를 변환한 것 — 실제 출력으로 교체할 것)
```
## 막힌 것
1.
Q: "What's the most annoying part of filming your climbs?"
Me: "it's so troublesome to on and off the videos"
Native: "It's a hassle to turn the videos on and off."
Pattern: turn X on and off

2.
Q: "So what does the app actually do with the video?"
Me: "my apps just calculate the starting point and end point"
Native: "My app detects where the climb starts and ends."
Pattern: detect where X starts and ends

3.
Q: "How is that different from just trimming it by hand?"
Me: "my app's function is to follow your dynamic movements"
Native: "My app makes the screen follow your movements."
Pattern: make X follow Y

4.
Q: "When would someone open the gym directory?"
Me: "when they get want to stamp"
Native: "When they want to get a stamp."
Pattern: want to get X

5.
Q: "Who's going to test it for you?"
Me: "I recast my friends climbers to test my app"
Native: "I'll ask my climbing friends to test the app."
Pattern: ask someone to do X
```
