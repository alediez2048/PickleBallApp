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
  getUserProfileByEmail,
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

  // Navigation for auth state is handled in RootLayoutNav; avoid redirecting here

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
      console.log("Error loading auth data:", error);
      setState({ token: null, session: null, user: null, isLoading: false });
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log("[Auth] Starting registration process", { email, name });

      // Optional pre-check in users table by email
      try {
        const { data: existingByEmail } = await getUserProfileByEmail(email);
        if (existingByEmail) {
          throw { code: "EMAIL_EXISTS", message: "Email already registered" };
        }
      } catch (preCheckErr) {
        console.log("Pre-check error:", preCheckErr);
        throw preCheckErr;
      }

      const { data, error } = await signUpWithEmail(email, password);
      if (error) {
        const msg = error.message?.toLowerCase?.() || "";
        if (msg.includes("already registered") || msg.includes("duplicate")) {
          throw { code: "EMAIL_EXISTS", message: "Email already registered" };
        }
        if (msg.includes("for security purposes")) {
          throw { code: "THROTTLED", message: error.message };
        }
        throw { code: "SIGNUP_FAILED", message: error.message };
      }

      const userId = data?.user?.id;
      if (userId) {
        // TODO: Remove is_verified true
        const userData = { name, email, is_verified: false };
        try {
          await createUserProfile(userId, userData);
        } catch (profileErr) {
          console.warn("[Auth] createUserProfile warning:", profileErr);
        }

        // Do not auto-authenticate after signup; require email verification
        console.log("[Auth] User created Successfully", { userId });
      }
    } catch (error) {
      console.log("[Auth] Registration failed:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in...", { email });

      const { data, error } = await signInWithEmail(email, password);

      if (error || !data.session) {
        const msg = error?.message || "No session returned";
        if (/email\s*not\s*confirmed/i.test(msg)) {
          throw { code: "EMAIL_NOT_CONFIRMED", message: "Email not confirmed" };
        }
        throw { code: "SIGNIN_FAILED", message: msg };
      }

      const token = data.session.access_token;
      const session = data.session;
      const user = data.user;

      console.log("Sign in successful:", { token, user });

      const { data: userProfile, error: profileError } = await getUserProfile(
        user.id
      );

      if (profileError) {
        console.log("Error fetching user profile:", profileError);
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

      setState((prev) => ({ ...prev, token, session, user: fullUserProfile }));
    } catch (error: any) {
      const msg = typeof error === "string" ? error : error?.message;
      console.log("Sign in error:", msg);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");

      await Promise.all([
        storage.removeItem("auth_token"),
        storage.removeItem("user"),
        logout(),
      ]);
      console.log("Auth data removed");

      setState((prev) => ({ ...prev, token: null, user: null, session: null }));
    } catch (error) {
      console.log("Sign out error:", error);
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
      console.log(`${provider} auth error:`, error);
      Alert.alert("Error", `Failed to authenticate with ${provider}`);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await socialAuth.signInWithGoogle();

      if (result.type === "success" && result.token && result.user) {
        await handleSocialAuthSuccess("google", result.token, result.user);
      } else {
        throw {
          code: "GOOGLE_SIGNIN_FAILED",
          message: result.message || "Google sign in failed",
        };
      }
    } catch (error) {
      console.log("Google sign in error:", error);
      Alert.alert("Error", "Failed to sign in with Google");
    }
  };

  const signInWithFacebook = async () => {
    try {
      const result = await socialAuth.signInWithFacebook();

      if (result.type === "success" && result.token && result.user) {
        await handleSocialAuthSuccess("facebook", result.token, result.user);
      } else {
        throw {
          code: "FACEBOOK_SIGNIN_FAILED",
          message: result.message || "Facebook sign in failed",
        };
      }
    } catch (error) {
      console.log("Facebook sign in error:", error);
      Alert.alert("Error", "Failed to sign in with Facebook");
    }
  };

  const updateProfile = async (updates: Record<string, any>) => {
    try {
      if (!state.user?.id) {
        throw { code: "NO_AUTH_USER", message: "No authenticated user" };
      }

      const { error } = await updateUserProfile(state.user.id, updates);
      if (error) {
        throw { code: "PROFILE_UPDATE_FAILED", message: error.message };
      }

      const updatedUser = { ...state.user, ...updates };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setState((prev) => ({ ...prev, user: updatedUser }));
    } catch (error) {
      console.log("Update profile error:", error);
      throw error;
    }
  };

  const updateMembership = async (plan: MembershipPlan) => {
    try {
      if (!state.user) {
        throw { code: "NO_AUTH_USER", message: "No authenticated user" };
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
        throw {
          code: "INVALID_PLAN_ID",
          message: "Invalid membership plan id",
        };
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
        throw { code: "MEMBERSHIP_UPDATE_FAILED", message: error.message };
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
      console.log("Error updating membership:", error);
      throw error;
    }
  };

  const resendConfirmationOfEmail = async (email: string) => {
    try {
      if (!email) {
        throw { code: "EMAIL_REQUIRED", message: "Email is required" };
      }

      const stateEmail = state.user?.email || null;
      console.log("[Auth] Resend confirmation requested", {
        requestedEmail: email,
        stateEmail,
        matchesUser: stateEmail ? stateEmail === email : null,
      });

      console.log("[Auth] Calling resendConfirmationEmail service...");
      const ok = await resendConfirmationEmail(email);
      console.log("[Auth] resendConfirmationEmail response:", ok);
      console.log("Confirmation email resent successfully");
    } catch (error) {
      console.log("Error resending confirmation email:", error);
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
    throw {
      code: "USE_AUTH_OUTSIDE_PROVIDER",
      message: "useAuth must be used within an AuthProvider",
    };
  }
  return context;
}
