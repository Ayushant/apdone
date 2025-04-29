import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import { RefreshCw } from "lucide-react-native";
import { theme } from "@/constants/theme";

interface CheckersProps {
  onScoreChange: (score: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 32, 360);
const CELL_SIZE = BOARD_SIZE / 8;

type Piece = {
  isKing: boolean;
  isPlayer: boolean;
} | null;

type Position = {
  row: number;
  col: number;
};

export default function Checkers({ onScoreChange }: CheckersProps) {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];

  const [board, setBoard] = useState<(Piece | null)[][]>([]);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [animations] = useState(
    Array(8).fill(0).map(() => 
      Array(8).fill(0).map(() => new Animated.Value(1))
    )
  );

  useEffect(() => {
    initializeBoard();
  }, []);

  useEffect(() => {
    onScoreChange(score);
  }, [score, onScoreChange]);

  const initializeBoard = () => {
    const newBoard: (Piece | null)[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Place player's pieces (bottom)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { isKing: false, isPlayer: true };
        }
      }
    }

    // Place computer's pieces (top)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { isKing: false, isPlayer: false };
        }
      }
    }

    setBoard(newBoard);
    setSelectedPiece(null);
    setValidMoves([]);
    setGameOver(false);
    setIsPlayerTurn(true);
    setScore(0);
  };

  const getValidMoves = (row: number, col: number): Position[] => {
    const piece = board[row][col];
    if (!piece) return [];

    const moves: Position[] = [];
    const directions = piece.isKing ? [-1, 1] : piece.isPlayer ? [-1] : [1];

    directions.forEach(rowDir => {
      [-1, 1].forEach(colDir => {
        // Regular move
        const newRow = row + rowDir;
        const newCol = col + colDir;
        if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
          moves.push({ row: newRow, col: newCol });
        }

        // Jump move
        const jumpRow = row + rowDir * 2;
        const jumpCol = col + colDir * 2;
        if (
          isValidPosition(jumpRow, jumpCol) &&
          !board[jumpRow][jumpCol] &&
          board[newRow][newCol] &&
          board[newRow][newCol]?.isPlayer !== piece.isPlayer
        ) {
          moves.push({ row: jumpRow, col: jumpCol });
        }
      });
    });

    return moves;
  };

  const isValidPosition = (row: number, col: number): boolean => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };

  const handlePiecePress = (row: number, col: number) => {
    if (!isPlayerTurn || gameOver) return;

    const piece = board[row][col];
    if (piece?.isPlayer) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setSelectedPiece({ row, col });
      setValidMoves(getValidMoves(row, col));
      animatePiece(row, col);
    } else if (selectedPiece && validMoves.some(move => move.row === row && move.col === col)) {
      movePiece(selectedPiece, { row, col });
    }
  };

  const animatePiece = (row: number, col: number) => {
    Animated.sequence([
      Animated.timing(animations[row][col], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animations[row][col], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const movePiece = (from: Position, to: Position) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const newBoard = board.map(row => [...row]);
    const piece = { ...newBoard[from.row][from.col]! };
    
    // Check if piece becomes king
    if ((piece.isPlayer && to.row === 0) || (!piece.isPlayer && to.row === 7)) {
      piece.isKing = true;
    }

    newBoard[from.row][from.col] = null;
    newBoard[to.row][to.col] = piece;

    // Handle jumps (captures)
    if (Math.abs(from.row - to.row) === 2) {
      const capturedRow = (from.row + to.row) / 2;
      const capturedCol = (from.col + to.col) / 2;
      newBoard[capturedRow][capturedCol] = null;
      
      if (piece.isPlayer) {
        setScore(prev => prev + 10);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }

    setBoard(newBoard);
    setSelectedPiece(null);
    setValidMoves([]);

    // Check for game over
    const remainingComputer = newBoard.flat().filter(p => p && !p.isPlayer).length;
    const remainingPlayer = newBoard.flat().filter(p => p?.isPlayer).length;

    if (remainingComputer === 0) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setScore(prev => prev + 50); // Bonus for winning
      setGameOver(true);
    } else if (remainingPlayer === 0) {
      setGameOver(true);
    } else {
      if (piece.isPlayer) {
        setIsPlayerTurn(false);
        // Computer's turn
        setTimeout(() => {
          makeComputerMove(newBoard);
        }, 500);
      } else {
        setIsPlayerTurn(true);
      }
    }
  };

  const makeComputerMove = (currentBoard: (Piece | null)[][]) => {
    // Find all computer pieces and their possible moves
    const moves: { from: Position; to: Position; isJump: boolean }[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = currentBoard[row][col];
        if (piece && !piece.isPlayer) {
          getValidMoves(row, col).forEach(move => {
            moves.push({ 
              from: { row, col }, 
              to: move,
              isJump: Math.abs(row - move.row) === 2
            });
          });
        }
      }
    }

    // Prioritize jumps (captures)
    const jumps = moves.filter(move => move.isJump);

    if (moves.length > 0) {
      const availableMoves = jumps.length > 0 ? jumps : moves;
      const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      movePiece(move.from, move.to);
    } else {
      setGameOver(true);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setScore(prev => prev + 50); // Player wins if computer has no moves
    }
  };

  const renderCell = (row: number, col: number) => {
    const piece = board[row][col];
    const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;
    const isValidMove = validMoves.some(move => move.row === row && move.col === col);
    const isDarkSquare = (row + col) % 2 === 1;

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          {
            backgroundColor: isDarkSquare 
              ? isValidMove 
                ? colors.primaryLight 
                : colors.card
              : colors.background,
          },
        ]}
        onPress={() => handlePiecePress(row, col)}
        disabled={!isDarkSquare || gameOver}
      >
        {piece && (
          <Animated.View
            style={[
              styles.piece,
              {
                backgroundColor: piece.isPlayer ? colors.primary : "#F59E0B", // Using amber color for opponent pieces
                transform: [{ scale: animations[row][col] }],
              },
            ]}
          >
            {piece.isKing && (
              <View style={[styles.crown, { borderBottomColor: "#FFD700" }]} />
            )}
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Checkers</Text>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.card }]}
          onPress={initializeBoard}
        >
          <RefreshCw size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.board, { backgroundColor: colors.border }]}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </View>
        ))}
      </View>

      <Text style={[styles.instructions, { color: colors.textSecondary }]}>
        {gameOver
          ? "Game Over! " + (score > 0 ? "You win!" : "Computer wins!")
          : isPlayerTurn
          ? "Your turn - tap a piece to move"
          : "Computer is thinking..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
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
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    padding: 4,
    borderRadius: 8,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 1,
    borderRadius: 2,
  },
  piece: {
    width: CELL_SIZE * 0.8,
    height: CELL_SIZE * 0.8,
    borderRadius: CELL_SIZE * 0.4,
    justifyContent: "center",
    alignItems: "center",
  },
  crown: {
    width: CELL_SIZE * 0.4,
    height: CELL_SIZE * 0.2,
    borderLeftWidth: CELL_SIZE * 0.2,
    borderRightWidth: CELL_SIZE * 0.2,
    borderBottomWidth: CELL_SIZE * 0.2,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  instructions: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    marginTop: 16,
    textAlign: "center",
  },
});