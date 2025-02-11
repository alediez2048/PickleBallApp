import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import type { Game } from '@/types/game';

interface GameCardProps {
  game: Game;
  onPress?: () => void;
}

export const GameCard = React.memo(function GameCard({ 
  game,
  onPress,
}: GameCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {game.location.imageUrl && (
        <Image
          source={{ uri: game.location.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{game.title}</Text>
        <Text style={styles.location}>{game.location.name}</Text>
        <View style={styles.details}>
          <Text style={styles.date}>
            {new Date(game.date).toLocaleDateString()}
          </Text>
          <Text style={styles.players}>
            {game.currentPlayers}/{game.maxPlayers} players
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.skillLevel}>{game.skillLevel}</Text>
          <Text style={styles.price}>${game.price}</Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  players: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  skillLevel: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
  },
}); 