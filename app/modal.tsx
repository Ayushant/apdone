import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, useColorScheme, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { theme } from "@/constants/theme";

export default function SupportModal() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoContainer}
        >
          <Text style={styles.logoText}>🎮</Text>
        </LinearGradient>

        <Text style={[styles.title, { color: colors.text }]}>Need Help?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Contact us for any assistance
        </Text>

        <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Email</Text>
          <Text style={[styles.contactValue, { color: colors.text }]}>
            ayushantk@gmail.com
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  logoText: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    color: "white",
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  contactCard: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
  },
  contactLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginBottom: 4,
  },
  contactValue: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
});
