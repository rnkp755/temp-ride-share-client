import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { CustomInput } from '../components/CustomInput';
import { Button } from '../components/Button';
import { useAuthStore } from '../../store/authStore';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export default function Register() {
  const [email, setEmail] = useState('');
  const [emailDomain, setEmailDomain] = useState('@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();
  const setUser = useAuthStore((state) => state.setUser);

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !gender) {
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

  const handleRegister = async () => {
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const fullEmail = email + emailDomain;
      
      // Store user data and navigate to verification
      setUser({ email: fullEmail, gender });
      router.push('/auth/verify');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sign up to get started
        </Text>
      </View>

      <View style={styles.form}>
        <CustomInput
          label="Email"
          placeholder="Enter your email"
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

        <CustomInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          isPassword
        />

        <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
        <View style={styles.genderContainer}>
          {GENDER_OPTIONS.map((option) => (
            <Button
              key={option}
              title={option}
              onPress={() => setGender(option.toLowerCase())}
              variant={gender === option.toLowerCase() ? 'primary' : 'secondary'}
              style={styles.genderButton}
            />
          ))}
        </View>

        {error ? (
          <Text style={[styles.error, { color: colors.notification }]}>
            {error}
          </Text>
        ) : null}

        <Button
          title="Register"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        />

        <View style={styles.loginContainer}>
          <Text style={{ color: colors.textSecondary }}>
            Already have an account?{' '}
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/auth/login')}
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  genderButton: {
    flex: 1,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
});