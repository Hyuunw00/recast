import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { getCounts, saveSession } from './src/db';
import { parse } from './src/parse';

export default function App() {
  const [text, setText] = useState('');
  const [counts, setCounts] = useState(getCounts);
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
    setCounts(getCounts());
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>recast</Text>
        <Text style={styles.subtitle}>오늘 회화에서 막힌 문장을 복습 세트로 만들어요</Text>

        {saved !== null && (
          <View style={styles.savedBanner}>
            <Text style={styles.savedTitle}>저장했어요</Text>
            <Text style={styles.savedBody}>
              {saved > 0 ? `${saved}개 문장이 내일 첫 복습에 나와요` : '막힌 것 없는 날로 기록했어요'}
            </Text>
          </View>
        )}

        <View style={styles.inputCard}>
          <TextInput
            style={[styles.input, items.length > 0 && styles.inputCompact]}
            multiline
            autoCorrect={false}
            autoCapitalize="none"
            placeholder={"ChatGPT가 준 '막힌 것' 목록을\n통째로 복사해서 여기에 붙여넣으세요"}
            placeholderTextColor="#A3A8B3"
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
          <View key={i} style={styles.card}>
            {item.q !== '' && <Text style={styles.q}>Q. {item.q}</Text>}
            <Text style={styles.native}>{item.native}</Text>
            {item.me !== '' && (
              <Text style={styles.me}>
                <Text style={styles.meLabel}>내가 한 말  </Text>
                {item.me}
              </Text>
            )}
            {item.pattern !== '' && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{item.pattern}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.button, !canSave && styles.buttonDisabled, pressed && styles.buttonPressed]}
          disabled={!canSave}
          onPress={save}
        >
          <Text style={styles.buttonText}>
            {items.length > 0 ? `${items.length}개 저장` : none ? '오늘 기록 저장' : '저장'}
          </Text>
        </Pressable>
        <Text style={styles.counts}>
          지금까지 세션 {counts.sessions}개 · 문장 {counts.items}개
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const ink = '#1C1E26';
const sub = '#6B7280';
const accent = '#3B6EF5';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F5F2' },
  content: { paddingTop: 72, paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 30, fontWeight: '800', color: ink },
  subtitle: { fontSize: 15, color: sub, marginTop: 4, marginBottom: 20 },

  savedBanner: { backgroundColor: '#E7F6EC', borderRadius: 14, padding: 14, marginBottom: 14 },
  savedTitle: { fontSize: 15, fontWeight: '700', color: '#17663A' },
  savedBody: { fontSize: 14, color: '#17663A', marginTop: 2 },

  inputCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14 },
  input: { height: 200, fontSize: 16, lineHeight: 22, color: ink, textAlignVertical: 'top', padding: 0 },
  inputCompact: { height: 88 },
  clear: { alignSelf: 'flex-end', marginTop: 8 },
  clearText: { fontSize: 14, color: sub },

  notice: { backgroundColor: '#FFF4DC', borderRadius: 14, padding: 14, marginTop: 14 },
  noticeTitle: { fontSize: 15, fontWeight: '700', color: '#7A4B00' },
  noticeBody: { fontSize: 14, color: '#7A4B00', marginTop: 2 },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: sub, marginTop: 22, marginBottom: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 10 },
  q: { fontSize: 13, color: sub, marginBottom: 8 },
  native: { fontSize: 18, lineHeight: 25, fontWeight: '600', color: ink },
  me: { fontSize: 14, lineHeight: 20, color: sub, marginTop: 8 },
  meLabel: { fontSize: 12, color: '#A3A8B3' },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF0FF',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: accent },

  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 34, backgroundColor: '#F6F5F2' },
  button: { backgroundColor: accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#C9CDD6' },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  counts: { fontSize: 13, color: sub, textAlign: 'center', marginTop: 10 },
});
