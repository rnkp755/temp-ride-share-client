import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { useTripStore } from '@/store/tripStore';
import { MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import API from '@/axios';
import { Post } from '@/types';
import TripCard from '../components/TripCard';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { trips } = useTripStore();

  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/post`, {
        params: {
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortType: 'desc'
        }
      });
      
      if (response.data && response.data.data && response.data.data.posts) {
        const posts = response.data.data.posts as Post[];
        setPosts(posts);
      }
    } catch (error) {
      console.error('Error searching for trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const renderItem = ({ item, index }: { item: Post; index: number }) => (
    <TripCard item={item} index={index} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>RideShare</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Find travel companions</Text>
      </View>
      
      {posts.length > 0 ? (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MapPin size={64} color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No trips available</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Be the first to post a trip!
          </Text>
          <Pressable
            style={[styles.createTripButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/create')}
          >
            <Text style={styles.createTripButtonText}>Create Trip</Text>
          </Pressable>
        </View>
      )}
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
  listContent: {
    padding: 16,
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
  timeAgo: {
    fontSize: 12,
    marginTop: 2,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createTripButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createTripButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});