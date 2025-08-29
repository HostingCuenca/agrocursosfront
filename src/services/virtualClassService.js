import api from './authService';

export const virtualClassService = {
    // ========== PARA ADMINISTRADORES E INSTRUCTORES ==========
    
    // Crear clase virtual para un curso específico
    createVirtualClass: async (courseId, classData) => {
        try {
            const apiData = {
                title: classData.title,
                description: classData.description,
                meeting_url: classData.meeting_url,
                meeting_id: classData.meeting_id,
                meeting_password: classData.meeting_password,
                scheduled_at: classData.scheduled_at,
                duration_minutes: parseInt(classData.duration_minutes) || 60,
                max_participants: parseInt(classData.max_participants) || 50
            };
            
            const response = await api.post(`/virtual-classes/courses/${courseId}/virtual-classes`, apiData);
            return response.data;
        } catch (error) {
            console.error('Create virtual class error:', error);
            throw error;
        }
    },

    // Listar clases virtuales de un curso específico
    getVirtualClassesByCourse: async (courseId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.upcoming) queryParams.append('upcoming', 'true');
            if (params.status) queryParams.append('status', params.status);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            const url = `/virtual-classes/courses/${courseId}/virtual-classes${
                queryParams.toString() ? '?' + queryParams.toString() : ''
            }`;
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Get virtual classes by course error:', error);
            throw error;
        }
    },

    // Obtener clase virtual específica
    getVirtualClassById: async (virtualClassId) => {
        try {
            const response = await api.get(`/virtual-classes/${virtualClassId}`);
            return response.data;
        } catch (error) {
            console.error('Get virtual class by ID error:', error);
            throw error;
        }
    },

    // Actualizar clase virtual
    updateVirtualClass: async (classId, updateData) => {
        try {
            const apiData = {};
            
            if (updateData.title) apiData.title = updateData.title;
            if (updateData.description) apiData.description = updateData.description;
            if (updateData.meeting_url) apiData.meeting_url = updateData.meeting_url;
            if (updateData.meeting_id) apiData.meeting_id = updateData.meeting_id;
            if (updateData.meeting_password) apiData.meeting_password = updateData.meeting_password;
            if (updateData.scheduled_at) apiData.scheduled_at = updateData.scheduled_at;
            if (updateData.duration_minutes) apiData.duration_minutes = parseInt(updateData.duration_minutes);
            if (updateData.max_participants) apiData.max_participants = parseInt(updateData.max_participants);
            
            const response = await api.put(`/virtual-classes/${classId}`, apiData);
            return response.data;
        } catch (error) {
            console.error('Update virtual class error:', error);
            throw error;
        }
    },

    // Cancelar clase virtual (instructor/admin)
    deleteVirtualClass: async (virtualClassId) => {
        try {
            const response = await api.delete(`/virtual-classes/${virtualClassId}`);
            return response.data;
        } catch (error) {
            console.error('Delete virtual class error:', error);
            throw error;
        }
    },

    // Registrarse para clase virtual (student)
    registerForVirtualClass: async (virtualClassId) => {
        try {
            const response = await api.post(`/virtual-classes/${virtualClassId}/register`);
            return response.data;
        } catch (error) {
            console.error('Register for virtual class error:', error);
            throw error;
        }
    },

    // Cancelar registro de clase virtual (student)
    unregisterFromVirtualClass: async (virtualClassId) => {
        try {
            const response = await api.delete(`/virtual-classes/${virtualClassId}/register`);
            return response.data;
        } catch (error) {
            console.error('Unregister from virtual class error:', error);
            throw error;
        }
    },

    // Marcar asistencia de estudiantes (instructor/admin)
    markAttendance: async (virtualClassId, attendanceData) => {
        try {
            const response = await api.post(`/virtual-classes/${virtualClassId}/attendance`, {
                attendances: attendanceData
            });
            return response.data;
        } catch (error) {
            console.error('Mark attendance error:', error);
            throw error;
        }
    },

    // ========== PARA ESTUDIANTES ==========
    
    // Ver clases virtuales del estudiante (solo cursos inscritos)
    getStudentVirtualClasses: async (studentId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.upcoming) queryParams.append('upcoming', 'true');
            if (params.status) queryParams.append('status', params.status);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            const url = `/virtual-classes/students/${studentId}/virtual-classes${
                queryParams.toString() ? '?' + queryParams.toString() : ''
            }`;
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Get student virtual classes error:', error);
            throw error;
        }
    },

    // Obtener asistencia de una clase virtual (instructor/admin)
    getVirtualClassAttendance: async (virtualClassId) => {
        try {
            const response = await api.get(`/virtual-classes/${virtualClassId}/attendance`);
            return response.data;
        } catch (error) {
            console.error('Get virtual class attendance error:', error);
            throw error;
        }
    },

    // Obtener estudiantes registrados en una clase virtual
    getVirtualClassRegistrations: async (virtualClassId) => {
        try {
            const response = await api.get(`/virtual-classes/${virtualClassId}/registrations`);
            return response.data;
        } catch (error) {
            console.error('Get virtual class registrations error:', error);
            throw error;
        }
    },

    // ========== FUNCIONES AUXILIARES ==========
    
    // Formatear fecha para mostrar
    formatScheduledDate: (scheduledAt) => {
        const date = new Date(scheduledAt);
        return {
            date: date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            datetime: date.toLocaleString('es-ES'),
            iso: scheduledAt
        };
    },

    // Calcular estado de la clase
    getClassStatus: (scheduledAt, status, durationMinutes = 60, isRegistered = false, userRole = 'student') => {
        const now = new Date();
        const classDate = new Date(scheduledAt);
        const classEnd = new Date(classDate.getTime() + (durationMinutes * 60000));
        
        if (status === 'cancelled') {
            return {
                status: 'cancelled',
                text: 'Cancelada',
                color: 'red',
                canJoin: false,
                canEdit: false,
                showMeetingLink: false
            };
        }
        
        if (status === 'completed') {
            return {
                status: 'completed',
                text: 'Completada',
                color: 'green',
                canJoin: false,
                canEdit: false,
                showMeetingLink: false
            };
        }
        
        if (now < classDate) {
            // Clase futura
            const minutesUntilStart = Math.floor((classDate - now) / 60000);
            const canJoinSoon = minutesUntilStart <= 15; // Permitir unirse 15 min antes
            
            // Los estudiantes registrados pueden ver el enlace siempre
            // Los instructores/admins pueden verlo siempre
            const showMeetingLink = (isRegistered && userRole === 'student') || userRole !== 'student';
            
            return {
                status: 'scheduled',
                text: canJoinSoon ? 'Próxima a comenzar' : 'Programada',
                color: canJoinSoon ? 'orange' : 'blue',
                canJoin: canJoinSoon,
                canEdit: true,
                minutesUntilStart,
                showMeetingLink
            };
        }
        
        if (now >= classDate && now <= classEnd) {
            // Clase en progreso
            return {
                status: 'ongoing',
                text: 'En vivo',
                color: 'green',
                canJoin: true,
                canEdit: false,
                showMeetingLink: isRegistered || userRole !== 'student'
            };
        }
        
        // Clase pasada
        return {
            status: 'past',
            text: 'Finalizada',
            color: 'gray',
            canJoin: false,
            canEdit: false,
            showMeetingLink: false
        };
    },

    // Validar datos de clase virtual
    validateClassData: (classData, isEdit = false) => {
        const errors = {};
        
        if (!isEdit || classData.title) {
            if (!classData.title || classData.title.trim().length < 3) {
                errors.title = 'El título debe tener al menos 3 caracteres';
            }
        }
        
        if (!isEdit || classData.meeting_url) {
            if (!classData.meeting_url || !classData.meeting_url.includes('://')) {
                errors.meeting_url = 'La URL de la reunión es requerida y debe ser válida';
            }
        }
        
        if (!isEdit || classData.scheduled_at) {
            if (!classData.scheduled_at) {
                errors.scheduled_at = 'La fecha y hora son requeridas';
            } else {
                const scheduledDate = new Date(classData.scheduled_at);
                const now = new Date();
                
                if (scheduledDate <= now) {
                    errors.scheduled_at = 'La fecha debe ser futura';
                }
                
                // No permitir más de 1 año en el futuro
                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                
                if (scheduledDate > oneYearFromNow) {
                    errors.scheduled_at = 'La fecha no puede ser más de 1 año en el futuro';
                }
            }
        }
        
        if (classData.duration_minutes) {
            const duration = parseInt(classData.duration_minutes);
            if (duration < 15 || duration > 480) {
                errors.duration_minutes = 'La duración debe estar entre 15 y 480 minutos';
            }
        }
        
        if (classData.max_participants) {
            const maxParticipants = parseInt(classData.max_participants);
            if (maxParticipants < 1 || maxParticipants > 1000) {
                errors.max_participants = 'El máximo de participantes debe estar entre 1 y 1000';
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

export default virtualClassService;