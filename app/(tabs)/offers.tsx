import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  useColorScheme 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Gift, Coins, ExternalLink, ArrowRight } from "lucide-react-native";
import { theme } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

export default function OffersScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Tips & Offers</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Learn how to earn more coins
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Featured Offer Banner */}
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.featuredOffer}
          >
            <View style={styles.featuredContent}>
              <Text style={styles.featuredLabel}>Featured Offer</Text>
              <Text style={styles.featuredTitle}>Daily Login Bonus</Text>
              <Text style={styles.featuredDescription}>
                Login daily to earn bonus coins and keep your streak going!
              </Text>
              <View style={styles.featuredReward}>
                <Coins size={16} color="#FFD700" />
                <Text style={styles.rewardText}>+50 coins</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tips to Earn More</Text>
          
          <View style={styles.tipsContainer}>
            <TouchableOpacity 
              style={[styles.tipCard, { backgroundColor: colors.card }]}
              activeOpacity={0.8}
            >
              <View style={[styles.tipIcon, { backgroundColor: colors.primaryLight }]}>
                <Gift size={20} color={colors.primary} />
              </View>
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>Complete Daily Missions</Text>
                <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
                  Finish 3 missions to earn bonus coins
                </Text>
              </View>
              <ArrowRight size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tipCard, { backgroundColor: colors.card }]}
              activeOpacity={0.8}
            >
              <View style={[styles.tipIcon, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}> 
                <ExternalLink size={20} color="#10B981" />
              </View>
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>Invite Friends</Text>
                <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
                  Get 100 coins for each friend invited
                </Text>
              </View>
              <ArrowRight size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  featuredOffer: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  featuredContent: {
    padding: 20,
  },
  featuredLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  featuredTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "white",
    marginBottom: 8,
  },
  featuredDescription: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
  },
  featuredReward: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rewardText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "white",
    marginLeft: 6,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tipsContainer: {
    paddingHorizontal: 16,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  tipTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    marginBottom: 2,
  },
  tipDescription: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
});