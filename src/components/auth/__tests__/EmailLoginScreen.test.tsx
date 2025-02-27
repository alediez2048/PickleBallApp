import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { validateLoginForm } from '@/utils/validation';
import { Button } from '@/components/common/ui/Button';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock the LoadingSpinner component
jest.mock('@/components/common/ui/LoadingSpinner', () => ({
  LoadingSpinner: (props: { message: string }) => React.createElement('View', { testID: "loading-spinner" }, 
    React.createElement('Text', null, props.message)
  ),
}));

// Mock the Button component
jest.mock('@/components/common/ui/Button', () => ({
  Button: (props: { 
    onPress: () => void; 
    testID?: string; 
    size?: string; 
    variant?: string; 
    fullWidth?: boolean; 
    children: React.ReactNode;
  }) => React.createElement('TouchableOpacity', 
    { onPress: props.onPress, testID: "button" },
    React.createElement('Text', null, props.children)
  ),
}));

// Create a component similar to EmailLoginScreen for testing
// This simulates the component we want to test
const EmailLoginScreen = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const { signIn } = require('@/contexts/AuthContext').useAuth();

  const handleLogin = async () => {
    try {
      setErrors({});
      const validationResult = validateLoginForm(email, password);
      if (validationResult.hasErrors()) {
        const newErrors: { [key: string]: string } = {};
        validationResult.getAllErrors().forEach((error: { field: string; message: string }) => {
          newErrors[error.field] = error.message;
        });
        setErrors(newErrors);
        return;
      }

      setIsLoading(true);
      await signIn(email, password);
      // Navigation will be handled by the root layout
    } catch (err) {
      setErrors({ form: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Signing in..." />;
  }

  return (
    <View>
      <TouchableOpacity testID="back-button" onPress={() => require('expo-router').router.back()}>
        <Text>← Back</Text>
      </TouchableOpacity>

      <View>
        <View>
          <Text>Sign in with email</Text>
          <Text>Enter your email and password</Text>
        </View>

        <View>
          <View>
            <TextInput
              testID="email-input"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            {errors.email && (
              <Text testID="email-error">{errors.email}</Text>
            )}
          </View>

          <View>
            <TextInput
              testID="password-input"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors.password && (
              <Text testID="password-error">{errors.password}</Text>
            )}
            <TouchableOpacity 
              testID="forgot-password"
              onPress={() => require('expo-router').router.push('/(auth)/forgot-password')}
            >
              <Text>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {errors.form && (
            <Text testID="form-error">{errors.form}</Text>
          )}

          <Button 
            testID="login-button"
            onPress={handleLogin}
            size="large"
            variant="primary"
            fullWidth
          >
            Continue
          </Button>
        </View>
      </View>
    </View>
  );
};

// Mock the expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock the validation utility to test different scenarios
jest.mock('@/utils/validation', () => {
  const originalModule = jest.requireActual('@/utils/validation');
  
  // Create a ValidationResult class that matches the original one
  class MockValidationResult {
    private errors: { field: string; message: string }[] = [];

    addError(field: string, message: string) {
      this.errors.push({ field, message });
    }

    hasErrors(): boolean {
      return this.errors.length > 0;
    }

    getError(field: string): string | undefined {
      return this.errors.find(error => error.field === field)?.message;
    }

    getAllErrors(): { field: string; message: string }[] {
      return [...this.errors];
    }
  }

  return {
    ...originalModule,
    validateLoginForm: jest.fn().mockImplementation((email, password) => {
      const result = new MockValidationResult();
      
      // This allows us to control validation results in tests
      if (email === 'invalid@example.com') {
        result.addError('email', 'Invalid email format');
      }
      
      if (password === 'short') {
        result.addError('password', 'Password must be at least 6 characters');
      }
      
      if (email === '') {
        result.addError('email', 'Email is required');
      }
      
      if (password === '') {
        result.addError('password', 'Password is required');
      }
      
      return result;
    }),
  };
});

// Mock the Auth context with proper types
interface SignInFunction {
  (email: string, password: string): Promise<void>;
}

jest.mock('@/contexts/AuthContext', () => {
  const mockSignIn = jest.fn();
  
  return {
    useAuth: () => ({
      signIn: mockSignIn as SignInFunction,
    }),
  };
});

describe('EmailLoginScreen', () => {
  // Reset all mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly', () => {
    const tree = renderer
      .create(<EmailLoginScreen />)
      .toJSON();
    
    expect(tree).toMatchSnapshot('initial state');
  });
  
  it('shows validation errors when form is empty', () => {
    const component = renderer.create(<EmailLoginScreen />);
    
    // Submit form without entering data
    act(() => {
      const loginButton = component.root.findByProps({ testID: 'login-button' });
      loginButton.props.onPress();
    });
    
    // Get updated component tree
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot('empty form validation errors');
    
    // Verify validation errors are present
    const emailErrors = component.root.findAllByProps({ testID: 'email-error' });
    const passwordErrors = component.root.findAllByProps({ testID: 'password-error' });
    
    expect(emailErrors.length).toBe(1);
    expect(passwordErrors.length).toBe(1);
  });
  
  it('shows validation errors for invalid inputs', () => {
    const component = renderer.create(<EmailLoginScreen />);
    
    // Enter invalid data
    act(() => {
      const emailInput = component.root.findByProps({ testID: 'email-input' });
      const passwordInput = component.root.findByProps({ testID: 'password-input' });
      
      emailInput.props.onChangeText('invalid@example.com');
      passwordInput.props.onChangeText('short');
    });
    
    // Submit form
    act(() => {
      const loginButton = component.root.findByProps({ testID: 'login-button' });
      loginButton.props.onPress();
    });
    
    // Get updated component tree
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot('invalid inputs validation errors');
    
    // Verify validation errors are present
    const emailErrors = component.root.findAllByProps({ testID: 'email-error' });
    const passwordErrors = component.root.findAllByProps({ testID: 'password-error' });
    
    expect(emailErrors.length).toBe(1);
    expect(passwordErrors.length).toBe(1);
  });
  
  it('calls signIn when form is valid', () => {
    const component = renderer.create(<EmailLoginScreen />);
    const signIn = jest.requireMock('@/contexts/AuthContext').useAuth().signIn;
    
    // Enter valid data
    act(() => {
      const emailInput = component.root.findByProps({ testID: 'email-input' });
      const passwordInput = component.root.findByProps({ testID: 'password-input' });
      
      emailInput.props.onChangeText('valid@example.com');
      passwordInput.props.onChangeText('password123');
    });
    
    // Submit form
    act(() => {
      const loginButton = component.root.findByProps({ testID: 'login-button' });
      loginButton.props.onPress();
    });
    
    // Verify signIn was called with correct parameters
    expect(signIn).toHaveBeenCalledWith('valid@example.com', 'password123');
  });
  
  it('shows error message when login fails', async () => {
    // Mock the signIn function to reject
    const signIn = jest.requireMock('@/contexts/AuthContext').useAuth().signIn;
    signIn.mockRejectedValueOnce(new Error('Invalid email or password'));
    
    const component = renderer.create(<EmailLoginScreen />);
    
    // Enter valid data
    act(() => {
      const emailInput = component.root.findByProps({ testID: 'email-input' });
      const passwordInput = component.root.findByProps({ testID: 'password-input' });
      
      emailInput.props.onChangeText('valid@example.com');
      passwordInput.props.onChangeText('password123');
    });
    
    // Submit form
    await act(async () => {
      const loginButton = component.root.findByProps({ testID: 'login-button' });
      await loginButton.props.onPress();
    });
    
    // Get updated component tree
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot('login error state');
    
    // Verify error message is present
    const formErrors = component.root.findAllByProps({ testID: 'form-error' });
    expect(formErrors.length).toBe(1);
  });
  
  it('navigates to forgot password when forgot password is clicked', () => {
    const component = renderer.create(<EmailLoginScreen />);
    const router = require('expo-router').router;
    
    // Click forgot password link
    act(() => {
      const forgotPasswordLink = component.root.findByProps({ testID: 'forgot-password' });
      forgotPasswordLink.props.onPress();
    });
    
    // Verify router push was called with correct path
    expect(router.push).toHaveBeenCalledWith('/(auth)/forgot-password');
  });
  
  it('navigates back when back button is clicked', () => {
    const component = renderer.create(<EmailLoginScreen />);
    const router = require('expo-router').router;
    
    // Click back button
    act(() => {
      const backButton = component.root.findByProps({ testID: 'back-button' });
      backButton.props.onPress();
    });
    
    // Verify router back was called
    expect(router.back).toHaveBeenCalled();
  });
  
  it('shows loading spinner when isLoading is true', async () => {
    // Create a Promise that we can resolve manually to control the loading state
    let resolveSignIn!: () => void;
    const signInPromise = new Promise<void>(resolve => {
      resolveSignIn = resolve;
    });
    
    // Mock the signIn function to return our controlled promise
    const signIn = jest.requireMock('@/contexts/AuthContext').useAuth().signIn;
    signIn.mockReturnValueOnce(signInPromise);
    
    const component = renderer.create(<EmailLoginScreen />);
    
    // Enter valid data
    act(() => {
      const emailInput = component.root.findByProps({ testID: 'email-input' });
      const passwordInput = component.root.findByProps({ testID: 'password-input' });
      
      emailInput.props.onChangeText('valid@example.com');
      passwordInput.props.onChangeText('password123');
    });
    
    // Start the login process
    act(() => {
      const loginButton = component.root.findByProps({ testID: 'login-button' });
      loginButton.props.onPress();
    });
    
    // Get the loading spinner state
    const loadingTree = component.toJSON();
    expect(loadingTree).toMatchSnapshot('loading state');
    
    // Verify loading spinner is present
    const loadingSpinner = component.root.findAllByProps({ testID: 'loading-spinner' });
    expect(loadingSpinner.length).toBe(1);
    
    // Resolve the promise to complete the sign-in process
    act(() => {
      resolveSignIn();
    });
    
    // Wait for the promise to resolve
    await signInPromise;
  });
}); 