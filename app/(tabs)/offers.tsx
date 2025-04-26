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
import { Download, ExternalLink } from "lucide-react-native";
import { theme } from "../../constants/theme";
import { offers } from "../../constants/offers";

export default function OffersScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Special Offers</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Complete offers to earn coins
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          <TouchableOpacity 
            style={[styles.categoryButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.categoryText}>All Offers</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryButton, { backgroundColor: colors.card }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.categoryText, { color: colors.text }]}>Apps</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryButton, { backgroundColor: colors.card }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.categoryText, { color: colors.text }]}>Surveys</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.categoryButton, { backgroundColor: colors.card }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.categoryText, { color: colors.text }]}>Videos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.offersContainer}>
          {offers.map((offer) => (
            <TouchableOpacity 
              key={offer.id}
              style={[styles.offerCard, { backgroundColor: colors.card }]}
              activeOpacity={0.9}
            >
              <Image source={{ uri: offer.image }} style={styles.offerImage} />
              <View style={styles.offerContent}>
                <Text style={[styles.offerTitle, { color: colors.text }]}>{offer.title}</Text>
                <Text style={[styles.offerDescription, { color: colors.textSecondary }]}>
                  {offer.description}
                </Text>
                <View style={styles.offerFooter}>
                  <View style={[styles.coinBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.coinText, { color: colors.primary }]}>
                      +{offer.coins} coins
                    </Text>
                  </View>
                  <View style={styles.offerAction}>
                    {offer.type === "download" ? (
                      <Download size={16} color={colors.primary} />
                    ) : (
                      <ExternalLink size={16} color={colors.primary} />
                    )}
                    <Text style={[styles.offerActionText, { color: colors.primary }]}>
                      {offer.type === "download" ? "Download" : "Visit"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  categoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "white",
  },
  offersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  offerCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  offerImage: {
    width: "100%",
    height: 140,
  },
  offerContent: {
    padding: 16,
  },
  offerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginBottom: 4,
  },
  offerDescription: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    marginBottom: 12,
  },
  offerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  coinBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  coinText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  offerAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  offerActionText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginLeft: 4,
  },
});