import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
} from 'expo-audio';
import { File } from 'expo-file-system';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { Alert } from 'react-native';

import { recordingFile } from './audio';
import type { RecordControls } from './ItemCard';

export function useRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer();
  const { playing } = useAudioPlayerStatus(player);
  const [recordingId, setRecordingId] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

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
    if (playing && playingId === id) {
      player.pause();
      return;
    }
    Speech.stop();
    player.replace({ uri: recordingFile(id).uri });
    player.play();
    setPlayingId(id);
  };

  const controls = (id: number): RecordControls => ({
    recording: recordingId === id,
    disabled: recordingId !== null && recordingId !== id,
    hasRecording: recordingFile(id).exists,
    playing: playing && playingId === id,
    onRecord: () => (recordingId === id ? stop(id) : start(id)),
    onPlay: () => play(id),
  });

  return { controls, state: `${recordingId}-${playingId}-${playing}` };
}
