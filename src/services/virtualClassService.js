import api from './authService';

export const virtualClassService = {
    // Obtener clases virtuales de un curso
    getCourseVirtualClasses: async (courseId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.upcoming) queryParams.append('upcoming', params.upcoming);
            if (params.past) queryParams.append('past', params.past);
            if (params.limit) queryParams.append('limit', params.limit);

            const response = await api.get(`/courses/${courseId}/virtual-classes?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Get course virtual classes error:', error);
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

    // Crear clase virtual (instructor/admin)
    createVirtualClass: async (courseId, virtualClassData) => {
        try {
            const response = await api.post(`/courses/${courseId}/virtual-classes`, virtualClassData);
            return response.data;
        } catch (error) {
            console.error('Create virtual class error:', error);
            throw error;
        }
    },

    // Actualizar clase virtual (instructor/admin)
    updateVirtualClass: async (virtualClassId, virtualClassData) => {
        try {
            const response = await api.put(`/virtual-classes/${virtualClassId}`, virtualClassData);
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

    // Obtener clases virtuales de un estudiante
    getStudentVirtualClasses: async (studentId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.upcoming) queryParams.append('upcoming', params.upcoming);
            if (params.past) queryParams.append('past', params.past);
            if (params.registered) queryParams.append('registered', params.registered);

            const response = await api.get(`/students/${studentId}/virtual-classes?${queryParams.toString()}`);
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
    }
};

export default virtualClassService;