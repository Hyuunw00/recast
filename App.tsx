import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { getSessions, saveSession } from './src/db';
import { History } from './src/History';
import { ItemCard } from './src/ItemCard';
import { parse } from './src/parse';
import { accent, background, faint, ink, sub } from './src/theme';

type Tab = 'add' | 'history';

export default function App() {
  const [tab, setTab] = useState<Tab>('add');
  const [text, setText] = useState('');
  const [sessions, setSessions] = useState(getSessions);
  const [saved, setSaved] = useState<number | null>(null);
  const { items, none } = useMemo(() => parse(text), [text]);
  const canSave = items.length > 0 || none;
  const unreadable = text.trim() !== '' && !canSave;

  const change = (next: string) => {
    setText(next);
    setSaved(null);
  };

  const save = () => {
    saveSession(items);
    setSaved(items.length);
    setText('');
    setSessions(getSessions());
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <Text style={styles.title}>recast</Text>
        <View style={styles.tabs}>
          <Pressable style={[styles.tab, tab === 'add' && styles.tabActive]} onPress={() => setTab('add')}>
            <Text style={[styles.tabText, tab === 'add' && styles.tabTextActive]}>추가</Text>
          </Pressable>
          <Pressable style={[styles.tab, tab === 'history' && styles.tabActive]} onPress={() => setTab('history')}>
            <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>저장한 세트</Text>
          </Pressable>
        </View>
      </View>

      {tab === 'history' ? (
        <History sessions={sessions} />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.subtitle}>오늘 회화에서 막힌 문장을 복습 세트로 만들어요</Text>

            {saved !== null && (
              <Pressable style={styles.savedBanner} onPress={() => setTab('history')}>
                <Text style={styles.savedTitle}>저장했어요</Text>
                <Text style={styles.savedBody}>
                  {saved > 0 ? `${saved}개 문장이 내일 첫 복습에 나와요` : '막힌 것 없는 날로 기록했어요'}
                </Text>
                <Text style={styles.savedLink}>저장한 세트 보기</Text>
              </Pressable>
            )}

            <View style={styles.inputCard}>
              <TextInput
                style={[styles.input, items.length > 0 && styles.inputCompact]}
                multiline
                autoCorrect={false}
                autoCapitalize="none"
                placeholder={"ChatGPT가 준 '막힌 것' 목록을\n통째로 복사해서 여기에 붙여넣으세요"}
                placeholderTextColor={faint}
                value={text}
                onChangeText={change}
              />
              {text !== '' && (
                <Pressable style={styles.clear} hitSlop={8} onPress={() => change('')}>
                  <Text style={styles.clearText}>지우기</Text>
                </Pressable>
              )}
            </View>

            {unreadable && (
              <View style={styles.notice}>
                <Text style={styles.noticeTitle}>문장을 찾지 못했어요</Text>
                <Text style={styles.noticeBody}>'막힌 것' 제목부터 마지막 줄까지 통째로 복사했는지 확인해 주세요</Text>
              </View>
            )}

            {none && (
              <View style={styles.notice}>
                <Text style={styles.noticeTitle}>오늘은 막힌 게 없었네요</Text>
                <Text style={styles.noticeBody}>저장하면 연습한 날로 기록돼요</Text>
              </View>
            )}

            {items.length > 0 && <Text style={styles.sectionTitle}>찾은 문장 {items.length}개</Text>}
            {items.map((item, i) => (
              <ItemCard key={i} item={item} />
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                !canSave && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              disabled={!canSave}
              onPress={save}
            >
              <Text style={styles.buttonText}>
                {items.length > 0 ? `${items.length}개 저장` : none ? '오늘 기록 저장' : '저장'}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: background },
  top: { paddingTop: 72, paddingHorizontal: 20, paddingBottom: 14 },
  title: { fontSize: 30, fontWeight: '800', color: ink },
  tabs: { flexDirection: 'row', backgroundColor: '#E9E7E1', borderRadius: 12, padding: 3, marginTop: 14 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 15, fontWeight: '600', color: sub },
  tabTextActive: { color: ink },

  content: { paddingHorizontal: 20, paddingBottom: 24 },
  subtitle: { fontSize: 15, color: sub, marginBottom: 14 },

  savedBanner: { backgroundColor: '#E7F6EC', borderRadius: 14, padding: 14, marginBottom: 14 },
  savedTitle: { fontSize: 15, fontWeight: '700', color: '#17663A' },
  savedBody: { fontSize: 14, color: '#17663A', marginTop: 2 },
  savedLink: { fontSize: 14, fontWeight: '700', color: '#17663A', marginTop: 8 },

  inputCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14 },
  input: { height: 200, fontSize: 16, lineHeight: 22, color: ink, textAlignVertical: 'top', padding: 0 },
  inputCompact: { height: 88 },
  clear: { alignSelf: 'flex-end', marginTop: 8 },
  clearText: { fontSize: 14, color: sub },

  notice: { backgroundColor: '#FFF4DC', borderRadius: 14, padding: 14, marginTop: 14 },
  noticeTitle: { fontSize: 15, fontWeight: '700', color: '#7A4B00' },
  noticeBody: { fontSize: 14, color: '#7A4B00', marginTop: 2 },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: sub, marginTop: 22, marginBottom: 4 },

  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 34, backgroundColor: background },
  button: { backgroundColor: accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#C9CDD6' },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
