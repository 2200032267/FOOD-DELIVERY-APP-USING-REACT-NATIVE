// components/OrderSummary.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useCart } from '../components/_CartContext';

const { width } = Dimensions.get('window');

type PaymentMethod = {
  id: string;
  name: string;
  icon: string;
};

const paymentMethods: PaymentMethod[] = [
  { id: 'credit', name: 'Credit Card', icon: 'card-outline' },
  { id: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
  { id: 'applepay', name: 'Apple Pay', icon: 'logo-apple' },
  { id: 'googlepay', name: 'Google Pay', icon: 'logo-google' },
];

export default function OrderSummary() {
  const { cartItems, totalPrice, clearCart, placeOrder } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('credit');
  const [showQR, setShowQR] = useState(false);
  const [orderId, setOrderId] = useState('');
  const qrRef = useRef<any>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const totalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
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
      ]),
      Animated.spring(totalAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim, totalAnim]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePlaceOrder = async () => {
    try {
      if (cartItems.length === 0) {
        Alert.alert('Error', 'Your cart is empty');
        return;
      }

      animateButton();
      setLoading(true);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScale, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      const id = await placeOrder();
      setOrderId(id);
      setShowQR(true);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setLoading(false);
      buttonScale.stopAnimation();
      buttonScale.setValue(1);
    }
  };

  if (showQR && orderId) {
    return (
      <View style={styles.qrContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.qrTitle}>Order Confirmed #{orderId}</Text>
        <Text style={styles.qrSubtitle}>Show this QR code when picking up your order</Text>
        
        <View style={styles.qrCodeContainer}>
          <QRCode
            value={orderId}
            size={width * 0.7}
            color="black"
            backgroundColor="white"
            getRef={ref => (qrRef.current = ref)}
          />
        </View>

        <Text style={styles.estimatedTime}>Estimated ready in 15-20 minutes</Text>
        
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={() => {
            setShowQR(false);
            clearCart();
            router.push('/(tabs)/menu');
          }}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
        <LinearGradient
          colors={['#6366f1', '#8b5cf6', '#a855f7']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Your Cart is Empty</Text>
        </LinearGradient>
        <View style={styles.emptyContent}>
          <Ionicons name="cart-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No items in your cart</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/menu')}
          >
            <Text style={styles.shopButtonText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#a855f7']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
          <View style={styles.headerIcon}>
            <Ionicons name="receipt-outline" size={32} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Order Summary</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.itemsContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {cartItems.map((item, index) => (
            <Animated.View
              key={`${item.id}-${index}`}
              style={[
                styles.itemCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 50 + index * 10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.itemGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.itemIcon}>
                  <Ionicons name="cube-outline" size={24} color="#6366f1" />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    ${item.price.toFixed(2)} each
                  </Text>
                </View>
                <View style={styles.itemTotal}>
                  <Text style={styles.itemTotalPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View
          style={[
            styles.pricingCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#f8fafc', '#e2e8f0']}
            style={styles.pricingGradient}
          >
            <Text style={styles.pricingTitle}>Pricing Details</Text>
            
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Subtotal</Text>
              <Text style={styles.pricingValue}>${totalPrice.toFixed(2)}</Text>
            </View>
            
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Tax (8%)</Text>
              <Text style={styles.pricingValue}>
                ${(totalPrice * 0.08).toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Delivery</Text>
              <Text style={[styles.pricingValue, styles.freeText]}>FREE</Text>
            </View>
            
            <View style={styles.divider} />
            
            <Animated.View
              style={[
                styles.totalRow,
                {
                  transform: [{ scale: totalAnim }],
                },
              ]}
            >
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                ${(totalPrice * 1.08).toFixed(2)}
              </Text>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.paymentMethods,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.selectedMethod,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <Ionicons 
                name={method.icon as any} 
                size={24} 
                color={selectedMethod === method.id ? '#6366f1' : '#6b7280'} 
              />
              <Text style={[
                styles.methodName,
                selectedMethod === method.id && styles.selectedMethodText
              ]}>
                {method.name}
              </Text>
              {selectedMethod === method.id && (
                <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>

      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: buttonScale }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <LinearGradient
            colors={
              loading
                ? ['#9ca3af', '#6b7280']
                : ['#6366f1', '#8b5cf6', '#a855f7']
            }
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.buttonText}>Processing Order...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Place Order</Text>
                <Text style={styles.buttonPrice}>
                  ${(totalPrice * 1.08).toFixed(2)}
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    height: 200,
    paddingBottom: 30,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginVertical: 16,
  },
  shopButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    width: '60%',
    alignItems: 'center',
    marginTop: 20,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemsContainer: {
    marginTop: 20,
  },
  itemCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  itemGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  pricingCard: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  pricingGradient: {
    padding: 24,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  pricingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  freeText: {
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: '#d1d5db',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  paymentMethods: {
    marginTop: 24,
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedMethod: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  methodName: {
    flex: 1,
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 12,
  },
  selectedMethodText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#f1f5f9',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  buttonPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  qrCodeContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  estimatedTime: {
    fontSize: 18,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 30,
  },
  doneButton: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});