import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Phone, ChevronLeft, AlertCircle } from "lucide-react-native";
import { theme } from "../../constants/theme";
import { useAuthStore } from "../../store/auth-store";

export default function PhoneLoginScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState(1); // 1: Phone number, 2: Verification code
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep(2);
    } catch (err) {
      setError("Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (!verificationCode || verificationCode.length < 4) {
      setError("Please enter a valid verification code");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      login({
        id: "5",
        email: `${phoneNumber}@phone.user`,
        displayName: "Phone User",
        photoURL: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop",
        phoneNumber,
      });
      
      router.replace("/(tabs)");
    } catch (err) {
      setError("Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (step === 1) {
              router.back();
            } else {
              setStep(1);
              setError("");
            }
          }}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {step === 1 ? "Phone Login" : "Verify Code"}
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.iconContainer}
            >
              <Text style={[styles.logoText, { color: "white", fontSize: 32 }]}>🎮</Text>
            </LinearGradient>
            
            <Text style={[styles.title, { color: colors.text }]}>
              {step === 1 ? "Enter Phone Number" : "Enter Verification Code"}
            </Text>
            
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {step === 1 
                ? "We'll send you a verification code" 
                : `We've sent a code to ${phoneNumber}`}
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            {step === 1 ? (
              <View style={styles.inputContainer}>
                <View style={[styles.inputIcon, { backgroundColor: colors.primaryLight }]}>
                  <Phone size={20} color={colors.primary} />
                </View>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Phone Number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            ) : (
              <View style={styles.codeContainer}>
                <TextInput
                  style={[
                    styles.codeInput,
                    { 
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Enter code"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                />
                
                <TouchableOpacity style={styles.resendButton}>
                  <Text style={[styles.resendText, { color: colors.primary }]}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.actionButton, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={step === 1 ? handleSendCode : handleVerifyCode}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {step === 1 ? "Send Code" : "Verify & Login"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              login(null);
              router.replace("/(tabs)");
            }}
          >
            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
  },
  errorText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#EF4444",
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  inputIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    borderWidth: 1,
  },
  codeContainer: {
    width: "100%",
    marginBottom: 24,
  },
  codeInput: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    borderWidth: 1,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 16,
  },
  resendButton: {
    alignSelf: "center",
  },
  resendText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  actionButton: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "white",
  },
  skipButton: {
    alignSelf: "center",
    marginTop: 24,
    padding: 8,
  },
  skipButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
});