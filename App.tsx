import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, KeyboardAvoidingView, Pressable, StyleSheet, Text, View } from 'react-native';

import { Add } from './src/Add';
import {
  getDueItems,
  getPendingDues,
  getSessions,
  getSettings,
  markAgain,
  markDone,
  saveSession,
  saveSettings,
} from './src/db';
import { History } from './src/History';
import { enableNotifications, onNotificationTap, syncNotifications } from './src/notify';
import { Review } from './src/Review';
import { toYmd } from './src/schedule';
import { Settings } from './src/Settings';
import { background, ink, sub } from './src/theme';

type Tab = 'review' | 'add' | 'history' | 'settings';

const load = () => ({
  sessions: getSessions(),
  due: getDueItems(),
  pending: getPendingDues(),
  settings: getSettings(),
});

export default function App() {
  const [data, setData] = useState(load);
  const [tab, setTab] = useState<Tab>(data.due.length > 0 ? 'review' : 'add');
  const [text, setText] = useState('');

  const refresh = () => {
    setData(load());
    syncNotifications();
  };

  useEffect(() => {
    enableNotifications();
    const removeTap = onNotificationTap(() => setTab('review'));
    const active = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      removeTap();
      active.remove();
    };
  }, []);

  const today = toYmd(new Date());
  const nextDue = data.pending.filter((due) => due > today).sort()[0];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'review', label: data.due.length > 0 ? `복습 ${data.due.length}` : '복습' },
    { key: 'add', label: '추가' },
    { key: 'history', label: '저장한 세트' },
  ];

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>recast</Text>
          <Pressable hitSlop={12} onPress={() => setTab('settings')}>
            <Ionicons name={tab === 'settings' ? 'settings' : 'settings-outline'} size={24} color={ink} />
          </Pressable>
        </View>
        <View style={styles.tabs}>
          {tabs.map(({ key, label }) => (
            <Pressable key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}>
              <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tab === 'review' && (
        <Review
          items={data.due}
          nextDue={nextDue}
          onResult={(item, done) => {
            if (done) markDone(item);
            else markAgain(item);
            refresh();
          }}
        />
      )}
      {tab === 'add' && (
        <Add
          text={text}
          onChangeText={setText}
          schedule={data.settings.schedule}
          onSave={(items) => {
            saveSession(items);
            refresh();
          }}
          onOpenHistory={() => setTab('history')}
        />
      )}
      {tab === 'history' && <History sessions={data.sessions} />}
      {tab === 'settings' && (
        <Settings
          settings={data.settings}
          onSave={(settings) => {
            saveSettings(settings);
            refresh();
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: background },
  top: { paddingTop: 72, paddingHorizontal: 20, paddingBottom: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 30, fontWeight: '800', color: ink },
  tabs: { flexDirection: 'row', backgroundColor: '#E9E7E1', borderRadius: 12, padding: 3, marginTop: 14 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 15, fontWeight: '600', color: sub },
  tabTextActive: { color: ink },
});
