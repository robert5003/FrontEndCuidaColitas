// app/citas.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const WEEKDAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const STORAGE_KEY = 'recordatorios:citas';

function formatMonthYear(d: Date) {
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}
function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function toISODate(d: Date) {
  const y = d.getFullYear(); const m = pad(d.getMonth()+1); const day = pad(d.getDate());
  return `${y}-${m}-${day}`;
}

export default function Citas() {
  const router = useRouter();

  const handleLogout = () => router.push('/login');

  // --- Calendario ---
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthMatrix = useMemo(() => {
    const y = viewDate.getFullYear(); const m = viewDate.getMonth();
    const firstWeekday = new Date(y,m,1).getDay();
    const daysInMonth = new Date(y,m+1,0).getDate();
    const cells: Array<{ key: string; day?: number }> = [];
    for (let i=0;i<firstWeekday;i++) cells.push({ key:`empty-prev-${i}` });
    for (let d=1; d<=daysInMonth; d++) cells.push({ key:`day-${d}`, day:d });
    while (cells.length % 7 !== 0) cells.push({ key:`empty-post-${cells.length}` });
    const weeks: Array<Array<{ key: string; day?: number }>> = [];
    for (let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i,i+7));
    return weeks;
  }, [viewDate]);

  const goPrevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth()-1, 1));
  const goNextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth()+1, 1));

  // --- Form ---
  const [hora, setHora] = useState('8:00 AM');
  const [veterinario, setVeterinario] = useState('Dr. Rodrigo Pollo');
  const [motivo, setMotivo] = useState('Vacuna  Rabia');
  const [importancia, setImportancia] = useState<'alta'|'leve'>('leve');

  const fechaTexto = selectedDate
    ? `${formatMonthYear(selectedDate)} ${pad(selectedDate.getDate())}`
    : '—';

  const notifySuccess = (msg: string) => {
    if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert('Cita agendada', msg);
  };

  const saveReminder = async (cita: any) => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push(cita);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const handleAgendar = async () => {
    if (!selectedDate) {
      Alert.alert('Selecciona una fecha', 'Por favor elige un día en el calendario.');
      return;
    }

const cita = {
  id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, // <- único
  fechaISO: toISODate(selectedDate),
  hora,
  veterinario,
  motivo,
  importancia,                 // 'alta' | 'leve'
  createdAt: new Date().toISOString(),
  status: 'pendiente' as const,
};

    try {
      // Aquí podrías hacer POST a tu backend
      await saveReminder(cita);
      notifySuccess('Tu cita fue registrada y aparecerá en Recordatorio.');
      // Si quieres ir directo:
      // router.push('/recordatorio' as any);
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la cita. Intenta de nuevo.');
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/huellitas-blancas.png')}
      style={styles.container}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.3 }}
    >
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}
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
          <Image source={require('@/assets/images/Imagen5.png')} style={styles.headerImage} />
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
          <Text style={styles.cardTitle}>Seleccione la fecha de su cita</Text>

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

            {monthMatrix.map((week, wi) => (
              <View key={`w-${wi}`} style={styles.weekRow}>
                {week.map((cell) => {
                  if (!cell.day) return <View key={cell.key} style={styles.dayCellEmpty} />;
                  const isSelected =
                    selectedDate &&
                    selectedDate.getFullYear() === viewDate.getFullYear() &&
                    selectedDate.getMonth() === viewDate.getMonth() &&
                    selectedDate.getDate() === cell.day;

                  return (
                    <TouchableOpacity
                      key={cell.key}
                      style={[styles.dayCell, isSelected && styles.daySelected]}
                      onPress={() => setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), cell.day))}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{cell.day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Formulario */}
          <View style={styles.formBox}>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Fecha</Text>
              <View style={styles.formValueBox}>
                <Text style={styles.formValue}>{fechaTexto}</Text>
              </View>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Hora</Text>
              <TouchableOpacity style={styles.formValueBox} onPress={() => setHora(hora === '8:00 AM' ? '10:00 AM' : '8:00 AM')}>
                <Text style={styles.formValue}>{hora}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Veterinario</Text>
              <TouchableOpacity
                style={styles.formValueBox}
                onPress={() =>
                  setVeterinario((v) => (v === 'Dr. Rodrigo Pollo' ? 'Dra. Ana López' : 'Dr. Rodrigo Pollo'))
                }
              >
                <Text style={styles.formValue}>{veterinario}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Motivo cita</Text>
              <TouchableOpacity
                style={styles.formValueBox}
                onPress={() => setMotivo((m) => (m === 'Vacuna  Rabia' ? 'Chequeo general' : 'Vacuna  Rabia'))}
              >
                <Text style={styles.formValue}>{motivo}</Text>
              </TouchableOpacity>
            </View>

            {/* NUEVO: Selector de importancia */}
            <View style={[styles.formRow, { alignItems: 'stretch' }]}>
              <Text style={styles.formLabel}>Importancia</Text>
              <View style={styles.importanceGroup}>
                <TouchableOpacity
                  style={[styles.importanceBtn, importancia === 'alta' && styles.importanceBtnActiveRed]}
                  onPress={() => setImportancia('alta')}
                  activeOpacity={0.9}
                >
                  <View style={[styles.dot, { backgroundColor: '#ff3b30' }]} />
                  <Text style={[styles.importanceText, importancia === 'alta' && styles.importanceTextActive]}>
                    Importante
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.importanceBtn, importancia === 'leve' && styles.importanceBtnActiveGreen]}
                  onPress={() => setImportancia('leve')}
                  activeOpacity={0.9}
                >
                  <View style={[styles.dot, { backgroundColor: '#00c780' }]} />
                  <Text style={[styles.importanceText, importancia === 'leve' && styles.importanceTextActive]}>
                    Leve
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Botón AGENDAR */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleAgendar} activeOpacity={0.9}>
            <Text style={styles.submitText}>AGENDAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, alignItems:'center', paddingTop:10 },

  header:{ width:'100%', backgroundColor:'#0d939cff', borderRadius:20, padding:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  logoutButton:{ backgroundColor:'#ff6666', borderRadius:20, padding:8 },
  profileButton:{ width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', marginLeft:10 },
  headerContent:{ flex:2, marginLeft:10, marginRight:10, alignItems:'center', justifyContent:'center' },
  greeting:{ color:'#fff', fontSize:18, fontWeight:'bold' },
  subtitle:{ color:'#fff', fontSize:14 },
  headerImage:{ width:40, height:40, resizeMode:'contain' },

  searchContainer:{ flexDirection:'row', backgroundColor:'#fff', borderRadius:25, width:'100%', padding:5, alignItems:'center', marginBottom:10 },
  searchIcon:{ marginRight:10 },
  searchInput:{ flex:1, fontSize:16 },
  topNav:{ width:'100%', backgroundColor:'#00bfae', paddingVertical:10, flexDirection:'row', justifyContent:'space-around', marginBottom:15 },
  navText:{ color:'#fff', fontWeight:'bold', fontSize:14 },
  activeNav:{ textDecorationLine:'underline' },

  card:{ backgroundColor:'#fff', width:'90%', borderRadius:20, padding:16, elevation:5 },
  cardTitle:{ fontSize:16, fontWeight:'600', color:'#1b1b1b', marginBottom:10 },

  calendar:{ borderWidth:1, borderColor:'#d8e3e6', borderRadius:12, padding:10, backgroundColor:'#f9feff' },
  calHeader:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:6 },
  monthBtn:{ padding:6, borderRadius:8, backgroundColor:'#e8f7f8' },
  monthText:{ fontWeight:'600', color:'#0d939c' },
  weekdaysRow:{ flexDirection:'row', justifyContent:'space-between', marginTop:6, marginBottom:4 },
  weekday:{ width:`${100/7}%`, textAlign:'center', fontSize:11, color:'#6c7a80', fontWeight:'600' },
  weekRow:{ flexDirection:'row', justifyContent:'space-between', marginBottom:6 },
  dayCell:{ width:`${100/7}%`, aspectRatio:1, alignItems:'center', justifyContent:'center', borderRadius:8, backgroundColor:'#ffffff', borderWidth:1, borderColor:'#e5eef0' },
  dayCellEmpty:{ width:`${100/7}%`, aspectRatio:1 },
  dayText:{ color:'#2a2a2a', fontSize:12, fontWeight:'600' },
  daySelected:{ backgroundColor:'#dff7f5', borderColor:'#0d939c' },
  dayTextSelected:{ color:'#0d939c' },

  formBox:{ marginTop:10, borderRadius:12, padding:10, backgroundColor:'#ffffff', gap:8 },
  formRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  formLabel:{ width:90, fontSize:13, color:'#2b2b2b', fontWeight:'600' },
  formValueBox:{ flex:1, backgroundColor:'#f0fbff', borderWidth:1, borderColor:'#cfe8ff', paddingVertical:8, paddingHorizontal:10, borderRadius:8 },
  formValue:{ color:'#2185ff', fontWeight:'600', fontSize:13 },

  // importancia
  importanceGroup:{ flex:1, flexDirection:'row', gap:10 },
  importanceBtn:{
    flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center',
    borderRadius:10, borderWidth:1, borderColor:'#dfe7ea', paddingVertical:10, backgroundColor:'#fff', gap:8
  },
  importanceBtnActiveRed:{ borderColor:'#ff3b30', backgroundColor:'#ffecec' },
  importanceBtnActiveGreen:{ borderColor:'#00c780', backgroundColor:'#eafff4' },
  importanceText:{ fontWeight:'700', color:'#2a2a2a' },
  importanceTextActive:{ color:'#111' },
  dot:{ width:10, height:10, borderRadius:5 },

  submitBtn:{ marginTop:14, backgroundColor:'#00c780', borderRadius:28, paddingVertical:14, alignItems:'center' },
  submitText:{ color:'#ffffff', fontWeight:'800', letterSpacing:0.5 },
});
