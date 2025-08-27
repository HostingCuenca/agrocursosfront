import api from './authService';

export const progressService = {
    // Obtener progreso general de un estudiante
    getStudentProgress: async (studentId) => {
        try {
            const response = await api.get(`/students/${studentId}/progress`);
            return response.data;
        } catch (error) {
            console.error('Get student progress error:', error);
            throw error;
        }
    },

    // Obtener progreso de todos los estudiantes en un curso (instructor/admin)
    getCourseProgress: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}/progress`);
            return response.data;
        } catch (error) {
            console.error('Get course progress error:', error);
            throw error;
        }
    },

    // Obtener progreso detallado de un estudiante en un curso específico
    getStudentCourseProgress: async (studentId, courseId) => {
        try {
            const response = await api.get(`/progress/${studentId}/${courseId}`);
            return response.data;
        } catch (error) {
            console.error('Get student course progress error:', error);
            throw error;
        }
    },

    // Actualizar tiempo de estudio (student)
    updateStudyTime: async (studentId, courseId, minutesStudied) => {
        try {
            const response = await api.post(`/progress/${studentId}/${courseId}/update-time`, {
                minutes_studied: minutesStudied
            });
            return response.data;
        } catch (error) {
            console.error('Update study time error:', error);
            throw error;
        }
    },

    // Dashboard completo del estudiante
    getStudentDashboard: async (studentId) => {
        try {
            const response = await api.get(`/progress/dashboard/${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Get student dashboard error:', error);
            throw error;
        }
    },

    // Dashboard del instructor (instructor/admin)
    getInstructorDashboard: async (instructorId) => {
        try {
            const response = await api.get(`/progress/instructor-dashboard/${instructorId}`);
            return response.data;
        } catch (error) {
            console.error('Get instructor dashboard error:', error);
            throw error;
        }
    },

    // Obtener estadísticas de progreso
    getProgressStats: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.course_id) queryParams.append('course_id', params.course_id);
            if (params.student_id) queryParams.append('student_id', params.student_id);
            if (params.start_date) queryParams.append('start_date', params.start_date);
            if (params.end_date) queryParams.append('end_date', params.end_date);

            const response = await api.get(`/progress/stats?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Get progress stats error:', error);
            throw error;
        }
    }
};

export default progressService;