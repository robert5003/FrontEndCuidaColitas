import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  FlatList,
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

const { width } = Dimensions.get('window');

type SectionType = 'vacunas' | 'consultas' | 'tratamientos';

type Pet = {
  id: string;
  name: string;
  vaccines?: string;
  consults?: string;
  treatments?: string;
  imageUri?: string | null;
};

const PETS_KEY = 'pets:list';
// compat: migración desde tu clave anterior si existiera
const LEGACY_GARFIELD_KEY = 'petImage:garfield';

export default function HistorialMD() {
  const router = useRouter();

  const [query, setQuery] = React.useState('');
  const [pets, setPets] = React.useState<Pet[]>([]);

  // ----- helpers de persistencia -----
  const savePets = React.useCallback(async (list: Pet[]) => {
    setPets(list);
    try {
      await AsyncStorage.setItem(PETS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('No se pudo guardar la lista de mascotas', e);
    }
  }, []);

  const loadPets = React.useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(PETS_KEY);
      if (raw) {
        const parsed: Pet[] = JSON.parse(raw);
        setPets(parsed);
        return;
      }
      // si no hay lista, inicializamos con Garfield (y migramos imagen si existía)
      let garfieldImage: string | null = null;
      const legacy = await AsyncStorage.getItem(LEGACY_GARFIELD_KEY);
      if (legacy) {
        // mover a sandbox
        const target = `${FileSystem.documentDirectory}pet_garfield.jpg`;
        try {
          await FileSystem.copyAsync({ from: legacy, to: target });
          garfieldImage = target;
          await AsyncStorage.removeItem(LEGACY_GARFIELD_KEY);
        } catch {
          garfieldImage = legacy; // fallback: usar la vieja ruta si copiar falla
        }
      }
      const seed: Pet[] = [
        {
          id: 'garfield',
          name: 'GARFIELD',
          vaccines: 'Rabia, Parvovirus',
          consults: 'Dr. Cuper, Garfield',
          treatments: 'Alergia, Parvovirus',
          imageUri: garfieldImage,
        },
      ];
      await savePets(seed);
    } catch (e) {
      console.warn('No se pudo cargar la lista de mascotas', e);
    }
  }, [savePets]);

  // Cargar al montar
  React.useEffect(() => {
    loadPets();
  }, [loadPets]);

  // Recargar cuando se vuelve a enfocar (por si /agregarMascota guardó algo nuevo)
  useFocusEffect(
    React.useCallback(() => {
      loadPets();
    }, [loadPets])
  );

  const handleLogout = React.useCallback(() => {
    router.push('/login');
  }, [router]);

  const handleNavigate = React.useCallback(
    (section: SectionType, petId: string) => {
      router.push({ pathname: '/detalleHistorial', params: { tipo: section, petId } });
    },
    [router]
  );

  // ----- Imagen por mascota -----
  const fileNameFor = (petId: string) => `pet_${petId}.jpg`;

  const persistPickedImageForPet = React.useCallback(
    async (petId: string, pickedUri: string) => {
      try {
        const targetPath = `${FileSystem.documentDirectory}${fileNameFor(petId)}`;
        await FileSystem.copyAsync({ from: pickedUri, to: targetPath });

        const updated = pets.map((p) => (p.id === petId ? { ...p, imageUri: targetPath } : p));
        await savePets(updated);
      } catch (e) {
        console.warn('No se pudo persistir la imagen', e);
        Alert.alert('Error', 'No se pudo guardar la imagen.');
      }
    },
    [pets, savePets]
  );

  const pickImageForPet = React.useCallback(
    async (petId: string) => {
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
        await persistPickedImageForPet(petId, result.assets[0].uri);
      }
    },
    [persistPickedImageForPet]
  );

  const removeImageForPet = React.useCallback(
    async (petId: string) => {
      try {
        const pet = pets.find((p) => p.id === petId);
        if (pet?.imageUri) {
          const info = await FileSystem.getInfoAsync(pet.imageUri);
          if (info.exists) await FileSystem.deleteAsync(pet.imageUri, { idempotent: true });
        }
      } catch {}
      const updated = pets.map((p) => (p.id === petId ? { ...p, imageUri: null } : p));
      await savePets(updated);
    },
    [pets, savePets]
  );

  const showPhotoMenuForPet = React.useCallback(
    (petId: string) => {
      const pet = pets.find((p) => p.id === petId);
      const hasImage = !!pet?.imageUri;

      if (Platform.OS === 'ios') {
        const options = ['Cancelar', hasImage ? 'Cambiar foto' : 'Agregar foto'];
        if (hasImage) options.push('Eliminar foto');

        ActionSheetIOS.showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex: 0,
            destructiveButtonIndex: hasImage ? 2 : undefined,
            userInterfaceStyle: 'light',
          },
          (index) => {
            if (index === 1) pickImageForPet(petId);
            if (hasImage && index === 2) removeImageForPet(petId);
          }
        );
      } else {
        Alert.alert(
          'Foto de la mascota',
          undefined,
          [
            { text: hasImage ? 'Cambiar foto' : 'Agregar foto', onPress: () => pickImageForPet(petId) },
            hasImage ? { text: 'Eliminar foto', style: 'destructive', onPress: () => removeImageForPet(petId) } : undefined,
            { text: 'Cancelar', style: 'cancel' },
          ].filter(Boolean) as any
        );
      }
    },
    [pets, pickImageForPet, removeImageForPet]
  );

  // ----- Búsqueda simple por nombre -----
  const filteredPets = React.useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return pets;
    return pets.filter((p) => p.name.toLowerCase().includes(t));
  }, [pets, query]);

  // ----- Render de cada card -----
  const renderPet = ({ item }: { item: Pet }) => {
    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => showPhotoMenuForPet(item.id)}
          style={styles.petImageWrapper}
          activeOpacity={0.8}
          accessibilityRole="imagebutton"
          accessibilityLabel={`Editar foto de ${item.name}`}
        >
          {item.imageUri ? (
            <>
              <Image source={{ uri: item.imageUri }} style={styles.petImage} />
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

        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.sectionTitle}>HISTORIAL</Text>

        <View style={styles.itemRow}>
          <Text style={styles.itemTitle}>Vacunas</Text>
          <Text style={styles.itemDetails}>{item.vaccines || '—'}</Text>
          <TouchableOpacity
            onPress={() => handleNavigate('vacunas', item.id)}
            style={styles.checkCircle}
            accessibilityRole="button"
            accessibilityLabel={`Abrir vacunas de ${item.name}`}
          >
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemTitle}>Consultas</Text>
          <Text style={styles.itemDetails}>{item.consults || '—'}</Text>
          <TouchableOpacity
            onPress={() => handleNavigate('consultas', item.id)}
            style={styles.checkCircle}
            accessibilityRole="button"
            accessibilityLabel={`Abrir consultas de ${item.name}`}
          >
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemTitle}>Tratamientos</Text>
          <Text style={styles.itemDetails}>{item.treatments || '—'}</Text>
          <TouchableOpacity
            onPress={() => handleNavigate('tratamientos', item.id)}
            style={styles.checkCircle}
            accessibilityRole="button"
            accessibilityLabel={`Abrir tratamientos de ${item.name}`}
          >
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('@/assets/images/huellitas-blancas.png')}
      style={styles.bg}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView style={styles.container}>
        {/* ENCABEZADO SUPERIOR */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Hola, Sr. Smith!</Text>
            <Text style={styles.subtitle}>Hoy es un gran día para cuidar colitas</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/PerfilUsua')}
            style={styles.profileButton}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
          >
            <Ionicons name="person-circle-outline" size={40} color="#3a3a3a" />
          </TouchableOpacity>
        </View>

        {/* BUSCADOR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar mascota..."
            placeholderTextColor="#555"
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Buscar mascota"
          />
          <Image source={require('@/assets/images/Imagen4.png')} style={styles.headerImage} />

        </View>

        {/* NAVEGACIÓN SUPERIOR */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.push('/recordatorio')} accessibilityRole="button">
            <Text style={styles.navText}>Recordatorio</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/citas')} accessibilityRole="button">
            <Text style={styles.navText}>Citas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/historialMD')} accessibilityRole="button">
            <Text style={[styles.navText, styles.activeNav]}>Historial MD</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/servicios')} accessibilityRole="button">
            <Text style={styles.navText}>Servicios</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA SCROLLEABLE DE MASCOTAS */}
        <FlatList
          data={filteredPets}
          keyExtractor={(item) => item.id}
          renderItem={renderPet}
          contentContainerStyle={{ paddingBottom: 90, paddingHorizontal: 16 }}
          ListFooterComponent={
            <TouchableOpacity
              onPress={() => router.push('/agregarMascota' as any)} // <- Aquí te redirige (luego me dices cómo será)
              style={styles.addButton}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Agregar nueva mascota"
            >
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
              <Text style={styles.addButtonText}>Agregar mascota</Text>
            </TouchableOpacity>
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: -38,
    width: '100%',
  },
  header: {
    width: '100%',
    backgroundColor: '#0d939cff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignSelf: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff6666',
    borderRadius: 20,
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
  },

  // Buscador + perfil
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    width: '95%',
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  headerImage: { width: 40, height: 40, resizeMode: 'contain', marginRight: 8 },

  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginLeft: 6,
  },

  topNav: {
    width: '100%',
    backgroundColor: '#00bfae',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  navText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  activeNav: { textDecorationLine: 'underline' },

  // Card mascota
  card: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    marginBottom: 10,
  },
  petImageWrapper: { alignSelf: 'center', marginBottom: 10 },
  petImage: { width: 100, height: 100, borderRadius: 50, resizeMode: 'cover' },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  petName: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  itemDetails: { color: '#888', flex: 2, textAlign: 'center' },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00f5a0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Botón agregar (abajo del último card)
  addButton: {
    marginTop: 8,
    marginBottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#00bfae',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 3,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
