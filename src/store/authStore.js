
import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,

    // Función para login
    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const response = await authService.login(credentials);

            const { user, token } = response;

            // Guardar en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false,
                error: null
            });

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al iniciar sesión';
            set({
                loading: false,
                error: errorMessage,
                isAuthenticated: false,
                user: null,
                token: null
            });
            throw error;
        }
    },

    // Función para registro
    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const response = await authService.register(userData);

            const { user, token } = response;

            // Guardar en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false,
                error: null
            });

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al registrar usuario';
            set({
                loading: false,
                error: errorMessage,
                isAuthenticated: false,
                user: null,
                token: null
            });
            throw error;
        }
    },

    // Función para logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null
        });
    },

    // Función para verificar autenticación
    checkAuth: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Limpiar datos corruptos
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    loading: false,
                    error: null
                });
            }
        } else {
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: null
            });
        }
    },

    // Función para limpiar errores
    clearError: () => set({ error: null }),

    // Función para actualizar perfil de usuario
    updateUserProfile: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            set({ user: updatedUser });
        }
    },

    // Función para obtener el perfil del usuario
    getProfile: async () => {
        try {
            const response = await authService.getProfile();
            const { user } = response;

            // Actualizar user data
            localStorage.setItem('user', JSON.stringify(user));
            set({ user });

            return response;
        } catch (error) {
            console.error('Error getting profile:', error);
            throw error;
        }
    }
}));

export default useAuthStore;