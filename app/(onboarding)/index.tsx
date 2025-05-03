import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthStore } from "@/store/auth-store";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    title: "Welcome to Casual Play Hub",
    description: "Play fun casual games and earn rewards while having a great time!",
    image: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Play & Earn",
    description: "Complete missions, win games, and collect coins that you can redeem for rewards.",
    image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Connect & Compete",
    description: "Challenge friends, join tournaments, and climb the leaderboards!",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop",
  },
];

function OnboardingScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const router = useRouter();
  const { completeOnboarding } = useAuthStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    completeOnboarding();
    router.replace("/(auth)/login");
  };

  const handleSkip = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    completeOnboarding();
    router.replace("/(auth)/login");
  };

  const renderItem = ({ item }: { item: typeof onboardingData[0] }) => {
    return (
      <View style={styles.slide}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          contentFit="cover"
          transition={1000}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  const Indicator = () => {
    return (
      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          const backgroundColor = scrollX.interpolate({
            inputRange,
            outputRange: [
              colors.textSecondary,
              colors.primary,
              colors.textSecondary,
            ],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.indicator,
                {
                  transform: [{ scale }],
                  opacity,
                  backgroundColor,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <TouchableOpacity 
        style={[styles.skipButton, { backgroundColor: colors.card }]}
        onPress={handleSkip}
      >
        <Text style={[styles.skipText, { color: colors.text }]}>Skip</Text>
      </TouchableOpacity>
      
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />
      
      <View style={styles.footer}>
        <Indicator />
        
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            {currentIndex === onboardingData.length - 1 ? (
              <Text style={styles.nextButtonText}>Get Started</Text>
            ) : (
              <ChevronRight size={24} color="white" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  skipText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },
  nextButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "white",
  },
});