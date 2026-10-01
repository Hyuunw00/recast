import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { SavedItem } from './db';
import { ItemCard } from './ItemCard';
import { formatDate, ink, sub } from './theme';
import { useRecorder } from './useRecorder';

type Props = {
  items: SavedItem[];
  nextDue?: string;
  onResult: (item: SavedItem, done: boolean) => void;
};

export function Review({ items, nextDue, onResult }: Props) {
  const recorder = useRecorder();

  return (
    <FlatList
      data={items}
      extraData={recorder.state}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        items.length > 0 ? <Text style={styles.summary}>오늘 복습할 문장 {items.length}개</Text> : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>오늘 복습 끝</Text>
          <Text style={styles.emptyBody}>
            {nextDue ? `다음 복습은 ${formatDate(nextDue)}이에요` : '예정된 복습이 없어요'}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <ItemCard item={item} record={recorder.controls(item.id)} onResult={(done) => onResult(item, done)} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 48 },
  summary: { fontSize: 14, color: sub },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: ink },
  emptyBody: { fontSize: 14, color: sub, marginTop: 6, textAlign: 'center' },
});
