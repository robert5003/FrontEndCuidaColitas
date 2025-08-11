import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActionSheetIOS,
    Alert,
    Dimensions,
    Image,
    ImageBackground,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// SUGERENCIA: pon aquí el ID real de la mascota. Ej: `petImage:${pet.id}`
const STORAGE_KEY = 'petImage:garfield';

export default function HistorialMD() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  type SectionType = 'vacunas' | 'consultas' | 'tratamientos' | string;

  const handleNavigate = (section: SectionType): void => {
    router.push({ pathname: '/detalleHistorial' as any, params: { tipo: section } });
  };

  const [image, setImage] = React.useState<string | null>(null);

  // Cargar imagen persistida al montar
  React.useEffect(() => {
    const loadImage = async () => {
      try {
        const uri = await AsyncStorage.getItem(STORAGE_KEY);
        if (uri) setImage(uri);
      } catch (e) {
        console.warn('No se pudo cargar la imagen guardada', e);
      }
    };
    loadImage();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso denegado para acceder a las fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, uri);
      } catch (e) {
        console.warn('No se pudo guardar la imagen', e);
      }
    }
  };

  const removeImage = async () => {
    setImage(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('No se pudo eliminar la imagen guardada', e);
    }
  };

  // Menú para Cambiar/Agregar/Eliminar
  const showPhotoMenu = () => {
    const hasImage = !!image;

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
          if (index === 1) pickImage();
          if (hasImage && index === 2) removeImage();
        }
      );
    } else {
      Alert.alert(
        'Foto de la mascota',
        undefined,
        [
          { text: hasImage ? 'Cambiar foto' : 'Agregar foto', onPress: pickImage },
          hasImage ? { text: 'Eliminar foto', style: 'destructive', onPress: removeImage } : undefined,
          { text: 'Cancelar', style: 'cancel' },
        ].filter(Boolean) as any
      );
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/huellitas-blancas.png')}
      style={styles.container}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.2 }}
    >
      {/* ENCABEZADO SUPERIOR */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hola, Sr. Smith!</Text>
          <Text style={styles.subtitle}>Hoy es un gran día para cuidar colitas</Text>
        </View>
          {/* Botón de perfil (mismo tamaño que antes: 40x40) */}
    <TouchableOpacity
          onPress={() => router.push('/PerfilUsua' as any)}
          style={styles.profileButton}
          activeOpacity={0.8}
          accessibilityLabel="Abrir perfil"
          accessibilityHint="Te llevará a la pantalla de perfil">
    {/* Usa el icono o una imagen. Dejo el icono por defecto: */}
    <Ionicons name="person-circle-outline" size={40} color="#3a3a3a" />
    </TouchableOpacity>
      </View>

      {/* INPUT DE BÚSQUEDA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#555"
        />
        <Image
          source={require('@/assets/images/Imagen4.png')}
           style={styles.headerImage}
        />
      </View>

      {/* BARRA DE NAVEGACIÓN */}
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

      {/* CONTENIDO PRINCIPAL */}
      <View style={styles.card}>
        {/* Imagen de la mascota (tocar para Agregar/Cambiar/Eliminar) */}
        <TouchableOpacity onPress={showPhotoMenu} style={styles.petImageWrapper} activeOpacity={0.8}>
          {image ? (
            <>
              <Image source={{ uri: image }} style={styles.petImage} />
              {/* Badge de cámara para indicar que es editable */}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera-outline" size={16} color="#fff" />
              </View>
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={32} color="#aaa" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.petName}>GARFIELD</Text>
        <Text style={styles.sectionTitle}>HISTORIAL</Text>

        <View style={styles.itemRow}>
          <Text style={styles.itemTitle}>Vacunas</Text>
          <Text style={styles.itemDetails}>Rabia, Parvovirus</Text>
          <TouchableOpacity onPress={() => handleNavigate('vacunas')} style={styles.checkCircle}>
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemTitle}>Consultas</Text>
          <Text style={styles.itemDetails}>Dr. Cuper, Garfield</Text>
          <TouchableOpacity onPress={() => handleNavigate('consultas')} style={styles.checkCircle}>
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemTitle}>Tratamientos</Text>
          <Text style={styles.itemDetails}>Alergia, Parvovirus</Text>
          <TouchableOpacity onPress={() => handleNavigate('tratamientos')} style={styles.checkCircle}>
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
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
    position: 'relative',
    zIndex: 1,
  },
  logoutButton: {
    backgroundColor: '#ff6666',
    borderRadius: 20,
    padding: 8,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginLeft: 10,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },

  petImageWrapper: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
  },
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

  greeting: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
  },
  headerImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  topNav: {
    width: '100%',
    backgroundColor: '#00bfae',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  navText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeNav: {
    textDecorationLine: 'underline',
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  itemDetails: {
    color: '#888',
    flex: 2,
    textAlign: 'center',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00f5a0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 15,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    width: '100%',
    backgroundColor: '#00f5a0',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});

  