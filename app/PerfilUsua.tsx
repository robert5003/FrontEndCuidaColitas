// PerfilUsuario.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AVATAR_KEY  = 'user:avatar';
const PHONE_KEY   = 'user:phone';
const ADDRESS_KEY = 'user:address';
const EMAIL_KEY   = 'user:email';

// Tamaños responsivos del avatar y la camarita
const AVATAR_SIZE = 120;
const BADGE_SIZE  = 26;

export default function PerfilUsuario() {
  const router = useRouter();
  const [avatar, setAvatar] = useState<string | null>(null);

  // Nombre fijo (no editable)
  const [nombre] = useState('Smith Angulo Rice Gonzales');

  // Campos persistentes
  const [email, setEmail] = useState('smithAngulo@gmail.com');
  const [telefono, setTelefono] = useState('+503 12345678');
  const [direccion, setDireccion] = useState<string>('');

  // -------- Carga inicial --------
  useEffect(() => {
    (async () => {
      const [uri, savedPhone, savedAddr, savedEmail] = await Promise.all([
        AsyncStorage.getItem(AVATAR_KEY),
        AsyncStorage.getItem(PHONE_KEY),
        AsyncStorage.getItem(ADDRESS_KEY),
        AsyncStorage.getItem(EMAIL_KEY),
      ]);
      if (uri) setAvatar(uri);
      if (savedPhone) setTelefono(savedPhone);
      if (savedAddr) setDireccion(savedAddr);
      if (savedEmail) setEmail(savedEmail);
    })();
  }, []);

  // Rehidratar al volver
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [p, a, e] = await Promise.all([
          AsyncStorage.getItem(PHONE_KEY),
          AsyncStorage.getItem(ADDRESS_KEY),
          AsyncStorage.getItem(EMAIL_KEY),
        ]);
        if (!active) return;
        if (p) setTelefono(p);
        if (a) setDireccion(a);
        if (e) setEmail(e);
      })();
      return () => { active = false; };
    }, [])
  );

  // -------- Avatar --------
  const savePermanently = async (srcUri: string) => {
    const fileName = srcUri.split('/').pop() ?? `avatar_${Date.now()}.jpg`;
    const dest = FileSystem.documentDirectory + fileName;
    if (!srcUri.startsWith(FileSystem.documentDirectory!)) {
      await FileSystem.copyAsync({ from: srcUri, to: dest });
      return dest;
    }
    return srcUri;
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Concede acceso a la galería para cambiar la foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      try {
        const picked = result.assets[0].uri;
        const persistentUri = await savePermanently(picked);
        setAvatar(persistentUri);
        await AsyncStorage.setItem(AVATAR_KEY, persistentUri);
      } catch {
        Alert.alert('Error', 'No se pudo guardar la imagen de forma permanente.');
      }
    }
  };

  const removeAvatar = async () => {
    try {
      if (avatar && avatar.startsWith(FileSystem.documentDirectory!)) {
        const info = await FileSystem.getInfoAsync(avatar);
        if (info.exists) await FileSystem.deleteAsync(avatar, { idempotent: true });
      }
    } catch {}
    setAvatar(null);
    await AsyncStorage.removeItem(AVATAR_KEY);
  };

  const onAvatarPress = () => {
    if (avatar) {
      Alert.alert('Foto de perfil', '¿Qué deseas hacer?', [
        { text: 'Cambiar foto', onPress: pickAvatar },
        { text: 'Eliminar foto', style: 'destructive', onPress: removeAvatar },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    } else {
      pickAvatar();
    }
  };

  // -------- Teléfono --------
  const persistTelefono = async () => {
    await AsyncStorage.setItem(PHONE_KEY, telefono.trim());
  };

  // -------- Dirección actual --------
  const registrarDireccionActual = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No podemos acceder a tu ubicación sin permiso.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      let addressStr = '';
      try {
        const geo = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        if (geo.length) {
          const a = geo[0];
          addressStr = [
            a.street || a.name,
            a.streetNumber,
            a.city,
            a.region,
            a.postalCode,
            a.country,
          ].filter(Boolean).join(', ');
        }
      } catch {}

      if (!addressStr) {
        addressStr = `Lat: ${pos.coords.latitude.toFixed(6)}, Lon: ${pos.coords.longitude.toFixed(6)}`;
      }

      setDireccion(addressStr);
      await AsyncStorage.setItem(ADDRESS_KEY, addressStr);
      Alert.alert('Dirección guardada', 'Se registró tu ubicación actual.');
    } catch {
      Alert.alert('Error', 'No se pudo obtener tu ubicación.');
    }
  };

  // -------- Logout --------
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'refreshToken']);
    } finally {
      router.replace('/login' as any);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/huellitas-blancas.png')}
      style={styles.bg}
      imageStyle={{ opacity: 0.22 }}
      resizeMode="repeat"
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.container}>
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={22} color="#000" />
          </TouchableOpacity>

          {/* Avatar limpio con badge */}
          <View style={styles.avatarHolder}>
            <View style={styles.avatarRing}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person-outline" size={48} color="#6b6b6b" />
                </View>
              )}
            </View>

            {/* Badge de cámara — pequeño, nítido y bien posicionado */}
            <TouchableOpacity
              onPress={onAvatarPress}
              activeOpacity={0.85}
              style={styles.cameraBadge}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name="camera-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Botón textual separado para no saturar */}
          <TouchableOpacity onPress={onAvatarPress} style={styles.smallBtn}>
            <Text style={styles.smallBtnText}>cambiar foto</Text>
          </TouchableOpacity>

          {/* Nombre (bloqueado) */}
          <View style={[styles.field, { opacity: 0.9 }]}>
            <TextInput
              value={nombre}
              editable={false}
              selectTextOnFocus={false}
              style={[styles.input, { color: '#555' }]}
            />
            <View style={[styles.iconBtn, { opacity: 0.35 }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#2e2e2e" />
            </View>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onEndEditing={async () => AsyncStorage.setItem(EMAIL_KEY, email.trim())}
              placeholder="Correo"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor="#8a8a8a"
            />
            <TouchableOpacity style={styles.iconBtn} onPress={async () => AsyncStorage.setItem(EMAIL_KEY, email.trim())}>
              <Ionicons name="create-outline" size={18} color="#2e2e2e" />
            </TouchableOpacity>
          </View>

          {/* Teléfono */}
          <View style={styles.field}>
            <TextInput
              value={telefono}
              onChangeText={setTelefono}
              onEndEditing={persistTelefono}
              placeholder="Teléfono"
              keyboardType="phone-pad"
              style={styles.input}
              placeholderTextColor="#8a8a8a"
            />
            <TouchableOpacity style={styles.iconBtn} onPress={persistTelefono}>
              <Ionicons name="save-outline" size={18} color="#2e2e2e" />
            </TouchableOpacity>
          </View>

          {/* Dirección por ubicación */}
          <TouchableOpacity style={styles.field} onPress={registrarDireccionActual}>
            <Text style={[styles.input, styles.inputAsButton]}>
              {direccion ? direccion : 'Registrar dirección'}
            </Text>
            <View style={styles.iconBtn}>
              <Ionicons name="location-outline" size={18} color="#2e2e2e" />
            </View>
          </TouchableOpacity>

          {/* Cambiar contraseña */}
          <TouchableOpacity style={styles.passwordBtn} onPress={() => router.push('/CambiarPassword' as any)}>
            <Text style={styles.passwordText}>Cambiar contraseña</Text>
          </TouchableOpacity>

          {/* Cerrar sesión */}
          <TouchableOpacity style={styles.logout} onPress={handleLogout}>
            <Text style={styles.logoutText}>CERRAR SESION</Text>
          </TouchableOpacity>

          {/* Logo */}
          <Image source={require('@/assets/images/Imagen1.jpg')} style={styles.logo} resizeMode="contain" />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0a0a0a' },
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e9eef0',
    marginBottom: 8,
  },

  // ---- Avatar limpio
  avatarHolder: {
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 3,               // aro limpio
    borderColor: '#fff',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f1f1',
  },

  // ---- Camarita mejor posicionada
  cameraBadge: {
    position: 'absolute',
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    right: -2,                    // ligeramente fuera del círculo
    bottom: -2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 2,
    borderColor: '#fff',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },

  smallBtn: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  smallBtnText: { fontSize: 12, color: '#1e1e1e' },

  field: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  input: { flex: 1, fontSize: 14, color: '#1e1e1e' },
  inputAsButton: { paddingVertical: 2, color: '#1e1e1e' },
  iconBtn: {
    marginLeft: 8, width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f1f1f1',
  },

  passwordBtn: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  passwordText: { color: '#1e1e1e', fontSize: 14 },

  logout: {
    width: '100%',
    backgroundColor: '#d43d3d',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: { color: '#fff', fontWeight: 'bold', letterSpacing: 0.5 },

  logo: {
    width: 160, height: 48, marginTop: 14,
    marginBottom: Platform.select({ ios: 16, android: 12 }),
  },
});
