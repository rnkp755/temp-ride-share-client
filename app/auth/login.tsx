import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { CustomInput } from '../components/CustomInput';
import { Button } from '../components/Button';
import { allowedEmailDomains, emailPlaceholder } from '@/config';
import API from '@/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export default function Login() {
  const [email, setEmail] = useState('');
  const [emailDomain, setEmailDomain] = useState(allowedEmailDomains[0]);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/user/login', {
        email: email + emailDomain,
        password,
      });

      if (response.status !== 200) {
        throw new Error('Login failed');
      }

      const user = response.data?.data.user;
      
      // Store user details locally
      await AsyncStorage.setItem('user', JSON.stringify({
        name: user.name,
        email: user.email,
        gender: user.gender,
        avatar: user.avatar,
        role: user.role,
        settings: user.settings
      }));
      const cookies = response.headers['set-cookie'];
      if (cookies?.length) {
        let accessToken = '';
        let refreshToken = '';
        
        cookies[0].split(',').forEach((cookie) => {
          cookie = cookie.trim();
          if (cookie.startsWith('accessToken=')) {
            accessToken = cookie.split(';')[0].split('=')[1];
          }
          if (cookie.startsWith('refreshToken=')) {
            refreshToken = cookie.split(';')[0].split('=')[1];
          }
        });

        if (accessToken) {
          await SecureStore.setItemAsync('accessToken', accessToken);
        }
        if (refreshToken) {
          await SecureStore.setItemAsync('refreshToken', refreshToken);
        }
      }

      router.replace('/(tabs)');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sign in to continue
        </Text>
      </View>

      <View style={styles.form}>
        <CustomInput
          label="Email"
          placeholder={emailPlaceholder}
          value={email}
          onChangeText={setEmail}
          isEmail
          emailDomain={emailDomain}
          onEmailDomainChange={setEmailDomain}
        />

        <CustomInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          isPassword
        />

        {error ? (
          <Text style={[styles.error, { color: colors.notification }]}>
            {error}
          </Text>
        ) : null}

        <Button
          title="Forgot Password"
          onPress={() => router.push('/auth/forgot-password')}
          variant="text"
          style={[styles.button, { alignSelf: 'flex-end', marginTop: -24, marginBottom: -8 }]}
        />

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
          disabled={!email || !password || loading}
        />

        <View style={styles.registerContainer}>
          <Text style={{ color: colors.textSecondary }}>
            Don't have an account?{' '}
          </Text>
          <Button
            title="Register"
            onPress={() => router.push('/auth/register')}
            variant="text"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: -12,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
});