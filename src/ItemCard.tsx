import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { speak } from './audio';
import type { ParsedItem } from './parse';
import { accent, faint, formatDate, ink, sub } from './theme';

export type RecordControls = {
  recording: boolean;
  disabled: boolean;
  hasRecording: boolean;
  onRecord: () => void;
  onPlay: () => void;
};

export function ItemCard({ item, due, record }: { item: ParsedItem; due?: string; record?: RecordControls }) {
  return (
    <View style={styles.card}>
      {item.q !== '' && <Text style={styles.q}>Q. {item.q}</Text>}
      <View style={styles.nativeRow}>
        <Text style={styles.native}>{item.native}</Text>
        <Pressable style={styles.speaker} hitSlop={8} onPress={() => speak(item.native)}>
          <Ionicons name="volume-medium" size={20} color={accent} />
        </Pressable>
      </View>
      {item.me !== '' && (
        <Text style={styles.me}>
          <Text style={styles.meLabel}>내가 한 말  </Text>
          {item.me}
        </Text>
      )}
      {record && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.action, record.recording && styles.actionRecording, record.disabled && styles.actionDisabled]}
            disabled={record.disabled}
            onPress={record.onRecord}
          >
            <Ionicons name={record.recording ? 'stop' : 'mic'} size={16} color={record.recording ? '#fff' : ink} />
            <Text style={[styles.actionText, record.recording && styles.actionTextRecording]}>
              {record.recording ? '녹음 끝내기' : record.hasRecording ? '다시 녹음' : '녹음'}
            </Text>
          </Pressable>
          {record.hasRecording && !record.recording && (
            <Pressable style={styles.action} onPress={record.onPlay}>
              <Ionicons name="play" size={16} color={ink} />
              <Text style={styles.actionText}>내 녹음 듣기</Text>
            </Pressable>
          )}
        </View>
      )}
      {(item.pattern !== '' || due) && (
        <View style={styles.bottom}>
          {item.pattern !== '' && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{item.pattern}</Text>
            </View>
          )}
          {due && <Text style={styles.due}>다음 복습 {formatDate(due)}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 10 },
  q: { fontSize: 13, color: sub, marginBottom: 8 },
  nativeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  native: { flex: 1, fontSize: 18, lineHeight: 25, fontWeight: '600', color: ink },
  speaker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  me: { fontSize: 14, lineHeight: 20, color: sub, marginTop: 8 },
  meLabel: { fontSize: 12, color: faint },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F0EC',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  actionRecording: { backgroundColor: '#E5484D' },
  actionDisabled: { opacity: 0.4 },
  actionText: { fontSize: 14, fontWeight: '600', color: ink },
  actionTextRecording: { color: '#fff' },
  bottom: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 12 },
  chip: { backgroundColor: '#EAF0FF', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  chipText: { fontSize: 13, fontWeight: '600', color: accent },
  due: { fontSize: 12, color: faint, marginLeft: 'auto' },
});
