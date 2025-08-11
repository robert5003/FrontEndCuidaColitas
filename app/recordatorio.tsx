// app/recordatorio.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// 🔒 Flag global para no reprogramar notificaciones en la misma sesión de app
let scheduledOnceGlobal = false;

type CitaRecordatorio = {
  id: string;
  fechaISO: string;   // "YYYY-MM-DD"
  hora: string;       // "8:00 AM"
  veterinario: string;
  motivo: string;
  createdAt: string;  // ISO
  status: 'pendiente' | 'completada' | 'cancelada';
  importancia?: 'alta' | 'leve';
};

const STORAGE_KEY = 'recordatorios:citas';
const SCHEDULED_MAP_KEY = 'recordatorios:scheduled'; // { [id]: notificationId }
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatMonthYear(d: Date) {
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}
function parseToDate(fechaISO: string, hora12: string) {
  const [hmm, ampm] = hora12.trim().split(' ');
  const [hStr, mStr] = hmm.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  if (ampm?.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (ampm?.toUpperCase() === 'AM' && h === 12) h = 0;
  const [Y, M, D] = fechaISO.split('-').map((x) => parseInt(x, 10));
  return new Date(Y, (M || 1) - 1, D || 1, h, m, 0, 0);
}
function hoursDiff(a: Date, b: Date) {
  return (a.getTime() - b.getTime()) / (1000 * 60 * 60);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Recordatorio() {
  const router = useRouter();

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [citas, setCitas] = useState<CitaRecordatorio[]>([]);
  const [scheduledMap, setScheduledMap] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false); // ✅ listo para programar

  // Modal detalle / edición
  const [openDetail, setOpenDetail] = useState(false);
  const [selected, setSelected] = useState<CitaRecordatorio | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editHora, setEditHora] = useState('');
  const [editMotivo, setEditMotivo] = useState('');
  const [editVet, setEditVet] = useState('');
  const [editImportancia, setEditImportancia] = useState<'alta' | 'leve' | undefined>(undefined);

  // Calendario simple
  const monthMatrix = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const firstWeekday = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: Array<{ key: string; day?: number }> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push({ key: `empty-prev-${i}` });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ key: `day-${d}`, day: d });
    while (cells.length % 7 !== 0) cells.push({ key: `empty-post-${cells.length}` });
    const weeks: Array<Array<{ key: string; day?: number }>> = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }, [viewDate]);

  const goPrevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  // Permisos + canal Android
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') await Notifications.requestPermissionsAsync();
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Recordatorios',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    })();
  }, []);

  // Cargar storage
  const loadData = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: CitaRecordatorio[] = raw ? JSON.parse(raw) : [];
    list.sort((a, b) => (a.fechaISO + a.hora).localeCompare(b.fechaISO + b.hora));
    setCitas(list);

    const schedRaw = await AsyncStorage.getItem(SCHEDULED_MAP_KEY);
    setScheduledMap(schedRaw ? JSON.parse(schedRaw) : {});
    setHydrated(true);

    // Mover el calendario al mes de la PRÓXIMA cita
    if (list.length) {
      const now = new Date();
      const toDate = (c: CitaRecordatorio) => parseToDate(c.fechaISO, c.hora);
      const upcoming =
        list.map((c) => toDate(c))
            .sort((a, b) => a.getTime() - b.getTime())
            .find((d) => d.getTime() >= now.getTime()) || toDate(list[0]);
      setViewDate(new Date(upcoming.getFullYear(), upcoming.getMonth(), 1));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Programación: solo una vez por sesión y luego de hidratar
  const ensureScheduled = useCallback(async () => {
    if (scheduledOnceGlobal || !hydrated) return;

    const map = { ...scheduledMap };
    let changed = false;

    for (const c of citas) {
      if (map[c.id]) continue; // ya tiene notificación
      const when = parseToDate(c.fechaISO, c.hora);
      if (when.getTime() <= Date.now()) continue;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio de cita 🐾',
          body: `${c.motivo} con ${c.veterinario} - ${c.hora}`,
          data: { citaId: c.id },
        },
        trigger: { date: when } as Notifications.DateTriggerInput,
      });

      map[c.id] = id;
      changed = true;
    }

    if (changed) {
      await AsyncStorage.setItem(SCHEDULED_MAP_KEY, JSON.stringify(map));
      setScheduledMap(map);
    }
    scheduledOnceGlobal = true; // ✅ evita “spam” al cambiar de pestaña
  }, [citas, scheduledMap, hydrated]);

  useEffect(() => {
    if (citas.length) ensureScheduled();
  }, [citas, ensureScheduled]);

  // Helpers UI
  const byMonth = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    return citas.filter((c) => {
      const [Y, M] = c.fechaISO.split('-').map((x) => parseInt(x, 10));
      return Y === y && (M - 1) === m;
    });
  }, [citas, viewDate]);

  const importanceColor = (c: CitaRecordatorio) => {
    if (c.importancia === 'alta') return '#ff3b30';
    if (c.importancia === 'leve') return '#00c780';
    const event = parseToDate(c.fechaISO, c.hora);
    return hoursDiff(event, new Date()) <= 48 ? '#ff3b30' : '#00c780';
  };

  const dayInfo = (fechaISO: string) => {
    const d = new Date(fechaISO);
    return { dow: WEEKDAYS[d.getDay()], day: d.getDate() };
  };

  // Eliminar cita (y cancela notificación)
  const deleteCita = async (id: string) => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: CitaRecordatorio[] = raw ? JSON.parse(raw) : [];
    const newList = list.filter((x) => x.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    setCitas(newList);

    const schedRaw = await AsyncStorage.getItem(SCHEDULED_MAP_KEY);
    const map = schedRaw ? JSON.parse(schedRaw) : {};
    if (map[id]) {
      try { await Notifications.cancelScheduledNotificationAsync(map[id]); } catch {}
      delete map[id];
      await AsyncStorage.setItem(SCHEDULED_MAP_KEY, JSON.stringify(map));
      setScheduledMap(map);
    }
    setOpenDetail(false);
  };

  // ======= EDICIÓN =======
  const startEdit = () => {
    if (!selected) return;
    setEditHora(selected.hora);
    setEditMotivo(selected.motivo);
    setEditVet(selected.veterinario);
    setEditImportancia(selected.importancia);
    setEditMode(true);
  };

  const saveEdit = async () => {
    if (!selected) return;

    // 1) Actualiza la lista en storage
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: CitaRecordatorio[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((x) => x.id === selected.id);
    if (idx === -1) return;

    const updated: CitaRecordatorio = {
      ...list[idx],
      hora: editHora.trim() || list[idx].hora,
      motivo: editMotivo.trim() || list[idx].motivo,
      veterinario: editVet.trim() || list[idx].veterinario,
      importancia: editImportancia,
    };
    list[idx] = updated;
    list.sort((a, b) => (a.fechaISO + a.hora).localeCompare(b.fechaISO + b.hora));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setCitas(list);
    setSelected(updated);

    // 2) Reprograma notificación (cancela si había)
    const schedRaw = await AsyncStorage.getItem(SCHEDULED_MAP_KEY);
    const map: Record<string, string> = schedRaw ? JSON.parse(schedRaw) : {};

    if (map[updated.id]) {
      try { await Notifications.cancelScheduledNotificationAsync(map[updated.id]); } catch {}
      delete map[updated.id];
    }

    const when = parseToDate(updated.fechaISO, updated.hora);
    if (when.getTime() > Date.now()) {
      const newId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio de cita 🐾',
          body: `${updated.motivo} con ${updated.veterinario} - ${updated.hora}`,
          data: { citaId: updated.id },
        },
        trigger: { date: when } as Notifications.DateTriggerInput,
      });
      map[updated.id] = newId;
    }

    await AsyncStorage.setItem(SCHEDULED_MAP_KEY, JSON.stringify(map));
    setScheduledMap(map);

    setEditMode(false);
    Alert.alert('Guardado', 'El recordatorio se actualizó.');
  };

  const handleLogout = () => router.push('/login');

  return (
    <ImageBackground
      source={require('@/assets/images/huellitas-blancas.png')}
      style={styles.container}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.3 }}
    >
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Hola, Sr. Smith!</Text>
            <Text style={styles.subtitle}>Hoy es un gran día para cuidar colitas</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/PerfilUsua' as any)}
            style={styles.profileButton}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={40} color="#3a3a3a" />
          </TouchableOpacity>
        </View>

        {/* BUSCADOR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor="#555" />
          <Image source={require('@/assets/images/Imagen6.png')} style={styles.headerImage} />
        </View>

        {/* NAV */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.push('/recordatorio' as any)}>
            <Text style={styles.navText}>Recordatorio</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/citas' as any)}>
            <Text style={styles.navText}>Citas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/historialMD' as any)}>
            <Text style={[styles.navText, styles.activeNav]}>Historial MD</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/servicios' as any)}>
            <Text style={styles.navText}>Servicios</Text>
          </TouchableOpacity>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          {/* Calendario */}
          <View style={styles.calendar}>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={goPrevMonth} style={styles.monthBtn}>
                <Ionicons name="chevron-back" size={18} color="#0d939c" />
              </TouchableOpacity>
              <Text style={styles.monthText}>{formatMonthYear(viewDate)}</Text>
              <TouchableOpacity onPress={goNextMonth} style={styles.monthBtn}>
                <Ionicons name="chevron-forward" size={18} color="#0d939c" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((d) => (
                <Text key={d} style={styles.weekday}>{d}</Text>
              ))}
            </View>
            {monthMatrix.map((w, i) => (
              <View key={i} style={styles.weekRow}>
                {w.map((c) =>
                  c.day ? (
                    <View key={c.key} style={styles.dayDotCell}>
                      <Text style={styles.dayMini}>{c.day}</Text>
                    </View>
                  ) : (
                    <View key={c.key} style={styles.dayDotCell} />
                  )
                )}
              </View>
            ))}
          </View>

          {/* Lista del mes */}
          <View style={{ marginTop: 10 }}>
            {byMonth.length === 0 ? (
              <Text style={{ color: '#7a8b93', textAlign: 'center', marginVertical: 10 }}>
                No hay recordatorios para este mes.
              </Text>
            ) : (
              byMonth.map((c) => {
                const { dow, day } = dayInfo(c.fechaISO);
                const color = importanceColor(c);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.reminderRow}
                    activeOpacity={0.9}
                    onPress={() => { setSelected(c); setOpenDetail(true); setEditMode(false); }}
                  >
                    <View style={styles.dateCol}>
                      <View style={[styles.importanceDot, { backgroundColor: color }]} />
                      <Text style={styles.dateDay}>{day}</Text>
                      <Text style={styles.dateDow}>{dow}</Text>
                    </View>

                    <View style={[styles.reminderCard, { borderLeftColor: color }]}>
                      <Text style={styles.reminderTitle}>
                        {c.motivo || 'Cita'} {c.veterinario ? `— ${c.veterinario}` : ''}
                      </Text>
                      <View style={styles.reminderMeta}>
                        <Ionicons name="time-outline" size={14} color="#2a2a2a" />
                        <Text style={styles.reminderMetaText}>{c.hora}</Text>
                        <View style={{ flex: 1 }} />
                        <Ionicons name="notifications-outline" size={16} color="#2a2a2a" />
                        <Text style={styles.reminderMetaText}>once</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Nuevo Recordatorio */}
          <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/citas' as any)} activeOpacity={0.9}>
            <Ionicons name="add-circle-outline" size={18} />
            <Text style={styles.newBtnText}>Nuevo Recordatorio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL DETALLE / EDICIÓN */}
      <Modal transparent visible={openDetail} animationType="fade" onRequestClose={() => setOpenDetail(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Detalle de recordatorio</Text>

            {selected && !editMode && (
              <>
                <Text style={styles.modalRow}><Text style={styles.bold}>Fecha:</Text> {selected.fechaISO}</Text>
                <Text style={styles.modalRow}><Text style={styles.bold}>Hora:</Text> {selected.hora}</Text>
                <Text style={styles.modalRow}><Text style={styles.bold}>Veterinario:</Text> {selected.veterinario}</Text>
                <Text style={styles.modalRow}><Text style={styles.bold}>Motivo:</Text> {selected.motivo}</Text>
                <Text style={styles.modalRow}><Text style={styles.bold}>Importancia:</Text> {selected.importancia ?? '—'}</Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={startEdit}>
                    <Ionicons name="create-outline" size={18} />
                    <Text style={styles.editText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteBtn} onPress={() =>
                    Alert.alert('Eliminar', '¿Eliminar este recordatorio?', [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Eliminar', style: 'destructive', onPress: () => deleteCita(selected.id) },
                    ])
                  }>
                    <Ionicons name="trash-outline" size={18} />
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.closeBtn} onPress={() => setOpenDetail(false)}>
                    <Text style={styles.closeText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {selected && editMode && (
              <>
                <Text style={styles.label}>Hora (e.g. 8:00 AM)</Text>
                <TextInput value={editHora} onChangeText={setEditHora} style={styles.input} placeholder="8:00 AM" />

                <Text style={styles.label}>Motivo</Text>
                <TextInput value={editMotivo} onChangeText={setEditMotivo} style={styles.input} placeholder="Motivo" />

                <Text style={styles.label}>Veterinario</Text>
                <TextInput value={editVet} onChangeText={setEditVet} style={styles.input} placeholder="Dr. ..." />

                <Text style={styles.label}>Importancia</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() => setEditImportancia('leve')}
                    style={[styles.tag, editImportancia === 'leve' && styles.tagActiveGreen]}
                  >
                    <Text style={[styles.tagText, editImportancia === 'leve' && styles.tagTextActive]}>Leve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEditImportancia('alta')}
                    style={[styles.tag, editImportancia === 'alta' && styles.tagActiveRed]}
                  >
                    <Text style={[styles.tagText, editImportancia === 'alta' && styles.tagTextActive]}>Importante</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                    <Ionicons name="save-outline" size={18} />
                    <Text style={styles.saveText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.closeBtnOutline} onPress={() => setEditMode(false)}>
                    <Text style={styles.closeTextDark}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 10 },

  header: {
    width: '100%', backgroundColor: '#0d939cff', borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
  },
  logoutButton: { backgroundColor: '#ff6666', borderRadius: 20, padding: 8 },
  profileButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  headerContent: { flex: 2, marginHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  greeting: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: '#fff', fontSize: 14 },
  headerImage: { width: 40, height: 40, resizeMode: 'contain' },

  searchContainer: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 25, width: '100%',
    paddingVertical: 5, paddingHorizontal: 12, alignItems: 'center', marginBottom: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },

  topNav: {
    width: '100%', backgroundColor: '#00bfae', paddingVertical: 10,
    flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15,
  },
  navText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  activeNav: { textDecorationLine: 'underline' },

  card: { backgroundColor: '#fff', width: '90%', borderRadius: 20, padding: 14, elevation: 5 },

  calendar: { backgroundColor: '#f9feff', borderColor: '#d8e3e6', borderWidth: 1, borderRadius: 12, padding: 10 },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthBtn: { padding: 6, borderRadius: 8, backgroundColor: '#e8f7f8' },
  monthText: { fontWeight: '600', color: '#0d939c' },
  weekdaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 11, color: '#6c7a80', fontWeight: '600' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  dayDotCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayMini: { fontSize: 11, color: '#2a2a2a' },

  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  dateCol: { width: 54, alignItems: 'center' },
  importanceDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 6 },
  dateDay: { fontSize: 18, fontWeight: '800', color: '#2a2a2a', lineHeight: 22 },
  dateDow: { fontSize: 12, color: '#7a8b90' },

  reminderCard: {
    flex: 1, backgroundColor: '#d8ffe9', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, borderLeftWidth: 6,
  },
  reminderTitle: { fontWeight: '700', color: '#154b2c' },
  reminderMeta: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  reminderMetaText: { fontSize: 12, color: '#2a2a2a' },

  newBtn: {
    marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#eafff4', borderRadius: 28, paddingVertical: 12,
  },
  newBtnText: { color: '#0b5', fontWeight: '800' },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '86%', backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  modalRow: { marginVertical: 2, color: '#333' },
  bold: { fontWeight: '700' },
  modalActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 14 },

  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#eef5ff', borderRadius: 10 },
  editText: { color: '#1b4bff', fontWeight: '700' },

  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#ffecec', borderRadius: 10 },
  deleteText: { color: '#b00020', fontWeight: '700' },

  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#0d939c', borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700' },

  closeBtn: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#0d939c', borderRadius: 10 },
  closeText: { color: '#fff', fontWeight: '700' },
  closeBtnOutline: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#f1f5f9', borderRadius: 10 },
  closeTextDark: { color: '#1f2937', fontWeight: '700' },

  label: { fontWeight: '700', marginTop: 8, marginBottom: 4, color: '#333' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 6 },

  tag: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  tagActiveGreen: { backgroundColor: '#eafff4', borderColor: '#00c780' },
  tagActiveRed: { backgroundColor: '#ffecec', borderColor: '#ff3b30' },
  tagText: { color: '#374151', fontWeight: '700' },
  tagTextActive: { color: '#0f172a' },
});
