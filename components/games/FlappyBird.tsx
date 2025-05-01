import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  useColorScheme,
} from "react-native";
import { theme } from "@/constants/theme";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");
const BIRD_SIZE = 20;
const PIPE_WIDTH = 60;
const PIPE_GAP = 200;
const GRAVITY = 0.4;  // Reduced from 0.6 for slower falling
const JUMP_VELOCITY = -8;  // Slightly reduced to match new gravity
const PIPE_SPEED = 3;
const MAX_VELOCITY = 12;  // Reduced from 15 to match new gravity
const PHYSICS_UPDATE_RATE = 33;  // ~30fps for smoother motion

interface FlappyBirdProps {
  onScoreChange: (score: number) => void;
}

const generatePipes = () => {
  const topHeight = Math.random() * (WINDOW_HEIGHT - PIPE_GAP - 100) + 50;
  return {
    top: topHeight,
    bottom: topHeight + PIPE_GAP,
  };
};

export default function FlappyBird({ onScoreChange }: FlappyBirdProps) {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const birdPosition = useRef(new Animated.Value(WINDOW_HEIGHT / 2)).current;
  const pipeX = useRef(new Animated.Value(WINDOW_WIDTH)).current;
  const currentBirdY = useRef(WINDOW_HEIGHT / 2);
  const currentPipeX = useRef(WINDOW_WIDTH);
  const birdVelocity = useRef(0);
  const physicsInterval = useRef<number>();
  const pipeInterval = useRef<number>();
  const pipes = useRef<{ top: number; bottom: number }>(generatePipes());

  useEffect(() => {
    const birdListener = birdPosition.addListener(({ value }) => {
      currentBirdY.current = value;
    });
    const pipeListener = pipeX.addListener(({ value }) => {
      currentPipeX.current = value;
    });

    return () => {
      birdPosition.removeListener(birdListener);
      pipeX.removeListener(pipeListener);
      stopGameLoop();
    };
  }, []);

  useEffect(() => {
    if (isGameStarted && !gameOver) {
      startGameLoop();
    }
    return () => stopGameLoop();
  }, [isGameStarted, gameOver]);

  const startGameLoop = () => {
    stopGameLoop();

    // Combined physics and game loop for smoother motion
    physicsInterval.current = window.setInterval(() => {
      if (!gameOver) {
        // Apply gravity to velocity with clamping
        birdVelocity.current = Math.min(
          birdVelocity.current + GRAVITY,
          MAX_VELOCITY
        );
        
        // Update bird position based on velocity
        const newPosition = Math.max(0, Math.min(
          currentBirdY.current + birdVelocity.current,
          WINDOW_HEIGHT - BIRD_SIZE
        ));
        
        // If bird hits boundaries, stop vertical momentum
        if (newPosition === 0 || newPosition === WINDOW_HEIGHT - BIRD_SIZE) {
          birdVelocity.current = 0;
        }
        
        currentBirdY.current = newPosition;
        birdPosition.setValue(newPosition);

        // Check collisions
        if (checkCollision(newPosition, currentPipeX.current)) {
          handleGameOver();
          return;
        }
      }
    }, PHYSICS_UPDATE_RATE);

    // Separate pipe movement loop
    pipeInterval.current = window.setInterval(() => {
      if (!gameOver) {
        const newPipeX = currentPipeX.current - PIPE_SPEED;
        
        if (newPipeX <= -PIPE_WIDTH) {
          currentPipeX.current = WINDOW_WIDTH;
          pipeX.setValue(WINDOW_WIDTH);
          pipes.current = generatePipes();
          setScore(prev => prev + 1);
        } else {
          currentPipeX.current = newPipeX;
          pipeX.setValue(newPipeX);
        }
      }
    }, PHYSICS_UPDATE_RATE);
  };

  const stopGameLoop = () => {
    if (physicsInterval.current) {
      clearInterval(physicsInterval.current);
      physicsInterval.current = undefined;
    }
    if (pipeInterval.current) {
      clearInterval(pipeInterval.current);
      pipeInterval.current = undefined;
    }
  };

  const handleTap = () => {
    if (gameOver) {
      resetGame();
      return;
    }
    
    if (!isGameStarted) {
      setIsGameStarted(true);
    }
    
    // Only update velocity on tap, don't set position directly
    birdVelocity.current = JUMP_VELOCITY;
  };

  const handleGameOver = () => {
    setGameOver(true);
    stopGameLoop();
  };

  const resetGame = () => {
    stopGameLoop();
    setScore(0);
    setGameOver(false);
    setIsGameStarted(false);
    birdVelocity.current = 0;
    currentBirdY.current = WINDOW_HEIGHT / 2;
    birdPosition.setValue(WINDOW_HEIGHT / 2);
    currentPipeX.current = WINDOW_WIDTH;
    pipeX.setValue(WINDOW_WIDTH);
    pipes.current = generatePipes();
  };

  const checkCollision = (birdY: number, pipeXPosition: number) => {
    // Ground collision - bird's bottom edge hits the ground
    if (birdY + BIRD_SIZE >= WINDOW_HEIGHT) {
      return true;
    }

    // Pipe collision
    // Only check collision if bird is within pipe's horizontal bounds
    const birdLeft = WINDOW_WIDTH / 4;  // Bird's x position
    const birdRight = birdLeft + BIRD_SIZE;
    const pipeLeft = pipeXPosition;
    const pipeRight = pipeXPosition + PIPE_WIDTH;

    // Check if bird overlaps horizontally with pipe
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      // Check vertical collision with top pipe
      if (birdY < pipes.current.top) {
        return true;
      }
      
      // Check vertical collision with bottom pipe
      if (birdY + BIRD_SIZE > pipes.current.bottom) {
        return true;
      }
    }

    return false;
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.score, { color: colors.text }]}>{score}</Text>

        <View style={styles.gameContainer}>
          {/* Top Pipe */}
          <Animated.View
            style={[
              styles.pipe,
              {
                height: pipes.current.top,
                borderColor: colors.primary,
                transform: [{ translateX: pipeX }],
              },
            ]}
          />

          {/* Bottom Pipe */}
          <Animated.View
            style={[
              styles.pipe,
              {
                top: pipes.current.bottom,
                height: WINDOW_HEIGHT - pipes.current.bottom,
                borderColor: colors.primary,
                transform: [{ translateX: pipeX }],
              },
            ]}
          />

          {/* Bird */}
          <Animated.View
            style={[
              styles.bird,
              {
                backgroundColor: colors.primary,
                transform: [{ translateY: birdPosition }],
              },
            ]}
          />
        </View>

        {!isGameStarted && (
          <View style={styles.startPrompt}>
            <Text style={[styles.startText, { color: colors.text }]}>
              Tap to Start
            </Text>
            <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
              Tap the screen to make the bird jump.
              Avoid hitting pipes and the ground!
            </Text>
          </View>
        )}

        {gameOver && (
          <View style={styles.gameOverContainer}>
            <Text style={[styles.gameOverText, { color: colors.text }]}>
              Game Over!
            </Text>
            <Text style={[styles.finalScore, { color: colors.text }]}>
              Score: {score}
            </Text>
            <Text style={[styles.restartText, { color: colors.textSecondary }]}>
              Tap to Play Again
            </Text>
          </View>
        )}

        {isGameStarted && !gameOver && (
          <View style={styles.instructions}>
            <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
              Keep tapping to stay airborne!
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameContainer: {
    flex: 1,
    position: "relative",
  },
  bird: {
    position: "absolute",
    left: WINDOW_WIDTH / 4,
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    borderRadius: BIRD_SIZE / 2,
  },
  pipe: {
    position: "absolute",
    width: PIPE_WIDTH,
    backgroundColor: "transparent",
    borderWidth: 3,
  },
  score: {
    position: "absolute",
    top: 50,
    width: WINDOW_WIDTH,
    textAlign: "center",
    fontSize: 40,
    fontFamily: "Poppins-Bold",
    zIndex: 1,
  },
  startText: {
    position: "absolute",
    bottom: 100,
    width: WINDOW_WIDTH,
    textAlign: "center",
    fontSize: 24,
    fontFamily: "Poppins-Bold",
  },
  gameOverContainer: {
    position: "absolute",
    top: WINDOW_HEIGHT / 2 - 80,
    width: WINDOW_WIDTH,
    alignItems: "center",
  },
  gameOverText: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    marginBottom: 10,
  },
  finalScore: {
    fontSize: 24,
    fontFamily: "Poppins-Medium",
    marginBottom: 20,
  },
  restartText: {
    fontSize: 20,
    fontFamily: "Poppins-Regular",
  },
  instructions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  startPrompt: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    marginTop: -60,
  },
});