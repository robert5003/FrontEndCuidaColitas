import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function HistorialMD() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
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
        <Image
          source={require('@/assets/images/Imagen6.png')} 
          style={styles.headerImage}
        />
      </View>

      {/* INPUT DE BÚSQUEDA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#555"
        />
      </View>

      {/* BARRA DE NAVEGACIÓN (BAJO EL INPUT) */}
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
        <TouchableOpacity onPress={() => router.push('/chat' as any)}>
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <View style={styles.card}>
        <Text style={styles.petName}>GARFIELD</Text>
        <Text style={styles.sectionTitle}>HISTORIAL</Text>

        <View style={styles.itemRow}>
          <Text style={styles.itemTitle}>Vacunas</Text>
          <Text style={styles.itemDetails}>Rabia, Parvovirus</Text>
          <View style={styles.checkCircle} />
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemTitle}>Consultas</Text>
          <Text style={styles.itemDetails}>Dr. Cuper, Garfield</Text>
          <View style={styles.checkCircle} />
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemTitle}>Tratamientos</Text>
          <Text style={styles.itemDetails}>Alergia, Parvovirus</Text>
          <View style={styles.checkCircle} />
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
  headerContent: {
    flex: 2,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
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
    width: '90%',
    padding: 10,
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
  },
});


