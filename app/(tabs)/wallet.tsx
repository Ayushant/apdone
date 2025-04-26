import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { Coins, ArrowDown, ArrowUp, Gift, Clock, RefreshCw } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useCoinsStore } from "@/store/coins-store";
import { transactionHistory } from "../../constants/transactions";

export default function WalletScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const { coins } = useCoinsStore();

  const handleRedeemPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Wallet</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <RefreshCw size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.balanceAmount}>
            <Coins size={32} color="white" />
            <Text style={styles.balanceValue}>{coins}</Text>
          </View>
          
          <View style={styles.balanceActions}>
            <TouchableOpacity 
              style={styles.balanceActionButton}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <ArrowDown size={16} color="white" />
              <Text style={styles.balanceActionText}>Earn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.balanceActionButton, styles.redeemButton]}
              onPress={handleRedeemPress}
            >
              <ArrowUp size={16} color="#6366F1" />
              <Text style={[styles.balanceActionText, { color: "#6366F1" }]}>Redeem</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.rewardsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rewards</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rewardsContainer}
          >
            <TouchableOpacity 
              style={[styles.rewardCard, { backgroundColor: colors.card }]}
              activeOpacity={0.9}
            >
              <View style={[styles.rewardIconContainer, { backgroundColor: "#F59E0B" }]}>
                <Gift size={24} color="white" />
              </View>
              <Text style={[styles.rewardTitle, { color: colors.text }]}>Amazon Gift Card</Text>
              <Text style={[styles.rewardPrice, { color: colors.primary }]}>5000 coins</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.rewardCard, { backgroundColor: colors.card }]}
              activeOpacity={0.9}
            >
              <View style={[styles.rewardIconContainer, { backgroundColor: "#10B981" }]}>
                <Gift size={24} color="white" />
              </View>
              <Text style={[styles.rewardTitle, { color: colors.text }]}>Google Play Card</Text>
              <Text style={[styles.rewardPrice, { color: colors.primary }]}>3000 coins</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.rewardCard, { backgroundColor: colors.card }]}
              activeOpacity={0.9}
            >
              <View style={[styles.rewardIconContainer, { backgroundColor: "#EC4899" }]}>
                <Gift size={24} color="white" />
              </View>
              <Text style={[styles.rewardTitle, { color: colors.text }]}>PayPal Cash</Text>
              <Text style={[styles.rewardPrice, { color: colors.primary }]}>10000 coins</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
          
          {transactionHistory?.map((transaction) => (
            <View 
              key={transaction.id}
              style={[styles.transactionItem, { backgroundColor: colors.card }]}
            >
              <View style={styles.transactionLeft}>
                <View 
                  style={[
                    styles.transactionIcon, 
                    { 
                      backgroundColor: transaction.type === "earned" 
                        ? "rgba(16, 185, 129, 0.1)" 
                        : "rgba(239, 68, 68, 0.1)" 
                    }
                  ]}
                >
                  {transaction.type === "earned" ? (
                    <ArrowDown size={16} color="#10B981" />
                  ) : (
                    <ArrowUp size={16} color="#EF4444" />
                  )}
                </View>
                <View>
                  <Text style={[styles.transactionTitle, { color: colors.text }]}>
                    {transaction.title}
                  </Text>
                  <View style={styles.transactionMeta}>
                    <Clock size={12} color={colors.textSecondary} />
                    <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                      {transaction.date}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Text 
                style={[
                  styles.transactionAmount, 
                  { 
                    color: transaction.type === "earned" ? "#10B981" : "#EF4444" 
                  }
                ]}
              >
                {transaction.type === "earned" ? "+" : "-"}{transaction.amount}
              </Text>
            </View>
          )) || null}
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
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceAmount: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  balanceValue: {
    fontFamily: "Poppins-Bold",
    fontSize: 36,
    color: "white",
    marginLeft: 8,
  },
  balanceActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: "48%",
  },
  redeemButton: {
    backgroundColor: "white",
  },
  balanceActionText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "white",
    marginLeft: 6,
  },
  rewardsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  rewardsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  rewardCard: {
    width: 150,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: "center",
  },
  rewardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  rewardTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  rewardPrice: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  historySection: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginBottom: 2,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDate: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginLeft: 4,
  },
  transactionAmount: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
});