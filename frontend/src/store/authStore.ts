import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'user' | 'expert' | 'admin';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
    updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            login: (user, _token) => {
                // In a real app, you might decode the token or verify with backend
                // For now, we assume if we get a user and token, we are logged in
                set({ user, isAuthenticated: true, isLoading: false });
                // Local storage handling for token usually happens in API layer or here
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
            },

            checkAuth: async () => {
                // Simulate auth check
                set({ isLoading: true });
                try {
                    // Check for token in cookies or local storage
                    // If valid, fetch user
                    // For demo, we just stop loading
                } finally {
                    set({ isLoading: false });
                }
            },

            updateProfile: (data) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...data } : null
                }));
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
