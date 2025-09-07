import api from './authService';

export const userConfigService = {
    // ========== PARA ADMINISTRADORES ==========
    
    // Obtener todos los estudiantes con estadísticas (admin)
    getAllStudents: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.offset) queryParams.append('offset', params.offset);
            
            const url = `/user-config/all-students${
                queryParams.toString() ? '?' + queryParams.toString() : ''
            }`;
            
            const response = await api.get(url);
            console.log('🔍 getAllStudents - URL called:', url);
            console.log('🔍 getAllStudents - Full response:', response);
            console.log('🔍 getAllStudents - Response data:', response.data);
            console.log('🔍 getAllStudents - Students array:', response.data.students);
            if (response.data.students && response.data.students.length > 0) {
                console.log('🔍 getAllStudents - First student example:', response.data.students[0]);
                console.log('🔍 getAllStudents - First student certificates:', response.data.students[0].total_certificates);
                console.log('🔍 getAllStudents - First student enrollments:', response.data.students[0].total_enrollments);
            }
            return response.data;
        } catch (error) {
            console.error('Get all students error:', error);
            throw error;
        }
    },

    // Resetear contraseña de estudiante (admin)
    resetStudentPassword: async (studentId, newPassword) => {
        try {
            const response = await api.patch('/user-config/reset-student-password', {
                student_id: studentId,
                new_password: newPassword
            });
            return response.data;
        } catch (error) {
            console.error('Reset student password error:', error);
            throw error;
        }
    },

    // ========== PARA USUARIOS (ESTUDIANTES/INSTRUCTORES) ==========

    // Obtener mi perfil
    getMyProfile: async () => {
        try {
            const response = await api.get('/user-config/my-profile');
            return response.data;
        } catch (error) {
            console.error('Get my profile error:', error);
            throw error;
        }
    },

    // Actualizar mi perfil
    updateProfile: async (profileData) => {
        try {
            const response = await api.patch('/user-config/update-profile', profileData);
            return response.data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },

    // ========== FUNCIONES AUXILIARES ==========

    // Generar contraseña segura
    generateSecurePassword: (length = 12) => {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    },

    // Validar formato de email
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validar formato de teléfono
    validatePhone: (phone) => {
        if (!phone) return true; // El teléfono es opcional
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.length >= 10;
    },

    // Validar contraseña
    validatePassword: (password) => {
        if (!password) return { isValid: false, message: 'La contraseña es obligatoria' };
        if (password.length < 6) {
            return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }
        return { isValid: true, message: '' };
    },

    // Formatear estadísticas de usuario
    formatUserStats: (user) => {
        console.log('📊 formatUserStats - Input user:', user);
        console.log('📊 formatUserStats - user.total_certificates:', user.total_certificates);
        console.log('📊 formatUserStats - user.total_enrollments:', user.total_enrollments);
        console.log('📊 formatUserStats - user.last_activity_date:', user.last_activity_date);
        
        const result = {
            enrollments: user.total_enrollments || 0,
            completedCourses: user.completed_courses || 0,
            certificates: user.total_certificates || 0,
            avgProgress: user.avg_progress || 0,
            totalSpent: user.total_spent || 0,
            lastActivity: user.last_activity_date ? new Date(user.last_activity_date).toLocaleDateString('es-ES') : 'Nunca'
        };
        
        console.log('📊 formatUserStats - Output result:', result);
        return result;
    },

    // Determinar estado del usuario
    getUserStatus: (user) => {
        if (!user.is_active) {
            return { status: 'inactive', text: 'Inactivo', color: 'red' };
        }
        
        if (parseInt(user.total_enrollments) === 0) {
            return { status: 'new', text: 'Nuevo', color: 'blue' };
        }
        
        const progress = parseFloat(user.avg_progress) || 0;
        
        if (progress > 80) {
            return { status: 'active', text: 'Muy Activo', color: 'green' };
        }
        
        if (progress > 30) {
            return { status: 'moderate', text: 'Activo', color: 'yellow' };
        }
        
        return { status: 'low', text: 'Poco Activo', color: 'orange' };
    }
};

export default userConfigService;