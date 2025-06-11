import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function RestablecerPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const handleRestablecer = () => {
    // Aquí iría la conexión al backend con fetch/axios (POST a endpoint Laravel)
    console.log('Correo:', email);
    console.log('Nueva contraseña:', nuevaPassword);
    console.log('Confirmar contraseña:', confirmarPassword);

    Alert.alert('Éxito', 'Contraseña actualizada correctamente', [
      {
        text: 'OK',
        onPress: () => router.replace('/login'), // Redirige al login
      },
    ]);
  };

  return (
    <ImageBackground
      source={require('@/assets/images/huellitas-blancas.png')}
      style={styles.background}
      imageStyle={{ opacity: 0.5 }}
      resizeMode="repeat"
    >
      <View style={styles.topContainer} />

      <View style={styles.container}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>RESTAURA TU CONTRASEÑA</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ingrese su correo"
          placeholderTextColor="#999"
          onChangeText={setEmail}
          value={email}
        />
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          placeholderTextColor="#999"
          secureTextEntry
          onChangeText={setNuevaPassword}
          value={nuevaPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar nueva contraseña"
          placeholderTextColor="#999"
          secureTextEntry
          onChangeText={setConfirmarPassword}
          value={confirmarPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRestablecer}>
          <Text style={styles.buttonText}>RESTAURAR CONTRASEÑA</Text>
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
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topContainer: {
    position: 'absolute',
    top: 0,
    width: width,
    height: 180,
    backgroundColor: '#5a4023',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    zIndex: 1,
  },
  titleWrapper: {
    backgroundColor: '#7fffd4',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 125, 
    marginBottom: 60,
    zIndex: 1,
  },
  title: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#7fffd4',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logo: {
    width: 140,
    height: 40,
    marginTop: 30,
  },
});