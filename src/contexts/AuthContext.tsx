import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { router } from "expo-router";
import { mockApi } from "@/services/mockApi";
import { storage } from "@/services/storage";
import { socialAuth } from "@/services/socialAuth";
import { Alert, Platform } from "react-native";
import { MembershipPlan } from "@/types/membership";
import { UserProfile } from "@/types/user";
import {
  signUpWithEmail,
  signInWithEmail,
  getSession,
  logout,
  resendConfirmationEmail,
} from "@/services/authService";
import {
  createUserProfile,
  updateUserProfile,
  getUserProfile,
} from "@/services/userService";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  updateProfile: (updates: Record<string, any>) => Promise<void>;
  resendConfirmationOfEmail: (email: string) => Promise<void>;
  updateMembership: (plan: MembershipPlan) => Promise<void>;

  // Auth state
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    session: null,
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
          user: {
            ...data.user,
            id: data.user?.id ?? "", // Ensure id is always a string
            email: data.user?.email ?? "",
          },
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
      const session = data.session;
      const user = data.user;

      console.log("Sign in successful:", { token, user });

      const { data: userProfile, error: profileError } = await getUserProfile(
        user.id
      );

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
      }

      const fullUserProfile = {
        ...user,
        ...userProfile,
      };

      await Promise.all([
        AsyncStorage.setItem("auth_token", token),
        AsyncStorage.setItem("user", JSON.stringify(fullUserProfile)),
      ]);

      console.log("Auth data stored successfully");

      setState({
        token,
        session,
        user: fullUserProfile,
        isLoading: false,
      });
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
        logout(),
      ]);
      console.log("Auth data removed");

      setState({ token: null, user: null, session: null, isLoading: false });
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
        session: null,
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

  const updateProfile = async (updates: Record<string, any>) => {
    try {
      if (!state.user?.id) {
        throw new Error("No authenticated user");
      }

      const { error } = await updateUserProfile(state.user.id, updates);
      if (error) {
        throw new Error(error.message);
      }

      const updatedUser = { ...state.user, ...updates };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setState((prev) => ({ ...prev, user: updatedUser }));
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  const updateMembership = async (plan: MembershipPlan) => {
    try {
      if (!state.user) {
        throw new Error("No authenticated user");
      }

      // Determine membership fields based on plan.id
      let membershipTier: string | null = null;
      let membershipStartDate: string | null = null;
      let membershipEndDate: string | null = null;

      if (plan.id === "drop-in") {
        membershipTier = "drop-in";
        membershipStartDate = null;
        membershipEndDate = null;
      } else if (plan.id === "monthly") {
        membershipTier = "monthly";
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        membershipStartDate = `${yyyy}-${mm}-${dd}`;

        // Calculate one month later (same day next month)
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        const yyyyEnd = nextMonth.getFullYear();
        const mmEnd = String(nextMonth.getMonth() + 1).padStart(2, "0");
        const ddEnd = String(nextMonth.getDate()).padStart(2, "0");
        membershipEndDate = `${yyyyEnd}-${mmEnd}-${ddEnd}`;
      } else {
        throw new Error("Invalid membership plan id");
      }

      // Update user profile in Supabase
      const { error } = await updateUserProfile(state.user.id, {
        membership: plan,
        has_payment_method: !!plan,
        membership_tier: membershipTier,
        membership_start_date: membershipStartDate,
        membership_end_date: membershipEndDate,
      });
      if (error) {
        throw new Error(error.message);
      }

      // Update user with new membership plan and membership fields
      const updatedUser = {
        ...state.user,
        membership: plan,
        has_payment_method: !!plan,
        membership_tier: membershipTier,
        membership_start_date: membershipStartDate,
        membership_end_date: membershipEndDate,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

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

  const resendConfirmationOfEmail = async (email: string) => {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      await resendConfirmationEmail(email);
      console.log("Confirmation email resent successfully");
    } catch (error) {
      console.error("Error resending confirmation email:", error);
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
    updateMembership,
    resendConfirmationOfEmail,
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
