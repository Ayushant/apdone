import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Platform,
  PanResponder,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import { RefreshCw } from "lucide-react-native";
import { theme } from "../../constants/theme";

interface BlockPuzzleProps {
  onScoreChange: (score: number) => void;
}

const GRID_SIZE = 12; // Increased height for falling blocks
const GRID_WIDTH = 8;
const { width } = Dimensions.get("window");
const CELL_SIZE = Math.min(width - 32, 360) / GRID_WIDTH;
const FALL_SPEED = 1000; // 1 second per block fall

// Tetris-like block shapes
const BLOCKS = [
  // I blocks
  [[1], [1], [1], [1]],
  [[1, 1, 1, 1]],
  
  // L blocks
  [[1, 0], [1, 0], [1, 1]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1], [0, 1], [0, 1]],
  [[0, 0, 1], [1, 1, 1]],
  
  // Square block
  [[1, 1], [1, 1]],
  
  // T block
  [[1, 1, 1], [0, 1, 0]],
  [[0, 1], [1, 1], [0, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0], [1, 1], [1, 0]],
  
  // Z blocks
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1], [1, 1], [1, 0]],
  
  // S blocks
  [[0, 1, 1], [1, 1, 0]],
  [[1, 0], [1, 1], [0, 1]],
];

export default function BlockPuzzle({ onScoreChange }: BlockPuzzleProps) {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState<number[][]>(
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_WIDTH).fill(0))
  );
  const [currentBlock, setCurrentBlock] = useState<number[][]>([]);
  const [currentPosition, setCurrentPosition] = useState<{ row: number, col: number } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [nextBlock, setNextBlock] = useState<number[][]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition] = useState(new Animated.ValueXY());
  const [lastValidPosition, setLastValidPosition] = useState<{ row: number, col: number } | null>(null);

  // Pan Responder setup for drag gestures
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        if (currentPosition) {
          setLastValidPosition(currentPosition);
        }
      },
      onPanResponderMove: (_, gesture) => {
        if (!currentBlock || !currentPosition) return;

        const newCol = Math.round(gesture.dx / CELL_SIZE) + lastValidPosition!.col;
        const newRow = Math.round(gesture.dy / CELL_SIZE) + lastValidPosition!.row;

        // Check if new position is valid
        if (canPlaceBlock(newRow, newCol, currentBlock)) {
          setCurrentPosition({ row: newRow, col: newCol });
          dragPosition.setValue({ x: gesture.dx, y: gesture.dy });
        }
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        dragPosition.setValue({ x: 0, y: 0 });
        // Check if we need to lock the block
        if (currentPosition && !canPlaceBlock(currentPosition.row + 1, currentPosition.col, currentBlock)) {
          lockBlock();
        }
      },
    })
  ).current;

  useEffect(() => {
    generateNewBlock();
  }, []);
  
  useEffect(() => {
    onScoreChange(score);
  }, [score, onScoreChange]);

  // Falling block logic
  useEffect(() => {
    if (gameOver || !currentBlock || !currentPosition) return;

    const fallInterval = setInterval(() => {
      moveBlock("down");
    }, FALL_SPEED);

    return () => clearInterval(fallInterval);
  }, [currentBlock, currentPosition, gameOver]);

  const generateNewBlock = () => {
    const block = nextBlock.length ? nextBlock : BLOCKS[Math.floor(Math.random() * BLOCKS.length)];
    const nextRandomBlock = BLOCKS[Math.floor(Math.random() * BLOCKS.length)];
    
    // Place new block at the top center
    const startCol = Math.floor((GRID_WIDTH - block[0].length) / 2);
    const startRow = 0;
    
    if (!canPlaceBlock(startRow, startCol, block)) {
      setGameOver(true);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }
    
    setCurrentBlock(block);
    setNextBlock(nextRandomBlock);
    setCurrentPosition({ row: startRow, col: startCol });
  };

  const moveBlock = (direction: "left" | "right" | "down") => {
    if (!currentBlock || !currentPosition || gameOver || isDragging) return;

    const { row, col } = currentPosition;
    let newRow = row;
    let newCol = col;

    switch (direction) {
      case "left":
        newCol = col - 1;
        break;
      case "right":
        newCol = col + 1;
        break;
      case "down":
        newRow = row + 1;
        break;
    }

    if (canPlaceBlock(newRow, newCol, currentBlock)) {
      setCurrentPosition({ row: newRow, col: newCol });
    } else if (direction === "down") {
      // Block has reached bottom or collision
      lockBlock();
    }
  };

  const rotateBlock = () => {
    if (!currentBlock || !currentPosition || gameOver) return;

    const rotated = currentBlock[0].map((_, i) =>
      currentBlock.map(row => row[i]).reverse()
    );

    if (canPlaceBlock(currentPosition.row, currentPosition.col, rotated)) {
      setCurrentBlock(rotated);
    }
  };

  const canPlaceBlock = (rowStart: number, colStart: number, block: number[][]) => {
    if (!block) return false;
    
    for (let i = 0; i < block.length; i++) {
      for (let j = 0; j < block[i].length; j++) {
        if (block[i][j] === 1) {
          const newRow = rowStart + i;
          const newCol = colStart + j;
          
          if (
            newRow < 0 ||
            newRow >= GRID_SIZE ||
            newCol < 0 ||
            newCol >= GRID_WIDTH ||
            grid[newRow][newCol] === 1
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const lockBlock = () => {
    if (!currentBlock || !currentPosition) return;
    
    const newGrid = grid.map(row => [...row]);
    
    // Place the block in its current position
    for (let i = 0; i < currentBlock.length; i++) {
      for (let j = 0; j < currentBlock[i].length; j++) {
        if (currentBlock[i][j] === 1) {
          const row = currentPosition.row + i;
          const col = currentPosition.col + j;
          if (row >= 0 && row < GRID_SIZE) {
            newGrid[row][col] = 1;
          }
        }
      }
    }
    
    // Calculate score - 1 point per cell
    const blockSize = currentBlock.flat().filter(cell => cell === 1).length;
    setScore(prevScore => prevScore + blockSize);
    
    // Check for completed rows
    let completedRows = 0;
    const updatedGrid = newGrid.filter((row) => {
      const isComplete = row.every(cell => cell === 1);
      if (isComplete) completedRows++;
      return !isComplete;
    });
    
    // Add new empty rows at the top
    while (updatedGrid.length < GRID_SIZE) {
      updatedGrid.unshift(Array(GRID_WIDTH).fill(0));
    }
    
    if (completedRows > 0) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // Bonus points for completed rows
      const bonus = completedRows * 20;
      setScore(prevScore => prevScore + bonus);
    }
    
    setGrid(updatedGrid);
    generateNewBlock();
  };

  const resetGame = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setGrid(Array(GRID_SIZE).fill(0).map(() => Array(GRID_WIDTH).fill(0)));
    setScore(0);
    setGameOver(false);
    setCurrentPosition(null);
    generateNewBlock();
  };

  const renderGrid = () => {
    const gridWithCurrentBlock = grid.map(row => [...row]);
    
    // Add current falling block to the grid preview
    if (currentBlock && currentPosition) {
      for (let i = 0; i < currentBlock.length; i++) {
        for (let j = 0; j < currentBlock[i].length; j++) {
          if (currentBlock[i][j] === 1) {
            const row = currentPosition.row + i;
            const col = currentPosition.col + j;
            if (row >= 0 && row < GRID_SIZE) {
              gridWithCurrentBlock[row][col] = 2; // 2 represents the falling block
            }
          }
        }
      }
    }

    return (
      <View style={[styles.grid, { borderColor: colors.border }]} {...panResponder.panHandlers}>
        {gridWithCurrentBlock.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((cell, colIndex) => (
              <View
                key={`cell-${rowIndex}-${colIndex}`}
                style={[
                  styles.cell,
                  {
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: 
                      cell === 2 ? colors.primary + (isDragging ? '40' : '80') :
                      cell === 1 ? colors.primary :
                      colors.card,
                    borderColor: colors.border,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderBlock = (block: number[][], preview: boolean = false) => {
    if (!block) return null;
    
    return (
      <View style={styles.blockContainer}>
        {preview && (
          <Text style={[styles.blockTitle, { color: colors.text }]}>
            Next Block:
          </Text>
        )}
        <View style={[
          styles.block,
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }
        ]}>
          {block.map((row, rowIndex) => (
            <View key={`block-row-${rowIndex}`} style={styles.blockRow}>
              {row.map((cell, colIndex) => (
                <View
                  key={`block-cell-${rowIndex}-${colIndex}`}
                  style={[
                    styles.blockCell,
                    {
                      width: CELL_SIZE * 0.6,
                      height: CELL_SIZE * 0.6,
                      backgroundColor: cell === 1 ? colors.primary : "transparent",
                      borderColor: cell === 1 ? colors.primary : "transparent",
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderControls = () => {
    return (
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.card }]}
          onPress={() => moveBlock("left")}
          disabled={gameOver}
        >
          <Text style={[styles.controlText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.card }]}
          onPress={() => moveBlock("down")}
          disabled={gameOver}
        >
          <Text style={[styles.controlText, { color: colors.text }]}>↓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.card }]}
          onPress={() => moveBlock("right")}
          disabled={gameOver}
        >
          <Text style={[styles.controlText, { color: colors.text }]}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.card }]}
          onPress={rotateBlock}
          disabled={gameOver}
        >
          <Text style={[styles.controlText, { color: colors.text }]}>↻</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Block Puzzle</Text>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.card }]}
          onPress={resetGame}
        >
          <RefreshCw size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {gameOver ? (
        <View style={styles.gameOverContainer}>
          <Text style={[styles.gameOverText, { color: colors.text }]}>Game Over!</Text>
          <Text style={[styles.scoreText, { color: colors.text }]}>Final Score: {score}</Text>
        </View>
      ) : (
        <>
          <View style={styles.gameContainer}>
            <View style={styles.nextBlockContainer}>
              {renderBlock(nextBlock, true)}
            </View>
            {renderGrid()}
          </View>
          {!isDragging && renderControls()}
          <Text style={[styles.instructions, { color: colors.textSecondary }]}>
            Drag blocks to position them or use controls to move and rotate
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
  },
  gameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  nextBlockContainer: {
    marginRight: 16,
  },
  blockContainer: {
    alignItems: 'center',
  },
  blockTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  block: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  blockRow: {
    flexDirection: 'row',
  },
  blockCell: {
    margin: 1,
    borderWidth: 1,
  },
  grid: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    margin: 1,
    borderWidth: 1,
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginHorizontal: 8,
  },
  controlText: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 24,
    fontFamily: 'Poppins-Medium',
  },
  instructions: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});