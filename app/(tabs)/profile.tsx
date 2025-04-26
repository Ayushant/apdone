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
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { 
  User, 
  Settings, 
  Bell, 
  HelpCircle, 
  Share2, 
  LogOut,
  ChevronRight,
  Award,
  Coins
} from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthStore } from "@/store/auth-store";
import { useCoinsStore } from "@/store/coins-store";

export default function ProfileScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { coins } = useCoinsStore();

  const handleLogout = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.push("/settings");
          }}
        >
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image 
            source={{ 
              uri: user?.photoURL || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop" 
            }} 
            style={styles.profileImage} 
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user?.displayName || "Guest User"}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {user?.email || "guest@example.com"}
            </Text>
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
              <Coins size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{coins}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Coins</Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
              <Award size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Achievements</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>Account Settings</Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: "rgba(99, 102, 241, 0.1)" }]}>
                <User size={20} color={colors.primary} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Edit Profile</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
                <Bell size={20} color="#10B981" />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
                <HelpCircle size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Help & Support</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: "rgba(236, 72, 153, 0.1)" }]}>
                <Share2 size={20} color="#EC4899" />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Invite Friends</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
                <LogOut size={20} color="#EF4444" />
              </View>
              <Text style={[styles.menuItemText, { color: "#EF4444" }]}>Logout</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
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
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  statsCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: "80%",
    alignSelf: "center",
    marginHorizontal: 8,
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  menuTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  versionInfo: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  versionText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
});