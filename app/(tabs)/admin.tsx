import { Button } from "react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";

export default function AdminScreen() {
  const router = useRouter();
  return (
    <ThemedView type='centered' style={{ flex: 1 }}>
      <ThemedText type='title' colorType='primary' style={{ marginBottom: 16 }}>
        Admin Panel
      </ThemedText>
      <Button
        title='Go to Locations'
        onPress={() => router.push("/admin/locations")}
      />
      <Button
        title='Go to Fixed Games'
        onPress={() => router.push("/admin/fixed-games")}
      />
    </ThemedView>
  );
}
