import { Button } from "react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";

export default function AdminScreen() {
  const router = useRouter();
  return (
    <ThemedView
      type='centered'
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        rowGap: 20,
        flexDirection: "column",
      }}
    >
      <ThemedView
        style={{
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <ThemedText type='title'>PicklePass</ThemedText>
      </ThemedView>
      <ThemedText type='title' colorType='primary' style={{ marginBottom: 32 }}>
        Admin Panel
      </ThemedText>
      <ThemedView style={{ width: 200, marginBottom: 16 }}>
        <Button
          title='Go to Locations'
          onPress={() => router.push("/admin/locations")}
          color='#007AFF'
        />
      </ThemedView>
      <ThemedView style={{ width: 200 }}>
        <Button
          title='Go to Fixed Games'
          onPress={() => router.push("/admin/fixed-games")}
          color='#007AFF'
        />
      </ThemedView>
    </ThemedView>
  );
}
