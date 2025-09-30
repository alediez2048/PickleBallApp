// Delete view for Fixed Games
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFixedGames } from "@/contexts/FixedGamesContext";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import BackButton from "@/components/common/BackButton";

export default function FixedGameDelete() {
  const { getFixedGame, deleteFixedGame, loading } = useFixedGames();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [game, setGame] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  // Fetch fixed game data on mount
  useEffect(() => {
    (async () => {
      if (id) {
        const g = await getFixedGame(id);
        setGame(g);
        setFetching(false);
      }
    })();
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    const ok = await deleteFixedGame(id);
    if (ok) {
      Alert.alert("Fixed game deleted");
      router.replace("/admin/fixed-games");
    }
  };

  if (fetching || !game) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <>
      <BackButton />
      <ThemedView style={styles.container}>
        <ThemedText type='title'>Delete Fixed Game</ThemedText>
        <ThemedText>
          Are you sure you want to delete the fixed game "{game.title}"?
        </ThemedText>
        <View style={styles.actions}>
          <Button
            title='Cancel'
            onPress={() => router.replace("/admin/fixed-games")}
          />
          <Button
            title={loading ? "Deleting..." : "Delete"}
            color='red'
            onPress={handleDelete}
            disabled={loading}
          />
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  actions: { flexDirection: "row", gap: 16, marginTop: 24 },
});
