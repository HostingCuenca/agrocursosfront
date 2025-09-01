import api from './authService';

export const certificateService = {
    // ✅ CORREGIDO: Obtener certificados de un estudiante
    getStudentCertificates: async (studentId) => {
        try {
            const response = await api.get(`/certificates/students/${studentId}/certificates`);
            return response.data;
        } catch (error) {
            console.error('Get student certificates error:', error);
            throw error;
        }
    },

    // Obtener certificados emitidos para un curso (instructor/admin)
    getCourseCertificates: async (courseId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            const response = await api.get(`/certificates/courses/${courseId}/certificates?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Get course certificates error:', error);
            throw error;
        }
    },

    // Emitir certificado a estudiante (instructor/admin)
    issueCertificate: async (certificateData) => {
        try {
            const response = await api.post('/certificates/issue', certificateData);
            return response.data;
        } catch (error) {
            console.error('Issue certificate error:', error);
            throw error;
        }
    },

    // Verificar certificado (público - no requiere autenticación)
    verifyCertificate: async (certificateId) => {
        try {
            const response = await api.get(`/certificates/${certificateId}/verify`);
            return response.data;
        } catch (error) {
            console.error('Verify certificate error:', error);
            throw error;
        }
    },

    // Revocar certificado (instructor/admin)
    revokeCertificate: async (certificateId, reason) => {
        try {
            const response = await api.put(`/certificates/${certificateId}/revoke`, {
                reason
            });
            return response.data;
        } catch (error) {
            console.error('Revoke certificate error:', error);
            throw error;
        }
    },

    // Obtener plantillas de certificados (instructor/admin)
    getCertificateTemplates: async () => {
        try {
            const response = await api.get('/certificates/templates');
            return response.data;
        } catch (error) {
            console.error('Get certificate templates error:', error);
            throw error;
        }
    },

    // Crear plantilla de certificado (admin)
    createCertificateTemplate: async (templateData) => {
        try {
            const response = await api.post('/certificates/templates', templateData);
            return response.data;
        } catch (error) {
            console.error('Create certificate template error:', error);
            throw error;
        }
    },

    // Actualizar plantilla de certificado (admin)
    updateCertificateTemplate: async (templateId, templateData) => {
        try {
            const response = await api.put(`/certificates/templates/${templateId}`, templateData);
            return response.data;
        } catch (error) {
            console.error('Update certificate template error:', error);
            throw error;
        }
    },

    // Eliminar plantilla de certificado (admin)
    deleteCertificateTemplate: async (templateId) => {
        try {
            const response = await api.delete(`/certificates/templates/${templateId}`);
            return response.data;
        } catch (error) {
            console.error('Delete certificate template error:', error);
            throw error;
        }
    },

    // Estadísticas de certificados (instructor/admin)
    getCertificateStats: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.course_id) queryParams.append('course_id', params.course_id);
            if (params.instructor_id) queryParams.append('instructor_id', params.instructor_id);
            if (params.start_date) queryParams.append('start_date', params.start_date);
            if (params.end_date) queryParams.append('end_date', params.end_date);

            const response = await api.get(`/certificates/stats?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Get certificate stats error:', error);
            throw error;
        }
    },

    // Obtener certificado específico
    getCertificateById: async (certificateId) => {
        try {
            const response = await api.get(`/certificates/${certificateId}`);
            return response.data;
        } catch (error) {
            console.error('Get certificate by ID error:', error);
            throw error;
        }
    },

    // Verificar elegibilidad para certificado
    checkEligibility: async (studentId, courseId) => {
        try {
            const response = await api.get(`/certificates/eligibility/${studentId}/${courseId}`);
            return response.data;
        } catch (error) {
            console.error('Check eligibility error:', error);
            throw error;
        }
    },

    // Generar certificado (automático o manual)
    generateCertificate: async (studentId, courseId, options = {}) => {
        try {
            const requestBody = {
                automatic: options.automatic || false,
                override: options.override || false
            };
            
            const response = await api.post(`/certificates/generate/${studentId}/${courseId}`, requestBody);
            return response.data;
        } catch (error) {
            console.error('Generate certificate error:', error);
            throw error;
        }
    },

    // Obtener datos para descarga de certificado con plantilla
    getCertificateDownloadData: async (certificateId) => {
        try {
            const response = await api.get(`/certificates/${certificateId}/download`);
            return response.data;
        } catch (error) {
            console.error('Get certificate download data error:', error);
            throw error;
        }
    }
};

export default certificateService;