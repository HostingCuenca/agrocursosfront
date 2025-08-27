import api from './authService';

export const enrollmentService = {
    // Obtener inscripciones de un estudiante
    getStudentEnrollments: async (studentId) => {
        try {
            const response = await api.get(`/students/${studentId}/enrollments`);
            return response.data;
        } catch (error) {
            console.error('Get student enrollments error:', error);
            throw error;
        }
    },

    // Obtener inscripciones de un curso (instructor/admin)
    getCourseEnrollments: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}/enrollments`);
            return response.data;
        } catch (error) {
            console.error('Get course enrollments error:', error);
            throw error;
        }
    },

    // Inscribirse en un curso
    enrollInCourse: async (courseId, enrollmentData = {}) => {
        try {
            const response = await api.post(`/courses/${courseId}/enroll`, enrollmentData);
            return response.data;
        } catch (error) {
            console.error('Enroll in course error:', error);
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