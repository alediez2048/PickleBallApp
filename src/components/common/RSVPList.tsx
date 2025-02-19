import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import type { User, SkillLevel } from '@/types/game';
import { useGameRegistration } from '@/hooks/useGameRegistration';
import { useBookedGames } from '@/contexts/BookedGamesContext';
import { useUserProfile } from '@/contexts/selectors/authSelectors';

interface RSVPListProps {
  gameId: string;
  players: User[];
  maxPlayers: number;
  onPlayerPress?: (player: User) => void;
}

interface PlayerAvatarProps {
  player: User;
  onPress?: () => void;
  isRegistered?: boolean;
}

const getImageSource = (profileImage: User['profileImage']) => {
  if (!profileImage) return undefined;
  
  if (typeof profileImage === 'string') {
    return { uri: profileImage };
  }
  
  return { uri: profileImage.base64 };
};

const PlayerAvatar = React.memo(({ player, onPress, isRegistered }: PlayerAvatarProps) => (
  <TouchableOpacity
    style={styles.avatarContainer}
    onPress={onPress}
    disabled={!onPress}
  >
    {player.profileImage ? (
      <Image
        source={getImageSource(player.profileImage)}
        style={[styles.avatar, isRegistered && styles.registeredAvatar]}
      />
    ) : (
      <View style={[styles.avatar, isRegistered ? styles.registeredAvatar : styles.defaultAvatar]}>
        <IconSymbol name="person.fill" size={20} color={isRegistered ? "#4CAF50" : "#666666"} />
      </View>
    )}
    <Text style={styles.playerName} numberOfLines={1}>
      {player.name}
      {isRegistered && " (Registered)"}
    </Text>
  </TouchableOpacity>
));

export function RSVPList({ gameId, players, maxPlayers, onPlayerPress }: RSVPListProps) {
  const { isLoading, error, registeredCount } = useGameRegistration(gameId);
  const { bookedGames } = useBookedGames();
  const currentUser = useUserProfile();

  const registeredPlayers = useMemo(() => {
    return bookedGames
      .filter(game => game.gameId === gameId && game.status === 'upcoming')
      .map(game => ({
        id: game.id,
        name: currentUser?.id === game.id.split('_')[0] ? currentUser.name || 'Anonymous' : 'Registered Player',
        email: currentUser?.id === game.id.split('_')[0] ? currentUser.email || 'anonymous@player.com' : 'registered@player.com',
        profileImage: currentUser?.id === game.id.split('_')[0] ? currentUser.profileImage : undefined,
        skillLevel: (currentUser?.skillLevel || 'Beginner') as SkillLevel
      }))
      .sort((a, b) => {
        // Sort by registration time (using the timestamp in the ID)
        const timeA = parseInt(a.id.split('_')[1], 10);
        const timeB = parseInt(b.id.split('_')[1], 10);
        return timeA - timeB;
      });
  }, [bookedGames, gameId, currentUser]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load players</Text>
      </View>
    );
  }

  const totalPlayers = players.length + registeredPlayers.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Players</Text>
        <Text style={styles.count}>
          {isLoading ? 'Loading...' : `${totalPlayers}/${maxPlayers}`}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Host and initial players */}
        {players.map((player) => (
          <PlayerAvatar
            key={player.id}
            player={player}
            onPress={() => onPlayerPress?.(player)}
          />
        ))}
        
        {/* Registered players */}
        {registeredPlayers.map((player) => (
          <PlayerAvatar
            key={player.id}
            player={player}
            onPress={() => onPlayerPress?.(player)}
            isRegistered
          />
        ))}

        {/* Empty spots */}
        {Array.from({ length: maxPlayers - totalPlayers }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.avatarContainer}>
            <View style={[styles.avatar, styles.emptyAvatar]}>
              <IconSymbol name="person.fill" size={20} color="#E0E0E0" />
            </View>
            <Text style={[styles.playerName, styles.emptySpotText]}>Open</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  count: {
    fontSize: 14,
    color: '#666666',
  },
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    width: 64,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  defaultAvatar: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registeredAvatar: {
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  emptyAvatar: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  playerName: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
  },
  emptySpotText: {
    color: '#666666',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
  },
}); 