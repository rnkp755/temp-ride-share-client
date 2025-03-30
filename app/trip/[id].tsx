import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTripStore } from '@/store/tripStore';
import { ChevronLeft, Calendar, Clock, Car, MessageCircle, MapPin } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function TripDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { trips } = useTripStore();
  
  const trip = trips.find(t => t.id.toString() === id);
  
  if (!trip) {
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Trip Details</Text>
        </View>
        
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: colors.text }]}>Trip not found</Text>
          <Pressable
            style={[styles.backHomeButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/')}
          >
            <Text style={styles.backHomeButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trip Details</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeIn.duration(600)}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: trip.user.avatar }} 
              style={styles.avatar} 
            />
            <View>
              <Text style={[styles.userName, { color: colors.text }]}>{trip.user.name}</Text>
              <Text style={[styles.tripDate, { color: colors.textSecondary }]}>
                Posted on {new Date(trip.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.routeContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Route</Text>
            <View style={styles.routePoints}>
              <View style={styles.pointLine}>
                <View style={[styles.startPoint, { backgroundColor: colors.primary }]} />
                <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
                <View style={[styles.endPoint, { backgroundColor: colors.primary }]} />
              </View>
              
              <View style={styles.routeLabels}>
                <Text style={[styles.routeText, { color: colors.text }]}>{trip.route.from}</Text>
                <Text style={[styles.routeText, { color: colors.text }]}>{trip.route.to}</Text>
              </View>
            </View>
            
            <View style={styles.viaContainer}>
              <Text style={[styles.viaText, { color: colors.textSecondary }]}>
                via {trip.route.via.join(', ')}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Trip Details</Text>
            <View style={styles.detailsGrid}>
              <View style={[styles.detailItem, { borderColor: colors.border }]}>
                <Calendar size={20} color={colors.primary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {new Date(trip.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.detailItem, { borderColor: colors.border }]}>
                <Clock size={20} color={colors.primary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Time</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{trip.time}</Text>
                </View>
              </View>
              
              <View style={[styles.detailItem, { borderColor: colors.border }]}>
                <Car size={20} color={colors.primary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Transportation</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {trip.transportation}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.detailItem, { borderColor: colors.border }]}>
                <MapPin size={20} color={colors.primary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Distance</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {Math.floor(Math.random() * 300) + 100} miles
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {trip.notes && (
            <View style={styles.notesContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
              <Text style={[styles.notesText, { color: colors.text }]}>{trip.notes}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.connectButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/messages/${trip.user.id}`)}
        >
          <MessageCircle size={20} color="#fff" />
          <Text style={styles.connectButtonText}>Connect with {trip.user.name.split(' ')[0]}</Text>
        </Pressable>
      </View>
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
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  tripDate: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  routeContainer: {
    marginBottom: 24,
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
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeLine: {
    width: 2,
    height: 30,
  },
  endPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeLabels: {
    flex: 1,
    justifyContent: 'space-between',
    height: 54,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  viaContainer: {
    marginLeft: 36,
    marginTop: 8,
  },
  viaText: {
    fontSize: 14,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailContent: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backHomeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backHomeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});