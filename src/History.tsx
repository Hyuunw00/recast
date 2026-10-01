import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
} from 'expo-audio';
import { File } from 'expo-file-system';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { Alert, SectionList, StyleSheet, Text, View } from 'react-native';

import { recordingFile } from './audio';
import type { SavedSession } from './db';
import { ItemCard } from './ItemCard';
import { formatDate, ink, sub } from './theme';

export function History({ sessions }: { sessions: SavedSession[] }) {
  const total = sessions.reduce((sum, session) => sum + session.items.length, 0);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer();
  const [recordingId, setRecordingId] = useState<number | null>(null);

  const start = async (id: number) => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      Alert.alert('마이크 권한이 필요해요', '설정 > recast에서 마이크를 켜 주세요');
      return;
    }
    Speech.stop();
    player.pause();
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordingId(id);
    } catch {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      Alert.alert('녹음을 시작하지 못했어요', '잠시 뒤에 다시 눌러 주세요');
    }
  };

  const stop = async (id: number) => {
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    if (recorder.uri) {
      const saved = recordingFile(id);
      if (saved.exists) saved.delete();
      new File(recorder.uri).move(saved);
    }
    setRecordingId(null);
  };

  const play = (id: number) => {
    Speech.stop();
    player.replace({ uri: recordingFile(id).uri });
    player.play();
  };

  return (
    <SectionList
      sections={sessions.map((session) => ({ session, data: session.items }))}
      extraData={recordingId}
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
      renderItem={({ item }) => (
        <ItemCard
          item={item}
          due={item.due}
          record={{
            recording: recordingId === item.id,
            disabled: recordingId !== null && recordingId !== item.id,
            hasRecording: recordingFile(item.id).exists,
            onRecord: () => (recordingId === item.id ? stop(item.id) : start(item.id)),
            onPlay: () => play(item.id),
          }}
        />
      )}
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
