import api from './authService';

export const enrollmentService = {
    // ✅ OPTIMIZADO: Obtener TODAS las inscripciones para Admin/Instructor en una sola llamada
    // Reemplaza múltiples llamadas a getCourseEnrollments() por curso
    // De 11+ segundos a milisegundos - elimina problema N+1 queries
    getAllEnrollments: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.status) queryParams.append('status', params.status);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            const url = `/enrollments/all${
                queryParams.toString() ? '?' + queryParams.toString() : ''
            }`;
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Get all enrollments error:', error);
            throw error;
        }
    },

    // Obtener inscripciones de un estudiante
    getStudentEnrollments: async (studentId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.status) queryParams.append('status', params.status);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            const url = `/enrollments/students/${studentId}/enrollments${
                queryParams.toString() ? '?' + queryParams.toString() : ''
            }`;
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Get student enrollments error:', error);
            throw error;
        }
    },

    // Obtener inscripciones de un curso (instructor/admin)
    getCourseEnrollments: async (courseId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.status) queryParams.append('status', params.status);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            const url = `/enrollments/courses/${courseId}/enrollments${
                queryParams.toString() ? '?' + queryParams.toString() : ''
            }`;
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Get course enrollments error:', error);
            throw error;
        }
    },

    // Solicitar inscripción en un curso (será estado pending)
    requestEnrollment: async (courseId, enrollmentData = {}) => {
        try {
            const response = await api.post(`/enrollments/courses/${courseId}/enroll`, enrollmentData);
            return response.data;
        } catch (error) {
            console.error('Request enrollment error:', error);
            throw error;
        }
    },

    // Aprobar inscripción (instructor/admin)
    approveEnrollment: async (enrollmentId) => {
        try {
            const response = await api.post(`/enrollments/${enrollmentId}/approve`, {});
            return response.data;
        } catch (error) {
            console.error('Approve enrollment error:', error);
            throw error;
        }
    },

    // Rechazar inscripción (instructor/admin)
    rejectEnrollment: async (enrollmentId, reason = '') => {
        try {
            const response = await api.post(`/enrollments/${enrollmentId}/reject`, { reason });
            return response.data;
        } catch (error) {
            console.error('Reject enrollment error:', error);
            throw error;
        }
    },

    // Inscripción masiva de estudiantes (instructor/admin)
    bulkEnroll: async (courseId, studentEmails, enrollmentData = {}) => {
        try {
            const response = await api.post('/enrollments/bulk', {
                course_id: courseId,
                student_emails: studentEmails,
                ...enrollmentData
            });
            return response.data;
        } catch (error) {
            console.error('Bulk enroll error:', error);
            throw error;
        }
    },

    // Actualizar inscripción
    updateEnrollment: async (enrollmentId, enrollmentData) => {
        try {
            const response = await api.put(`/enrollments/${enrollmentId}`, enrollmentData);
            return response.data;
        } catch (error) {
            console.error('Update enrollment error:', error);
            throw error;
        }
    },

    // Cancelar inscripción
    cancelEnrollment: async (enrollmentId) => {
        try {
            const response = await api.delete(`/enrollments/${enrollmentId}`);
            return response.data;
        } catch (error) {
            console.error('Cancel enrollment error:', error);
            throw error;
        }
    },

    // Estadísticas de inscripciones (instructor/admin)
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

    // Obtener inscripción específica
    getEnrollmentById: async (enrollmentId) => {
        try {
            const response = await api.get(`/enrollments/${enrollmentId}`);
            return response.data;
        } catch (error) {
            console.error('Get enrollment by ID error:', error);
            throw error;
        }
    }
};

export default enrollmentService;