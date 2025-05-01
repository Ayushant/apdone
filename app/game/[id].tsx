import React, { useState, useEffect } from "react";
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const router = useRouter();
  const { addCoins } = useCoinsStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [game, setGame] = useState<any>(null);
  const [score, setScore] = useState(0);
  
  useEffect(() => {
    const loadGame = async () => {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundGame = allGames.find(g => g.id === id);
      setGame(foundGame);
      setIsLoading(false);
    };
    
    loadGame();
  }, [id]);

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    
    // Award coins based on score milestones
    if (newScore % 50 === 0 && newScore > 0) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      addCoins(10);
    }
  };

  const renderGame = () => {
    if (!game) return null;
    
    switch (game.id) {
      case "tictactoe":
        return <TicTacToe onScoreChange={handleScoreChange} />;
      case "sudoku":
        return <Sudoku onScoreChange={handleScoreChange} />;
      case "blockpuzzle":
        return <BlockPuzzle onScoreChange={handleScoreChange} />;
      case "mathcalc":
        return <MathCalc onScoreChange={handleScoreChange} />;
      case "game2048":
        return <Game2048 onScoreChange={handleScoreChange} />;
      case "memorytrainer":
        return <MemoryTrainer onScoreChange={handleScoreChange} />;
      case "concentration":
        return <Concentration onScoreChange={handleScoreChange} />;
      case "checkers":
        return <Checkers onScoreChange={handleScoreChange} />;
      case "flappybird":
        return <FlappyBird onScoreChange={handleScoreChange} />;
      default:
        return (
          <View style={styles.placeholderContainer}>
            <Text style={[styles.placeholderText, { color: colors.text }]}>
              Game coming soon!
            </Text>
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading game...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={handleBack}
        >
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {game?.name || "Game"}
        </Text>
        
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreItem, { backgroundColor: colors.card }]}>
          <Trophy size={16} color={colors.gold} />
          <Text style={[styles.scoreText, { color: colors.text }]}>
            Score: {score}
          </Text>
        </View>
        
        <View style={[styles.scoreItem, { backgroundColor: colors.card }]}>
          <Coins size={16} color={colors.gold} />
          <Text style={[styles.scoreText, { color: colors.text }]}>
            Earned: {Math.floor(score / 50) * 10}
          </Text>
        </View>
      </View>
      
      <View style={styles.gameContainer}>
        {renderGame()}
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
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scoreItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  scoreText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
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
});