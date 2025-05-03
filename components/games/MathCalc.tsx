import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import { RefreshCw, Clock } from "lucide-react-native";
import { theme } from "@/constants/theme";

interface MathCalcProps {
  onScoreChange: (score: number) => void;
}

type Operation = '+' | '-' | 'x' | '÷';
type Problem = {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
};

const TIME_LIMIT = 60;
const MAX_NUMBER = 12;

export default function MathCalc({ onScoreChange }: MathCalcProps) {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const prevScoreRef = useRef(0);
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [options, setOptions] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [buttonScales] = useState(() => 
    Array(4).fill(0).map(() => new Animated.Value(1))
  );

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

  const generateProblem = useCallback(() => {
    const operations: Operation[] = ['+', '-', 'x', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1: number, num2: number, answer: number;

    switch (operation) {
      case '÷':
        num2 = Math.floor(Math.random() * (MAX_NUMBER - 1)) + 1;
        answer = Math.floor(Math.random() * MAX_NUMBER) + 1;
        num1 = num2 * answer;
        break;
      case 'x':
        num1 = Math.floor(Math.random() * MAX_NUMBER) + 1;
        num2 = Math.floor(Math.random() * MAX_NUMBER) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = Math.floor(Math.random() * MAX_NUMBER * 2) + 1;
        num2 = Math.floor(Math.random() * MAX_NUMBER) + 1;
        answer = operation === '+' ? num1 + num2 : num1 - num2;
    }

    const newProblem = { num1, num2, operation, answer };
    
    // Generate wrong options
    const wrongOptions: number[] = [];
    const offset = Math.floor(answer / 2);
    while (wrongOptions.length < 3) {
      const wrongAnswer = answer + (Math.random() < 0.5 ? -1 : 1) * 
        (Math.floor(Math.random() * offset) + 1);
      if (!wrongOptions.includes(wrongAnswer) && wrongAnswer !== answer) {
        wrongOptions.push(wrongAnswer);
      }
    }
    
    // Combine correct and wrong options and shuffle
    const allOptions = [...wrongOptions, answer].sort(() => Math.random() - 0.5);
    
    setProblem(newProblem);
    setOptions(allOptions);
  }, []);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsGameOver(true);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (selectedAnswer: number, index: number) => {
    if (!problem || isGameOver) return;

    Animated.sequence([
      Animated.timing(buttonScales[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScales[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (selectedAnswer === problem.answer) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      const newStreak = streak + 1;
      setStreak(newStreak);
      const points = 10 * (1 + Math.floor(newStreak / 3));
      setScore(prev => prev + points);
    } else {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setStreak(0);
    }

    generateProblem();
  };

  const resetGame = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setIsGameOver(false);
    setStreak(0);
    generateProblem();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.timerContainer, { backgroundColor: colors.card }]}>
          <Clock size={20} color={colors.text} />
          <Text style={[styles.timerText, { color: colors.text }]}>
            {timeLeft}s
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.resetButton, { backgroundColor: colors.card }]}
          onPress={resetGame}
        >
          <RefreshCw size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {isGameOver ? (
        <View style={styles.gameOverContainer}>
          <Text style={[styles.gameOverText, { color: colors.text }]}>Time's Up!</Text>
          <Text style={[styles.finalScoreText, { color: colors.text }]}>
            Final Score: {score}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.problemContainer}>
            <Text style={[styles.problemText, { color: colors.text }]}>
              {problem?.num1} {problem?.operation} {problem?.num2} = ?
            </Text>
            <Text style={[styles.streakText, { color: colors.primary }]}>
              {streak > 2 ? `${streak}x Streak!` : ''}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <Animated.View
                key={index}
                style={[{ transform: [{ scale: buttonScales[index] }] }]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { backgroundColor: colors.card }
                  ]}
                  onPress={() => handleAnswer(option, index)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  } as const,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  } as const,
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  } as const,
  timerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    marginLeft: 8,
  } as const,
  resetButton: {
    padding: 12,
    borderRadius: 12,
  } as const,
  problemContainer: {
    alignItems: 'center',
    marginBottom: 48,
  } as const,
  problemText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    marginBottom: 8,
  } as const,
  streakText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  } as const,
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  } as const,
  optionButton: {
    width: '47%', // Changed from percentage calculation to fixed percentage
    aspectRatio: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  } as const,
  optionText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
  } as const,
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  gameOverText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    marginBottom: 16,
  } as const,
  finalScoreText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
  } as const,
});