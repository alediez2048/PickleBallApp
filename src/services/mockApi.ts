import { storage } from './storage';
import { MOCK_GAMES } from '@/utils/mockData';
import { Game } from '@/types/game';
import { Platform } from 'react-native';

// Simulated network delay
const NETWORK_DELAY = 1000;
const PROFILE_UPDATE_DELAY = 300; // Faster delay for profile updates

// Mock token generation
const generateToken = (userId: string) => `mock-token-${userId}-${Date.now()}`;
const generateVerificationToken = () => Math.random().toString(36).substring(2, 15);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    skillLevel?: string;
    profileImage?: string | {
      uri: string;
      base64: string;
      timestamp: number;
    };
  };
}

export interface PasswordResetRequest {
  email: string;
}

export interface SocialAuthCredentials {
  token: string;
  provider: 'google' | 'facebook' | 'apple';
  user: {
    id: string;
    email: string;
    name: string;
    photoUrl?: string;
  };
}

export interface UpdateProfileData {
  skillLevel?: string;
  profileImage?: string | {
    uri: string;
    base64: string;
    timestamp: number;
  };
  displayName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  hasCompletedProfile?: boolean;
}

interface BookedGame {
  id: string;
  gameId: string;
  date: string;
  time: string;
  courtName: string;
  location: {
    address: string;
    area: string;
    city: string;
  };
  skillRating: number;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  userId?: string;
  userInfo?: {
    name: string;
    email: string;
    profileImage?: string | {
      uri: string;
      base64: string;
      timestamp: number;
    };
    skillLevel?: string;
  };
}

interface MockUser {
  id: string;
  email: string;
  name: string;
  password: string;
  emailVerified: boolean;
  verificationToken: string | null;
  skillLevel?: string;
  profileImage?: string | {
    uri: string;
    base64: string;
    timestamp: number;
  };
  displayName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  hasCompletedProfile?: boolean;
  gamesPlayed?: GameHistory[];
  bookedGames?: BookedGame[];
}

interface GameHistory {
  id: string;
  date: string;
  result: 'win' | 'loss';
  score: string;
  opponent: string;
}

export interface FirstTimeProfileData {
  displayName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  skillLevel?: string;
  playingExperience: string;
  preferredPlayStyle: string[];
  membershipTier: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    matchAlerts: boolean;
  };
  waiverAccepted: boolean;
  waiverSignedAt?: string;
  termsAccepted: boolean;
  termsAcceptedAt: string;
  privacyPolicyAccepted: boolean;
  privacyPolicyAcceptedAt: string;
  hasCompletedProfile?: boolean;
}

const STORAGE_KEYS = {
  MOCK_USERS: 'mock_users_data',
  GAMES_HISTORY: 'games_history_data',
  BOOKED_GAMES: 'booked_games_data',
  GLOBAL_GAME_BOOKINGS: 'global_game_bookings_data'
};

class MockApi {
  private MOCK_USERS: Map<string, MockUser>;
  private GLOBAL_GAME_BOOKINGS: Map<string, string[]>;

  constructor() {
    this.MOCK_USERS = new Map();
    this.GLOBAL_GAME_BOOKINGS = new Map();
    this.loadMockUsers();
    this.loadGlobalBookings();
  }

  private async loadMockUsers() {
    try {
      const storedUsers = await storage.getItem(STORAGE_KEYS.MOCK_USERS);
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        this.MOCK_USERS = new Map(parsedUsers);
      }

      // Add test user only if no users exist
      if (this.MOCK_USERS.size === 0) {
        const testUser: MockUser = {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
          emailVerified: true,
          verificationToken: null,
          skillLevel: 'Intermediate',
          profileImage: undefined,
          gamesPlayed: [
            {
              id: '1',
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              result: 'win',
              score: '11-9',
              opponent: 'John Doe'
            }
          ],
          bookedGames: []
        };
        
        this.MOCK_USERS.set(testUser.email, testUser);
        await this.saveMockUsers();
      }
    } catch (error) {
      console.error('MockApi: Error loading users:', error);
      throw error;
    }
  }

  private async saveMockUsers() {
    try {
      const usersArray = Array.from(this.MOCK_USERS.entries());
      await storage.setItem(STORAGE_KEYS.MOCK_USERS, JSON.stringify(usersArray));
    } catch (error) {
      console.error('MockApi: Error saving users:', error);
      throw error;
    }
  }

  private async loadGlobalBookings() {
    try {
      const storedBookings = await storage.getItem(STORAGE_KEYS.GLOBAL_GAME_BOOKINGS);
      if (storedBookings) {
        this.GLOBAL_GAME_BOOKINGS = new Map(JSON.parse(storedBookings));
      }
    } catch (error) {
      console.error('MockApi: Error loading global bookings:', error);
    }
  }

  private async saveGlobalBookings() {
    try {
      const bookingsArray = Array.from(this.GLOBAL_GAME_BOOKINGS.entries());
      await storage.setItem(STORAGE_KEYS.GLOBAL_GAME_BOOKINGS, JSON.stringify(bookingsArray));
    } catch (error) {
      console.error('MockApi: Error saving global bookings:', error);
    }
  }

  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = this.MOCK_USERS.get(email);

    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    const { password: _, verificationToken: __, ...userWithoutPassword } = user;
    const response = {
      token: generateToken(user.id),
      user: userWithoutPassword,
    };
    return response;
  }

  async register({ email, password, name }: RegisterCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    // Basic domain validation
    const domain = email.split('@')[1];
    const blockedDomains = ['test.com', 'fake.com'];
    if (blockedDomains.includes(domain.toLowerCase())) {
      throw new Error('Please use a valid email address');
    }

    if (this.MOCK_USERS.has(email)) {
      throw new Error('Email already registered');
    }

    const newUser: MockUser = {
      id: (this.MOCK_USERS.size + 1).toString(),
      email,
      password,
      name,
      emailVerified: true,
      verificationToken: null,
      bookedGames: [],
      gamesPlayed: []
    };

    // Save the new user to the map
    this.MOCK_USERS.set(email, newUser);
    
    // Save to storage immediately
    await this.saveMockUsers();

    const { password: _, verificationToken: __, ...userWithoutPassword } = newUser;
    return {
      token: generateToken(newUser.id),
      user: userWithoutPassword,
    };
  }

  async verifyEmail(email: string, token: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = this.MOCK_USERS.get(email);
    if (!user || user.verificationToken !== token) {
      throw new Error('Invalid verification token');
    }

    user.emailVerified = true;
    user.verificationToken = null;
    this.MOCK_USERS.set(email, user);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = this.MOCK_USERS.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email already verified');
    }

    const newVerificationToken = generateVerificationToken();
    user.verificationToken = newVerificationToken;
    this.MOCK_USERS.set(email, user);

    // In a real implementation, this would send a new verification email
  }

  async requestPasswordReset({ email }: PasswordResetRequest): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = this.MOCK_USERS.get(email);
    if (!user) {
      // We don't want to reveal if an email exists or not for security reasons
      return;
    }

    // In a real implementation, this would:
    // 1. Generate a reset token
    // 2. Store it with an expiration
    // 3. Send an email with the reset link
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = this.MOCK_USERS.get(email);
    if (!user) {
      throw new Error('Invalid reset request');
    }

    // In a real implementation, this would:
    // 1. Verify the reset token
    // 2. Check if it's expired
    // 3. Update the password in the database
    user.password = newPassword;
    this.MOCK_USERS.set(email, user);
  }

  async socialAuth({ token, provider, user }: SocialAuthCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    // Check if user already exists
    const existingUser = Array.from(this.MOCK_USERS.values()).find(u => u.email === user.email);

    if (existingUser) {
      // Update existing user with social info
      const updatedUser = {
        ...existingUser,
        name: user.name, // Update name from social profile
        emailVerified: true, // Social logins are considered verified
      };
      this.MOCK_USERS.set(existingUser.email, updatedUser);

      const { password: _, verificationToken: __, ...userWithoutPassword } = updatedUser;
      return {
        token: generateToken(existingUser.id),
        user: userWithoutPassword,
      };
    }

    // Create new user
    const newUser: MockUser = {
      id: (this.MOCK_USERS.size + 1).toString(),
      email: user.email,
      name: user.name,
      password: '', // Social auth users don't have passwords
      emailVerified: true, // Social logins are considered verified
      verificationToken: null,
    };

    this.MOCK_USERS.set(newUser.email, newUser);

    const { password: _, verificationToken: __, ...userWithoutPassword } = newUser;
    return {
      token: generateToken(newUser.id),
      user: userWithoutPassword,
    };
  }

  async updateProfile(email: string, data: UpdateProfileData): Promise<{ user: Omit<MockUser, 'password' | 'verificationToken'> }> {
    console.debug('[MockApi] Starting profile update', {
      platform: Platform.OS,
      email,
      data: JSON.stringify(data, null, 2)
    });
    
    try {
      // Load latest user data from storage
      await this.loadMockUsers();
      console.debug('[MockApi] Loaded mock users from storage');
      
      const user = this.MOCK_USERS.get(email);
      if (!user) {
        console.error('[MockApi] User not found for email:', email);
        throw new Error('User not found');
      }
      console.debug('[MockApi] Found existing user:', {
        id: user.id,
        email: user.email,
        currentSkillLevel: user.skillLevel
      });

      let updatedUser = { ...user };
      console.debug('[MockApi] Created updated user object');

      // Process all fields from UpdateProfileData that exist in MockUser
      const allowedFields = ['skillLevel', 'profileImage', 'displayName', 'phoneNumber', 'dateOfBirth', 'address', 'hasCompletedProfile'] as const;
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && allowedFields.includes(key as typeof allowedFields[number])) {
          console.debug(`[MockApi] Updating field: ${key}`, { value });
          (updatedUser as any)[key] = value;
        }
      });

      // Check for skill level change specifically
      if (data.skillLevel !== undefined && data.skillLevel !== user.skillLevel) {
        console.debug('[MockApi] Attempting to update skill level', {
          current: user.skillLevel,
          new: data.skillLevel
        });
        
        // Check for active bookings
        const activeBookings = user.bookedGames?.filter(
          booking => booking.status === 'upcoming'
        ) || [];

        if (activeBookings.length > 0) {
          console.error('[MockApi] Cannot change skill level with active bookings');
          throw new Error('Cannot change skill level while you have upcoming games. Please complete or cancel your existing games first.');
        }

        updatedUser.skillLevel = data.skillLevel;
        console.debug('[MockApi] Skill level updated successfully');
      }

      // Handle profile image update
      if (data.profileImage) {
        console.debug('[MockApi] Updating profile image');
        if (typeof data.profileImage === 'string') {
          updatedUser.profileImage = data.profileImage;
        } else {
          updatedUser.profileImage = {
            uri: data.profileImage.uri,
            base64: data.profileImage.base64,
            timestamp: data.profileImage.timestamp
          };
        }
        console.debug('[MockApi] Profile image updated successfully');
      }

      // Update user in the map
      this.MOCK_USERS.set(email, updatedUser);
      console.debug('[MockApi] Updated user in MOCK_USERS map');
      
      // Save changes immediately
      await this.saveMockUsers();
      console.debug('[MockApi] Saved changes to storage');

      const { password: _, verificationToken: __, ...userWithoutPassword } = updatedUser;
      console.debug('[MockApi] Profile update completed successfully', {
        updatedFields: Object.keys(data),
        hasCompletedProfile: updatedUser.hasCompletedProfile
      });

      return { user: userWithoutPassword };
    } catch (error) {
      console.error('[MockApi] Error updating profile:', error);
      throw error;
    }
  }

  async getGameHistory(email: string): Promise<GameHistory[]> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));
    const user = this.MOCK_USERS.get(email);
    if (!user) {
      throw new Error('User not found');
    }
    return user.gamesPlayed || [];
  }

  async addGameToHistory(email: string, game: Omit<GameHistory, 'id'>): Promise<GameHistory> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));
    const user = this.MOCK_USERS.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    const newGame: GameHistory = {
      id: Date.now().toString(),
      ...game
    };

    if (!user.gamesPlayed) {
      user.gamesPlayed = [];
    }
    user.gamesPlayed.unshift(newGame);
    await this.saveMockUsers();
    return newGame;
  }

  async getBookedGames(email: string): Promise<BookedGame[]> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = this.MOCK_USERS.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    return user.bookedGames || [];
  }

  async getGameBookings(gameId: string): Promise<number> {
    try {
      console.log('Getting bookings for game:', gameId);
      
      if (!gameId) {
        console.error('Invalid gameId provided to getGameBookings');
        return 0;
      }

      // Get base game details
      const gameDetails = MOCK_GAMES[gameId];
      if (!gameDetails) {
        console.error('Game not found:', gameId);
        return 0;
      }

      // Get active bookings
      const bookings = this.GLOBAL_GAME_BOOKINGS.get(gameId) || [];
      console.log('Found global bookings:', bookings);
      
      let activeBookingsCount = 0;

      // Count active bookings across all users
      for (const [email, user] of this.MOCK_USERS) {
        const userBookings = user.bookedGames || [];
        const activeUserBookings = userBookings.filter(booking => 
          booking.gameId === gameId && 
          booking.status === 'upcoming'
        );
        
        activeBookingsCount += activeUserBookings.length;
        
        if (activeUserBookings.length > 0) {
          console.log(`Found ${activeUserBookings.length} active bookings for user ${email}`);
        }
      }

      console.log('Total active bookings:', activeBookingsCount);
      return activeBookingsCount;
    } catch (error) {
      console.error('Error in getGameBookings:', error);
      return 0;
    }
  }

  async bookGame(email: string, game: Omit<BookedGame, 'status'>): Promise<BookedGame> {
    console.log('MockApi: Attempting to book game:', game.gameId);
    console.log('User email:', email);
    
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = this.MOCK_USERS.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Get the full game details from MOCK_GAMES
    const gameDetails = Object.values(MOCK_GAMES).find((g: Game) => g.id === game.gameId);
    if (!gameDetails) {
      throw new Error('Game not found');
    }

    console.log('Game details:', {
      gameSkillLevel: gameDetails.skillLevel,
      userSkillLevel: user.skillLevel
    });

    // Check if game is full
    const currentBookings = await this.getGameBookings(game.gameId);
    if (currentBookings + gameDetails.players.length >= gameDetails.maxPlayers) {
      throw new Error('This game is already full');
    }

    // Check skill level compatibility
    if (user.skillLevel && gameDetails.skillLevel && 
        user.skillLevel.toLowerCase() !== gameDetails.skillLevel.toLowerCase()) {
      throw new Error(`This game requires ${gameDetails.skillLevel} skill level`);
    }

    if (!user.bookedGames) {
      user.bookedGames = [];
    }

    // Check if user has any active booking for this game
    const existingBooking = user.bookedGames.find(
      bookedGame => bookedGame.gameId === game.gameId && bookedGame.status === 'upcoming'
    );

    if (existingBooking) {
      throw new Error('You have already booked this game');
    }

    // Get current global bookings for this game
    const gameBookings = this.GLOBAL_GAME_BOOKINGS.get(game.gameId) || [];
    
    // Generate a new booking ID that includes both game ID and timestamp
    const bookingId = `${game.gameId}_${Date.now()}`;

    // Create the new booking with user information
    const bookedGame: BookedGame = {
      ...game,
      id: bookingId,
      status: 'upcoming',
      userId: user.id,
      userInfo: {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        skillLevel: user.skillLevel
      }
    };

    // First update global bookings
    this.GLOBAL_GAME_BOOKINGS.set(game.gameId, [...gameBookings, bookingId]);
    await this.saveGlobalBookings();

    // Then update user's bookings
    user.bookedGames = [bookedGame, ...user.bookedGames];
    await this.saveMockUsers();
    
    console.log('MockApi: Game booked successfully:', game.gameId);
    return bookedGame;
  }

  async cancelBooking(email: string, gameId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = this.MOCK_USERS.get(email);
    if (!user || !user.bookedGames) {
      throw new Error('User or booking not found');
    }

    const booking = user.bookedGames.find(game => game.id === gameId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Update user's booking status
    booking.status = 'cancelled';

    // Update global bookings
    const gameBookings = this.GLOBAL_GAME_BOOKINGS.get(booking.gameId) || [];
    const updatedBookings = gameBookings.filter(id => id !== gameId);
    this.GLOBAL_GAME_BOOKINGS.set(booking.gameId, updatedBookings);

    // Save both user and global booking data
    await Promise.all([
      this.saveMockUsers(),
      this.saveGlobalBookings()
    ]);
  }

  async clearBookedGames(email: string): Promise<void> {
    const user = this.MOCK_USERS.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all game IDs from user's bookings
    const gameIds = new Set(user.bookedGames?.map(booking => booking.gameId) || []);

    // Update global bookings for each affected game
    for (const gameId of gameIds) {
      const gameBookings = this.GLOBAL_GAME_BOOKINGS.get(gameId) || [];
      const updatedBookings = gameBookings.filter(bookingId => 
        !user.bookedGames?.some(booking => booking.id === bookingId)
      );
      this.GLOBAL_GAME_BOOKINGS.set(gameId, updatedBookings);
    }

    user.bookedGames = [];
    await Promise.all([
      this.saveMockUsers(),
      this.saveGlobalBookings()
    ]);
  }

  async getRegisteredPlayers(gameId: string): Promise<Array<{
    id: string;
    name: string;
    email: string;
    profileImage?: string | { uri: string; base64: string; timestamp: number; };
    skillLevel?: string;
  }>> {
    const registeredPlayers: Array<{
      id: string;
      name: string;
      email: string;
      profileImage?: string | { uri: string; base64: string; timestamp: number; };
      skillLevel?: string;
    }> = [];

    // Iterate through all users to find bookings for this game
    for (const user of this.MOCK_USERS.values()) {
      const booking = user.bookedGames?.find(
        game => game.gameId === gameId && game.status === 'upcoming'
      );

      if (booking) {
        registeredPlayers.push({
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          skillLevel: user.skillLevel
        });
      }
    }

    return registeredPlayers;
  }
}

export const mockApi = new MockApi(); 