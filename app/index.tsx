import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import API from '@/axios';
import { useTheme } from '../context/ThemeContext';
import Welcome from './welcome';


export default function Index() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const response = await API.post('/user/refresh-access-token', { refreshToken });

          if (response.status !== 200) {
            throw new Error('Login failed');
          }

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
          
          router.replace('/(tabs)'); // Navigate to home if session is valid
        }
      } catch (error) {
        console.error('Session refresh failed:', error);
      }
      setLoading(false); // Show welcome screen if auth fails
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Welcome />; // Show welcome screen if no active session
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
