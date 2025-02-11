import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Game } from '@/types/game';
import { withMemo } from '@/components/hoc/withMemo';
import { useGames } from '@/contexts/GameContext';
import { LoadingSpinner } from './LoadingSpinner';
import { ThemedText } from '@/components/ThemedText';

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
}) => {
  // Use context data if no data prop is provided
  const { games: contextGames, loading: contextLoading, error: contextError } = useGames();
  const games = data || contextGames;
  const isLoading = loading || contextLoading;
  const hasError = error || contextError;

  // Memoize the keyExtractor function
  const keyExtractor = useCallback((item: Game) => item.id, []);

  // Memoize the renderItem function
  const renderItem: ListRenderItem<Game> = useCallback(
    ({ item }) => (
      <GameListItem
        game={item}
        onPress={() => onGamePress?.(item)}
      />
    ),
    [onGamePress]
  );

  // Memoize empty component based on loading and error states
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
      estimatedFirstItemOffset={0}
      drawDistance={estimatedItemSize * 10} // Pre-render 10 items worth of content
      overrideItemLayout={(layout, item) => {
        layout.size = estimatedItemSize;
      }}
    />
  );
};

// Memoized Game List Item Component
const GameListItem = withMemo<{ game: Game; onPress?: () => void }>(
  ({ game, onPress }) => {
    return (
      <View style={styles.itemContainer}>
        <ThemedText style={styles.title}>{game.title}</ThemedText>
        <ThemedText style={styles.details}>
          {`${game.currentPlayers}/${game.maxPlayers} players • ${game.skillLevel}`}
        </ThemedText>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export const GameList = withMemo(GameListComponent); 