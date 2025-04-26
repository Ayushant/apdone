import React, { useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  useColorScheme,
  Image,
  Animated,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Bell, Settings, Coins, Gift, Video, ExternalLink, Award } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useCoinsStore } from "@/store/coins-store";
import { GameCard } from "@/components/GameCard";
import { RewardCard } from "@/components/RewardCard";
import { featuredGames } from "@/constants/games";

export default function HomeScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const router = useRouter();
  const { coins, addCoins } = useCoinsStore();
  const coinScale = new Animated.Value(1);

  const handleGamePress = (gameId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/game/${gameId}`);
  };

  const handleDailyBonus = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Animate coin icon
    Animated.sequence([
      Animated.timing(coinScale, {
        toValue: 1.3,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(coinScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    addCoins(50);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.coinContainer}>
          <Animated.View style={{ transform: [{ scale: coinScale }] }}>
            <Coins size={24} color={colors.gold} />
          </Animated.View>
          <Text style={[styles.coinText, { color: colors.text }]}>{coins}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <Bell size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Daily Bonus & Missions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Bonus & Missions</Text>
          <View style={styles.cardsContainer}>
            <RewardCard
              title="Daily Bonus"
              description="Claim your 50 coins"
              icon={<Gift size={24} color={colors.white} />}
              colors={["#8B5CF6", "#6366F1"]}
              onPress={handleDailyBonus}
            />
            <RewardCard
              title="Watch & Earn"
              description="Watch video for 20 coins"
              icon={<Video size={24} color={colors.white} />}
              colors={["#EC4899", "#F472B6"]}
              onPress={() => addCoins(20)}
            />
          </View>
          <View style={styles.cardsContainer}>
            <RewardCard
              title="Visit & Earn"
              description="Visit partner sites"
              icon={<ExternalLink size={24} color={colors.white} />}
              colors={["#10B981", "#34D399"]}
              onPress={() => addCoins(30)}
            />
            <RewardCard
              title="Daily Missions"
              description="Complete 3 tasks"
              icon={<Award size={24} color={colors.white} />}
              colors={["#F59E0B", "#FBBF24"]}
              onPress={() => router.push("/missions")}
            />
          </View>
        </View>

        {/* Featured Games */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Games</Text>
          <View style={styles.gamesGrid}>
            {featuredGames?.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPress={() => handleGamePress(game.id)}
              />
            )) || null}
          </View>
        </View>

        {/* Spin & Win */}
        <TouchableOpacity 
          onPress={() => router.push("/spin-wheel")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#4F46E5", "#7C3AED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.spinWheelBanner}
          >
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1642483155337-568244d1ddd5?q=80&w=1000&auto=format&fit=crop" }}
              style={styles.spinWheelImage}
            />
            <View style={styles.spinWheelContent}>
              <Text style={styles.spinWheelTitle}>Spin & Win</Text>
              <Text style={styles.spinWheelSubtitle}>Spin the wheel for amazing rewards</Text>
              <View style={styles.spinWheelButton}>
                <Text style={styles.spinWheelButtonText}>Spin Now</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Scratch Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Scratch & Win</Text>
          <TouchableOpacity 
            style={[styles.scratchCard, { backgroundColor: colors.card }]}
            onPress={() => router.push("/scratch-cards")}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=1000&auto=format&fit=crop" }}
              style={styles.scratchCardImage}
            />
            <Text style={[styles.scratchCardText, { color: colors.text }]}>
              Scratch cards to win instant coins and rewards
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginLeft: 6,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    marginBottom: 12,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  gamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  spinWheelBanner: {
    height: 160,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
  },
  spinWheelImage: {
    width: 120,
    height: "100%",
  },
  spinWheelContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  spinWheelTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 22,
    color: "white",
    marginBottom: 4,
  },
  spinWheelSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  spinWheelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  spinWheelButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "white",
  },
  scratchCard: {
    borderRadius: 16,
    overflow: "hidden",
    height: 120,
  },
  scratchCardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  scratchCardText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    height: "100%",
    textAlignVertical: "center",
  },
});