import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { useTripStore } from '@/store/tripStore';
import { useUserStore } from '@/store/userStore';
import { ROUTES } from '@/constants/routes';
import { ChevronLeft, Calendar, Clock, Car, Check } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function CreateTripScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { addTrip } = useTripStore();
  const { user } = useUserStore();
  
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');
  const [transportation, setTransportation] = useState('');
  const [notes, setNotes] = useState('');
  
  const transportationOptions = ['Car', 'Bus', 'Train', 'Undecided'];
  
  const handleCreateTrip = () => {
    if (!selectedRoute) return;
    
    const newTrip = {
      id: Date.now(),
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      route: selectedRoute,
      date,
      time,
      transportation: transportation || 'Undecided',
      notes,
      createdAt: new Date().toISOString(),
    };
    
    addTrip(newTrip);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.back()}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Trip</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Route</Text>
          <View style={styles.routesContainer}>
            {ROUTES.map((route, index) => (
              <Pressable
                key={index}
                style={[
                  styles.routeCard, 
                  { 
                    backgroundColor: selectedRoute === route ? colors.primary : colors.card,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => setSelectedRoute(route)}
              >
                <View style={styles.routeInfo}>
                  <View style={styles.routePoints}>
                    <View style={styles.pointLine}>
                      <View style={[styles.startPoint, { backgroundColor: selectedRoute === route ? '#fff' : colors.primary }]} />
                      <View style={[styles.routeLine, { backgroundColor: selectedRoute === route ? '#fff' : colors.border }]} />
                      <View style={[styles.endPoint, { backgroundColor: selectedRoute === route ? '#fff' : colors.primary }]} />
                    </View>
                    
                    <View style={styles.routeLabels}>
                      <Text style={[
                        styles.routeText, 
                        { color: selectedRoute === route ? '#fff' : colors.text }
                      ]}>
                        {route.from}
                      </Text>
                      <Text style={[
                        styles.routeText, 
                        { color: selectedRoute === route ? '#fff' : colors.text }
                      ]}>
                        {route.to}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[
                    styles.viaText, 
                    { color: selectedRoute === route ? '#fff' : colors.textSecondary }
                  ]}>
                    via {route.via.join(', ')}
                  </Text>
                </View>
                
                {selectedRoute === route && (
                  <View style={styles.checkIcon}>
                    <Check size={20} color="#fff" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>
        
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Date & Time</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Calendar size={20} color={colors.primary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Date"
              placeholderTextColor={colors.textSecondary}
              value={date}
              onChangeText={setDate}
              keyboardType={Platform.OS === 'ios' ? 'default' : 'numeric'}
            />
          </View>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Clock size={20} color={colors.primary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Time"
              placeholderTextColor={colors.textSecondary}
              value={time}
              onChangeText={setTime}
              keyboardType={Platform.OS === 'ios' ? 'default' : 'numeric'}
            />
          </View>
        </Animated.View>
        
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transportation</Text>
          <View style={styles.transportationOptions}>
            {transportationOptions.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.transportOption,
                  { 
                    backgroundColor: transportation === option ? colors.primary : colors.card,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => setTransportation(option)}
              >
                <Car size={16} color={transportation === option ? '#fff' : colors.primary} />
                <Text style={[
                  styles.transportText,
                  { color: transportation === option ? '#fff' : colors.text }
                ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
        
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Notes</Text>
          <View style={[styles.notesContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.notesInput, { color: colors.text }]}
              placeholder="Add any additional information about your trip..."
              placeholderTextColor={colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </Animated.View>
        
        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.createButton, 
              { 
                backgroundColor: selectedRoute ? colors.primary : colors.border,
                opacity: selectedRoute ? 1 : 0.7
              }
            ]}
            onPress={handleCreateTrip}
            disabled={!selectedRoute}
          >
            <Text style={styles.createButtonText}>Create Trip</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  routesContainer: {
    marginBottom: 8,
  },
  routeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeInfo: {
    flex: 1,
  },
  routePoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointLine: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  startPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeLine: {
    width: 2,
    height: 24,
  },
  endPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeLabels: {
    flex: 1,
    justifyContent: 'space-between',
    height: 44,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  viaText: {
    fontSize: 14,
    marginTop: 8,
    marginLeft: 36,
  },
  checkIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  transportationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  transportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 6,
    marginBottom: 12,
  },
  transportText: {
    fontSize: 14,
    marginLeft: 8,
  },
  notesContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  notesInput: {
    fontSize: 16,
    minHeight: 100,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});