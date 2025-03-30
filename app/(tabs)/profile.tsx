import { useState } from 'react';
import { router } from 'expo-router';
import { View, Text, StyleSheet, Image, Pressable, Switch, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useUserStore } from '@/store/userStore';
import { useTripStore } from '@/store/tripStore';
import { User, Moon, Sun, LogOut, Settings, MapPin } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuthStore } from '../../store/authStore';


export default function ProfileScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const { user } = useUserStore();
  const { trips } = useTripStore();

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };
  
  const userTrips = trips.filter(trip => trip.user.id === user.id);
  
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');
  
  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toggleTheme();
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Animated.View entering={FadeIn.duration(600)}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          </Animated.View>
          <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{userTrips.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Trips Posted</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Connections</Text>
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
        
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLeft}>
            {isDarkMode ? (
              <Moon size={20} color={colors.primary} />
            ) : (
              <Sun size={20} color={colors.primary} />
            )}
            <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleToggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
        
        <Pressable 
          style={styles.settingItem}
          android_ripple={{ color: colors.ripple }}
        >
          <View style={styles.settingLeft}>
            <MapPin size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Default Location</Text>
          </View>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>New York</Text>
        </Pressable>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        
        <Pressable 
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          android_ripple={{ color: colors.ripple }}
        >
          <View style={styles.settingLeft}>
            <User size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Edit Profile</Text>
          </View>
        </Pressable>
        
        <Pressable 
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          android_ripple={{ color: colors.ripple }}
        >
          <View style={styles.settingLeft}>
            <Settings size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Account Settings</Text>
          </View>
        </Pressable>
        
        <Pressable 
          style={styles.settingItem}
          android_ripple={{ color: colors.ripple }}
          onPress={handleLogout}
        >
          <View style={styles.settingLeft}>
            <LogOut size={20} color="#FF3B30" />
            <Text style={[styles.settingText, { color: '#FF3B30' }]}>Logout</Text>
          </View>
        </Pressable>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          RideShare v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});