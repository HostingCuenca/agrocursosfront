import api from './authService';

export const assignmentService = {
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

    // Obtener asignación específica (incluye intentos del estudiante)
    getAssignmentById: async (assignmentId) => {
        try {
            const response = await api.get(`/assignments/${assignmentId}`);
            return response.data;
        } catch (error) {
            console.error('Get assignment by ID error:', error);
            throw error;
        }
    },

    // Crear asignación/examen (instructor/admin)
    createAssignment: async (courseId, assignmentData) => {
        try {
            const response = await api.post(`/courses/${courseId}/assignments`, assignmentData);
            return response.data;
        } catch (error) {
            console.error('Create assignment error:', error);
            throw error;
        }
    },

    // Actualizar asignación (instructor/admin)
    updateAssignment: async (assignmentId, assignmentData) => {
        try {
            const response = await api.put(`/assignments/${assignmentId}`, assignmentData);
            return response.data;
        } catch (error) {
            console.error('Update assignment error:', error);
            throw error;
        }
    },

    // Eliminar asignación (instructor/admin)
    deleteAssignment: async (assignmentId) => {
        try {
            const response = await api.delete(`/assignments/${assignmentId}`);
            return response.data;
        } catch (error) {
            console.error('Delete assignment error:', error);
            throw error;
        }
    },

    // Iniciar intento de examen (student)
    startAttempt: async (assignmentId) => {
        try {
            const response = await api.post(`/assignments/${assignmentId}/attempt`);
            return response.data;
        } catch (error) {
            console.error('Start attempt error:', error);
            throw error;
        }
    },

    // Enviar respuestas del examen (student)
    submitAttempt: async (attemptId, answers) => {
        try {
            const response = await api.post(`/assignments/attempts/${attemptId}/submit`, {
                answers
            });
            return response.data;
        } catch (error) {
            console.error('Submit attempt error:', error);
            throw error;
        }
    },

    // Ver todos los intentos de una asignación (instructor/admin)
    getAssignmentAttempts: async (assignmentId) => {
        try {
            const response = await api.get(`/assignments/${assignmentId}/attempts`);
            return response.data;
        } catch (error) {
            console.error('Get assignment attempts error:', error);
            throw error;
        }
    },

    // Obtener intento específico
    getAttemptById: async (attemptId) => {
        try {
            const response = await api.get(`/assignments/attempts/${attemptId}`);
            return response.data;
        } catch (error) {
            console.error('Get attempt by ID error:', error);
            throw error;
        }
    },

    // Calificar intento manualmente (instructor/admin)
    gradeAttempt: async (attemptId, gradeData) => {
        try {
            const response = await api.put(`/assignments/attempts/${attemptId}/grade`, gradeData);
            return response.data;
        } catch (error) {
            console.error('Grade attempt error:', error);
            throw error;
        }
    }
};

export default assignmentService;