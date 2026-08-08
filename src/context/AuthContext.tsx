"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { seedCurriculumForUser } from "@/lib/data-access/subjects";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dedicated Single-User Personal Credentials
const SINGLE_USER_EMAIL =
  process.env.NEXT_PUBLIC_STUDYOS_USER_EMAIL || "maxwell.mathew@studyos.local";
const SINGLE_USER_PASSWORD =
  process.env.NEXT_PUBLIC_STUDYOS_USER_PASSWORD || "studyos_personal_maxwell_2026";
const SINGLE_USER_NAME = "Maxwell";

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
          name: SINGLE_USER_NAME,
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

  useEffect(() => {
    let isMounted = true;

    async function initSingleUserAuth() {
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

        // 2. If no active session, authenticate single user silently in background
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: SINGLE_USER_EMAIL,
            password: SINGLE_USER_PASSWORD,
          });

        if (signInData?.session && signInData?.user) {
          if (!isMounted) return;
          setSession(signInData.session);
          setUser(signInData.user);
          await fetchProfile(signInData.user);
          if (isMounted) setLoading(false);
          return;
        }

        // 3. If single user account does not exist yet, provision it automatically
        if (signInError) {
          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
              email: SINGLE_USER_EMAIL,
              password: SINGLE_USER_PASSWORD,
              options: {
                data: {
                  full_name: SINGLE_USER_NAME,
                },
              },
            });

          if (signUpData?.user) {
            // Auto sign in if session was not returned by signup
            let activeSession = signUpData.session;
            if (!activeSession) {
              const res = await supabase.auth.signInWithPassword({
                email: SINGLE_USER_EMAIL,
                password: SINGLE_USER_PASSWORD,
              });
              activeSession = res.data?.session ?? null;
            }

            if (!isMounted) return;
            if (activeSession && signUpData.user) {
              setSession(activeSession);
              setUser(signUpData.user);
              await fetchProfile(signUpData.user);

              // Seed default curriculum for new personal workspace
              try {
                await seedCurriculumForUser(signUpData.user.id);
              } catch (seedErr) {
                console.warn("Curriculum auto-seed notice:", seedErr);
              }
            }
          } else if (signUpError) {
            console.error("Single user initialization notice:", signUpError.message);
          }
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSingleUserAuth();

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
      }}
    >
      {children}
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
