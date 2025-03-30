import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { allowedEmailDomains } from '../../config';

interface CustomInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  error?: string;
  isEmail?: boolean;
  emailDomain?: string;
  onEmailDomainChange?: (domain: string) => void;
  label?: string;
}

const EMAIL_DOMAINS = allowedEmailDomains;

export function CustomInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  isPassword,
  error,
  isEmail,
  emailDomain,
  onEmailDomainChange,
  label,
}: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const { colors } = useTheme();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailDomainSelect = (domain: string) => {
    onEmailDomainChange?.(domain);
    setShowDomainDropdown(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          { borderColor: error ? colors.notification : colors.border },
        ]}>
        {isEmail ? (
          <View style={styles.emailContainer}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={placeholder}
              placeholderTextColor={colors.textSecondary}
              value={value}
              onChangeText={onChangeText}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.domainSelector}
              onPress={() => setShowDomainDropdown(!showDomainDropdown)}>
              <Text style={{ color: colors.text, fontSize: 18 }}>{emailDomain}</Text>
              <Text style={{ color: colors.text, fontSize: 18 }}>▼</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={placeholder}
              placeholderTextColor={colors.textSecondary}
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={isPassword && !showPassword}
              autoCapitalize="none"
            />
            {isPassword && (
              <TouchableOpacity onPress={togglePasswordVisibility}>
                {showPassword ? (
                  <EyeOff color={colors.textSecondary} size={20} />
                ) : (
                  <Eye color={colors.textSecondary} size={20} />
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
      {error && <Text style={[styles.errorText, { color: colors.notification }]}>{error}</Text>}
      {isEmail && showDomainDropdown && (
        <View
          style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {EMAIL_DOMAINS.map((domain) => (
            <TouchableOpacity
              key={domain}
              style={styles.dropdownItem}
              onPress={() => handleEmailDomainSelect(domain)}>
              <Text style={{ color: colors.text, fontSize: 18 }}>{domain}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 18,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  emailContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  domainSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 76,
    right: 0,
    width: 150,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});