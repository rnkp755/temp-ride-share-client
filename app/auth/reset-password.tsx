import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { CustomInput } from '../components/CustomInput';
import { OTPInput } from '../components/OTPInput';
import { Button } from '../components/Button';

export default function ResetPassword() {
  const [code, setCode] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  const validateForm = () => {
    if (!password || !confirmPassword || code.some((digit) => !digit)) {
      setError('All fields are required');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleReset = async () => {
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const enteredCode = code.join('');
      
      // Mock validation (correct code is '1234')
      if (enteredCode === '1234') {
        router.replace('/auth/login');
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter the verification code and your new password
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>Verification Code</Text>
        <OTPInput code={code} setCode={setCode} />

        <CustomInput
          label="New Password"
          placeholder="Enter your new password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          isPassword
        />

        <CustomInput
          label="Confirm New Password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          isPassword
        />

        {error ? (
          <Text style={[styles.error, { color: colors.notification }]}>
            {error}
          </Text>
        ) : null}

        <Button
          title="Reset Password"
          onPress={handleReset}
          loading={loading}
          style={styles.button}
        />

        <Button
          title="Back to Login"
          onPress={() => router.push('/auth/login')}
          variant="secondary"
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
});