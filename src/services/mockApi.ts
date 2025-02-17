import { storage } from './storage';

// Simulated network delay
const NETWORK_DELAY = 1000;

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

interface UpdateProfileData {
  skillLevel?: string;
  profileImage?: string | {
    uri: string;
    base64: string;
    timestamp: number;
  };
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

const STORAGE_KEYS = {
  MOCK_USERS: 'mock_users_data',
  GAMES_HISTORY: 'games_history_data',
  BOOKED_GAMES: 'booked_games_data'
};

class MockApi {
  private MOCK_USERS: Map<string, MockUser>;

  constructor() {
    this.MOCK_USERS = new Map();
    this.loadMockUsers();
  }

  private async loadMockUsers() {
    try {
      const storedUsers = await storage.getItem(STORAGE_KEYS.MOCK_USERS);
      if (storedUsers) {
        this.MOCK_USERS = new Map(JSON.parse(storedUsers));
      } else {
        // Initialize with default test user if no stored users
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

    const verificationToken = generateVerificationToken();
    const newUser = {
      id: (this.MOCK_USERS.size + 1).toString(),
      email,
      password,
      name,
      emailVerified: true,
      verificationToken: null
    };

    this.MOCK_USERS.set(email, newUser);

    // In a real implementation, this would send an email with the verification link

    const { password: _, verificationToken: __, ...userWithoutPassword } = newUser;
    const response = {
      token: generateToken(newUser.id),
      user: userWithoutPassword,
    };
    return response;
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
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = this.MOCK_USERS.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Handle profile image update
    if (data.profileImage) {
      if (typeof data.profileImage === 'string') {
        user.profileImage = data.profileImage;
      } else {
        // Store the full image data object
        user.profileImage = {
          uri: data.profileImage.uri,
          base64: data.profileImage.base64,
          timestamp: data.profileImage.timestamp
        };
      }
    }

    const updatedUser = {
      ...user,
      skillLevel: data.skillLevel !== undefined ? data.skillLevel : user.skillLevel,
      updatedAt: new Date().toISOString()
    };

    this.MOCK_USERS.set(email, updatedUser);
    await this.saveMockUsers(); // Persist the changes

    const { password: _, verificationToken: __, ...userWithoutPassword } = updatedUser;
    return { user: userWithoutPassword };
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

  async bookGame(email: string, game: Omit<BookedGame, 'status'>): Promise<BookedGame> {
    // Simplified logging
    console.log('MockApi: Attempting to book game:', game.gameId);
    
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = this.MOCK_USERS.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.bookedGames) {
      user.bookedGames = [];
    }

    // Check if user has already booked this game
    const existingBooking = user.bookedGames.find(
      bookedGame => 
        bookedGame.gameId === game.gameId &&
        bookedGame.status === 'upcoming'
    );

    if (existingBooking) {
      throw new Error('You have already booked this game');
    }

    const bookedGame: BookedGame = {
      ...game,
      status: 'upcoming'
    };

    user.bookedGames.unshift(bookedGame);
    await this.saveMockUsers();
    
    // Simplified success log
    console.log('MockApi: Game booked successfully:', game.gameId);

    return bookedGame;
  }

  async cancelBooking(email: string, gameId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = this.MOCK_USERS.get(email);
    if (!user || !user.bookedGames) {
      throw new Error('User or booking not found');
    }

    const gameIndex = user.bookedGames.findIndex(game => game.id === gameId);
    if (gameIndex === -1) {
      throw new Error('Booking not found');
    }

    user.bookedGames[gameIndex].status = 'cancelled';
    await this.saveMockUsers();
  }

  async clearBookedGames(email: string): Promise<void> {
    const user = this.MOCK_USERS.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    user.bookedGames = [];
    await this.saveMockUsers();
  }
}

export const mockApi = new MockApi(); 