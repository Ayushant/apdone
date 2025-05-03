import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ChevronLeft, Trophy, Coins } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { allGames } from "@/constants/games";
import { useCoinsStore } from "@/store/coins-store";
import { useAuthStore } from "@/store/auth-store";
import TicTacToe from "@/components/games/TicTacToe";
import Sudoku from "@/components/games/Sudoku";
import BlockPuzzle from "@/components/games/BlockPuzzle";
import MathCalc from "@/components/games/MathCalc";
import Game2048 from "@/components/games/Game2048";
import MemoryTrainer from "@/components/games/MemoryTrainer";
import Concentration from "@/components/games/Concentration";
import Checkers from "@/components/games/Checkers";
import FlappyBird from "@/components/games/FlappyBird";

export default function GameScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { addCoins, isLoading } = useCoinsStore();
  const [score, setScore] = useState(0);
  const [currentGame, setCurrentGame] = useState(allGames.find(g => g.id === id));
  const previousScore = useRef(0);
  const isInitialMount = useRef(true);

  // Track pending coin rewards
  const pendingCoins = useRef(0);

  // Process coin rewards with debouncing
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (pendingCoins.current > 0 && user?.uid && !user.isGuest) {
      const timer = setTimeout(async () => {
        try {
          await addCoins(pendingCoins.current);
          pendingCoins.current = 0;
        } catch (error) {
          console.error('Failed to award coins:', error);
          // Could show an error toast here
        }
      }, 2000); // Debounce coin updates

      return () => clearTimeout(timer);
    }
  }, [score, user?.uid]);

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
    
    // Only award coins for non-guest users
    if (!isInitialMount.current && user?.uid && !user.isGuest) {
      // Award coins for every 50 point milestone
      const previousMilestone = Math.floor(previousScore.current / 50);
      const newMilestone = Math.floor(newScore / 50);
      
      if (newMilestone > previousMilestone) {
        // Calculate coins to award (10 coins per milestone)
        const coinsToAward = (newMilestone - previousMilestone) * 10;
        pendingCoins.current += coinsToAward;

        // Could show a toast notification here
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }
    
    previousScore.current = newScore;
  }, [user?.uid]);

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  if (!currentGame) return null;

  const GameComponent = {
    tictactoe: TicTacToe,
    sudoku: Sudoku,
    blockpuzzle: BlockPuzzle,
    mathcalc: MathCalc,
    game2048: Game2048,
    memorytrainer: MemoryTrainer,
    flappybird: FlappyBird
  }[currentGame.id];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={[styles.gameTitle, { color: colors.text }]}>{currentGame.name}</Text>
          <View style={styles.scoreContainer}>
            <Trophy size={16} color={colors.primary} />
            <Text style={[styles.scoreText, { color: colors.text }]}>{score}</Text>
          </View>
        </View>

        {user && !user.isGuest && (
          <View style={[styles.coinsDisplay, { backgroundColor: colors.card }]}>
            <Coins size={16} color={colors.gold} />
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text} style={{ marginLeft: 4 }} />
            ) : (
              <Text style={[styles.coinsText, { color: colors.text }]}>+{pendingCoins.current}</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.gameContainer}>
        {GameComponent && (
          <GameComponent onScoreChange={handleScoreChange} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  gameTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    marginLeft: 6,
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontFamily: "Poppins-Medium",
    fontSize: 18,
    textAlign: "center",
  },
  coinsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  coinsText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    marginLeft: 4,
  },
});