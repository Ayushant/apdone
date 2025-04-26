import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { Star } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
  onPress: () => void;
  style?: ViewStyle;
}

export function GameCard({ game, onPress, style }: GameCardProps) {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: game.image }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {game.name}
        </Text>
        <View style={styles.footer}>
          <View style={styles.rating}>
            <Star size={12} color={colors.gold} fill={colors.gold} />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {game.rating}
            </Text>
          </View>
          <View 
            style={[
              styles.categoryBadge, 
              { backgroundColor: colors.primaryLight }
            ]}
          >
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {game.categoryName}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 120,
  },
  content: {
    padding: 12,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    marginLeft: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontFamily: "Poppins-Medium",
    fontSize: 10,
  },
});