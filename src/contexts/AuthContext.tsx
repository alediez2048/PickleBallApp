import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { router } from "expo-router";
import {
  mockApi,
  FirstTimeProfileData,
  UpdateProfileData,
} from "@/services/mockApi";
import { storage } from "@/services/storage";
import { socialAuth } from "@/services/socialAuth";
import { Alert, Platform } from "react-native";
import { MembershipPlan } from "@/types/membership";
import {
  signUpWithEmail,
  signInWithEmail,
  getSession,
  logout,
} from "@/services/authService";
import { createUserProfile } from "@/services/userService";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  isVerified?: boolean;
  skillLevel?: string;
  profileImage?:
    | string
    | {
        uri: string;
        base64: string;
        timestamp: number;
      };
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  membership?: MembershipPlan;
  paymentMethods?: PaymentMethod[];
  hasCompletedProfile?: boolean;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  session: any | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;

  // Social authentication methods
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;

  // Profile management methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateFirstTimeProfile: (data: FirstTimeProfileData) => Promise<void>;
  updateMembership: (plan: MembershipPlan) => Promise<void>;
  updatePaymentMethods: (methods: PaymentMethod[]) => Promise<void>;
  updatePaymentMethod?: (hasPaymentMethod: boolean) => Promise<void>;

  // Auth state
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    // Load token and user data from storage on app start
    loadStoredAuth();
  }, []);

  useEffect(() => {
    // Only navigate when auth state changes, not on every loading state change
    if (!state.isLoading && state.token === null) {
      router.replace("/login");
    }
  }, [state.token]);

  const loadStoredAuth = async () => {
    try {
      console.log("Loading stored auth data...");

      const [token, userString] = await Promise.all([
        AsyncStorage.getItem("auth_token"),
        AsyncStorage.getItem("user"),
      ]);

      console.log("Stored auth data:", { token, userString });

      if (token && userString) {
        const user = JSON.parse(userString);

        const { data, error } = await getSession();

        if (error || !data?.session) {
          console.warn("Session expired or invalid in Supabase");
          await AsyncStorage.multiRemove(["auth_token", "user"]);
          setState({
            token: null,
            session: null,
            user: null,
            isLoading: false,
          });
          return;
        }

        console.log("Supabase session is valid");
        setState({
          token: data.session.access_token,
          session: data.session,
          user,
          isLoading: false,
        });
      } else {
        setState({ token: null, session: null, user: null, isLoading: false });
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
      setState({ token: null, session: null, user: null, isLoading: false });
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log("[Auth] Starting registration process", { email, name });
      setState((prev) => ({ ...prev, isLoading: true }));

      const { data, error } = await signUpWithEmail(email, password);
      if (error) throw new Error(error.message);

      const userId = data?.user?.id;
      if (userId) {
        await createUserProfile(userId, { name, email });
        setState({
          session: data.session,
          token: data.session?.access_token || null,
          user: data.user,
          isLoading: false,
        });

        // Store the auth data
        await Promise.all([
          data.session?.access_token
            ? storage.setItem("auth_token", data.session.access_token)
            : Promise.resolve(),
          storage.setItem("user", JSON.stringify(data.user)),
        ]);
        console.log("[Auth] User data stored in local storage");
      }
    } catch (error) {
      console.error("[Auth] Registration failed:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in...", { email });
      setState((prev) => ({ ...prev, isLoading: true }));

      const { data, error } = await signInWithEmail(email, password);

      if (error || !data.session) {
        throw new Error(error?.message || "No session returned");
      }

      const token = data.session.access_token;
      const user = data.user;
      const session = data.session;

      console.log("Sign in successful:", { token, user });

      await Promise.all([
        AsyncStorage.setItem("auth_token", token),
        AsyncStorage.setItem("user", JSON.stringify(user)),
      ]);

      console.log("Auth data stored");

      setState({ token, session, user, isLoading: false });
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      setState((prev) => ({ ...prev, isLoading: true }));

      await Promise.all([
        storage.removeItem("auth_token"),
        storage.removeItem("user"),
      ]);
      console.log("Auth data removed");

      setState({ token: null, user: null, isLoading: false });
    } catch (error) {
      console.error("Sign out error:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const handleSocialAuthSuccess = async (
    provider: "google" | "facebook",
    token: string,
    user: { id: string; email: string; name: string; photoUrl?: string }
  ) => {
    try {
      const response = await mockApi.socialAuth({ token, provider, user });

      await Promise.all([
        storage.setItem("auth_token", response.token),
        storage.setItem("user", JSON.stringify(response.user)),
      ]);

      setState({
        token: response.token,
        user: response.user,
        isLoading: false,
      });
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      Alert.alert("Error", `Failed to authenticate with ${provider}`);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const result = await socialAuth.signInWithGoogle();

      if (result.type === "success" && result.token && result.user) {
        await handleSocialAuthSuccess("google", result.token, result.user);
      } else {
        throw new Error(result.message || "Google sign in failed");
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      Alert.alert("Error", "Failed to sign in with Google");
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const signInWithFacebook = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const result = await socialAuth.signInWithFacebook();

      if (result.type === "success" && result.token && result.user) {
        await handleSocialAuthSuccess("facebook", result.token, result.user);
      } else {
        throw new Error(result.message || "Facebook sign in failed");
      }
    } catch (error) {
      console.error("Facebook sign in error:", error);
      Alert.alert("Error", "Failed to sign in with Facebook");
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      if (!state.user?.email) {
        throw new Error("No authenticated user");
      }

      // Map UserProfile to UpdateProfileData
      const profileUpdates: UpdateProfileData = { ...updates } as any;

      // Handle address mapping if it exists
      if (updates.address) {
        profileUpdates.address = {
          address: updates.address.street || "",
          city: updates.address.city || "",
          state: updates.address.state || "",
          zipCode: updates.address.zipCode || "",
          country: updates.address.country || "United States",
        };
      }

      const { user: updatedUser } = await mockApi.updateProfile(
        state.user.email,
        profileUpdates
      );

      // Store the updated user data
      await storage.setItem("user", JSON.stringify(updatedUser));

      setState((prev) => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));

      console.log("Profile updated successfully:", updatedUser);
    } catch (error) {
      console.error("Profile update error:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const updateFirstTimeProfile = async (data: FirstTimeProfileData) => {
    try {
      console.debug("[AuthContext] Starting first time profile update", {
        platform: Platform.OS,
        hasUser: !!state.user,
        userEmail: state.user?.email,
        data,
      });

      setState((prev) => ({ ...prev, isLoading: true }));

      if (!state.user?.email) {
        console.error("[AuthContext] No authenticated user found");
        throw new Error("No authenticated user");
      }

      // Map FirstTimeProfileData to UpdateProfileData
      const profileData: UpdateProfileData = {
        skillLevel: data.skillLevel,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        address: {
          address: data.address.address,
          city: data.address.city,
          state: data.address.state,
          zipCode: data.address.zipCode,
          country: data.address.country,
        },
        hasCompletedProfile: true,
      };

      console.debug("[AuthContext] Calling mockApi.updateProfile", {
        email: state.user.email,
        profileData,
      });

      const { user: updatedUser } = await mockApi.updateProfile(
        state.user.email,
        profileData
      );

      console.debug("[AuthContext] Profile update API call successful", {
        updatedUser,
      });

      // After successful profile update, update the stored user data
      const userWithProfile = {
        ...updatedUser,
        hasCompletedProfile: true,
      };

      console.debug("[AuthContext] Storing updated user data");
      await storage.setItem("user", JSON.stringify(userWithProfile));

      console.debug("[AuthContext] Updating state with new user data");
      setState((prev) => ({
        ...prev,
        user: userWithProfile,
        isLoading: false,
      }));

      console.debug(
        "[AuthContext] First time profile update completed successfully"
      );
    } catch (error) {
      console.error("[AuthContext] Profile update error:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const updateMembership = async (plan: MembershipPlan) => {
    try {
      if (!state.user) {
        throw new Error("No authenticated user");
      }

      // Update user with new membership plan
      const updatedUser = {
        ...state.user,
        membership: plan,
      };

      // Store the updated user data
      await storage.setItem("user", JSON.stringify(updatedUser));

      // Update state
      setState((prev) => ({
        ...prev,
        user: updatedUser,
      }));

      console.log("Membership updated successfully:", plan);
    } catch (error) {
      console.error("Error updating membership:", error);
      throw error;
    }
  };

  const updatePaymentMethods = async (methods: PaymentMethod[]) => {
    try {
      if (!state.user) {
        throw new Error("No authenticated user");
      }

      // Update user with new payment methods
      const updatedUser = {
        ...state.user,
        paymentMethods: methods,
      };

      // Store the updated user data
      await storage.setItem("user", JSON.stringify(updatedUser));

      // Update state
      setState((prev) => ({
        ...prev,
        user: updatedUser,
      }));

      console.log("Payment methods updated successfully:", methods);
    } catch (error) {
      console.error("Error updating payment methods:", error);
      throw error;
    }
  };

  const updatePaymentMethod = async (hasPaymentMethod: boolean) => {
    try {
      if (!state.user) {
        throw new Error("No authenticated user");
      }

      // Update user with new payment method
      const updatedUser = {
        ...state.user,
        paymentMethods: hasPaymentMethod
          ? [
              {
                id: "new_payment_method",
                last4: "XXXX",
                brand: "New",
                expiryMonth: "12",
                expiryYear: "2024",
                isDefault: true,
              },
            ]
          : [],
      };

      // Store the updated user data
      await storage.setItem("user", JSON.stringify(updatedUser));

      // Update state
      setState((prev) => ({
        ...prev,
        user: updatedUser,
      }));

      console.log(
        "Payment method updated successfully:",
        hasPaymentMethod ? "Added" : "Removed"
      );
    } catch (error) {
      console.error("Error updating payment method:", error);
      throw error;
    }
  };

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    updateProfile,
    updateFirstTimeProfile,
    updateMembership,
    updatePaymentMethods,
    updatePaymentMethod,
    isAuthenticated: !!state.token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
