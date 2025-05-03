import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Platform,
  Animated,
  PanResponder,
} from "react-native";
import * as Haptics from "expo-haptics";
import { RefreshCw } from "lucide-react-native";
import { theme } from "@/constants/theme";

interface Game2048Props {
  onScoreChange: (score: number) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const GRID_SIZE = 4;
const CELL_SIZE = Math.min(
  (SCREEN_WIDTH - 48) / GRID_SIZE,
  (SCREEN_HEIGHT - 250) / GRID_SIZE
);
const SWIPE_THRESHOLD = 50;

const CELL_COLORS = {
  2: "#EEE4DA",
  4: "#EDE0C8",
  8: "#F2B179",
  16: "#F59563",
  32: "#F67C5F",
  64: "#F65E3B",
  128: "#EDCF72",
  256: "#EDCC61",
  512: "#EDC850",
  1024: "#EDC53F",
  2048: "#EDC22E",
};

const CELL_TEXT_COLORS = {
  2: "#776E65",
  4: "#776E65",
  8: "#F9F6F2",
  16: "#F9F6F2",
  32: "#F9F6F2",
  64: "#F9F6F2",
  128: "#F9F6F2",
  256: "#F9F6F2",
  512: "#F9F6F2",
  1024: "#F9F6F2",
  2048: "#F9F6F2",
};

export default function Game2048({ onScoreChange }: Game2048Props) {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const prevScoreRef = useRef(0);
  
  const [grid, setGrid] = useState<number[][]>(
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0))
  );
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [animations] = useState<Animated.Value[][]>(
    Array(GRID_SIZE).fill(0).map(() =>
      Array(GRID_SIZE).fill(0).map(() => new Animated.Value(1))
    )
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => !isProcessing,
      onPanResponderRelease: (e, gesture) => {
        if (isProcessing || gameOver) return;
        
        const { dx, dy } = gesture;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        
        if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return;
        
        setIsProcessing(true);
        
        // Add haptic feedback
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        setTimeout(() => {
          if (absDx > absDy) {
            if (dx > 0) {
              moveRight();
            } else {
              moveLeft();
            }
          } else {
            if (dy > 0) {
              moveDown();
            } else {
              moveUp();
            }
          }
          setIsProcessing(false);
        }, 50); // Small delay to ensure smooth animation
      },
    })
  ).current;

  // Check if any moves are possible
  const hasValidMoves = useCallback((currentGrid: number[][]) => {
    // Check for empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentGrid[i][j] === 0) return true;
      }
    }

    // Check for adjacent equal numbers
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = currentGrid[i][j];
        // Check right
        if (j < GRID_SIZE - 1 && current === currentGrid[i][j + 1]) return true;
        // Check down
        if (i < GRID_SIZE - 1 && current === currentGrid[i + 1][j]) return true;
      }
    }

    return false;
  }, []);

  // Check for game over after each move
  useEffect(() => {
    if (!hasValidMoves(grid)) {
      setGameOver(true);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [grid, hasValidMoves]);

  useEffect(() => {
    initializeGrid();
  }, []);

  // Debounce score updates with proper dependencies
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

  const initializeGrid = () => {
    const newGrid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    addNewTile(newGrid);
    addNewTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const addNewTile = (currentGrid: number[][]) => {
    const available = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentGrid[i][j] === 0) {
          available.push({ x: i, y: j });
        }
      }
    }
    
    if (available.length > 0) {
      const randomCell = available[Math.floor(Math.random() * available.length)];
      currentGrid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
      
      // Animate new tile
      animations[randomCell.x][randomCell.y].setValue(0);
      Animated.spring(animations[randomCell.x][randomCell.y], {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const moveLeft = () => {
    const newGrid = grid.map(row => {
      // First filter out zeros and create a new array
      const merged = row.filter(cell => cell !== 0);
      const result = [];
      
      // Iterate through the filtered array to merge pairs
      for (let i = 0; i < merged.length; i++) {
        if (i < merged.length - 1 && merged[i] === merged[i + 1]) {
          // Merge equal adjacent numbers
          result.push(merged[i] * 2);
          setScore(prev => prev + merged[i] * 2);
          i++; // Skip next number since we merged it
        } else {
          result.push(merged[i]);
        }
      }
      
      // Fill the remaining space with zeros
      return [...result, ...Array(GRID_SIZE - result.length).fill(0)];
    });
    
    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      setGrid(newGrid);
      addNewTile(newGrid);
    }
  };

  const moveRight = () => {
    const newGrid = grid.map(row => {
      // First filter out zeros and create a new array
      const merged = row.filter(cell => cell !== 0);
      const result = [];
      
      // Iterate through the filtered array to merge pairs (from right to left)
      for (let i = merged.length - 1; i >= 0; i--) {
        if (i > 0 && merged[i] === merged[i - 1]) {
          // Merge equal adjacent numbers
          result.unshift(merged[i] * 2);
          setScore(prev => prev + merged[i] * 2);
          i--; // Skip next number since we merged it
        } else {
          result.unshift(merged[i]);
        }
      }
      
      // Fill the remaining space with zeros
      return [...Array(GRID_SIZE - result.length).fill(0), ...result];
    });
    
    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      setGrid(newGrid);
      addNewTile(newGrid);
    }
  };

  const moveUp = () => {
    const rotated = rotateGrid(grid);
    const moved = rotated.map(row => {
      // First filter out zeros and create a new array
      const merged = row.filter(cell => cell !== 0);
      const result = [];
      
      // Iterate through the filtered array to merge pairs
      for (let i = 0; i < merged.length; i++) {
        if (i < merged.length - 1 && merged[i] === merged[i + 1]) {
          // Merge equal adjacent numbers
          result.push(merged[i] * 2);
          setScore(prev => prev + merged[i] * 2);
          i++; // Skip next number since we merged it
        } else {
          result.push(merged[i]);
        }
      }
      
      // Fill the remaining space with zeros
      return [...result, ...Array(GRID_SIZE - result.length).fill(0)];
    });
    const newGrid = rotateGrid(moved, 3);
    
    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      setGrid(newGrid);
      addNewTile(newGrid);
    }
  };

  const moveDown = () => {
    const rotated = rotateGrid(grid);
    const moved = rotated.map(row => {
      // First filter out zeros and create a new array
      const merged = row.filter(cell => cell !== 0);
      const result = [];
      
      // Iterate through the filtered array to merge pairs (from bottom to top)
      for (let i = merged.length - 1; i >= 0; i--) {
        if (i > 0 && merged[i] === merged[i - 1]) {
          // Merge equal adjacent numbers
          result.unshift(merged[i] * 2);
          setScore(prev => prev + merged[i] * 2);
          i--; // Skip next number since we merged it
        } else {
          result.unshift(merged[i]);
        }
      }
      
      // Fill the remaining space with zeros
      return [...Array(GRID_SIZE - result.length).fill(0), ...result];
    });
    const newGrid = rotateGrid(moved, 3);
    
    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      setGrid(newGrid);
      addNewTile(newGrid);
    }
  };

  const rotateGrid = (grid: number[][], times: number = 1) => {
    let newGrid = [...grid];
    for (let i = 0; i < times; i++) {
      newGrid = newGrid[0].map((_, index) =>
        newGrid.map(row => row[index]).reverse()
      );
    }
    return newGrid;
  };

  const renderCell = (value: number, row: number, col: number) => {
    const backgroundColor = value ? CELL_COLORS[value as keyof typeof CELL_COLORS] : colors.card;
    const textColor = value ? CELL_TEXT_COLORS[value as keyof typeof CELL_TEXT_COLORS] : colors.text;
    
    return (
      <Animated.View
        style={[
          styles.cellContainer,
          {
            transform: [{ scale: animations[row][col] }],
          },
        ]}
      >
        <View
          style={[
            styles.cell,
            { backgroundColor },
          ]}
        >
          {value > 0 && (
            <Text style={[styles.cellText, { color: textColor }]}>
              {value}
            </Text>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>2048</Text>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.card }]}
          onPress={initializeGrid}
        >
          <RefreshCw size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View 
        style={[styles.grid, { borderColor: colors.border }]}
        {...panResponder.panHandlers}
      >
        {grid.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((cell, colIndex) => (
              <React.Fragment key={`cell-${rowIndex}-${colIndex}`}>
                {renderCell(cell, rowIndex, colIndex)}
              </React.Fragment>
            ))}
          </View>
        ))}
      </View>

      {gameOver && (
        <View style={[styles.gameOverContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.gameOverText, { color: colors.text }]}>Game Over!</Text>
          <Text style={[styles.scoreText, { color: colors.text }]}>Score: {score}</Text>
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: colors.primary, padding: 12, marginTop: 16 }]}
            onPress={initializeGrid}
          >
            <Text style={[styles.resetButtonText, { color: 'white' }]}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.instructions}>
        <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
          Swipe to merge tiles with the same number
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: Math.min(24, SCREEN_WIDTH * 0.06),
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  grid: {
    alignSelf: "center",
    padding: 8,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  row: {
    flexDirection: "row",
  },
  cellContainer: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    padding: 4,
  },
  cell: {
    flex: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cellText: {
    fontFamily: "Poppins-Bold",
    fontSize: CELL_SIZE / 3,
  },
  instructions: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  instructionsText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
  },
  gameOverContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 10,
  },
  gameOverText: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    marginBottom: 16,
    textAlign: "center",
  },
  scoreText: {
    fontFamily: "Poppins-Regular",
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  resetButtonText: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
  },
});