import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { RefreshCw } from "lucide-react-native";
import { theme } from "@/constants/theme";

interface SudokuProps {
  onScoreChange: (score: number) => void;
}


// Generate a valid Sudoku puzzle
const generateSudoku = (emptyCells: number) => {
  const base = Array.from({ length: 9 }, (_, i) => i + 1);
  const shuffle = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Create solved puzzle
  const solution = Array(81).fill(0);
  const shuffledBase = shuffle([...base]);
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      solution[i * 9 + j] = shuffledBase[(i * 3 + Math.floor(i / 3) + j) % 9];
    }
  }

  // Create puzzle by removing numbers
  const puzzle = [...solution];
  const indices = shuffle(Array.from({ length: 81 }, (_, i) => i));
  for (let i = 0; i < emptyCells; i++) {
    puzzle[indices[i]] = 0;
  }

  return { puzzle, solution };
};

export default function Sudoku({ onScoreChange }: SudokuProps) {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const prevScoreRef = useRef(0);
  
  const [score, setScore] = useState(0);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [puzzle, setPuzzle] = useState<number[]>([]);
  const [solution, setSolution] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  
  useEffect(() => {
    generatePuzzle();
  }, [difficulty]);
  
  const debouncedScoreUpdate = useCallback((newScore: number) => {
    if (newScore !== prevScoreRef.current) {
      onScoreChange(newScore);
      prevScoreRef.current = newScore;
    }
  }, [onScoreChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedScoreUpdate(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score, debouncedScoreUpdate]);

  const generatePuzzle = () => {
    const emptyCells = difficulty === "easy" ? 30 : difficulty === "medium" ? 45 : 55;
    const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(emptyCells);
    setPuzzle(newPuzzle);
    setSolution(newSolution);
  };

  const handleCellPress = (index: number) => {
    if (puzzle[index] !== 0) return;
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCell(index);
  };

  const handleNumberPress = (number: number) => {
    if (selectedCell === null) return;
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const newPuzzle = [...puzzle];
    newPuzzle[selectedCell] = number;
    setPuzzle(newPuzzle);
    
    // Check if correct
    if (number === solution[selectedCell]) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Add points based on difficulty
      const points = difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 15;
      setScore(prevScore => prevScore + points);
      
      // Check if puzzle is complete
      if (!newPuzzle.includes(0) && newPuzzle.every((num, idx) => num === solution[idx])) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        // Bonus for completing puzzle
        const bonus = difficulty === "easy" ? 50 : difficulty === "medium" ? 100 : 200;
        setScore(prevScore => prevScore + bonus);
      }
    }
    
    setSelectedCell(null);
  };

  // Group cells into 3x3 boxes
  const renderBox = (startRow: number, startCol: number) => {
    return (
      <View style={[styles.box, { borderColor: colors.border }]}>
        {Array(3).fill(0).map((_, row) =>
          Array(3).fill(0).map((_, col) => {
            const index = (startRow + row) * 9 + (startCol + col);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.cell,
                  selectedCell === index && { backgroundColor: colors.primaryLight },
                  { borderColor: colors.border },
                ]}
                onPress={() => handleCellPress(index)}
              >
                {puzzle[index] !== 0 && (
                  <Text 
                    style={[
                      styles.cellText,
                      {
                        color: puzzle[index] === solution[index] ? colors.text : colors.primary,
                        fontFamily: solution[index] === puzzle[index] ? "Poppins-Bold" : "Poppins-Regular"
                      }
                    ]}
                  >
                    {puzzle[index]}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Sudoku</Text>
          <TouchableOpacity 
            style={[styles.resetButton, { backgroundColor: colors.card }]}
            onPress={generatePuzzle}
          >
            <RefreshCw size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.difficultyContainer}>
          {["easy", "medium", "hard"].map((level) => (
            <TouchableOpacity 
              key={level}
              style={[
                styles.difficultyButton, 
                difficulty === level && { backgroundColor: colors.primary },
              ]}
              onPress={() => setDifficulty(level as "easy" | "medium" | "hard")}
            >
              <Text 
                style={[
                  styles.difficultyText, 
                  { color: difficulty === level ? "white" : colors.text },
                ]}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={[styles.board, { borderColor: colors.border }]}>
          {Array(3).fill(0).map((_, boxRow) =>
            Array(3).fill(0).map((_, boxCol) => (
              <React.Fragment key={`${boxRow}-${boxCol}`}>
                {renderBox(boxRow * 3, boxCol * 3)}
              </React.Fragment>
            ))
          )}
        </View>
        
        <View style={styles.numberPad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
            <TouchableOpacity
              key={number}
              style={[
                styles.numberButton,
                { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleNumberPress(number)}
              disabled={selectedCell === null}
            >
              <Text style={[styles.numberText, { color: colors.text }]}>
                {number}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={[styles.instructions, { color: colors.textSecondary }]}>
          Select an empty cell, then tap a number to fill it.
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
    alignItems: "center",
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  difficultyContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  difficultyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  difficultyText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  board: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 360,
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 2,
    borderRadius: 12,
    padding: 8,
    marginBottom: 24,
  },
  box: {
    width: "33.33%",
    aspectRatio: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
  },
  cell: {
    width: "33.33%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
  },
  cellText: {
    fontSize: 18,
  },
  numberPad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    maxWidth: 360,
    marginBottom: 16,
  },
  numberButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  numberText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  instructions: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});