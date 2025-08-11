import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const detalles = {
  vacunas: [
    {
      nombre: 'Rabia',
      descripcion: 'Protege contra el virus de la rabia, que afecta el sistema nervioso.',
    },
    {
      nombre: 'Parvovirus',
      descripcion:
        'Previene infecciones virales intestinales graves en cachorros y perros adultos.',
    },
  ],
  consultas: [
    {
      nombre: 'Dr. Cuper',
      descripcion: 'Consulta general para Garfield realizada por el Dr. Cuper.',
    },
  ],
  tratamientos: [
    {
      nombre: 'Alergia',
      descripcion: 'Tratamiento para síntomas alérgicos.',
    },
    {
      nombre: 'Parvovirus',
      descripcion: 'Tratamiento de apoyo para combatir el parvovirus.',
    },
  ],
};

export default function DetalleHistorial() {
  const router = useRouter();
  const { tipo } = useLocalSearchParams();

  const handleLogout = () => {
    router.push('/login');
  };

  const data = detalles[tipo as keyof typeof detalles] || [];

  return (
    <ImageBackground
      source={require('@/assets/images/huellitas-blancas.png')}
      style={styles.container}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.3 }}
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

      {/* BARRA DE NAVEGACIÓN (BAJO EL INPUT) */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.push('/recordatorio')}>
          <Text style={styles.navText}>Recordatorio</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/citas')}>
          <Text style={styles.navText}>Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/historialMD')}>
          <Text style={[styles.navText, styles.activeNav]}>Historial MD</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.navText}>{tipo?.toString().charAt(0).toUpperCase() + tipo?.toString().slice(1)}</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <View style={styles.card}>
        <Text style={styles.petName}>{tipo?.toString().charAt(0).toUpperCase() + tipo?.toString().slice(1)}</Text>
        {data.length > 0 ? (
          data.map((item, index) => (
            <View key={index} style={styles.detailBox}>
              <Text style={styles.detailTitle}>{item.nombre}</Text>
              <Text style={styles.detailDescription}>{item.descripcion}</Text>
            </View>
          ))
        ) : (
          <Text>No hay información disponible.</Text>
        )}
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
  headerContent: {
    flex: 2,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
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
    alignItems: 'center',
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
    marginBottom: 15,
    color: '#000',
  },
  detailBox: {
    backgroundColor: '#eee',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailDescription: {
    fontSize: 14,
    color: '#444',
  },
});
