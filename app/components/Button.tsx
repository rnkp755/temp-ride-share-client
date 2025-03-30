import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'text';
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: ButtonProps) {
  const { colors } = useTheme(); // Updated to use `colors`

  const buttonStyles = [
    styles.button,
    {
      backgroundColor:
        variant === 'primary' ? colors.primary : 'transparent', // Use `colors.primary`
      borderColor: variant === 'secondary' ? colors.primary : 'transparent', // Use `colors.primary`
      borderWidth: variant === 'secondary' ? 1 : 0,
      opacity: disabled ? 0.5 : 1,
      paddingHorizontal: variant === 'text' ? 8 : 24,
    },
    style,
  ];

  const textColor = variant === 'primary' ? '#FFFFFF' : colors.primary; // Use `colors.primary`

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});