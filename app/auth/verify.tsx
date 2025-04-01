import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import OTPInput from '../components/OTPInput';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import API from '@/axios';

export default function Verify() {
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [resendDisabled, setResendDisabled] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30);
  const { colors } = useTheme();
  const [email, setEmail] = useState<string | null>(null);

  // Fetch stored user details from AsyncStorage
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setEmail(user.email);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    getUserData();
  }, []);

  // Auto-send OTP when email is available
  useEffect(() => {
    if (email) {
      handleResend();
    }
  }, [email]);

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
      setCountdown(30);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, countdown]);

  const handleVerify = async () => {
    setError('');
    setLoading(true);

    try {
      if (!email) {
        setError('Session expired. Please register again.');
        return;
      }

      const enteredCode = code.join('');
      const response = await API.post('/otp/verify/register', {
        email,
        otp: enteredCode,
      });

      if (response.status !== 200) {
        throw new Error('Invalid OTP');
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

      router.replace('/(tabs)');
    } catch (err) {
      console.error('Verification error:', err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendDisabled(true);
    try {
      await API.post('/otp/send/register', { email });
      setCode(['', '', '', '']);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP. Try again.');
      setResendDisabled(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Verify Your Email
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We sent a code to {email}
        </Text>
      </View>

      <View style={styles.form}>
        <OTPInput code={code} setCode={setCode} />

        {error ? (
          <Text style={[styles.error, { color: colors.notification }]}>
            {error}
          </Text>
        ) : null}

        <Button
          title="Verify"
          onPress={handleVerify}
          loading={loading}
          disabled={code.some((digit) => !digit)}
          style={styles.button}
        />

        <Button
          title={resendDisabled ? `Resend code in ${countdown}s` : 'Resend verification code'}
          onPress={handleResend}
          variant="secondary"
          disabled={resendDisabled}
          style={styles.button}
        />
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
    gap: 24,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
});