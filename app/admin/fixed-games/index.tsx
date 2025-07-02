// List view for Fixed Games
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Button, View } from "react-native";
import { useRouter } from "expo-router";
import { useFixedGames } from "@/contexts/FixedGamesContext";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import BackButton from "@/components/common/BackButton";

export default function FixedGamesList() {
  const { fixedGames, fetchFixedGames, loading } = useFixedGames();
  const router = useRouter();

  useEffect(() => {
    fetchFixedGames();
  }, [fetchFixedGames]);

  return (
    <ThemedView>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton />
        <ThemedView>
          <ThemedText type="title" style={styles.title}>
            Fixed Games
          </ThemedText>
          <Button
            title="Create New Fixed Game"
            onPress={() => router.push("/admin/fixed-games/create")}
          />
          {loading && <ThemedText>Loading...</ThemedText>}
          {fixedGames.map((game) => (
            <ThemedView
              key={game.id}
              colorType="soft"
              type="card"
              style={styles.card}
              borderColorType="border"
              borderWidth={2}
            >
              <ThemedText type="subtitle">{game.title}</ThemedText>
              <ThemedView
                colorType="soft"
                className="flex flex-row justify-between items-start p-2 gap-4 mb-3"
              >
                <ThemedView colorType="soft">
                  <ThemedText type="caption">{game.description}</ThemedText>

                  <ThemedText type="caption">
                    Max Players: {game.max_players}
                  </ThemedText>
                  <ThemedText type="caption">
                    Skill: {game.skill_level}
                  </ThemedText>
                </ThemedView>
                <ThemedView colorType="soft">
                  <ThemedText type="caption">
                    Day: {game.day_of_week}
                  </ThemedText>
                  <ThemedText type="caption">
                    Start: {game.start_time}
                  </ThemedText>
                  <ThemedText type="caption">
                    Duration: {game.duration_minutes} min
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <View style={styles.actions}>
                <Button
                  title="Edit"
                  onPress={() => router.push(`/admin/fixed-games/${game.id}`)}
                />
                <Button
                  title="Delete"
                  color="red"
                  onPress={() =>
                    router.push(`/admin/fixed-games/delete/${game.id}`)
                  }
                />
              </View>
            </ThemedView>
          ))}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { marginBottom: 16 },
  card: { marginVertical: 10 },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
});
