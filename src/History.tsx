import { SectionList, StyleSheet, Text, View } from 'react-native';

import type { SavedSession } from './db';
import { ItemCard } from './ItemCard';
import { formatDate, ink, sub } from './theme';
import { useRecorder } from './useRecorder';

export function History({ sessions }: { sessions: SavedSession[] }) {
  const total = sessions.reduce((sum, session) => sum + session.items.length, 0);
  const recorder = useRecorder();

  return (
    <SectionList
      sections={sessions.map((session) => ({ session, data: session.items }))}
      extraData={recorder.state}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.content}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        sessions.length > 0 ? (
          <Text style={styles.summary}>
            세션 {sessions.length}개 · 문장 {total}개
          </Text>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>아직 저장한 세트가 없어요</Text>
          <Text style={styles.emptyBody}>'추가'에서 막힌 것 목록을 붙여넣으면 여기에 쌓여요</Text>
        </View>
      }
      renderSectionHeader={({ section: { session } }) => (
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate(session.date)}</Text>
          <Text style={styles.count}>
            {session.items.length > 0 ? `문장 ${session.items.length}개` : '막힌 것 없는 날'}
          </Text>
        </View>
      )}
      renderItem={({ item }) => <ItemCard item={item} due={item.due} record={recorder.controls(item.id)} />}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 48 },
  summary: { fontSize: 14, color: sub },
  header: { flexDirection: 'row', alignItems: 'baseline', marginTop: 22 },
  date: { fontSize: 17, fontWeight: '700', color: ink, flex: 1 },
  count: { fontSize: 13, color: sub },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: ink },
  emptyBody: { fontSize: 14, color: sub, marginTop: 6, textAlign: 'center' },
});
