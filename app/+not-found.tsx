import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Coming Soon" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Coming Soon!</Text>
        <Text style={styles.subtitle}>This feature will be available soon.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go back to home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Poppins-Bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#6366F1",
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    color: "white",
    fontFamily: "Poppins-Medium",
  },
});
