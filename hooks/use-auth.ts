"use client";

import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/config";

type AuthState = {
  user: User | null;
  idToken: string | null;
  loading: boolean;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    idToken: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setState({ user: null, idToken: null, loading: false });
        return;
      }
      const idToken = await user.getIdToken();
      setState({ user, idToken, loading: false });
    });
    return unsubscribe;
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );
      const idToken = await credential.user.getIdToken();
      setState({ user: credential.user, idToken, loading: false });
      return credential.user;
    },
    [],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );
      const idToken = await credential.user.getIdToken();
      setState({ user: credential.user, idToken, loading: false });
      return credential.user;
    },
    [],
  );

  const signInWithDebugToken = useCallback(async (customToken: string) => {
    const credential = await signInWithCustomToken(firebaseAuth, customToken);
    const idToken = await credential.user.getIdToken();
    setState({ user: credential.user, idToken, loading: false });
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(firebaseAuth);
    setState({ user: null, idToken: null, loading: false });
  }, []);

  const refreshToken = useCallback(async () => {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    const idToken = await user.getIdToken(true);
    setState((prev) => ({ ...prev, idToken }));
  }, []);

  return {
    ...state,
    signUpWithEmail,
    signInWithEmail,
    signInWithDebugToken,
    signOut,
    refreshToken,
  };
}
