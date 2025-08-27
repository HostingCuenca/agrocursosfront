import api from './authService';

export const moduleService = {
    // Obtener módulos de un curso (endpoint correcto según API)
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
            const response = await api.post(`/modules/courses/${courseId}/modules`, moduleData);
            return response.data;
        } catch (error) {
            console.error('Create module error:', error);
            throw error;
        }
    },

    // Reordenar módulos (instructor/admin)
    reorderModules: async (courseId, moduleOrders) => {
        try {
            const response = await api.put(`/modules/courses/${courseId}/modules/reorder`, {
                moduleOrders
            });
            return response.data;
        } catch (error) {
            console.error('Reorder modules error:', error);
            throw error;
        }
    },

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

    // NOTA: Los siguientes endpoints no están disponibles en la API según documentación
    // pero los dejamos implementados para futuro uso

    // Obtener módulo específico con sus clases (endpoint no disponible)
    getModuleById: async (moduleId) => {
        try {
            const response = await api.get(`/modules/${moduleId}`);
            return response.data;
        } catch (error) {
            console.error('Get module by ID error (endpoint may not exist):', error);
            throw error;
        }
    },

    // Actualizar módulo (endpoint no disponible)
    updateModule: async (moduleId, moduleData) => {
        try {
            const response = await api.put(`/modules/${moduleId}`, moduleData);
            return response.data;
        } catch (error) {
            console.error('Update module error (endpoint may not exist):', error);
            throw error;
        }
    },

    // Eliminar módulo (endpoint no disponible)
    deleteModule: async (moduleId) => {
        try {
            const response = await api.delete(`/modules/${moduleId}`);
            return response.data;
        } catch (error) {
            console.error('Delete module error (endpoint may not exist):', error);
            throw error;
        }
    }
};

export default moduleService;