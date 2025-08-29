import api from './authService';

export const instructorService = {
    // Obtener lista de instructores con paginación y filtros (solo admin)
    getInstructors: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            
            // Paginación
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            // Filtros
            if (params.status) queryParams.append('status', params.status); // 'active' o 'inactive'
            if (params.search) queryParams.append('search', params.search);
            
            const url = `/admin/instructors${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Get instructors error:', error);
            throw error;
        }
    },

    // Crear nuevo instructor (solo admin)
    createInstructor: async (instructorData) => {
        try {
            const apiData = {
                email: instructorData.email,
                password: instructorData.password,
                first_name: instructorData.first_name || instructorData.firstName,
                last_name: instructorData.last_name || instructorData.lastName,
                phone: instructorData.phone,
                country: instructorData.country,
                specialization: instructorData.specialization,
                bio: instructorData.bio
            };
            
            const response = await api.post('/admin/instructors', apiData);
            return response.data;
        } catch (error) {
            console.error('Create instructor error:', error);
            throw error;
        }
    },

    // Obtener detalles de un instructor específico (solo admin)
    getInstructorById: async (instructorId) => {
        try {
            const response = await api.get(`/admin/instructors/${instructorId}`);
            return response.data;
        } catch (error) {
            console.error('Get instructor by ID error:', error);
            throw error;
        }
    },

    // Actualizar instructor (solo admin)
    updateInstructor: async (instructorId, updateData) => {
        try {
            // Construir objeto dinámicamente - Solo enviar campos que tienen valor
            const apiData = {};
            
            if (updateData.first_name || updateData.firstName) {
                apiData.first_name = updateData.first_name || updateData.firstName;
            }
            if (updateData.last_name || updateData.lastName) {
                apiData.last_name = updateData.last_name || updateData.lastName;
            }
            if (updateData.email) {
                apiData.email = updateData.email;
            }
            if (updateData.phone) {
                apiData.phone = updateData.phone;
            }
            if (updateData.country) {
                apiData.country = updateData.country;
            }
            if (updateData.specialization) {
                apiData.specialization = updateData.specialization;
            }
            if (updateData.bio) {
                apiData.bio = updateData.bio;
            }
            
            const response = await api.put(`/admin/instructors/${instructorId}`, apiData);
            return response.data;
        } catch (error) {
            console.error('Update instructor error:', error);
            throw error;
        }
    },

    // Deshabilitar instructor (solo admin) - CRÍTICO
    disableInstructor: async (instructorId) => {
        try {
            const response = await api.patch(`/admin/instructors/${instructorId}/disable`);
            return response.data;
        } catch (error) {
            console.error('Disable instructor error:', error);
            throw error;
        }
    },

    // Habilitar instructor (solo admin) - CRÍTICO
    enableInstructor: async (instructorId) => {
        try {
            const response = await api.patch(`/admin/instructors/${instructorId}/enable`);
            return response.data;
        } catch (error) {
            console.error('Enable instructor error:', error);
            throw error;
        }
    },

    // Obtener estadísticas del instructor (solo admin)
    getInstructorStats: async (instructorId) => {
        try {
            const response = await api.get(`/admin/instructors/${instructorId}/stats`);
            return response.data;
        } catch (error) {
            console.error('Get instructor stats error:', error);
            throw error;
        }
    },

    // Métodos auxiliares para manejo de errores
    handleAPIError: (result) => {
        if (!result.success) {
            if (result.details) {
                // Errores de validación
                const errorMessages = result.details.map(error => error.message).join(', ');
                throw new Error(`Error de validación: ${errorMessages}`);
            } else {
                // Error general
                throw new Error(result.error || 'Error desconocido');
            }
        }
        return true;
    },

    // Formatear datos de instructor para mostrar
    formatInstructorData: (instructor) => {
        return {
            ...instructor,
            fullName: `${instructor.first_name} ${instructor.last_name}`,
            statusText: instructor.is_active ? 'Activo' : 'Inactivo',
            statusClass: instructor.is_active ? 'status-active' : 'status-inactive',
            courseCount: instructor.course_count || 0
        };
    }
};

export default instructorService;