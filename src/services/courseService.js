import api from './authService';

export const courseService = {
    // Obtener todos los cursos con filtros opcionales
    getCourses: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            
            // Solo agregar parámetros que no sean undefined/null/empty
            if (params.category) queryParams.append('category', params.category);
            if (params.level) queryParams.append('level', params.level);
            if (params.search) queryParams.append('search', params.search);
            
            // Agregar paginación solo si se especifica
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);

            const queryString = queryParams.toString();
            const url = queryString ? `/courses?${queryString}` : '/courses';
            
            const response = await api.get(url);
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

    // Crear nuevo curso (instructor/admin) - según documentación
    createCourse: async (courseData) => {
        try {
            // Mapear campos según documentación API
            const apiData = {
                title: courseData.title,
                description: courseData.description,
                category: courseData.category,
                subcategory: courseData.subcategory,
                difficulty_level: courseData.difficulty_level,
                price: parseFloat(courseData.price) || 0,
                currency: courseData.currency || 'USD',
                duration_hours: parseInt(courseData.duration_hours) || 0,
                language: courseData.language || 'es',
                thumbnail: courseData.thumbnail,
                tags: courseData.tags || [],
                is_published: Boolean(courseData.is_published)
            };
            
            const response = await api.post('/courses', apiData);
            return response.data;
        } catch (error) {
            console.error('Create course error:', error);
            throw error;
        }
    },

    // Actualizar curso (instructor/admin) - según documentación
    updateCourse: async (courseId, courseData) => {
        try {
            console.log('🔄 courseService.updateCourse called');
            console.log('📌 Course ID:', courseId);
            console.log('📦 Course Data received:', courseData);
            
            // CONSTRUIR OBJETO DINÁMICAMENTE - Solo enviar campos que tienen valor
            const apiData = {};
            
            if (courseData.title && courseData.title.trim()) {
                apiData.title = courseData.title.trim();
            }
            if (courseData.description && courseData.description.trim()) {
                apiData.description = courseData.description.trim();
            }
            if (courseData.category) {
                apiData.category = courseData.category;
            }
            if (courseData.subcategory) {
                apiData.subcategory = courseData.subcategory;
            }
            if (courseData.difficulty_level) {
                apiData.difficulty_level = courseData.difficulty_level;
            }
            if (courseData.price !== undefined && courseData.price !== null) {
                apiData.price = Number(courseData.price);
            }
            if (courseData.currency) {
                apiData.currency = courseData.currency;
            }
            if (courseData.duration_hours !== undefined && courseData.duration_hours !== null) {
                apiData.duration_hours = Number(courseData.duration_hours);
            }
            if (courseData.language) {
                apiData.language = courseData.language;
            }
            if (courseData.thumbnail && courseData.thumbnail.trim()) {
                apiData.thumbnail = courseData.thumbnail.trim();
            }
            if (courseData.is_published !== undefined) {
                apiData.is_published = Boolean(courseData.is_published);
            }
            
            console.log('📤 Sending to API (dynamic):', apiData);
            console.log('🌐 PUT URL:', `/courses/${courseId}`);
            
            const response = await api.put(`/courses/${courseId}`, apiData);
            console.log('✅ API Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Update course error:', error);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error data:', error.response?.data);
            throw error;
        }
    },

    // Eliminar curso (instructor/admin) - soft delete
    deleteCourse: async (courseId) => {
        try {
            const response = await api.delete(`/courses/${courseId}`);
            return response.data;
        } catch (error) {
            console.error('Delete course error:', error);
            throw error;
        }
    },

    // Obtener inscripciones de un curso (instructor/admin)
    getCourseEnrollments: async (courseId) => {
        try {
            const response = await api.get(`/enrollments/courses/${courseId}/enrollments`);
            return response.data;
        } catch (error) {
            console.error('Get course enrollments error:', error);
            throw error;
        }
    },

    // Métodos delegados a servicios especializados
    // Obtener progreso - delegado a progressService
    getCourseProgress: async (courseId) => {
        const { progressService } = await import('./progressService');
        return progressService.getCourseProgress(courseId);
    },

    // Obtener certificados - delegado a certificateService  
    getCourseCertificates: async (courseId) => {
        const { certificateService } = await import('./certificateService');
        return certificateService.getCourseCertificates(courseId);
    },

    // Obtener asignaciones - delegado a assignmentService
    getCourseAssignments: async (courseId) => {
        const { assignmentService } = await import('./assignmentService');
        return assignmentService.getCourseAssignments(courseId);
    },

    // Crear asignación - delegado a assignmentService
    createAssignment: async (courseId, assignmentData) => {
        const { assignmentService } = await import('./assignmentService');
        return assignmentService.createAssignment(courseId, assignmentData);
    },

    // Obtener clases virtuales - delegado a virtualClassService
    getVirtualClasses: async (courseId, params = {}) => {
        const { virtualClassService } = await import('./virtualClassService');
        return virtualClassService.getCourseVirtualClasses(courseId, params);
    },

    // Crear clase virtual - delegado a virtualClassService
    createVirtualClass: async (courseId, virtualClassData) => {
        const { virtualClassService } = await import('./virtualClassService');
        return virtualClassService.createVirtualClass(courseId, virtualClassData);
    },

    // Métodos adicionales para gestión de contenido
    // Obtener módulos de un curso - delegado a moduleService
    getCourseModules: async (courseId) => {
        const { moduleService } = await import('./moduleService');
        return moduleService.getCourseModules(courseId);
    },

    // Crear módulo en un curso - delegado a moduleService
    createCourseModule: async (courseId, moduleData) => {
        const { moduleService } = await import('./moduleService');
        return moduleService.createModule(courseId, moduleData);
    },

    // Compatibilidad con código existente
    getCourse: async (id) => {
        return courseService.getCourseById(id);
    },

    // DEPRECATED - usar enrollmentService.requestEnrollment
    enrollInCourse: async (courseId, enrollmentData = {}) => {
        console.warn('courseService.enrollInCourse is deprecated, use enrollmentService.requestEnrollment instead');
        const { enrollmentService } = await import('./enrollmentService');
        return enrollmentService.requestEnrollment(courseId, enrollmentData);
    }
};

export default courseService;