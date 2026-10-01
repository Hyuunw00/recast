import { setAudioModeAsync } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import * as Speech from 'expo-speech';

setAudioModeAsync({ playsInSilentMode: true });

let voice: string | undefined;
Speech.getAvailableVoicesAsync().then((voices) => {
  voice = voices.find((v) => v.language === 'en-US' && v.quality === Speech.VoiceQuality.Enhanced)?.identifier;
});

export function speak(text: string) {
  Speech.stop();
  Speech.speak(text, { language: 'en-US', voice });
}

export function recordingFile(itemId: number) {
  return new File(Paths.document, `rec-${itemId}.m4a`);
}
