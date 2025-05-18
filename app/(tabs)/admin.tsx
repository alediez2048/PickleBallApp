import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function AdminScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>
      <Button
        title='Go to Locations'
        onPress={() => router.push("/admin/locations")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
