import React, { useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Game } from '@/types/game';
import { withMemo } from '@/components/hoc/withMemo';
import { useGames } from '@/contexts/GameContext';
import { LoadingSpinner } from './LoadingSpinner';
import { ThemedText } from '@/components/ThemedText';

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

interface GameListProps {
  data?: Game[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onGamePress?: (game: Game) => void;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  estimatedItemSize?: number;
  prefetchCount?: number;
}

const GameListComponent: React.FC<GameListProps> = ({
  data,
  loading = false,
  error = null,
  onRefresh,
  onEndReached,
  onGamePress,
  ListEmptyComponent,
  ListHeaderComponent,
  estimatedItemSize = 100,
  prefetchCount = 5,
}) => {
  const { games: contextGames, loading: contextLoading, error: contextError, prefetchGame } = useGames();
  const games = data || contextGames;
  const isLoading = loading || contextLoading;
  const hasError = error || contextError;

  // Prefetch next batch of games
  useEffect(() => {
    if (prefetchGame && games.length > 0) {
      const startIndex = Math.max(0, games.length - prefetchCount);
      games.slice(startIndex).forEach(game => {
        prefetchGame(game.id);
      });
    }
  }, [games, prefetchGame, prefetchCount]);

  const keyExtractor = useCallback((item: Game) => item.id, []);

  const renderItem: ListRenderItem<Game> = useCallback(
    ({ item }) => (
      <GameListItem
        game={item}
        onPress={() => onGamePress?.(item)}
      />
    ),
    [onGamePress]
  );

  const EmptyComponent = useMemo(() => {
    if (isLoading) return <LoadingSpinner />;
    if (hasError) {
      return (
        <View style={styles.centerContent}>
          <ThemedText style={styles.errorText}>{hasError}</ThemedText>
        </View>
      );
    }
    if (ListEmptyComponent) return ListEmptyComponent;
    return (
      <View style={styles.centerContent}>
        <ThemedText>No games found</ThemedText>
      </View>
    );
  }, [isLoading, hasError, ListEmptyComponent]);

  return (
    <FlashList
      data={games}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={estimatedItemSize}
      ListEmptyComponent={EmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      onRefresh={onRefresh}
      refreshing={isLoading}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      drawDistance={estimatedItemSize * 10}
      overrideItemLayout={(layout, item) => {
        layout.size = estimatedItemSize;
      }}
      removeClippedSubviews={Platform.OS !== 'web'}
    />
  );
};

const GameListItem = withMemo<{ game: Game; onPress?: () => void }>(
  ({ game, onPress }) => {
    return (
      <View style={styles.itemContainer}>
        {game.location.imageUrl && (
          <Image
            source={game.location.imageUrl}
            style={styles.image}
            placeholder={blurhash}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        )}
        <View style={styles.contentContainer}>
          <ThemedText style={styles.title}>{game.title}</ThemedText>
          <ThemedText style={styles.details}>
            {`${game.currentPlayers}/${game.maxPlayers} players • ${game.skillLevel}`}
          </ThemedText>
          <ThemedText style={styles.location}>
            {`${game.location.name} • ${game.location.city}, ${game.location.state}`}
          </ThemedText>
        </View>
      </View>
    );
  },
  (prev, next) => prev.game.id === next.game.id
);

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export const GameList = withMemo(GameListComponent); 