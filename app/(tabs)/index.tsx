import React, { useEffect, useRef } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

type RootStackParamList = {
  explore: undefined;
  menu: undefined;
  cart: undefined;
  // add other routes here if needed
};

export default function HomeTab() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animations
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
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous bounce animation for main icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#ff6f00" />
      <LinearGradient
        colors={["#ff6f00", "#ff8f00", "#ffa726"]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Main Logo with Glow Effect */}
            <View style={styles.logoContainer}>
              <View style={styles.glowEffect} />
              <Animated.View
                style={[
                  styles.logoCircle,
                  {
                    transform: [{ translateY: bounceAnim }],
                  },
                ]}
              >
                <Text style={styles.logoEmoji}>🍔</Text>
              </Animated.View>
            </View>

            {/* Welcome Text */}
            <Animated.Text
              style={[
                styles.title,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              Welcome to Foodie! 🎉
            </Animated.Text>

            <Animated.Text
              style={[
                styles.subtitle,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              Discover amazing flavors and satisfy your cravings with our
              delicious food collection
            </Animated.Text>
          </Animated.View>

          {/* Feature Cards */}
          <Animated.View
            style={[
              styles.cardsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Browse Menu Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("explore")} // 👈 navigate to Explore tab
            >
              <LinearGradient
                colors={["#ffffff", "#f8f9fa"]}
                style={styles.card}
              >
                <Animated.View
                  style={[
                    styles.cardIcon,
                    { transform: [{ rotate: spin }] }, // spin should be defined via Animated
                  ]}
                >
                  <Text style={styles.cardEmoji}>📱</Text>
                </Animated.View>
                <Text style={styles.cardTitle}>Browse Menu</Text>
                <Text style={styles.cardDescription}>
                  Explore our extensive collection of mouth-watering dishes
                </Text>
                <LinearGradient
                  colors={["#ff6f00", "#ff8f00"]}
                  style={styles.cardButton}
                >
                  <Text style={styles.cardButtonText}>Start Exploring →</Text>
                </LinearGradient>
              </LinearGradient>
            </TouchableOpacity>

            {/* Quick Order Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("menu")} // 👈 navigate to Menu tab
            >
              <LinearGradient
                colors={["#ffffff", "#f8f9fa"]}
                style={styles.card}
              >
                <View style={styles.cardIcon}>
                  <Text style={styles.cardEmoji}>⚡</Text>
                </View>
                <Text style={styles.cardTitle}>Quick Order</Text>
                <Text style={styles.cardDescription}>
                  Reorder your favorites or try our chefs recommendations
                </Text>
                <LinearGradient
                  colors={["#e91e63", "#f06292"]}
                  style={styles.cardButton}
                >
                  <Text style={styles.cardButtonText}>Order Now →</Text>
                </LinearGradient>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Popular Categories */}
          <Animated.View
            style={[
              styles.categoriesSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <View style={styles.categoriesContainer}>
              {["🍕", "🍔", "🌮", "🍜", "🍣", "🥗"].map((emoji, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.categoryItem,
                    {
                      transform: [
                        {
                          scale: scaleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.categoryButton}
                  >
                    <Text style={styles.categoryEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Bottom CTA */}
          <Animated.View
            style={[
              styles.bottomCTA,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.ctaText}>
              Ready to order? Lets get started!
            </Text>
            <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
              <Text style={styles.arrowEmoji}>👆</Text>
            </Animated.View>
          </Animated.View>
        </ScrollView>

        {/* Floating Action Button */}
        <Animated.View
          style={[
            styles.fab,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('cart')}// 👈 navigate to Cart tab
          >
            <LinearGradient
              colors={["#ff6f00", "#ff8f00"]}
              style={styles.fabButton}
            >
              <Text style={styles.fabIcon}>🛒</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 30,
  },
  glowEffect: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ffffff30",
    top: -10,
    left: -10,
    zIndex: 0,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 1,
  },
  logoEmoji: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 15,
    textShadowColor: "#00000030",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    opacity: 0.9,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  cardEmoji: {
    fontSize: 30,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
  },
  cardButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  cardButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  categoryItem: {
    margin: 10,
  },
  categoryButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  categoryEmoji: {
    fontSize: 35,
  },
  bottomCTA: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  ctaText: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
    opacity: 0.9,
  },
  arrowEmoji: {
    fontSize: 24,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    zIndex: 100,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  fabIcon: {
    fontSize: 28,
  },
});
