import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Dimensions,
  Animated,
  FlatList,
  StatusBar,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Type definitions
type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  categoryId: string;
};

type TopPick = {
  id: string;
  name: string;
  restaurant: string;
  price: string;
  rating: number;
  time: string;
  imageUrl: string;
  category: string;
};

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  offer: string;
  imageUrl: string;
  isFeatured: boolean;
};

type Offer = {
  id: string;
  title: string;
  subtitle: string;
  color1: string;
  color2: string;
  validUntil: string;
};

export default function ExploreScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topPicks, setTopPicks] = useState<TopPick[]>([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const router = useRouter();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch limited time offers
        const offersSnapshot = await getDocs(collection(db, 'limitedTimeOffers'));
        const offersData = offersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Offer[];
        setOffers(offersData);

        // Fetch food categories
        const categoriesSnapshot = await getDocs(collection(db, 'foodCategories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesData);

        // Fetch top picks
        const topPicksSnapshot = await getDocs(collection(db, 'topPicks'));
        const topPicksData = topPicksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TopPick[];
        
        setTopPicks(topPicksData);

        // Fetch featured restaurants
        const featuredQuery = query(
          collection(db, 'featuredRestaurants'),
          where('isFeatured', '==', true)
        );
        const featuredSnapshot = await getDocs(featuredQuery);
        const featuredData = featuredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Restaurant[];
        setFeaturedRestaurants(featuredData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        // Start animations after data is loaded
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(searchAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    fetchData();
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    // Navigate to menu screen with category filter
    router.push({
      pathname: '/menu',
      params: { category: categoryId }
    });
  };

  const handleTopPickPress = (item: TopPick) => {
    // Navigate to item details or restaurant
    router.push({
      pathname: '/menu',
      params: { itemId: item.id }
    });
  };

  const handleRestaurantPress = (restaurantId: string) => {
    // Navigate to restaurant menu
    router.push({
      pathname: '/menu',
      params: { restaurantId }
    });
  };

  const renderCategoryItem: ListRenderItem<Category> = ({ item, index }) => (
    <Animated.View
      style={[
        styles.categoryItem,
        {
          backgroundColor: item.color,
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50 + index * 10],
              }),
            },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Pressable
        style={styles.categoryPressable}
        onPress={() => handleCategoryPress(item.categoryId)}
      >
        <Text style={styles.categoryEmoji}>{item.emoji}</Text>
        <Text style={styles.categoryName}>{item.name}</Text>
      </Pressable>
    </Animated.View>
  );

const renderTopPickItem: ListRenderItem<TopPick> = ({ item, index }) => (
  <Animated.View
    style={[
      styles.topPickCard,
      {
        opacity: fadeAnim,
        transform: [
          {
            translateX: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 30 + index * 10],
            }),
          },
        ],
      },
    ]}
  >
    <Pressable onPress={() => handleTopPickPress(item)} style={{ flex: 1 }}>
      <Image source={{ uri: item.imageUrl }} style={styles.topPickImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.topPickGradient}
      >
        <View style={styles.topPickInfo}>
          <Text style={styles.topPickName}>{item.name}</Text>
          <Text style={styles.topPickRestaurant}>{item.restaurant}</Text>
          <View style={styles.topPickDetails}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#ffd700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.timeText}>{item.time}</Text>
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  </Animated.View>
);

  const renderRestaurantItem: ListRenderItem<Restaurant> = ({ item, index }) => (
    <Animated.View
      style={[
        styles.restaurantCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 20 + index * 5],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable 
        style={styles.restaurantPressable}
        onPress={() => handleRestaurantPress(item.id)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.restaurantImage} />
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantHeader}>
            <Text style={styles.restaurantName}>{item.name}</Text>
            <View style={styles.offerBadge}>
              <Text style={styles.offerText}>{item.offer}</Text>
            </View>
          </View>
          <Text style={styles.cuisineText}>{item.cuisine}</Text>
          <View style={styles.restaurantDetails}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#ffd700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.timeText}>{item.deliveryTime}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  const renderOfferItem: ListRenderItem<Offer> = ({ item, index }) => (
    <Animated.View
      style={[
        styles.offerCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              scale: scaleAnim.interpolate({
                inputRange: [0.9, 1],
                outputRange: [0.9 + index * 0.02, 1],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient 
        colors={[item.color1, item.color2]}
        style={styles.offerGradient}
      >
        <Text style={styles.offerTitle}>{item.title}</Text>
        <Text style={styles.offerSubtitle}>{item.subtitle}</Text>
        <Text style={styles.offerValid}>Valid until: {item.validUntil}</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </LinearGradient>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={20} color="#fff" />
            <Text style={styles.locationText}>Vijayawada, AP</Text>
            <Ionicons name="chevron-down" size={16} color="#fff" />
          </View>
          
          <Animated.View
            style={[
              styles.searchContainer,
              {
                opacity: searchAnim,
                transform: [{ scale: searchAnim }],
              },
            ]}
          >
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for dishes, restaurants..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            <Pressable style={styles.filterButton}>
              <Ionicons name="options-outline" size={20} color="#6366f1" />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Limited-Time Offers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Limited-Time Offers</Text>
          {offers.length > 0 ? (
            <FlatList
              data={offers}
              renderItem={renderOfferItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.offersContainer}
            />
          ) : (
            <Text style={styles.emptyText}>No current offers</Text>
          )}
        </View>

        {/* Food Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ Whats on your mind?</Text>
          {categories.length > 0 ? (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              numColumns={4}
              scrollEnabled={false}
              contentContainerStyle={styles.categoriesGrid}
            />
          ) : (
            <Text style={styles.emptyText}>No categories available</Text>
          )}
        </View>

        {/* Top Picks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ Top Picks Near You</Text>
            <Pressable>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          {topPicks.length > 0 ? (
            <FlatList
              data={topPicks}
              renderItem={renderTopPickItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topPicksContainer}
            />
          ) : (
            <Text style={styles.emptyText}>No top picks available</Text>
          )}
        </View>

        {/* Featured Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏪 Featured Restaurants</Text>
            <Pressable>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          {featuredRestaurants.length > 0 ? (
            <FlatList
              data={featuredRestaurants}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No featured restaurants</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  header: {
    height: 200,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  offersContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  offerCard: {
    width: width * 0.7,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  offerGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  offerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  offerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  offerValid: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  categoriesGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  categoryItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    margin: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  topPicksContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  topPickCard: {
    width: width * 0.6,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  topPickImage: {
    width: '100%',
    height: '100%',
  },
  topPickGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
  },
  topPickInfo: {
    padding: 16,
  },
  topPickName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  topPickRestaurant: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  topPickDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  restaurantPressable: {
    flexDirection: 'row',
    padding: 16,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  offerBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  offerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cuisineText: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 8,
  },
  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});