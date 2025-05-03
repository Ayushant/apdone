import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Platform,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import { RefreshCw } from "lucide-react-native";
import { theme } from "@/constants/theme";

interface TicTacToeProps {
  onScoreChange: (score: number) => void;
}

export default function TicTacToe({ onScoreChange }: TicTacToeProps) {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [cellScales] = useState(Array(9).fill(0).map(() => new Animated.Value(1)));
  const prevScoreRef = useRef(0);
  
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

  const animateCell = (index: number) => {
    Animated.sequence([
      Animated.timing(cellScales[index], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cellScales[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = (index: number) => {
    if (board[index] || gameOver || !isXNext) return;
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    animateCell(index);
    
    const newBoard = [...board];
    newBoard[index] = "X";  // Player is always X
    setBoard(newBoard);
    setIsXNext(false);
    
    const result = checkWinner(newBoard);
    if (result.winner) {
      handleWin(result.winner, result.line);
    } else if (!newBoard.includes(null)) {
      handleDraw();
    } else {
      // Computer's turn
      setTimeout(() => {
        makeComputerMove(newBoard);
      }, 500);
    }
  };

  const makeComputerMove = (currentBoard: Array<string | null>) => {
    if (gameOver) return;
    
    let moveIndex = -1;
    
    // Try to win
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const testBoard = [...currentBoard];
        testBoard[i] = "O";
        if (checkWinner(testBoard).winner === "O") {
          moveIndex = i;
          break;
        }
      }
    }
    
    // Block player's winning move
    if (moveIndex === -1) {
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          const testBoard = [...currentBoard];
          testBoard[i] = "X";
          if (checkWinner(testBoard).winner === "X") {
            moveIndex = i;
            break;
          }
        }
      }
    }
    
    // Try to take center
    if (moveIndex === -1 && !currentBoard[4]) {
      moveIndex = 4;
    }
    
    // Try to take corners
    if (moveIndex === -1) {
      const corners = [0, 2, 6, 8];
      const emptyCorners = corners.filter(i => !currentBoard[i]);
      if (emptyCorners.length > 0) {
        moveIndex = emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
      }
    }
    
    // Take any available side
    if (moveIndex === -1) {
      const sides = [1, 3, 5, 7];
      const emptySides = sides.filter(i => !currentBoard[i]);
      if (emptySides.length > 0) {
        moveIndex = emptySides[Math.floor(Math.random() * emptySides.length)];
      }
    }

    if (moveIndex !== -1) {
      animateCell(moveIndex);
      const newBoard = [...currentBoard];
      newBoard[moveIndex] = "O";
      setBoard(newBoard);
      
      const result = checkWinner(newBoard);
      if (result.winner) {
        handleWin(result.winner, result.line);
      } else if (!newBoard.includes(null)) {
        handleDraw();
      } else {
        setIsXNext(true);
      }
    }
  };

  const checkWinner = (squares: Array<string | null>) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return { winner: null, line: null };
  };

  const handleWin = (winner: string, line: number[]) => {
    if (winner === "X") {
      // Player wins
      const newScore = score + 10;
      setScore(newScore);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setTimeout(() => {
        Platform.OS === "web" 
          ? alert("You win! +10 points")
          : Alert.alert("You win!", "+10 points");
      }, 300);
    } else {
      // Computer wins
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setTimeout(() => {
        Platform.OS === "web"
          ? alert("Computer wins!")
          : Alert.alert("Computer wins!");
      }, 300);
    }
    setWinningLine(line);
    setGameOver(true);
  };

  const handleDraw = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setTimeout(() => {
      Platform.OS === "web"
        ? alert("It's a draw!")
        : Alert.alert("It's a draw!");
    }, 300);
    setGameOver(true);
  };

  const resetGame = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setWinningLine(null);
  };

  const renderCell = (index: number) => {
    const isWinningCell = winningLine?.includes(index);
    
    return (
      <Animated.View
        style={[
          styles.cellContainer,
          { transform: [{ scale: cellScales[index] }] }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.cell,
            { 
              backgroundColor: isWinningCell ? colors.primaryLight : colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => handlePress(index)}
          disabled={board[index] !== null || gameOver || !isXNext}
        >
          {board[index] && (
            <Text 
              style={[
                styles.cellText, 
                { 
                  color: board[index] === "X" ? colors.primary : "#F59E0B",
                  opacity: isWinningCell ? 1 : 0.8,
                }
              ]}
            >
              {board[index]}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={[styles.infoText, { color: colors.text }]}>
          {gameOver 
            ? "Game Over" 
            : isXNext 
              ? "Your Turn (X)" 
              : "Computer's Turn (O)"}
        </Text>
        <TouchableOpacity 
          style={[styles.resetButton, { backgroundColor: colors.card }]}
          onPress={resetGame}
        >
          <RefreshCw size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.board}>
        <View style={styles.row}>
          {renderCell(0)}
          {renderCell(1)}
          {renderCell(2)}
        </View>
        <View style={styles.row}>
          {renderCell(3)}
          {renderCell(4)}
          {renderCell(5)}
        </View>
        <View style={styles.row}>
          {renderCell(6)}
          {renderCell(7)}
          {renderCell(8)}
        </View>
      </View>
      
      <View style={styles.instructions}>
        <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
          Get three in a row to win. You are X, computer is O.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  infoText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  board: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 320,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  cellContainer: {
    flex: 1,
    padding: 4,
  },
  cell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  cellText: {
    fontFamily: "Poppins-Bold",
    fontSize: 40,
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
});