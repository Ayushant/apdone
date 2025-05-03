import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  useColorScheme,
  Platform,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ChevronLeft, User, Mail, Camera } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthStore } from "@/store/auth-store";

export default function EditProfileScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsLoading(true);
    // TODO: Implement profile update logic
    setTimeout(() => {
      setIsLoading(false);
      router.back();
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity 
          style={[styles.saveButton, { opacity: isLoading ? 0.5 : 1 }]}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.imageSection}>
          <Image 
            source={{ uri: user?.photoURL || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop" }}
            style={styles.profileImage}
          />
          <TouchableOpacity 
            style={[styles.cameraButton, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
          >
            <Camera size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={[styles.inputIcon, { backgroundColor: colors.primaryLight }]}>
              <User size={20} color={colors.primary} />
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
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={[styles.inputIcon, { backgroundColor: colors.primaryLight }]}>
              <Mail size={20} color={colors.primary} />
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
              placeholder="Email Address"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              editable={false}
            />
          </View>
        </View>
      </View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  imageSection: {
    alignItems: "center",
    marginVertical: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    right: "30%",
  },
  form: {
    marginTop: 8,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
});