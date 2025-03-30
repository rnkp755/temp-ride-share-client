import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { useTripStore } from '@/store/tripStore';
import { Search, MapPin, Calendar, Clock, Car } from 'lucide-react-native';
import { ROUTES } from '@/constants/routes';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { trips } = useTripStore();
  
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  
  const places = ROUTES.reduce((acc, route) => {
    if (!acc.includes(route.from)) acc.push(route.from);
    if (!acc.includes(route.to)) acc.push(route.to);
    route.via.forEach(place => {
      if (!acc.includes(place)) acc.push(place);
    });
    return acc;
  }, []);
  
  const filteredSourcePlaces = places.filter(place => 
    place.toLowerCase().includes(source.toLowerCase())
  );
  
  const filteredDestinationPlaces = places.filter(place => 
    place.toLowerCase().includes(destination.toLowerCase())
  );
  
  const handleSearch = () => {
    if (!source || !destination) return;
    
    const results = trips.filter(trip => {
      const routeFromMatches = trip.route.from.toLowerCase() === source.toLowerCase();
      const routeToMatches = trip.route.to.toLowerCase() === destination.toLowerCase();
      
      const sourceInVia = trip.route.via.some(
        place => place.toLowerCase() === source.toLowerCase()
      );
      
      const destinationInVia = trip.route.via.some(
        place => place.toLowerCase() === destination.toLowerCase()
      );
      
      return (routeFromMatches || sourceInVia) && (routeToMatches || destinationInVia);
    });
    
    setSearchResults(results);
    setShowSourceSuggestions(false);
    setShowDestinationSuggestions(false);
  };
  
  const renderTripCard = ({ item }) => {
    return (
      <Animated.View 
        entering={FadeInDown.springify()} 
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <Pressable 
          style={styles.cardContent}
          onPress={() => router.push(`/trip/${item.id}`)}
          android_ripple={{ color: colors.ripple }}
        >
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: item.user.avatar }} 
              style={styles.avatar} 
            />
            <Text style={[styles.userName, { color: colors.text }]}>{item.user.name}</Text>
          </View>
          
          <View style={styles.routeContainer}>
            <View style={styles.routePoints}>
              <View style={styles.pointLine}>
                <View style={[styles.startPoint, { backgroundColor: colors.primary }]} />
                <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
                <View style={[styles.endPoint, { backgroundColor: colors.primary }]} />
              </View>
              
              <View style={styles.routeLabels}>
                <Text style={[styles.routeText, { color: colors.text }]}>{item.route.from}</Text>
                <Text style={[styles.routeText, { color: colors.text }]}>{item.route.to}</Text>
              </View>
            </View>
            
            <View style={styles.viaContainer}>
              <Text style={[styles.viaText, { color: colors.textSecondary }]}>
                via {item.route.via.join(', ')}
              </Text>
            </View>
          </View>
          
          <View style={styles.tripDetails}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Clock size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {item.time}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Car size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {item.transportation || 'Undecided'}
              </Text>
            </View>
          </View>
          
          <Pressable
            style={[styles.connectButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/messages/${item.user.id}`)}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </Pressable>
        </Pressable>
      </Animated.View>
    );
  };
  
  const renderSuggestion = (item, isSource) => {
    return (
      <Pressable
        style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
        onPress={() => {
          if (isSource) {
            setSource(item);
            setShowSourceSuggestions(false);
          } else {
            setDestination(item);
            setShowDestinationSuggestions(false);
          }
        }}
      >
        <MapPin size={16} color={colors.primary} />
        <Text style={[styles.suggestionText, { color: colors.text }]}>{item}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Find Trips</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Search for available rides</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MapPin size={20} color={colors.primary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="From"
              placeholderTextColor={colors.textSecondary}
              value={source}
              onChangeText={setSource}
              onFocus={() => {
                setShowSourceSuggestions(true);
                setShowDestinationSuggestions(false);
              }}
            />
          </View>
          
          {showSourceSuggestions && filteredSourcePlaces.length > 0 && (
            <Animated.View 
              entering={FadeIn.duration(200)} 
              style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}
            >
              <FlatList
                data={filteredSourcePlaces}
                renderItem={({ item }) => renderSuggestion(item, true)}
                keyExtractor={(item) => `source-${item}`}
                keyboardShouldPersistTaps="handled"
              />
            </Animated.View>
          )}
        </View>
        
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MapPin size={20} color={colors.primary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="To"
              placeholderTextColor={colors.textSecondary}
              value={destination}
              onChangeText={setDestination}
              onFocus={() => {
                setShowDestinationSuggestions(true);
                setShowSourceSuggestions(false);
              }}
            />
          </View>
          
          {showDestinationSuggestions && filteredDestinationPlaces.length > 0 && (
            <Animated.View 
              entering={FadeIn.duration(200)} 
              style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}
            >
              <FlatList
                data={filteredDestinationPlaces}
                renderItem={({ item }) => renderSuggestion(item, false)}
                keyExtractor={(item) => `destination-${item}`}
                keyboardShouldPersistTaps="handled"
              />
            </Animated.View>
          )}
        </View>
        
        <Pressable
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
        >
          <Search size={20} color="#fff" />
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>
      
      <View style={styles.resultsContainer}>
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderTripCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyResults}>
            <Text style={[styles.emptyResultsText, { color: colors.textSecondary }]}>
              {source && destination 
                ? "No trips found for this route. Try different locations or create a new trip."
                : "Enter source and destination to search for trips"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 12,
    zIndex: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 12,
    maxHeight: 200,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingVertical: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeContainer: {
    marginBottom: 16,
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
  tripDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 6,
  },
  connectButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});