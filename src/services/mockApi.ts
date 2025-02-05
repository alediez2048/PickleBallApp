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
    console.log('MockApi: Login attempt with:', { email, password });
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = MOCK_USERS.get(email);
    console.log('MockApi: Found user:', user);

    if (!user || user.password !== password) {
      console.log('MockApi: Invalid credentials');
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;
    const response = {
      token: generateToken(user.id),
      user: userWithoutPassword,
    };
    console.log('MockApi: Login successful:', response);
    return response;
  }

  async register({ email, password, name }: RegisterCredentials): Promise<AuthResponse> {
    console.log('MockApi: Register attempt with:', { email, name });
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    if (MOCK_USERS.has(email)) {
      console.log('MockApi: Email already registered');
      throw new Error('Email already registered');
    }

    const newUser = {
      id: (MOCK_USERS.size + 1).toString(),
      email,
      password,
      name,
    };

    MOCK_USERS.set(email, newUser);
    console.log('MockApi: New user registered:', newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    const response = {
      token: generateToken(newUser.id),
      user: userWithoutPassword,
    };
    console.log('MockApi: Registration successful:', response);
    return response;
  }
}

export const mockApi = new MockApi(); 