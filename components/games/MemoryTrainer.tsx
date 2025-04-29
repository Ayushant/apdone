import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { RefreshCw } from "lucide-react-native";
import { theme } from "@/constants/theme";

interface MemoryTrainerProps {
  onScoreChange: (score: number) => void;
}

const GRID_SIZE = 5;
const INITIAL_VIEW_TIME = 5000; // 5 seconds
const DECREASE_VIEW_TIME = 250; // Decrease view time by 250ms each level
const MIN_VIEW_TIME = 1000; // Minimum 1 second viewing time

export default function MemoryTrainer({ onScoreChange }: MemoryTrainerProps) {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];

  const [grid, setGrid] = useState<boolean[][]>([]);
  const [playerGrid, setPlayerGrid] = useState<boolean[][]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gamePhase, setGamePhase] = useState<"view" | "recall" | "result">("view");
  const [viewTime, setViewTime] = useState(INITIAL_VIEW_TIME);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    onScoreChange(score);
  }, [score, onScoreChange]);

  const startNewGame = () => {
    const newGrid = Array(GRID_SIZE).fill(0).map(() =>
      Array(GRID_SIZE).fill(false).map(() => Math.random() < 0.4)
    );
    setGrid(newGrid);
    setPlayerGrid(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(false)));
    setGamePhase("view");
    setGameOver(false);

    // Start recall phase after view time
    setTimeout(() => {
      if (gamePhase === "view") {
        setGamePhase("recall");
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    }, viewTime);
  };

  const handleCellPress = (row: number, col: number) => {
    if (gamePhase !== "recall" || gameOver) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newPlayerGrid = playerGrid.map(r => [...r]);
    newPlayerGrid[row][col] = !newPlayerGrid[row][col];
    setPlayerGrid(newPlayerGrid);
  };

  const checkResult = () => {
    let correct = 0;
    let total = 0;

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j]) total++;
        if (grid[i][j] === playerGrid[i][j]) {
          if (grid[i][j]) correct++;
        }
      }
    }

    const accuracy = correct / total;
    if (accuracy >= 0.8) { // 80% accuracy required to pass
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      const levelScore = Math.round((level * 10) * accuracy);
      const nextLevel = level + 1;
      setScore(prevScore => prevScore + levelScore);
      setLevel(nextLevel);
      // Calculate view time using the next level value
      setViewTime(Math.max(MIN_VIEW_TIME, INITIAL_VIEW_TIME - ((nextLevel - 1) * DECREASE_VIEW_TIME)));
      setTimeout(startNewGame, 1500);
    } else {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setGameOver(true);
    }
    setGamePhase("result");
  };

  const renderGrid = (displayGrid: boolean[][]) => {
    return (
      <View style={[styles.grid, { borderColor: colors.border }]}>
        {displayGrid.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((cell, j) => (
              <TouchableOpacity
                key={j}
                style={[
                  styles.cell,
                  {
                    backgroundColor: cell ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleCellPress(i, j)}
                disabled={gamePhase !== "recall"}
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Memory Trainer</Text>
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: colors.card }]}
            onPress={() => {
              setLevel(1);
              setScore(0);
              setViewTime(INITIAL_VIEW_TIME);
              startNewGame();
            }}
          >
            <RefreshCw size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Level: {level}
          </Text>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Score: {score}
          </Text>
        </View>

        {renderGrid(gamePhase === "view" ? grid : playerGrid)}

        {gamePhase === "recall" && !gameOver && (
          <TouchableOpacity
            style={[styles.checkButton, { backgroundColor: colors.primary }]}
            onPress={checkResult}
          >
            <Text style={styles.checkButtonText}>Check Answer</Text>
          </TouchableOpacity>
        )}

        {gameOver && (
          <View style={styles.gameOverContainer}>
            <Text style={[styles.gameOverText, { color: colors.text }]}>
              Game Over!
            </Text>
            <Text style={[styles.finalScoreText, { color: colors.text }]}>
              Final Score: {score}
            </Text>
          </View>
        )}

        <Text style={[styles.instructions, { color: colors.textSecondary }]}>
          {gamePhase === "view"
            ? "Memorize the pattern..."
            : gamePhase === "recall"
            ? "Tap cells to recreate the pattern"
            : "Checking your answer..."}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  infoText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
  },
  grid: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 360,
    alignSelf: "center",
    borderWidth: 2,
    borderRadius: 12,
    padding: 8,
    marginBottom: 24,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: "center",
    marginBottom: 24,
  },
  checkButtonText: {
    color: "white",
    fontFamily: "Poppins-Medium",
    fontSize: 16,
  },
  gameOverContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  gameOverText: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    marginBottom: 8,
  },
  finalScoreText: {
    fontSize: 24,
    fontFamily: "Poppins-Medium",
  },
  instructions: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
  },
});