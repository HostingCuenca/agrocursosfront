// import axios from 'axios';
//
// const API_BASE = process.env.REACT_APP_API_BASE_URL;
//
// const api = axios.create({
//     baseURL: API_BASE,
//     headers: {
//         'Content-Type': 'application/json'
//     }
// });
//
// // Interceptor para añadir token
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('authToken');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );
//
// // Interceptor para manejar errores
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             localStorage.removeItem('authToken');
//             localStorage.removeItem('userData');
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );
//
// export const authService = {
//     login: async (credentials) => {
//         const response = await api.post('/auth/login', credentials);
//         return response.data;
//     },
//
//     register: async (userData) => {
//         const response = await api.post('/auth/register', userData);
//         return response.data;
//     },
//
//     getProfile: async () => {
//         const response = await api.get('/auth/profile');
//         return response.data;
//     }
// };
//
// export default api;

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para añadir token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    // Iniciar sesión
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Registrar usuario
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    // Obtener perfil del usuario
    getProfile: async () => {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    // Actualizar perfil del usuario
    updateProfile: async (userData) => {
        try {
            const response = await api.put('/auth/profile', userData);
            return response.data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },

    // Cambiar contraseña
    changePassword: async (passwordData) => {
        try {
            const response = await api.put('/auth/change-password', passwordData);
            return response.data;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    },

    // Solicitar restablecimiento de contraseña
    requestPasswordReset: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            console.error('Request password reset error:', error);
            throw error;
        }
    },

    // Restablecer contraseña
    resetPassword: async (token, newPassword) => {
        try {
            const response = await api.post('/auth/reset-password', {
                token,
                password: newPassword
            });
            return response.data;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },

    // Verificar token
    verifyToken: async () => {
        try {
            const response = await api.get('/auth/verify-token');
            return response.data;
        } catch (error) {
            console.error('Verify token error:', error);
            throw error;
        }
    },

    // Logout (opcional - lado del servidor)
    logout: async () => {
        try {
            const response = await api.post('/auth/logout');
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            // No lanzar error aquí porque el logout local debe funcionar aunque falle el servidor
            return null;
        }
    }
};

export default api;