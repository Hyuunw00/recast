import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Settings as SettingsValue } from './db';
import { notificationsAllowed } from './notify';
import { parseTime } from './schedule';
import { accent, ink, sub } from './theme';

const DAYS = [1, 2, 3, 5, 7, 10, 14, 21, 28, 30, 45, 60, 90, 120, 180, 365];

type Props = {
  settings: SettingsValue;
  onSave: (settings: SettingsValue) => void;
};

export function Settings({ settings, onSave }: Props) {
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    notificationsAllowed().then(setAllowed);
  }, []);

  const { hour, minute } = parseTime(settings.time)!;
  const time = new Date();
  time.setHours(hour, minute, 0, 0);

  const days = [...new Set([...DAYS, ...settings.schedule])].sort((a, b) => a - b);

  const changeTime = (picked: Date) => {
    const next = `${String(picked.getHours()).padStart(2, '0')}:${String(picked.getMinutes()).padStart(2, '0')}`;
    if (next !== settings.time) onSave({ ...settings, time: next });
  };

  const toggle = (day: number) => {
    const schedule = settings.schedule.includes(day)
      ? settings.schedule.filter((selected) => selected !== day)
      : [...settings.schedule, day].sort((a, b) => a - b);
    if (schedule.length > 0) onSave({ ...settings, schedule });
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>설정</Text>
      <Text style={styles.applied}>바꾸면 바로 적용돼요</Text>

      {!allowed && (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>알림이 꺼져 있어요</Text>
          <Text style={styles.noticeBody}>아이폰 설정 &gt; recast &gt; 알림에서 켜야 복습 알림이 와요</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.timeRow}>
          <Text style={styles.label}>알림 시각</Text>
          <DateTimePicker
            value={time}
            mode="time"
            display="compact"
            locale="ko-KR"
            themeVariant="light"
            accentColor={accent}
            onChange={(_, picked) => picked && changeTime(picked)}
          />
        </View>
        <Text style={styles.help}>복습할 문장이 있는 날, 이 시각에 알림이 한 번 와요</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>복습 주기</Text>
        <Text style={styles.help}>저장한 날부터 며칠째에 복습할지 눌러서 골라요</Text>
        <View style={styles.days}>
          {days.map((day) => {
            const selected = settings.schedule.includes(day);
            return (
              <Pressable
                key={day}
                style={({ pressed }) => [styles.day, selected && styles.daySelected, pressed && styles.pressed]}
                onPress={() => toggle(day)}
              >
                <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day}일</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.summary}>지금 주기: {settings.schedule.join(' · ')}일째</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 48 },
  heading: { fontSize: 17, fontWeight: '700', color: ink },
  applied: { fontSize: 13, color: sub, marginTop: 2 },
  notice: { backgroundColor: '#FFF4DC', borderRadius: 14, padding: 14, marginTop: 12 },
  noticeTitle: { fontSize: 15, fontWeight: '700', color: '#7A4B00' },
  noticeBody: { fontSize: 14, color: '#7A4B00', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 16, fontWeight: '700', color: ink },
  help: { fontSize: 13, lineHeight: 18, color: sub, marginTop: 4 },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  day: { backgroundColor: '#F1F0EC', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  daySelected: { backgroundColor: accent },
  dayText: { fontSize: 15, fontWeight: '600', color: ink },
  dayTextSelected: { color: '#fff' },
  pressed: { opacity: 0.5 },
  summary: { fontSize: 13, lineHeight: 18, color: sub, marginTop: 14 },
});
