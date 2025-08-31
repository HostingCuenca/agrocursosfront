import { create } from 'zustand';
import { certificateService } from '../services';

const useCertificateStore = create((set, get) => ({
    // Estado
    certificates: [],
    myCertificates: [],
    courseCertificates: [],
    currentCertificate: null,
    eligibility: null,
    templates: [],
    stats: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    },

    // Acciones - Obtener certificados de un estudiante
    getStudentCertificates: async (studentId) => {
        set({ loading: true, error: null });
        try {
            const response = await certificateService.getStudentCertificates(studentId);
            
            set({
                myCertificates: response.certificates || [],
                loading: false
            });
            
            return response;
        } catch (error) {
            console.error('Error fetching student certificates:', error);
            set({ 
                error: error.response?.data?.message || 'Error al cargar certificados',
                loading: false,
                myCertificates: []
            });
            throw error;
        }
    },

    // Obtener certificados de un curso específico
    getCourseCertificates: async (courseId, params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await certificateService.getCourseCertificates(courseId, params);
            
            set({
                courseCertificates: response.certificates || [],
                pagination: response.pagination || {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 0
                },
                loading: false
            });
            
            return response;
        } catch (error) {
            console.error('Error fetching course certificates:', error);
            set({ 
                error: error.response?.data?.message || 'Error al cargar certificados del curso',
                loading: false,
                courseCertificates: []
            });
            throw error;
        }
    },

    // Verificar certificado público
    verifyCertificate: async (certificateNumber) => {
        set({ loading: true, error: null });
        try {
            const response = await certificateService.verifyCertificate(certificateNumber);
            
            set({
                currentCertificate: response.valid ? response.certificate : null,
                loading: false
            });
            
            return response;
        } catch (error) {
            console.error('Error verifying certificate:', error);
            set({ 
                error: error.response?.data?.message || 'Error al verificar certificado',
                loading: false,
                currentCertificate: null
            });
            throw error;
        }
    },

    // Verificar elegibilidad para certificado
    checkEligibility: async (studentId, courseId) => {
        set({ loading: true, error: null });
        try {
            const response = await certificateService.checkEligibility(studentId, courseId);
            
            set({
                eligibility: response.eligibility || null,
                loading: false
            });
            
            return response;
        } catch (error) {
            console.error('Error checking eligibility:', error);
            set({ 
                error: error.response?.data?.message || 'Error al verificar elegibilidad',
                loading: false,
                eligibility: null
            });
            throw error;
        }
    },

    // Generar certificado
    generateCertificate: async (studentId, courseId, options = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await certificateService.generateCertificate(studentId, courseId, options);
            
            // Actualizar lista de certificados si es exitoso
            if (response.success) {
                const { myCertificates } = get();
                set({
                    myCertificates: [response.certificate, ...myCertificates],
                    currentCertificate: response.certificate,
                    loading: false
                });
            }
            
            return response;
        } catch (error) {
            console.error('Error generating certificate:', error);
            set({ 
                error: error.response?.data?.message || 'Error al generar certificado',
                loading: false
            });
            throw error;
        }
    },

    // Emitir certificado (método original)
    issueCertificate: async (certificateData) => {
        set({ loading: true, error: null });
        try {
            const response = await certificateService.issueCertificate(certificateData);
            
            // Actualizar lista de certificados
            if (response.success) {
                const { courseCertificates } = get();
                set({
                    courseCertificates: [response.certificate, ...courseCertificates],
                    loading: false
                });
            }
            
            return response;
        } catch (error) {
            console.error('Error issuing certificate:', error);
            set({ 
                error: error.response?.data?.message || 'Error al emitir certificado',
                loading: false
            });
            throw error;
        }
    },

    // Revocar certificado
    revokeCertificate: async (certificateId, reason) => {
        set({ loading: true, error: null });
        try {
            const response = await certificateService.revokeCertificate(certificateId, reason);
            
            // Actualizar estado del certificado en las listas
            if (response.success) {
                const { myCertificates, courseCertificates } = get();
                
                const updateCertificate = (cert) => 
                    cert.id === certificateId ? { ...cert, status: 'revoked' } : cert;
                
                set({
                    myCertificates: myCertificates.map(updateCertificate),
                    courseCertificates: courseCertificates.map(updateCertificate),
                    loading: false
                });
            }
            
            return response;
        } catch (error) {
            console.error('Error revoking certificate:', error);
            set({ 
                error: error.response?.data?.message || 'Error al revocar certificado',
                loading: false
            });
            throw error;
        }
    },

    // Obtener plantillas de certificados
    getCertificateTemplates: async (category = '') => {
        set({ loading: true, error: null });
        try {
            const response = await certificateService.getCertificateTemplates();
            
            let templates = response.templates || [];
            
            // Filtrar por categoría si se especifica
            if (category) {
                templates = templates.filter(template => template.category === category);
            }
            
            set({
                templates,
                loading: false
            });
            
            return response;
        } catch (error) {
            console.error('Error fetching certificate templates:', error);
            set({ 
                error: error.response?.data?.message || 'Error al cargar plantillas',
                loading: false,
                templates: []
            });
            throw error;
        }
    },

    // Crear plantilla de certificado
    createCertificateTemplate: async (templateData) => {
        set({ loading: true, error: null });
        try {
            const response = await certificateService.createCertificateTemplate(templateData);
            
            if (response.success) {
                const { templates } = get();
                set({
                    templates: [response.template, ...templates],
                    loading: false
                });
            }
            
            return response;
        } catch (error) {
            console.error('Error creating certificate template:', error);
            set({ 
                error: error.response?.data?.message || 'Error al crear plantilla',
                loading: false
            });
            throw error;
        }
    },

    // Obtener estadísticas de certificados
    getCertificateStats: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await certificateService.getCertificateStats(params);
            
            set({
                stats: response.stats || null,
                loading: false
            });
            
            return response;
        } catch (error) {
            console.error('Error fetching certificate stats:', error);
            set({ 
                error: error.response?.data?.message || 'Error al cargar estadísticas',
                loading: false,
                stats: null
            });
            // No hacer throw aquí para que no rompa toda la carga de la página
            return { success: false, error: error.response?.data?.message || 'Error al cargar estadísticas' };
        }
    },

    // Limpiar error
    clearError: () => set({ error: null }),

    // Limpiar elegibilidad
    clearEligibility: () => set({ eligibility: null }),

    // Obtener datos para descarga de certificado
    getCertificateDownloadData: async (certificateId) => {
        set({ loading: true, error: null });
        try {
            const response = await certificateService.getCertificateDownloadData(certificateId);
            
            set({ loading: false });
            return response;
        } catch (error) {
            console.error('Error getting certificate download data:', error);
            set({ 
                error: error.response?.data?.message || 'Error al obtener datos de descarga',
                loading: false
            });
            throw error;
        }
    },

    // Limpiar certificado actual
    clearCurrentCertificate: () => set({ currentCertificate: null }),

    // Resetear store
    reset: () => set({
        certificates: [],
        myCertificates: [],
        courseCertificates: [],
        currentCertificate: null,
        eligibility: null,
        templates: [],
        stats: null,
        loading: false,
        error: null,
        pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
        }
    })
}));

export default useCertificateStore;