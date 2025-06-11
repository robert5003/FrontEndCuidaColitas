import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HistorialMD() {
  const router = useRouter();

  const handleLogout = () => {
    // Aquí puedes limpiar el estado de sesión si es necesario, por ejemplo:
    // AsyncStorage.clear(); (si usas AsyncStorage)
    router.push('/login');
  };

  return (
    <ImageBackground
      source={require('@/assets/images/huellitas-blancas.png')}
      style={styles.container}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.5 }}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.greeting}>Hola, Sr. Smith!</Text>
        <Text style={styles.subtitle}>Hoy es un gran día para cuidar colitas</Text>
      </View>

      <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor="#555" />

      <View style={styles.card}>
        <Text style={styles.petName}>GARFIELD</Text>
        <Text style={styles.sectionTitle}>HISTORIAL</Text>

        <View style={styles.itemCard}>
          <Text style={styles.itemTitle}>Vacunas</Text>
          <Text style={styles.itemDetails}>Rabia, Parvovirus</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemCard}>
          <Text style={styles.itemTitle}>Consultas</Text>
          <Text style={styles.itemDetails}>Dr. Cuper, Garfield</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemCard}>
          <Text style={styles.itemTitle}>Tratamientos</Text>
          <Text style={styles.itemDetails}>Alergia, Parvovirus</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    padding: 20,
    backgroundColor: '#4E8E8E',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    zIndex: 1,
  },
  greeting: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    marginVertical: 10,
    paddingLeft: 20,
    zIndex: 2,
    width: '90%',
  },
  logoutButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#ff6666',
    padding: 10,
    borderRadius: 20,
    zIndex: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDetails: {
    fontSize: 14,
    color: '#888',
  },
  addButton: {
    padding: 10,
    backgroundColor: '#00f5a0',
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
