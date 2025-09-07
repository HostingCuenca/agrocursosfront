import api from './authService';

export const enrollmentService = {
    // Obtener todas las inscripciones (admin)
    getAllEnrollments: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.status) queryParams.append('status', params.status);
            if (params.course_id) queryParams.append('course_id', params.course_id);
            if (params.instructor_id) queryParams.append('instructor_id', params.instructor_id);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);

            const response = await api.get(`/enrollments/all?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Get all enrollments error:', error);
            throw error;
        }
    },

    // Obtener inscripciones de un curso específico (instructor/admin)
    getCourseEnrollments: async (courseId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.status) queryParams.append('status', params.status);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);

            const response = await api.get(`/enrollments/courses/${courseId}/enrollments?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Get course enrollments error:', error);
            throw error;
        }
    },

    // Aprobar inscripción
    approveEnrollment: async (enrollmentId) => {
        try {
            const response = await api.post(`/enrollments/${enrollmentId}/approve`);
            return response.data;
        } catch (error) {
            console.error('Approve enrollment error:', error);
            throw error;
        }
    },

    // Rechazar inscripción
    rejectEnrollment: async (enrollmentId, reason) => {
        try {
            const response = await api.post(`/enrollments/${enrollmentId}/reject`, {
                reason
            });
            return response.data;
        } catch (error) {
            console.error('Reject enrollment error:', error);
            throw error;
        }
    },

    // Aprobar múltiples inscripciones
    approveMultipleEnrollments: async (enrollmentIds) => {
        try {
            const promises = enrollmentIds.map(id => 
                api.post(`/enrollments/${id}/approve`)
            );
            const responses = await Promise.allSettled(promises);
            
            const results = responses.map((response, index) => ({
                enrollmentId: enrollmentIds[index],
                success: response.status === 'fulfilled',
                data: response.status === 'fulfilled' ? response.value.data : null,
                error: response.status === 'rejected' ? response.reason : null
            }));

            return results;
        } catch (error) {
            console.error('Approve multiple enrollments error:', error);
            throw error;
        }
    },

    // Obtener estadísticas de inscripciones
    getEnrollmentStats: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.course_id) queryParams.append('course_id', params.course_id);
            if (params.instructor_id) queryParams.append('instructor_id', params.instructor_id);
            if (params.start_date) queryParams.append('start_date', params.start_date);
            if (params.end_date) queryParams.append('end_date', params.end_date);

            const response = await api.get(`/enrollments/stats?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Get enrollment stats error:', error);
            throw error;
        }
    },

    // Obtener inscripción específica por ID
    getEnrollmentById: async (enrollmentId) => {
        try {
            const response = await api.get(`/enrollments/${enrollmentId}`);
            return response.data;
        } catch (error) {
            console.error('Get enrollment by ID error:', error);
            throw error;
        }
    },

    // Crear nueva inscripción (para admin)
    createEnrollment: async (enrollmentData) => {
        try {
            const response = await api.post('/enrollments/create', enrollmentData);
            return response.data;
        } catch (error) {
            console.error('Create enrollment error:', error);
            throw error;
        }
    },

    // Cancelar inscripción
    cancelEnrollment: async (enrollmentId, reason) => {
        try {
            const response = await api.delete(`/enrollments/${enrollmentId}`, {
                data: { reason }
            });
            return response.data;
        } catch (error) {
            console.error('Cancel enrollment error:', error);
            throw error;
        }
    },

    // Buscar inscripciones
    searchEnrollments: async (searchTerm, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('search', searchTerm);
            if (params.status) queryParams.append('status', params.status);
            if (params.course_id) queryParams.append('course_id', params.course_id);

            const response = await api.get(`/enrollments/search?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Search enrollments error:', error);
            throw error;
        }
    },

    // Solicitar inscripción en un curso (para estudiantes)
    requestEnrollment: async (courseId, enrollmentData = {}) => {
        try {
            const response = await api.post(`/enrollments/courses/${courseId}/enroll`, enrollmentData);
            return response.data;
        } catch (error) {
            console.error('Request enrollment error:', error);
            throw error;
        }
    },

    // ✅ OPTIMIZADO: Dashboard de administrador con estadísticas y pendientes
    // Reemplaza múltiples llamadas: getEnrollmentStats() + getAllEnrollments() + etc.
    // De 5+ requests a 1 request optimizado para administradores
    getAdminDashboardBatch: async () => {
        try {
            const response = await api.get('/enrollments/admin-batch');
            return response.data;
        } catch (error) {
            console.error('Get admin dashboard batch error:', error);
            throw error;
        }
    },

    // ✅ NUEVO: Reporte financiero completo sin límites de paginación
    // Obtiene todos los datos financieros: ingresos, ventas, conversiones, rankings
    // Con filtros opcionales de fecha para análisis temporal
    getFinancialReport: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.start_date) queryParams.append('start_date', params.start_date);
            if (params.end_date) queryParams.append('end_date', params.end_date);

            const url = `/enrollments/financial-report${
                queryParams.toString() ? '?' + queryParams.toString() : ''
            }`;
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Get financial report error:', error);
            throw error;
        }
    },

    // Obtener inscripciones de un estudiante específico
    getStudentEnrollments: async (studentId) => {
        try {
            const response = await api.get(`/enrollments/students/${studentId}/enrollments`);
            return response.data;
        } catch (error) {
            console.error('Get student enrollments error:', error);
            throw error;
        }
    }
};

export default enrollmentService;