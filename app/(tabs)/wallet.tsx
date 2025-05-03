import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Coins, Gift, Clock } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useCoinsStore } from "@/store/coins-store";
import { useAuthStore } from "@/store/auth-store";

export default function WalletScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const { coins } = useCoinsStore();
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Wallet</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <View style={styles.balanceAmount}>
            <Coins size={32} color="white" />
            <Text style={styles.balanceValue}>{coins}</Text>
          </View>
          <Text style={styles.balanceHint}>Play games to earn more coins!</Text>
        </LinearGradient>

        {/* Coming Soon Section */}
        <View style={styles.comingSoonSection}>
          <View style={[styles.comingSoonCard, { backgroundColor: colors.card }]}>
            <Gift size={24} color={colors.primary} />
            <Text style={[styles.comingSoonTitle, { color: colors.text }]}>Exciting Rewards Coming Soon</Text>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>Soon you'll be able to redeem your coins for amazing rewards! Keep collecting coins.</Text>
          </View>
        </View>

        {/* Empty Transaction Section */}
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Clock size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Transactions Yet</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Start playing games to see your coin history here</Text>
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
  },
  balanceCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  balanceLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  balanceAmount: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  balanceValue: {
    fontFamily: "Poppins-Bold",
    fontSize: 36,
    color: "white",
    marginLeft: 8,
  },
  balanceHint: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
  },
  comingSoonSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  comingSoonCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  comingSoonTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  comingSoonText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
  },
  transactionsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    marginBottom: 12,
  },
  emptyState: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyStateTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
  },
});