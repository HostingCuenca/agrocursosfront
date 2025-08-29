import api from './authService';

export const moduleService = {
    // Obtener módulos de un curso
    getCourseModules: async (courseId) => {
        try {
            console.log('🔄 moduleService.getCourseModules called');
            console.log('📌 Course ID:', courseId);

            const response = await api.get(`/modules/courses/${courseId}/modules`);
            console.log('✅ Modules fetched:', response.data);
            
            // Handle different response formats
            if (response.data.modules) {
                return response.data.modules; // Return just the modules array
            } else if (Array.isArray(response.data)) {
                return response.data; // Already an array
            } else {
                return []; // Default empty array
            }
        } catch (error) {
            console.error('❌ Get course modules error:', error);
            throw error;
        }
    },

    // Crear módulo en un curso (instructor/admin)
    createModule: async (courseId, moduleData) => {
        try {
            console.log('🔄 moduleService.createModule called');
            console.log('📌 Course ID:', courseId);
            console.log('📦 Module Data:', moduleData);

            // Construir objeto dinámicamente - solo campos con valores
            const apiData = {};
            
            if (moduleData.title && moduleData.title.trim()) {
                apiData.title = moduleData.title.trim();
            }
            if (moduleData.description && moduleData.description.trim()) {
                apiData.description = moduleData.description.trim();
            }
            if (moduleData.order_sequence !== undefined && moduleData.order_sequence !== null) {
                apiData.order_sequence = Number(moduleData.order_sequence);
            }
            if (moduleData.is_published !== undefined) {
                apiData.is_published = Boolean(moduleData.is_published);
            }
            if (moduleData.metadata) {
                apiData.metadata = moduleData.metadata;
            }

            console.log('📤 Sending to API:', apiData);
            console.log('🌐 POST URL:', `/modules/courses/${courseId}/modules`);

            const response = await api.post(`/modules/courses/${courseId}/modules`, apiData);
            console.log('✅ Module created:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Create module error:', error);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error data:', error.response?.data);
            throw error;
        }
    },

    // Actualizar módulo (instructor/admin) - endpoint disponible según documentación
    updateModule: async (moduleId, moduleData) => {
        try {
            console.log('🔄 moduleService.updateModule called');
            console.log('📌 Module ID:', moduleId);
            console.log('📦 Module Data received:', moduleData);
            
            // Construir objeto dinámicamente - solo campos con valores
            const apiData = {};
            
            if (moduleData.title && moduleData.title.trim()) {
                apiData.title = moduleData.title.trim();
            }
            if (moduleData.description && moduleData.description.trim()) {
                apiData.description = moduleData.description.trim();
            }
            if (moduleData.order_sequence !== undefined && moduleData.order_sequence !== null) {
                apiData.order_sequence = Number(moduleData.order_sequence);
            }
            if (moduleData.is_published !== undefined) {
                apiData.is_published = Boolean(moduleData.is_published);
            }
            if (moduleData.metadata) {
                apiData.metadata = moduleData.metadata;
            }
            
            console.log('📤 Sending to API (dynamic):', apiData);
            console.log('🌐 PUT URL:', `/modules/${moduleId}`);
            
            const response = await api.put(`/modules/${moduleId}`, apiData);
            console.log('✅ Module updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Update module error:', error);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error data:', error.response?.data);
            throw error;
        }
    },

    // Eliminar módulo (instructor/admin) - soft delete
    deleteModule: async (moduleId) => {
        try {
            const response = await api.delete(`/modules/${moduleId}`);
            return response.data;
        } catch (error) {
            console.error('Delete module error:', error);
            throw error;
        }
    },

    // Reordenar módulos (instructor/admin)
    reorderModules: async (courseId, modules) => {
        try {
            console.log('🔄 moduleService.reorderModules called');
            console.log('📌 Course ID:', courseId);
            console.log('📦 Modules order:', modules);

            // Formato correcto según pruebas: {"moduleOrders": [{"id": "uuid", "order_sequence": 1}]}
            const apiData = {
                moduleOrders: modules.map(module => ({
                    id: module.id,
                    order_sequence: Number(module.order_sequence)
                }))
            };

            console.log('📤 Sending reorder data:', apiData);
            const response = await api.put(`/modules/courses/${courseId}/modules/reorder`, apiData);
            console.log('✅ Modules reordered:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Reorder modules error:', error);
            throw error;
        }
    },

    // Obtener clases de un módulo - delegado a classService
    getModuleClasses: async (moduleId) => {
        try {
            const { classService } = await import('./classService');
            return classService.getModuleClasses(moduleId);
        } catch (error) {
            console.error('Get module classes error:', error);
            throw error;
        }
    },

    // Crear clase en un módulo - delegado a classService
    createClass: async (moduleId, classData) => {
        try {
            const { classService } = await import('./classService');
            return classService.createClass(moduleId, classData);
        } catch (error) {
            console.error('Create class error:', error);
            throw error;
        }
    },

    // Métodos de utilidad
    // Validar orden de secuencia
    validateOrderSequence: (modules, newOrder) => {
        const orders = modules.map(m => m.order_sequence).filter(o => o !== newOrder);
        return !orders.includes(newOrder);
    },

    // Generar siguiente orden de secuencia
    getNextOrderSequence: (modules) => {
        if (!modules || modules.length === 0) return 1;
        const maxOrder = Math.max(...modules.map(m => m.order_sequence || 0));
        return maxOrder + 1;
    }
};

export default moduleService;