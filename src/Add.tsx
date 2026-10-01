import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ItemCard } from './ItemCard';
import { parse, type ParsedItem } from './parse';
import { dueFor, toYmd } from './schedule';
import { accent, background, faint, formatDate, ink, sub } from './theme';

type Props = {
  text: string;
  onChangeText: (text: string) => void;
  schedule: number[];
  onSave: (items: ParsedItem[]) => void;
  onOpenHistory: () => void;
};

export function Add({ text, onChangeText, schedule, onSave, onOpenHistory }: Props) {
  const [saved, setSaved] = useState<number | null>(null);
  const { items, none } = useMemo(() => parse(text), [text]);
  const canSave = items.length > 0 || none;
  const unreadable = text.trim() !== '' && !canSave;

  const change = (next: string) => {
    onChangeText(next);
    setSaved(null);
  };

  const save = () => {
    onSave(items);
    setSaved(items.length);
    onChangeText('');
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>오늘 회화에서 막힌 문장을 복습 세트로 만들어요</Text>

        {saved !== null && (
          <Pressable style={styles.savedBanner} onPress={onOpenHistory}>
            <Text style={styles.savedTitle}>저장했어요</Text>
            <Text style={styles.savedBody}>
              {saved > 0
                ? `${saved}개 문장의 첫 복습은 ${formatDate(dueFor(toYmd(new Date()), 0, schedule))}이에요`
                : '막힌 것 없는 날로 기록했어요'}
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
          style={({ pressed }) => [styles.button, !canSave && styles.buttonDisabled, pressed && styles.buttonPressed]}
          disabled={!canSave}
          onPress={save}
        >
          <Text style={styles.buttonText}>
            {items.length > 0 ? `${items.length}개 저장` : none ? '오늘 기록 저장' : '저장'}
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
