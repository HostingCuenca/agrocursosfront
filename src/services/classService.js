import api from './authService';

export const classService = {
    // Obtener clases de un módulo
    getModuleClasses: async (moduleId) => {
        try {
            console.log('🔄 classService.getModuleClasses called');
            console.log('📌 Module ID:', moduleId);

            const response = await api.get(`/classes/modules/${moduleId}/classes`);
            console.log('✅ Classes fetched:', response.data);
            
            // Handle different response formats
            if (response.data.classes) {
                return response.data.classes; // Return just the classes array
            } else if (Array.isArray(response.data)) {
                return response.data; // Already an array
            } else {
                return []; // Default empty array
            }
        } catch (error) {
            console.error('❌ Get module classes error:', error);
            throw error;
        }
    },

    // Crear clase en un módulo (instructor/admin)
    createClass: async (moduleId, classData) => {
        try {
            console.log('🔄 classService.createClass called');
            console.log('📌 Module ID:', moduleId);
            console.log('📦 Class Data:', classData);

            // Construir objeto dinámicamente - solo campos con valores
            const apiData = {};
            
            if (classData.title && classData.title.trim()) {
                apiData.title = classData.title.trim();
            }
            if (classData.description && classData.description.trim()) {
                apiData.description = classData.description.trim();
            }
            if (classData.content_type) {
                apiData.content_type = classData.content_type; // "video", "text", "mixed"
            }
            if (classData.order_sequence !== undefined && classData.order_sequence !== null) {
                apiData.order_sequence = Number(classData.order_sequence);
            }
            if (classData.content_url && classData.content_url.trim()) {
                apiData.content_url = classData.content_url.trim();
            }
            if (classData.content_text && classData.content_text.trim()) {
                apiData.content_text = classData.content_text.trim();
            }
            if (classData.metadata) {
                apiData.metadata = classData.metadata;
            }
            if (classData.is_published !== undefined) {
                apiData.is_published = Boolean(classData.is_published);
            }

            console.log('📤 Sending to API:', apiData);
            console.log('🌐 POST URL:', `/classes/modules/${moduleId}/classes`);

            const response = await api.post(`/classes/modules/${moduleId}/classes`, apiData);
            console.log('✅ Class created:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Create class error:', error);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error data:', error.response?.data);
            throw error;
        }
    },

    // Actualizar clase (instructor/admin) - endpoint disponible según documentación
    updateClass: async (classId, classData) => {
        try {
            console.log('🔄 classService.updateClass called');
            console.log('📌 Class ID:', classId);
            console.log('📦 Class Data received:', classData);
            
            // Construir objeto dinámicamente - solo campos con valores
            const apiData = {};
            
            if (classData.title && classData.title.trim()) {
                apiData.title = classData.title.trim();
            }
            if (classData.description && classData.description.trim()) {
                apiData.description = classData.description.trim();
            }
            if (classData.content_type) {
                apiData.content_type = classData.content_type;
            }
            if (classData.order_sequence !== undefined && classData.order_sequence !== null) {
                apiData.order_sequence = Number(classData.order_sequence);
            }
            if (classData.content_url && classData.content_url.trim()) {
                apiData.content_url = classData.content_url.trim();
            }
            if (classData.content_text && classData.content_text.trim()) {
                apiData.content_text = classData.content_text.trim();
            }
            if (classData.metadata) {
                apiData.metadata = classData.metadata;
            }
            if (classData.is_published !== undefined) {
                apiData.is_published = Boolean(classData.is_published);
            }
            
            console.log('📤 Sending to API (dynamic):', apiData);
            console.log('🌐 PUT URL:', `/classes/${classId}`);
            
            const response = await api.put(`/classes/${classId}`, apiData);
            console.log('✅ Class updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Update class error:', error);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error data:', error.response?.data);
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
            console.log('🔄 classService.reorderClasses called');
            console.log('📌 Module ID:', moduleId);
            console.log('📦 Classes order:', classes);

            // Formato correcto según pruebas: {"classOrders": [{"id": "uuid", "order_sequence": 1}]}
            const apiData = {
                classOrders: classes.map(classItem => ({
                    id: classItem.id,
                    order_sequence: Number(classItem.order_sequence)
                }))
            };

            console.log('📤 Sending reorder data:', apiData);
            const response = await api.put(`/classes/modules/${moduleId}/classes/reorder`, apiData);
            console.log('✅ Classes reordered:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Reorder classes error:', error);
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
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    },

    // Generar URL de thumbnail de YouTube
    generateYouTubeThumbnail: (videoId) => {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
};

export default classService;