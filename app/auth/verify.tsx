import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { OTPInput } from '../components/OTPInput';
import { Button } from '../components/Button';
import { useAuthStore } from '../../store/authStore';

export default function Verify() {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  const setIsVerified = useAuthStore((state) => state.setIsVerified);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const enteredCode = code.join('');
      
      // Mock validation (correct code is '1234')
      if (enteredCode === '1234') {
        setIsVerified(true);
        setIsAuthenticated(true);
        router.replace('/(tabs)');
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCode(['', '', '', '']);
    setError('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Verify Your Email
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We sent a code to {user?.email}
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
          title={
            resendDisabled
              ? `Resend code in ${countdown}s`
              : 'Resend verification code'
          }
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