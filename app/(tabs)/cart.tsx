import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { CartItem as CartItemType, useCart } from '../components/_CartContext';

const { width } = Dimensions.get('window');


interface CartItemProps {
  item: CartItemType;
  index: number;
  opacityMap: { [key: string]: Animated.Value };
  handleQuantityChange: (id: string, newQuantity: number) => void;
  handleRemoveItem: (id: string, itemName: string) => void;
  isAnimating: boolean;
}

const CartItemComponent: React.FC<CartItemProps> = ({ 
  item, 
  index,
  opacityMap,
  handleQuantityChange,
  handleRemoveItem,
  isAnimating
}) => {
  const itemAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 600,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const opacity = opacityMap[item.id] || new Animated.Value(1);

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          opacity: opacity,
          transform: [
            {
              translateX: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
            {
              scale: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.itemCard}>
        <View style={styles.imageContainer}>
          <LinearGradient colors={['#ff6f00', '#ff8f00']} style={styles.imagePlaceholder}>
            <Text style={styles.imageEmoji}>🍔</Text>
          </LinearGradient>
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
          <Text style={styles.itemSubtotal}>Subtotal: ${(item.price * item.quantity).toFixed(2)}</Text>
        </View>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <LinearGradient
              colors={item.quantity <= 1 ? ['#ccc', '#ddd'] : ['#ff6f00', '#ff8f00']}
              style={styles.quantityButtonGradient}
            >
              <Text style={[styles.quantityButtonText, { color: item.quantity <= 1 ? '#999' : '#fff' }]}>−</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityText}>{item.quantity}</Text>
          </View>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
          >
            <LinearGradient colors={['#ff6f00', '#ff8f00']} style={styles.quantityButtonGradient}>
              <Text style={styles.quantityButtonText}>+</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item.id, item.name)}>
          <Text style={styles.removeIcon}>🗑️</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

CartItemComponent.displayName = 'CartItem';

const MemoizedCartItem = React.memo(CartItemComponent);

export default function CartScreen() {
  const { cartItems: cart, updateQuantity, removeFromCart, totalPrice, placeOrder } = useCart();
  
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [orderId, setOrderId] = useState('');
  const qrRef = useRef<QRCode>(null);
  const opacityMap = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    cart.forEach((item) => {
      if (!opacityMap[item.id]) {
        opacityMap[item.id] = new Animated.Value(1);
      }
    });
  }, [cart]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const totalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    Animated.timing(totalAnim, { toValue: 1, duration: 1000, useNativeDriver: false }).start();
  }, []);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const scaleValue = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleValue, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start(() => setIsAnimating(false));

    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string, itemName: string) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove ${itemName} from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (!opacityMap[id]) {
              opacityMap[id] = new Animated.Value(1);
            }
            Animated.timing(opacityMap[id], {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              removeFromCart(id);
              opacityMap[id].setValue(1);
            });
          },
        },
      ]
    );
  };

  const handleCheckout = async () => {
    try {
      setIsAnimating(true);
      const order = await placeOrder();
      setOrderId(order);
      setShowQR(true);
    } catch (error: unknown) {
      let errorMessage = 'Failed to place order';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsAnimating(false);
    }
  };

  const saveQRCode = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need permission to save the QR code to your gallery');
        return;
      }

      if (qrRef.current) {
        const base64 = await new Promise<string>((resolve) => {
          (qrRef.current as any)?.toDataURL((data: string) => resolve(data));
        });
        const fileUri = `${FileSystem.cacheDirectory}order_${orderId}.png`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await MediaLibrary.saveToLibraryAsync(fileUri);
        Alert.alert('Success', 'QR code saved to your gallery');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save QR code');
    }
  };

  const shareQRCode = async () => {
    try {
      if (qrRef.current && typeof (qrRef.current as any).toDataURL === 'function') {
        const base64 = await new Promise<string>((resolve) => {
          (qrRef.current as any).toDataURL((data: string) => resolve(data));
        });
        const fileUri = `${FileSystem.cacheDirectory}order_${orderId}.png`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Share.share({
          url: fileUri,
          title: 'My Order QR Code',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const renderCartItem = ({ item, index }: { item: CartItemType; index: number }) => (
    <MemoizedCartItem 
      item={item} 
      index={index} 
      opacityMap={opacityMap}
      handleQuantityChange={handleQuantityChange}
      handleRemoveItem={handleRemoveItem}
      isAnimating={isAnimating}
    />
  );

  if (showQR && orderId) {
    return (
      <View style={styles.qrContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.qrTitle}>Your Order #{orderId}</Text>
        <Text style={styles.qrSubtitle}>Show this QR code to the restaurant</Text>
        
        <View style={styles.qrCodeContainer}>
          <QRCode
            value={orderId}
            size={width * 0.7}
            color="black"
            backgroundColor="white"
            getRef={ref => (qrRef.current = ref)}
          />
        </View>

        <View style={styles.qrButtons}>
          <TouchableOpacity style={styles.qrButton} onPress={saveQRCode}>
            <Ionicons name="download-outline" size={24} color="white" />
            <Text style={styles.qrButtonText}>Save QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.qrButton} onPress={shareQRCode}>
            <Ionicons name="share-outline" size={24} color="white" />
            <Text style={styles.qrButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.qrButton} 
            onPress={() => {
              setShowQR(false);
              router.push('/(tabs)/menu');
            }}
          >
            <Ionicons name="home-outline" size={24} color="white" />
            <Text style={styles.qrButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <LinearGradient colors={['#ff6f00', '#ff8f00', '#ffa726']} style={styles.emptyContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#ff6f00" />
        <Animated.View
          style={[
            styles.emptyContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>Looks like you havent added any delicious items to your cart yet!</Text>

          <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)/menu')}>
            <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.browseButtonGradient}>
              <Text style={styles.browseButtonText}>Browse Menu 🍽️</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ff6f00" />

      <LinearGradient colors={['#ff6f00', '#ff8f00']} style={styles.header}>
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.headerTitle}>Your Cart 🛒</Text>
          <Text style={styles.headerSubtitle}>
            {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
          </Text>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[styles.listContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          renderItem={renderCartItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.footerGradient}>
          <Animated.View
            style={[
              styles.totalContainer,
              {
                opacity: totalAnim,
                transform: [
                  {
                    translateY: totalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.totalLabel}>Order Total</Text>
            
          </Animated.View>

<TouchableOpacity 
  style={styles.checkoutButton}
  onPress={() => router.push('/order-summary')} // Add this line
  disabled={cart.length === 0 || isAnimating}
>
  <LinearGradient colors={['#ff6f00', '#ff8f00']} style={styles.checkoutGradient}>
    {isAnimating ? (
      <Text style={styles.checkoutText}>Processing...</Text>
    ) : (
      <Text style={styles.checkoutText}>Checkout 🍽️</Text>
    )}
  </LinearGradient>
</TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#ff6f00',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 10,
  },
  itemContainer: {
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    elevation: 3,
  },
  imageContainer: {
    marginRight: 14,
  },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: {
    fontSize: 28,
  },

  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#888',
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff6f00',
    marginTop: 6,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  quantityButton: {
    borderRadius: 20,
    overflow: 'hidden',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 22,
    fontWeight: '700',
  },
  quantityDisplay: {
    marginHorizontal: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
  },
  removeButton: {
    marginLeft: 8,
    padding: 4,
  },
  removeIcon: {
    fontSize: 22,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerGradient: {
    borderRadius: 10,
    padding: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff6f00',
  },
  checkoutButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  checkoutGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  browseButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  browseButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#ff6f00',
    fontSize: 18,
    fontWeight: '700',
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  qrCodeContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 4,
    marginBottom: 30,
  },
  qrButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  qrButton: {
    backgroundColor: '#ff6f00',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});
