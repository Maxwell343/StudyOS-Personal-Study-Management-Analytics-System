"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { seedCurriculumForUser } from "@/lib/data-access/subjects";
import { LoginForm } from "@/components/auth/LoginForm";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch or create profile for authenticated user
  const fetchProfile = useCallback(async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (error) {
        console.warn("Could not fetch profile:", error.message);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create profile if trigger didn't execute
        const newProfile: Database["public"]["Tables"]["profiles"]["Insert"] = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
          avatar_url: null,
        };
        const { data: created, error: createError } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .single();

        if (!createError && created) {
          setProfile(created);
        }
      }
    } catch (err) {
      console.warn("Error in fetchProfile:", err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  const signIn = useCallback(async (email: string, pass: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) return { error: error.message };

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        await fetchProfile(data.user);
        if (typeof window !== "undefined") {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = "/";
        }
      }
      return {};
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Sign in failed" };
    }
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, pass: string, name: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) return { error: error.message };

      let activeSession = data.session;
      let activeUser = data.user;

      if (!activeSession && activeUser) {
        // Sign in immediately after registration
        const res = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        activeSession = res.data?.session ?? null;
        activeUser = res.data?.user ?? activeUser;
      }

      if (activeSession && activeUser) {
        setSession(activeSession);
        setUser(activeUser);
        await fetchProfile(activeUser);

        // Auto-seed curriculum for newly registered user workspace
        try {
          await seedCurriculumForUser(activeUser.id);
        } catch (seedErr) {
          console.warn("Curriculum auto-seed notice:", seedErr);
        }

        if (typeof window !== "undefined") {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = "/";
        }
      }

      return {};
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Sign up failed" };
    }
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        // 1. Check existing persisted session
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession?.user) {
          if (!isMounted) return;
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user);
          if (isMounted) setLoading(false);
          return;
        }

        // 2. If explicit env credentials are supplied in .env.local for local testing
        const envEmail = process.env.NEXT_PUBLIC_STUDYOS_USER_EMAIL;
        const envPass = process.env.NEXT_PUBLIC_STUDYOS_USER_PASSWORD;

        if (envEmail && envPass) {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: envEmail,
            password: envPass,
          });

          if (signInData?.session && signInData?.user && isMounted) {
            setSession(signInData.session);
            setUser(signInData.user);
            await fetchProfile(signInData.user);
          }
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        refreshProfile,
        signIn,
        signUp,
        signOut,
      }}
    >
      {!session && !loading ? (
        <LoginForm onSignIn={signIn} onSignUp={signUp} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
