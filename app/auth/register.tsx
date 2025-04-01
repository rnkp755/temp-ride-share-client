import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import CustomInput from '../components/CustomInput';
import Button  from '../components/Button';
import { emailPlaceholder, allowedEmailDomains, genderOptions } from '@/config';
import API from '@/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Register() {
  const [email, setEmail] = useState('');
  const [emailDomain, setEmailDomain] = useState(allowedEmailDomains[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [detectedName, setDetectedName] = useState('');
  const [isLoadingName, setIsLoadingName] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !gender) {
      setError('All fields are required');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      setError('Password must be at least 8 characters long and contain letters, numbers & special characters');
      return false;
    }
    return true;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const timeout = setTimeout(() => {
      if (text) {
        fetchUserName(text);
      } else {
        setDetectedName('');
      }
    }, 1500);
    
    setTypingTimeout(timeout);
  };

  const fetchUserName = async (email: string) => {
    setIsLoadingName(true);
    try {
      const response = await API.post(`/outlook`, {
        email: email + emailDomain
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch user data');
      }

      const name = response.data?.data?.name;
      setDetectedName(name);
    } catch (error) {
      console.error('Error fetching user name:', error);
      setDetectedName('');
    } finally {
      setIsLoadingName(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await API.post(`/user/register`, {
        email: email + emailDomain,
        gender,
        password,
      });

      if (response.status !== 201) {
        throw new Error('Registration failed');
      }

      const user = response.data?.data;
      
      // Store user details locally
      await AsyncStorage.setItem('user', JSON.stringify({
        name: user.name,
        email: user.email,
        gender: user.gender,
        avatar: user.avatar,
        role: user.role,
        settings: user.settings
      }));

      router.push('/auth/verify');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
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
          placeholder={emailPlaceholder}
          value={email}
          onChangeText={handleEmailChange}
          isEmail
          emailDomain={emailDomain}
          onEmailDomainChange={setEmailDomain}
        />
        {isLoadingName ? (
          <Text style={[styles.name, { color: colors.textSecondary }]}>
            Looking up your account...
          </Text>
        ) : detectedName ? (
          <Text style={[styles.name]}>
            <Text style={{ color: colors.text }}>Welcome{' '}</Text>
            <Text style={{ color: colors.success }}>{detectedName}</Text>
          </Text>
        ) : null}
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
          {genderOptions.map((option) => (
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
          disabled={!email || !password || !gender || password !== confirmPassword || loading}
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
    marginTop: -12,
  },
  genderButton: {
    flex: 1,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  name: {
    fontSize: 14,
    marginTop: -12,
    marginLeft: 2
  },
  button: {
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
});