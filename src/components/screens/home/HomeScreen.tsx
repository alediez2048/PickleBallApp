import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Game } from '@/types/game';
import { GamesApi } from '@/services/api/games';
import { FeaturedGames } from './sections/FeaturedGames';
import { QuickActions } from './sections/QuickActions';
import { GameCategories } from './sections/GameCategories';
import { UserGames } from './sections/UserGames';
import { RecentActivity } from './sections/RecentActivity';
import { useAppNavigation } from '@/hooks/useAppNavigation';

export function HomeScreen() {
  const navigation = useAppNavigation();
  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ['games'],
    queryFn: () => GamesApi.getGames(),
  });

  const handleGamePress = (gameId: string) => {
    navigation.navigate(`/game/${gameId}`);
  };

  const handleCreateGame = () => {
    navigation.navigate('/game/create');
  };

  const handleViewAllGames = () => {
    navigation.navigate('/games');
  };

  return (
    <ScrollView style={styles.container}>
      <QuickActions onCreateGame={handleCreateGame} />
      <FeaturedGames
        games={games.slice(0, 3)}
        onGamePress={handleGamePress}
        onViewAll={handleViewAllGames}
      />
      <GameCategories />
      <UserGames games={games} onGamePress={handleGamePress} />
      <RecentActivity userId="current-user" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 