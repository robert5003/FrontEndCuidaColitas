import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = () => {
    if (email === 'test@gmail.com' && password === '123456') {
      router.push('/');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch('http://TU_API_LARAVEL.test/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          last_name: lastName,
          email: regEmail,
          password: regPassword,
          password_confirmation: confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! You can now log in.');
        toggleView(false);
      } else {
        alert(data.message || 'Error in registration');
      }
    } catch (error) {
      console.error(error);
      alert('Network error during registration');
    }
  };

  const toggleView = (nextState: boolean) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsRegistering(nextState);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <ImageBackground
      source={require('@/assets/images/huellitas-blancas.png')}
      style={styles.container}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.5 }}
    >
      <View style={styles.headerShape} />

      <Animated.View style={[styles.card, { opacity: fadeAnim }]}> 
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, !isRegistering ? styles.activeTab : styles.inactiveTab]} 
            onPress={() => toggleView(false)}>
            <Text style={!isRegistering ? styles.tabTextActive : styles.tabTextInactive}>LOG IN</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, isRegistering ? styles.activeTab : styles.inactiveTab]} 
            onPress={() => toggleView(true)}>
            <Text style={isRegistering ? styles.tabTextActive : styles.tabTextInactive}>SIGN UP</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Welcome to CuidaColitas</Text>

        {isRegistering ? (
          <>
            <TextInput placeholder="Name" value={name} onChangeText={setName} placeholderTextColor="#333" style={styles.input} />
            <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} placeholderTextColor="#333" style={styles.input} />
            <TextInput placeholder="E-mail" value={regEmail} onChangeText={setRegEmail} placeholderTextColor="#333" style={styles.input} />
            <TextInput placeholder="Create Password" value={regPassword} onChangeText={setRegPassword} placeholderTextColor="#333" secureTextEntry style={styles.input} />
            <TextInput placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholderTextColor="#333" secureTextEntry style={styles.input} />
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>REGISTER</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#333"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#333"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>LOG IN</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.push('/restaurarcontra' as any)}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
      </Animated.View>

      <Image
        source={require('@/assets/images/Imagen1.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60
  },
  headerShape: {
    position: 'absolute',
    top: 0,
    width: width,
    height: 180,
    backgroundColor: '#5a4023',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    zIndex: 1
  },
  card: {
    width: '90%',
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    zIndex: 2
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: '#00f5a0',
  },
  inactiveTab: {
    backgroundColor: '#d3fbea',
  },
  tabTextActive: {
    fontWeight: 'bold',
  },
  tabTextInactive: {
    fontWeight: 'bold',
    color: '#333'
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
  buttonText: {
    fontWeight: 'bold'
  },
  forgot: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#555'
  },
  logo: {
    width: 180,
    height: 50,
    marginTop: 20,
    zIndex: 2
  }
});
