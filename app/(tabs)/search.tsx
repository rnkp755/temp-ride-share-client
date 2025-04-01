import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Search, MapPin, Calendar, Clock, Car } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import debounce from 'lodash.debounce';
import API from '@/axios';

type Route = {
  _id: string;
  src: string;
  dest: string;
  via: string[];
}

type Post = 
{
  _id: string,
  userId: {
    _id: string,
    name: string,
    email: string,
    gender: "male" | "female" | "other",
    avatar: string,
    role: "student" | "employee" | "admin",
  },
  src: string,
  dest: string,
  via: string,
  tripDate: string,
  tripTime: string,
  transportation: "Bike" | "Auto" | "Car" | "Bus" | "Unknown",
  notes: string,
  visibleTo: string
}

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  
  const [sourceSuggestions, setSourceSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  
  // Debounce the API calls for route suggestions
  const debouncedFetchSourceSuggestions = useCallback(
    debounce(async (text) => {
      if (text.length < 2) {
        setSourceSuggestions([]);
        return;
      }
      
      try {
        const response = await API.get(`/route/search?src=${text}`);
        if (response.data && response.data.data) {
          // Extract unique source locations from routes
          const routes = response.data.data as Route[];
          const suggestions = [...new Set(routes.map((route) => route.src))];
          setSourceSuggestions(suggestions);
        }
      } catch (error) {
        console.error('Error fetching source suggestions:', error);
        setSourceSuggestions([]);
      }
    }, 300),
    []
  );
  
  const debouncedFetchDestinationSuggestions = useCallback(
    debounce(async (text) => {
      if (text.length < 2) {
        setDestinationSuggestions([]);
        return;
      }
      
      try {
        const response = await API.get(`/route/search?dest=${text}`);
        if (response.data && response.data.data) {
          const routes = response.data.data as Route[];
          const suggestions = [...new Set(routes.map((route) => route.dest))];
          setDestinationSuggestions(suggestions);
        }
      } catch (error) {
        console.error('Error fetching destination suggestions:', error);
        setDestinationSuggestions([]);
      }
    }, 300),
    []
  );
  
  // Effect to fetch source suggestions whenever source input changes
  useEffect(() => {
    if (source) {
      debouncedFetchSourceSuggestions(source);
    } else {
      setSourceSuggestions([]);
    }
    
    return () => {
      debouncedFetchSourceSuggestions.cancel();
    };
  }, [source, debouncedFetchSourceSuggestions]);
  
  // Effect to fetch destination suggestions whenever destination input changes
  useEffect(() => {
    if (destination) {
      debouncedFetchDestinationSuggestions(destination);
    } else {
      setDestinationSuggestions([]);
    }
    
    return () => {
      debouncedFetchDestinationSuggestions.cancel();
    };
  }, [destination, debouncedFetchDestinationSuggestions]);
  
  const handleSearch = async () => {
    if (!source || !destination) return;
    
    setLoading(true);
    try {
      const response = await API.get(`/post`, {
        params: {
          src: source,
          dest: destination,
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortType: 'desc'
        }
      });
      
      if (response.data && response.data.data && response.data.data.posts) {
        const posts = response.data.data.posts as Post[];
        setSearchResults(posts);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching for trips:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
      setShowSourceSuggestions(false);
      setShowDestinationSuggestions(false);
    }
  };
  
  const renderTripCard = ({ item }: { item: Post }) => {
    return (
      <Animated.View 
        entering={FadeInDown.springify()} 
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <Pressable 
          style={styles.cardContent}
          onPress={() => router.push(`/trip/${item._id}`)}
          android_ripple={{ color: colors.ripple }}
        >
            <View style={styles.userInfo}>
            <Image 
              source={{ uri: item.userId?.avatar || 'https://via.placeholder.com/40' }} 
              style={styles.avatar} 
            />
            <View>
              <Text style={[styles.userName, { color: colors.text }]}>
              {item.userId?.name || 'Unknown User'}
              </Text>
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.userId?.email || 'No Email Provided'}
              </Text>
            </View>
            </View>
          
          <View style={styles.routeContainer}>
            <View style={styles.routePoints}>
              <View style={styles.pointLine}>
                <View style={[styles.startPoint, { backgroundColor: colors.primary }]} />
                <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
                <View style={[styles.endPoint, { backgroundColor: colors.primary }]} />
              </View>
              
              <View style={styles.routeLabels}>
                <Text style={[styles.routeText, { color: colors.text }]}>{item.src}</Text>
                <Text style={[styles.routeText, { color: colors.text }]}>{item.dest}</Text>
              </View>
            </View>
            
            <View style={styles.viaContainer}>
              <Text style={[styles.viaText, { color: colors.textSecondary }]}>
                {item.via ? `via ${item.via}` : 'Direct route'}
              </Text>
            </View>
          </View>
          
          <View style={styles.tripDetails}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {item.tripDate ? new Date(item.tripDate).toLocaleDateString() : 'Not specified'}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Clock size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {item.tripTime || 'Not specified'}
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
            onPress={() => router.push(`/messages/${item.userId?._id}`)}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </Pressable>
        </Pressable>
      </Animated.View>
    );
  };
  
  interface SuggestionProps {
    item: string;
    isSource: boolean;
  }

  const renderSuggestion = ({ item, isSource }: SuggestionProps) => {
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
          
          {showSourceSuggestions && sourceSuggestions.length > 0 && (
            <Animated.View 
              entering={FadeIn.duration(200)} 
              style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}
            >
              <FlatList
                data={sourceSuggestions}
                renderItem={({ item }) => renderSuggestion({ item, isSource: true })}
                keyExtractor={(item, index) => `source-${index}-${item}`}
                keyboardShouldPersistTaps="handled"
              />
            </Animated.View>
          )}
        </View>
        
        <View style={[styles.inputContainer, styles.destContainer]}>
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
          
          {showDestinationSuggestions && destinationSuggestions.length > 0 && (
            <Animated.View 
              entering={FadeIn.duration(200)} 
              style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}
            >
              <FlatList
                data={destinationSuggestions}
                renderItem={({ item }) => renderSuggestion({ item, isSource: false })}
                keyExtractor={(item, index) => `destination-${index}-${item}`}
                keyboardShouldPersistTaps="handled"
              />
            </Animated.View>
          )}
        </View>
        
        <Pressable
          style={[
            styles.searchButton, 
            { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }
          ]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Search size={20} color="#fff" />
          <Text style={styles.searchButtonText}>
            {loading ? 'Searching...' : 'Search'}
          </Text>
        </Pressable>
      </View>
      
      <View style={styles.resultsContainer}>
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderTripCard}
            keyExtractor={(item) => item._id}
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
    zIndex: 2,
  },
  inputContainer: {
    marginBottom: 12,
    zIndex: 3,
    position: 'relative',
  },
  destContainer: {
    zIndex: 2,
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
    zIndex: 10,
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
    zIndex: 1,
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
    zIndex: 1,
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