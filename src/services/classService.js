import api from './authService';

export const classService = {
    // Obtener clases de un módulo (endpoint correcto según API)
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
            const response = await api.post(`/classes/modules/${moduleId}/classes`, classData);
            return response.data;
        } catch (error) {
            console.error('Create class error:', error);
            throw error;
        }
    },

    // Marcar clase como completada (student) - endpoint disponible según API
    completeClass: async (classId) => {
        try {
            const response = await api.post(`/classes/${classId}/complete`);
            return response.data;
        } catch (error) {
            console.error('Complete class error:', error);
            throw error;
        }
    },

    // NOTA: Los siguientes endpoints no están disponibles en la API según documentación
    // pero los dejamos implementados para futuro uso

    // Obtener clase específica (endpoint no disponible)
    getClassById: async (classId) => {
        try {
            const response = await api.get(`/classes/${classId}`);
            return response.data;
        } catch (error) {
            console.error('Get class by ID error (endpoint may not exist):', error);
            throw error;
        }
    },

    // Actualizar clase (endpoint no disponible)
    updateClass: async (classId, classData) => {
        try {
            const response = await api.put(`/classes/${classId}`, classData);
            return response.data;
        } catch (error) {
            console.error('Update class error (endpoint may not exist):', error);
            throw error;
        }
    },

    // Eliminar clase (endpoint no disponible)
    deleteClass: async (classId) => {
        try {
            const response = await api.delete(`/classes/${classId}`);
            return response.data;
        } catch (error) {
            console.error('Delete class error (endpoint may not exist):', error);
            throw error;
        }
    },

    // Reordenar clases (endpoint no disponible según API)
    reorderClasses: async (moduleId, classOrders) => {
        try {
            const response = await api.put(`/classes/modules/${moduleId}/classes/reorder`, {
                classOrders
            });
            return response.data;
        } catch (error) {
            console.error('Reorder classes error (endpoint may not exist):', error);
            throw error;
        }
    }
};

export default classService;