import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import { RefreshCw } from "lucide-react-native";
import { theme } from "@/constants/theme";

// Card symbols using emoji for simplicity
const symbols = ["🎨", "🎭", "🎪", "🎢", "🎠", "🎡", "🎮", "🎲", "🎯", "🎳", "🎹", "🎺"];

interface ConcentrationProps {
  onScoreChange: (score: number) => void;
}

export default function Concentration({ onScoreChange }: ConcentrationProps) {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const prevScoreRef = useRef(0);
  const [cards, setCards] = useState<{ id: number; symbol: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const debouncedScoreUpdate = useCallback((matchCount: number, moveCount: number) => {
    const newScore = Math.max(0, matchCount * 50 - moveCount * 2);
    if (newScore !== prevScoreRef.current) {
      onScoreChange(newScore);
      prevScoreRef.current = newScore;
    }
  }, [onScoreChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedScoreUpdate(matches, moves);
    }, 100);
    return () => clearTimeout(timer);
  }, [matches, moves, debouncedScoreUpdate]);

  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(cardPairs);
    setSelectedCards([]);
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
  };

  const handleCardPress = (cardId: number) => {
    if (isLocked || selectedCards.length >= 2 || cards[cardId].isFlipped || cards[cardId].isMatched) {
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Flip the card
    const newCards = [...cards];
    newCards[cardId].isFlipped = true;
    setCards(newCards);
    
    if (selectedCards.length === 0) {
      setSelectedCards([cardId]);
    } else {
      setSelectedCards([...selectedCards, cardId]);
      setMoves(prev => prev + 1);
      
      // Check for match
      const firstCard = cards[selectedCards[0]];
      const secondCard = cards[cardId];
      
      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        newCards[selectedCards[0]].isMatched = true;
        newCards[cardId].isMatched = true;
        setCards(newCards);
        setMatches(prev => prev + 1);
        setSelectedCards([]);
      } else {
        // No match
        setIsLocked(true);
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[selectedCards[0]].isFlipped = false;
          resetCards[cardId].isFlipped = false;
          setCards(resetCards);
          setSelectedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    initializeGame();
  };

  const CARD_MARGIN = 4;
  const GRID_PADDING = 16;
  const GRID_SIZE = 4;
  const windowWidth = Dimensions.get("window").width;
  const availableWidth = windowWidth - (GRID_PADDING * 2);
  const CARD_SIZE = (availableWidth - (CARD_MARGIN * 2 * GRID_SIZE)) / GRID_SIZE;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Concentration</Text>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.card }]}
          onPress={resetGame}
        >
          <RefreshCw size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <Text style={[styles.statsText, { color: colors.text }]}>
          Moves: {moves}
        </Text>
        <Text style={[styles.statsText, { color: colors.text }]}>
          Matches: {matches}
        </Text>
      </View>

      <View style={[styles.grid, { backgroundColor: colors.border }]}>
        {Array.from({ length: 4 }).map((_, row) => (
          <View key={row} style={styles.row}>
            {Array.from({ length: 4 }).map((_, col) => {
              const index = row * 4 + col;
              const card = cards[index];
              if (!card) return null;
              
              return (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.card,
                    {
                      width: CARD_SIZE,
                      height: CARD_SIZE,
                      backgroundColor: card.isFlipped || card.isMatched ? colors.primary : colors.card,
                    },
                  ]}
                  onPress={() => handleCardPress(card.id)}
                  disabled={isLocked}
                >
                  <Text style={[
                    styles.cardText,
                    { opacity: card.isFlipped || card.isMatched ? 1 : 0 }
                  ]}>
                    {card.symbol}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statsText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
  },
  grid: {
    padding: 8,
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
  },
  card: {
    margin: 4,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 24,
  },
});