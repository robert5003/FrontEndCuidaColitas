import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = {
  mint: '#27E0BB',
  brown: '#5a4023',
  text: '#000000',
  placeholder: '#9A9A9A',
  white: '#FFFFFF',
};

export default function CambiarPassword() {
  const router = useRouter();

  const [actualPassword, setActualPassword] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleActualizar = async () => {
    if (loading) return;

    if (!actualPassword || !nuevaPassword || !confirmarPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    } // 👈 ESTE CORCHETE FALTABA

    if (nuevaPassword.length < 8) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      // TODO: reemplazar por tu endpoint real
      /*
      const res = await fetch('http://TU-IP:8000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: actualPassword,
          password: nuevaPassword,
          password_confirmation: confirmarPassword,
        }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar la contraseña');
      */
      Alert.alert('Éxito', 'Contraseña actualizada correctamente', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Algo salió mal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/huellitas-blancas.png')}
      style={styles.background}
      imageStyle={{ opacity: 0.28 }}
      resizeMode="repeat"
    >
      <View style={styles.topBar} />

      <View style={styles.content}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>CAMBIAR  CONTRASEÑA</Text>
        </View>

        {/* Contraseña actual */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Contraseña actual"
            placeholderTextColor={COLORS.placeholder}
            secureTextEntry={!showActual}
            value={actualPassword}
            onChangeText={setActualPassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowActual(s => !s)}
            accessibilityLabel={showActual ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Ionicons name={showActual ? 'eye-off' : 'eye'} size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Nueva contraseña */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Nueva contraseña"
            placeholderTextColor={COLORS.placeholder}
            secureTextEntry={!showNueva}
            value={nuevaPassword}
            onChangeText={setNuevaPassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowNueva(s => !s)}
            accessibilityLabel={showNueva ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Ionicons name={showNueva ? 'eye-off' : 'eye'} size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Confirmar nueva contraseña */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Confirmar nueva contraseña"
            placeholderTextColor={COLORS.placeholder}
            secureTextEntry={!showConfirmar}
            value={confirmarPassword}
            onChangeText={setConfirmarPassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowConfirmar(s => !s)}
            accessibilityLabel={showConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Ionicons name={showConfirmar ? 'eye-off' : 'eye'} size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
          onPress={handleActualizar}
          activeOpacity={0.9}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.text} />
          ) : (
            <Text style={styles.primaryBtnText}>ACTUALIZAR CONTRASEÑA</Text>
          )}
        </TouchableOpacity>

        <Image
          source={require('@/assets/images/Imagen1.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  topBar: {
    position: 'absolute',
    top: 0,
    width,
    height: 160,
    backgroundColor: COLORS.brown,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 2,
  },
  pill: {
    backgroundColor: COLORS.mint,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 115,
    marginBottom: 40,
    maxWidth: width * 0.88,
  },
  pillText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  inputWrap: {
    width: '100%',
    position: 'relative',
    marginBottom: 14,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingRight: 44, // espacio para el ojito
    fontSize: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  primaryBtn: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.mint,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingHorizontal: 12,
  },
  primaryBtnText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  logo: { width: 150, height: 44, marginTop: 28 },
});
