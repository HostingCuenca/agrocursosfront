import api from './authService';

export const courseService = {
    // Obtener todos los cursos con filtros y paginación
    getCourses: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.category) queryParams.append('category', params.category);
            if (params.level) queryParams.append('level', params.level);
            if (params.search) queryParams.append('search', params.search);

            const response = await api.get(`/courses?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Get courses error:', error);
            throw error;
        }
    },

    // Obtener curso específico por ID
    getCourseById: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}`);
            return response.data;
        } catch (error) {
            console.error('Get course by ID error:', error);
            throw error;
        }
    },

    // Crear nuevo curso (instructor/admin)
    createCourse: async (courseData) => {
        try {
            const response = await api.post('/courses', courseData);
            return response.data;
        } catch (error) {
            console.error('Create course error:', error);
            throw error;
        }
    },

    // Actualizar curso (instructor/admin)
    updateCourse: async (courseId, courseData) => {
        try {
            const response = await api.put(`/courses/${courseId}`, courseData);
            return response.data;
        } catch (error) {
            console.error('Update course error:', error);
            throw error;
        }
    },

    // Eliminar curso (instructor/admin)
    deleteCourse: async (courseId) => {
        try {
            const response = await api.delete(`/courses/${courseId}`);
            return response.data;
        } catch (error) {
            console.error('Delete course error:', error);
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

    // Obtener progreso de todos los estudiantes en un curso
    getCourseProgress: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}/progress`);
            return response.data;
        } catch (error) {
            console.error('Get course progress error:', error);
            throw error;
        }
    },

    // Obtener certificados de un curso
    getCourseCertificates: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}/certificates`);
            return response.data;
        } catch (error) {
            console.error('Get course certificates error:', error);
            throw error;
        }
    },

    // Obtener asignaciones de un curso
    getCourseAssignments: async (courseId) => {
        try {
            const response = await api.get(`/courses/${courseId}/assignments`);
            return response.data;
        } catch (error) {
            console.error('Get course assignments error:', error);
            throw error;
        }
    },

    // Crear asignación en un curso (instructor/admin)
    createAssignment: async (courseId, assignmentData) => {
        try {
            const response = await api.post(`/courses/${courseId}/assignments`, assignmentData);
            return response.data;
        } catch (error) {
            console.error('Create assignment error:', error);
            throw error;
        }
    },

    // Obtener clases virtuales de un curso
    getVirtualClasses: async (courseId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.upcoming) queryParams.append('upcoming', params.upcoming);

            const response = await api.get(`/courses/${courseId}/virtual-classes?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Get virtual classes error:', error);
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

    // Compatibilidad con código existente
    getCourse: async (id) => {
        return courseService.getCourseById(id);
    }
};