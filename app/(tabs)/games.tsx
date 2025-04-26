import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useColorScheme,
  FlatList
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { Search, TrendingUp, Clock, Star } from "lucide-react-native";
import { theme } from "../../constants/theme";
import { GameCard } from "../../components/GameCard";
import { allGames, gameCategories } from "../../constants/games";

export default function GamesScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState("all");

  const filteredGames = selectedCategory === "all" 
    ? allGames 
    : allGames.filter(game => game.category === selectedCategory);

  const handleGamePress = (gameId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/game/${gameId}`);
  };

  const handleCategoryPress = (category: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setSelectedCategory(category);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Games</Text>
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.card }]}>
          <Search size={20} color={colors.textSecondary} />
          <Text style={[styles.searchText, { color: colors.textSecondary }]}>Search games</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          <TouchableOpacity 
            style={[
              styles.categoryButton, 
              selectedCategory === "all" && { backgroundColor: colors.primary }
            ]}
            onPress={() => handleCategoryPress("all")}
          >
            <Text 
              style={[
                styles.categoryText, 
                selectedCategory === "all" ? { color: "white" } : { color: colors.text }
              ]}
            >
              All Games
            </Text>
          </TouchableOpacity>
          
          {gameCategories.map((category) => (
            <TouchableOpacity 
              key={category.id}
              style={[
                styles.categoryButton, 
                selectedCategory === category.id && { backgroundColor: colors.primary }
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Text 
                style={[
                  styles.categoryText, 
                  selectedCategory === category.id ? { color: "white" } : { color: colors.text }
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.primary }]}>
          <TrendingUp size={16} color="white" />
          <Text style={styles.filterButtonText}>Popular</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card }]}>
          <Clock size={16} color={colors.text} />
          <Text style={[styles.filterButtonText, { color: colors.text }]}>New</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card }]}>
          <Star size={16} color={colors.text} />
          <Text style={[styles.filterButtonText, { color: colors.text }]}>Top Rated</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredGames || []}
        renderItem={({ item }) => (
          <GameCard
            game={item}
            onPress={() => handleGamePress(item.id)}
            style={styles.gameCard}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gamesRow}
        contentContainerStyle={styles.gamesList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    marginBottom: 12,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    marginLeft: 8,
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "white",
    marginLeft: 4,
  },
  gamesList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  gamesRow: {
    justifyContent: "space-between",
  },
  gameCard: {
    width: "48%",
    marginBottom: 16,
  },
});