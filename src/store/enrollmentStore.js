import { create } from 'zustand';
import enrollmentService from '../services/enrollmentService';

const useEnrollmentStore = create((set, get) => ({
    // Estado inicial
    enrollments: [],
    pendingEnrollments: [],
    stats: null,
    loading: false,
    error: null,
    selectedEnrollments: [],
    filters: {
        status: 'all',
        courseId: null,
        search: ''
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    },

    // Acciones básicas
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
    
    // Gestión de filtros
    setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
        pagination: { ...state.pagination, page: 1 }
    })),

    clearFilters: () => set({
        filters: {
            status: 'all',
            courseId: null,
            search: ''
        },
        pagination: { ...get().pagination, page: 1 }
    }),

    // Gestión de selección
    selectEnrollment: (enrollmentId) => set((state) => {
        const isSelected = state.selectedEnrollments.includes(enrollmentId);
        return {
            selectedEnrollments: isSelected 
                ? state.selectedEnrollments.filter(id => id !== enrollmentId)
                : [...state.selectedEnrollments, enrollmentId]
        };
    }),

    selectAllEnrollments: (enrollmentIds) => set({ 
        selectedEnrollments: enrollmentIds 
    }),

    clearSelection: () => set({ selectedEnrollments: [] }),

    // Obtener todas las inscripciones (admin)
    getAllEnrollments: async (params = {}) => {
        const state = get();
        set({ loading: true, error: null });
        
        try {
            const requestParams = {
                ...state.filters,
                ...state.pagination,
                ...params
            };

            // Limpiar parámetros vacíos
            Object.keys(requestParams).forEach(key => {
                if (!requestParams[key] || requestParams[key] === 'all') {
                    delete requestParams[key];
                }
            });

            const response = await enrollmentService.getAllEnrollments(requestParams);
            
            set({
                enrollments: response.enrollments || [],
                pagination: response.pagination || state.pagination,
                loading: false
            });
            
            return response;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message || 'Error al cargar inscripciones',
                loading: false 
            });
            throw error;
        }
    },

    // Obtener inscripciones de un curso
    getCourseEnrollments: async (courseId, params = {}) => {
        const state = get();
        set({ loading: true, error: null });
        
        try {
            const requestParams = {
                ...state.filters,
                ...state.pagination,
                ...params
            };

            Object.keys(requestParams).forEach(key => {
                if (!requestParams[key] || requestParams[key] === 'all') {
                    delete requestParams[key];
                }
            });

            const response = await enrollmentService.getCourseEnrollments(courseId, requestParams);
            
            set({
                enrollments: response.enrollments || [],
                pagination: response.pagination || state.pagination,
                loading: false
            });
            
            return response;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message || 'Error al cargar inscripciones del curso',
                loading: false 
            });
            throw error;
        }
    },

    // Obtener inscripciones pendientes
    getPendingEnrollments: async (params = {}) => {
        const state = get();
        set({ loading: true, error: null });
        
        try {
            const requestParams = {
                status: 'pending',
                ...params
            };

            const response = await enrollmentService.getAllEnrollments(requestParams);
            
            set({
                pendingEnrollments: response.enrollments || [],
                loading: false
            });
            
            return response;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message || 'Error al cargar inscripciones pendientes',
                loading: false 
            });
            throw error;
        }
    },

    // Aprobar inscripción
    approveEnrollment: async (enrollmentId) => {
        set({ loading: true, error: null });
        
        try {
            const response = await enrollmentService.approveEnrollment(enrollmentId);
            
            // Actualizar el estado local
            set((state) => ({
                enrollments: state.enrollments.map(enrollment => 
                    enrollment.id === enrollmentId 
                        ? { ...enrollment, status: 'enrolled' }
                        : enrollment
                ),
                pendingEnrollments: state.pendingEnrollments.filter(
                    enrollment => enrollment.id !== enrollmentId
                ),
                selectedEnrollments: state.selectedEnrollments.filter(
                    id => id !== enrollmentId
                ),
                loading: false
            }));
            
            return response;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message || 'Error al aprobar inscripción',
                loading: false 
            });
            throw error;
        }
    },

    // Rechazar inscripción
    rejectEnrollment: async (enrollmentId, reason) => {
        set({ loading: true, error: null });
        
        try {
            const response = await enrollmentService.rejectEnrollment(enrollmentId, reason);
            
            // Actualizar el estado local
            set((state) => ({
                enrollments: state.enrollments.map(enrollment => 
                    enrollment.id === enrollmentId 
                        ? { ...enrollment, status: 'rejected', rejection_reason: reason }
                        : enrollment
                ),
                pendingEnrollments: state.pendingEnrollments.filter(
                    enrollment => enrollment.id !== enrollmentId
                ),
                selectedEnrollments: state.selectedEnrollments.filter(
                    id => id !== enrollmentId
                ),
                loading: false
            }));
            
            return response;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message || 'Error al rechazar inscripción',
                loading: false 
            });
            throw error;
        }
    },

    // Aprobar múltiples inscripciones
    approveMultipleEnrollments: async (enrollmentIds) => {
        set({ loading: true, error: null });
        
        try {
            const results = await enrollmentService.approveMultipleEnrollments(enrollmentIds);
            
            const successfulIds = results
                .filter(result => result.success)
                .map(result => result.enrollmentId);

            const failedResults = results.filter(result => !result.success);

            // Actualizar el estado local para las aprobaciones exitosas
            set((state) => ({
                enrollments: state.enrollments.map(enrollment => 
                    successfulIds.includes(enrollment.id)
                        ? { ...enrollment, status: 'enrolled' }
                        : enrollment
                ),
                pendingEnrollments: state.pendingEnrollments.filter(
                    enrollment => !successfulIds.includes(enrollment.id)
                ),
                selectedEnrollments: [],
                loading: false
            }));

            // Si hubo fallos, mostrar error con detalles
            if (failedResults.length > 0) {
                const errorMessage = `${successfulIds.length} inscripciones aprobadas, ${failedResults.length} fallaron`;
                set({ error: errorMessage });
            }
            
            return { successfulIds, failedResults, results };
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message || 'Error al aprobar inscripciones',
                loading: false 
            });
            throw error;
        }
    },

    // Obtener estadísticas
    getEnrollmentStats: async (params = {}) => {
        set({ loading: true, error: null });
        
        try {
            const response = await enrollmentService.getEnrollmentStats(params);
            
            set({
                stats: response.stats || null,
                loading: false
            });
            
            return response;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message || 'Error al cargar estadísticas',
                loading: false 
            });
            throw error;
        }
    },

    // Buscar inscripciones
    searchEnrollments: async (searchTerm, params = {}) => {
        set({ loading: true, error: null });
        
        try {
            const response = await enrollmentService.searchEnrollments(searchTerm, params);
            
            set({
                enrollments: response.enrollments || [],
                pagination: response.pagination || get().pagination,
                loading: false
            });
            
            return response;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || error.message || 'Error al buscar inscripciones',
                loading: false 
            });
            throw error;
        }
    },

    // Resetear store
    reset: () => set({
        enrollments: [],
        pendingEnrollments: [],
        stats: null,
        loading: false,
        error: null,
        selectedEnrollments: [],
        filters: {
            status: 'all',
            courseId: null,
            search: ''
        },
        pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
        }
    })
}));

export default useEnrollmentStore;