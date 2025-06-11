import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function HistorialMD() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.bannerContainer}>
        <Text style={styles.bannerText}>Hola, Sr. Smith!</Text>
        <Text style={styles.bannerSubText}>Hoy es un gran día para cuidar colitas</Text>
        <Image source={require('@/assets/images/Imagen4.jpg')} style={styles.bannerImage} />
      </View>

      <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor="#555" />

      <View style={styles.navMenu}>
        <Text style={styles.navItem}>Recordatorio</Text>
        <Text style={styles.navItem}>Citas</Text>
        <Text style={[styles.navItem, styles.activeNavItem]}>Historial MD</Text>
        <Text style={styles.navItem}>Chat</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.profileContainer}>
          <View style={styles.profileCircle} />
          <Text style={styles.petName}>GARFIELD</Text>
        </View>

        <Text style={styles.sectionTitle}>HISTORIAL</Text>

        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeader}>Vacunas</Text>
          <Text style={styles.sectionText}>Rabia</Text>
          <Text style={styles.sectionText}>Parvovirus</Text>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeader}>Consultas</Text>
          <Text style={styles.sectionText}>Dr. Cuper</Text>
          <Text style={styles.sectionText}>Garfield</Text>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeader}>Tratamientos</Text>
          <Text style={styles.sectionText}>Alergia</Text>
          <Text style={styles.sectionText}>Parvovirus</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003b3b',
    paddingHorizontal: 10,
  },
  bannerContainer: {
    backgroundColor: '#b3f0e6',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  bannerText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  bannerSubText: {
    fontSize: 12,
    color: '#333',
  },
  bannerImage: {
    width: 60,
    height: 60,
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    marginVertical: 10,
    paddingLeft: 20,
  },
  navMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  navItem: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeNavItem: {
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#e5f9f6',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
  },
  petName: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
  },
  sectionBox: {
    backgroundColor: '#a0f8e4',
    borderRadius: 15,
    width: '100%',
    padding: 15,
    marginBottom: 15,
  },
  sectionHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 13,
    color: '#333',
  },
});
