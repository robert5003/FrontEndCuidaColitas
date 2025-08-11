import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const PETS_KEY = 'pets:list';

export default function AgregarMascota() {
  const router = useRouter();

  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [vaccines, setVaccines] = React.useState('');
  const [consults, setConsults] = React.useState('');
  const [treatments, setTreatments] = React.useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Debes permitir acceso a tus fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const savePet = async () => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar el nombre de la mascota.');
      return;
    }

    let finalUri = imageUri;
    if (imageUri) {
      const targetPath = `${FileSystem.documentDirectory}pet_${Date.now()}.jpg`;
      try {
        await FileSystem.copyAsync({ from: imageUri, to: targetPath });
        finalUri = targetPath;
      } catch {
        Alert.alert('Error', 'No se pudo guardar la imagen, se guardará sin foto.');
        finalUri = null;
      }
    }

    try {
      const raw = await AsyncStorage.getItem(PETS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const newPet = {
        id: `${Date.now()}`,
        name: name.trim(),
        vaccines: vaccines.trim(),
        consults: consults.trim(),
        treatments: treatments.trim(),
        imageUri: finalUri || null,
      };
      list.push(newPet);
      await AsyncStorage.setItem(PETS_KEY, JSON.stringify(list));
      router.back(); // volver a HistorialMD
    } catch (e) {
      console.warn('No se pudo guardar la mascota', e);
      Alert.alert('Error', 'No se pudo guardar la mascota.');
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/huellitas-blancas.png')}
      style={{ flex: 1 }}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.title}>Agregar nueva mascota</Text>

          {/* Foto */}
          <TouchableOpacity
            onPress={pickImage}
            style={styles.petImageWrapper}
            activeOpacity={0.8}
          >
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.petImage} />
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera-outline" size={16} color="#fff" />
                </View>
              </>
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={32} color="#aaa" />
                <View style={[styles.cameraBadge, { bottom: 8, right: 8 }]}>
                  <Ionicons name="camera-outline" size={16} color="#fff" />
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Campos */}
          <Text style={styles.label}>Nombre de la mascota</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Garfield"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Vacunas recibidas</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Rabia, Parvovirus"
            value={vaccines}
            onChangeText={setVaccines}
          />

          <Text style={styles.label}>Consultas (doctor y diagnóstico)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Dr. Cuper, Alergia"
            value={consults}
            onChangeText={setConsults}
          />

          <Text style={styles.label}>Tratamientos (padecimiento y tratamiento)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Alergia, tratamiento con antihistamínicos"
            value={treatments}
            onChangeText={setTreatments}
          />

          {/* Botón Guardar */}
          <TouchableOpacity onPress={savePet} style={styles.saveButton}>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar mascota</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  title: {
    fontSize: 22,
    fontWeight: 'normal',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  petImageWrapper: { alignSelf: 'center', marginBottom: 20 },
  petImage: { width: 120, height: 120, borderRadius: 60, resizeMode: 'cover' },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0008',
    borderRadius: 12,
    padding: 4,
  },
  label: { fontWeight: 'bold', color: '#000', marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: '#ffffffff',
    borderColor: '#00bfae',
    color: '#000',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#00bfae',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    alignSelf: 'center',
    elevation: 3,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
