// Simulated network delay
const NETWORK_DELAY = 1000;

// Mock user database
const MOCK_USERS = new Map([
  ['test@example.com', {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123'
  }]
]);

// Mock token generation
const generateToken = (userId: string) => `mock-token-${userId}-${Date.now()}`;

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
  };
}

class MockApi {
  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = MOCK_USERS.get(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;
    return {
      token: generateToken(user.id),
      user: userWithoutPassword,
    };
  }

  async register({ email, password, name }: RegisterCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    if (MOCK_USERS.has(email)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: (MOCK_USERS.size + 1).toString(),
      email,
      password,
      name,
    };

    MOCK_USERS.set(email, newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return {
      token: generateToken(newUser.id),
      user: userWithoutPassword,
    };
  }
}

export const mockApi = new MockApi(); 