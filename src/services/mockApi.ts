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

export interface PasswordResetRequest {
  email: string;
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

  async requestPasswordReset({ email }: PasswordResetRequest): Promise<void> {
    console.log('MockApi: Password reset requested for:', email);
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = MOCK_USERS.get(email);
    if (!user) {
      console.log('MockApi: User not found for password reset');
      // We don't want to reveal if an email exists or not for security reasons
      return;
    }

    // In a real implementation, this would:
    // 1. Generate a reset token
    // 2. Store it with an expiration
    // 3. Send an email with the reset link
    console.log('MockApi: Reset email would be sent to:', email);
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    console.log('MockApi: Resetting password for:', email);
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

    const user = MOCK_USERS.get(email);
    if (!user) {
      throw new Error('Invalid reset request');
    }

    // In a real implementation, this would:
    // 1. Verify the reset token
    // 2. Check if it's expired
    // 3. Update the password in the database
    user.password = newPassword;
    MOCK_USERS.set(email, user);
    console.log('MockApi: Password updated successfully');
  }
}

export const mockApi = new MockApi(); 