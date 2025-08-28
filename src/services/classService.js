import api from './authService';

export const classService = {
    // Obtener clases de un módulo
    getModuleClasses: async (moduleId) => {
        try {
            const response = await api.get(`/classes/modules/${moduleId}/classes`);
            return response.data;
        } catch (error) {
            console.error('Get module classes error:', error);
            throw error;
        }
    },

    // Crear clase en un módulo (instructor/admin)
    createClass: async (moduleId, classData) => {
        try {
            // Mapear campos según documentación
            const apiData = {
                title: classData.title,
                description: classData.description,
                type: classData.type, // "video", "text", "quiz", "assignment"
                order_sequence: parseInt(classData.order_sequence),
                duration_minutes: classData.duration_minutes ? parseInt(classData.duration_minutes) : undefined,
                content_url: classData.content_url,
                content_text: classData.content_text,
                metadata: classData.metadata || {},
                is_published: Boolean(classData.is_published || false)
            };

            // Limpiar campos undefined para no enviarlos
            Object.keys(apiData).forEach(key => {
                if (apiData[key] === undefined) {
                    delete apiData[key];
                }
            });

            const response = await api.post(`/classes/modules/${moduleId}/classes`, apiData);
            return response.data;
        } catch (error) {
            console.error('Create class error:', error);
            throw error;
        }
    },

    // Actualizar clase (instructor/admin) - endpoint disponible según documentación
    updateClass: async (classId, classData) => {
        try {
            // Solo enviar los campos que se quieren actualizar (edición parcial)
            const apiData = {};
            if (classData.title !== undefined) apiData.title = classData.title;
            if (classData.description !== undefined) apiData.description = classData.description;
            if (classData.type !== undefined) apiData.type = classData.type;
            if (classData.order_sequence !== undefined) apiData.order_sequence = parseInt(classData.order_sequence);
            if (classData.duration_minutes !== undefined) apiData.duration_minutes = parseInt(classData.duration_minutes);
            if (classData.content_url !== undefined) apiData.content_url = classData.content_url;
            if (classData.content_text !== undefined) apiData.content_text = classData.content_text;
            if (classData.metadata !== undefined) apiData.metadata = classData.metadata;
            if (classData.is_published !== undefined) apiData.is_published = Boolean(classData.is_published);

            const response = await api.put(`/classes/${classId}`, apiData);
            return response.data;
        } catch (error) {
            console.error('Update class error:', error);
            throw error;
        }
    },

    // Eliminar clase (instructor/admin) - soft delete
    deleteClass: async (classId) => {
        try {
            const response = await api.delete(`/classes/${classId}`);
            return response.data;
        } catch (error) {
            console.error('Delete class error:', error);
            throw error;
        }
    },

    // Reordenar clases (instructor/admin) - endpoint disponible según documentación
    reorderClasses: async (moduleId, classes) => {
        try {
            // Formato según documentación: [{"id": "class-id", "order_sequence": 1}, ...]
            const response = await api.put(`/classes/modules/${moduleId}/classes/reorder`, {
                classes
            });
            return response.data;
        } catch (error) {
            console.error('Reorder classes error:', error);
            throw error;
        }
    },

    // Obtener clase específica por ID
    getClassById: async (classId) => {
        try {
            const response = await api.get(`/classes/${classId}`);
            return response.data;
        } catch (error) {
            console.error('Get class by ID error:', error);
            throw error;
        }
    },

    // Marcar clase como completada (student)
    completeClass: async (classId) => {
        try {
            const response = await api.post(`/classes/${classId}/complete`);
            return response.data;
        } catch (error) {
            console.error('Complete class error:', error);
            throw error;
        }
    },

    // Métodos de utilidad para tipos de clases
    getClassTypes: () => [
        { value: 'video', label: 'Video' },
        { value: 'text', label: 'Texto/Artículo' },
        { value: 'quiz', label: 'Cuestionario' },
        { value: 'assignment', label: 'Tarea/Asignación' }
    ],

    // Validar tipo de clase
    validateClassType: (type) => {
        const validTypes = ['video', 'text', 'quiz', 'assignment'];
        return validTypes.includes(type);
    },

    // Generar siguiente orden de secuencia
    getNextOrderSequence: (classes) => {
        if (!classes || classes.length === 0) return 1;
        const maxOrder = Math.max(...classes.map(c => c.order_sequence || 0));
        return maxOrder + 1;
    },

    // Validar y procesar metadata según tipo de clase
    processMetadata: (type, metadata) => {
        const processedMetadata = { ...metadata };

        switch (type) {
            case 'video':
                // Para videos: validar URL de video y plataforma
                if (metadata.video_url) {
                    if (metadata.video_url.includes('youtube.com') || metadata.video_url.includes('youtu.be')) {
                        processedMetadata.video_platform = 'youtube';
                    } else if (metadata.video_url.includes('vimeo.com')) {
                        processedMetadata.video_platform = 'vimeo';
                    } else {
                        processedMetadata.video_platform = 'other';
                    }
                }
                break;

            case 'quiz':
                // Para quizzes: validar estructura de preguntas
                if (metadata.questions && Array.isArray(metadata.questions)) {
                    processedMetadata.questions_count = metadata.questions.length;
                }
                break;

            case 'assignment':
                // Para asignaciones: validar fecha de entrega
                if (metadata.due_date) {
                    processedMetadata.due_date = new Date(metadata.due_date).toISOString();
                }
                break;

            default:
                break;
        }

        return processedMetadata;
    },

    // Extraer ID de video de YouTube URL
    extractYouTubeVideoId: (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    },

    // Generar URL de thumbnail de YouTube
    generateYouTubeThumbnail: (videoId) => {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
};

export default classService;