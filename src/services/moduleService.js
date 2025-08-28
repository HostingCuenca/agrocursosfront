import api from './authService';

export const moduleService = {
    // Obtener módulos de un curso
    getCourseModules: async (courseId) => {
        try {
            const response = await api.get(`/modules/courses/${courseId}/modules`);
            return response.data;
        } catch (error) {
            console.error('Get course modules error:', error);
            throw error;
        }
    },

    // Crear módulo en un curso (instructor/admin)
    createModule: async (courseId, moduleData) => {
        try {
            // Mapear campos según documentación
            const apiData = {
                title: moduleData.title,
                description: moduleData.description,
                order_sequence: parseInt(moduleData.order_sequence),
                duration_minutes: moduleData.duration_minutes ? parseInt(moduleData.duration_minutes) : undefined,
                is_published: Boolean(moduleData.is_published || false)
            };

            const response = await api.post(`/modules/courses/${courseId}/modules`, apiData);
            return response.data;
        } catch (error) {
            console.error('Create module error:', error);
            throw error;
        }
    },

    // Actualizar módulo (instructor/admin) - endpoint disponible según documentación
    updateModule: async (moduleId, moduleData) => {
        try {
            // Solo enviar los campos que se quieren actualizar (edición parcial)
            const apiData = {};
            if (moduleData.title !== undefined) apiData.title = moduleData.title;
            if (moduleData.description !== undefined) apiData.description = moduleData.description;
            if (moduleData.order_sequence !== undefined) apiData.order_sequence = parseInt(moduleData.order_sequence);
            if (moduleData.duration_minutes !== undefined) apiData.duration_minutes = parseInt(moduleData.duration_minutes);
            if (moduleData.is_published !== undefined) apiData.is_published = Boolean(moduleData.is_published);

            const response = await api.put(`/modules/${moduleId}`, apiData);
            return response.data;
        } catch (error) {
            console.error('Update module error:', error);
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
            // Formato según documentación: [{"id": "module-id", "order_sequence": 1}, ...]
            const response = await api.put(`/modules/courses/${courseId}/modules/reorder`, {
                modules
            });
            return response.data;
        } catch (error) {
            console.error('Reorder modules error:', error);
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