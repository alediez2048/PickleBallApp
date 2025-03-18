import { Game, User, Location, SkillLevel, GameStatus } from '@/types/game';
import { MembershipPlan } from '@/types/membership';
import { 
  DBGame, 
  DBProfile, 
  DBLocation, 
  DBMembershipPlan,
  DBUserMembership,
  DBGameParticipant
} from './schema';

/**
 * Transforms a database game record into an app Game model
 */
export const transformDBGameToGame = (
  dbGame: DBGame & { location: DBLocation, host: DBProfile, participants: (DBGameParticipant & { profile: DBProfile })[] }
): Game => {
  // Convert the database game to the app game model
  return {
    id: dbGame.id,
    title: dbGame.title,
    description: dbGame.description || '',
    startTime: dbGame.start_time,
    endTime: dbGame.end_time,
    location: {
      id: dbGame.location.id,
      name: dbGame.location.name,
      address: dbGame.location.address,
      city: dbGame.location.city,
      state: dbGame.location.state,
      zipCode: dbGame.location.zip_code,
      coordinates: {
        latitude: dbGame.location.latitude,
        longitude: dbGame.location.longitude,
      },
      imageUrl: dbGame.location.image_url,
    },
    host: {
      id: dbGame.host.id,
      name: dbGame.host.name,
      email: dbGame.host.email,
      skillLevel: dbGame.host.skill_level as SkillLevel || 'Beginner',
      profileImage: dbGame.host.profile_image_url,
    },
    players: dbGame.participants.map(participant => ({
      id: participant.profile.id,
      name: participant.profile.name,
      email: participant.profile.email,
      skillLevel: participant.profile.skill_level as SkillLevel || 'Beginner',
      profileImage: participant.profile.profile_image_url,
    })),
    registeredCount: dbGame.participants.length,
    maxPlayers: dbGame.max_players,
    skillLevel: dbGame.skill_level as SkillLevel,
    price: dbGame.price,
    imageUrl: dbGame.image_url,
    status: dbGame.status as GameStatus,
    createdAt: dbGame.created_at,
    updatedAt: dbGame.updated_at,
  };
};

/**
 * Transforms an app Game model to a database game record
 */
export const transformGameToDBGame = (game: Partial<Game>): Partial<DBGame> => {
  const dbGame: Partial<DBGame> = {
    title: game.title,
    description: game.description,
    start_time: game.startTime,
    end_time: game.endTime,
    max_players: game.maxPlayers,
    skill_level: game.skillLevel,
    price: game.price,
    image_url: game.imageUrl,
    status: game.status,
  };

  // Only include non-undefined values
  return Object.fromEntries(
    Object.entries(dbGame).filter(([_, v]) => v !== undefined)
  ) as Partial<DBGame>;
};

/**
 * Transforms a database profile record into an app User model
 */
export const transformDBProfileToUser = (dbProfile: DBProfile): User => {
  return {
    id: dbProfile.id,
    name: dbProfile.name,
    email: dbProfile.email,
    skillLevel: dbProfile.skill_level as SkillLevel || 'Beginner',
    profileImage: dbProfile.profile_image_url,
  };
};

/**
 * Transforms a database location record into an app Location model
 */
export const transformDBLocationToLocation = (dbLocation: DBLocation): Location => {
  return {
    id: dbLocation.id,
    name: dbLocation.name,
    address: dbLocation.address,
    city: dbLocation.city,
    state: dbLocation.state,
    zipCode: dbLocation.zip_code,
    coordinates: {
      latitude: dbLocation.latitude,
      longitude: dbLocation.longitude,
    },
    imageUrl: dbLocation.image_url,
  };
};

/**
 * Transforms a database membership plan to an app MembershipPlan model
 */
export const transformDBMembershipPlanToMembershipPlan = (
  dbPlan: DBMembershipPlan
): MembershipPlan => {
  return {
    id: dbPlan.id,
    name: dbPlan.name,
    price: dbPlan.price,
    interval: dbPlan.interval === 'month' ? 'month' : 'year',
    benefits: dbPlan.benefits,
    description: dbPlan.description,
  };
};

/**
 * Formats a date to ISO string without time for database storage
 */
export const formatDateForDB = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Helper to handle possible Supabase errors
 */
export const handleSupabaseError = (error: any): Error => {
  if (error?.message) {
    return new Error(error.message);
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  return new Error('An unknown error occurred');
};

/**
 * Helper to extract a specific error code from Supabase errors
 */
export const getSupabaseErrorCode = (error: any): string | null => {
  if (error?.code) {
    return error.code;
  }
  
  return null;
}; 