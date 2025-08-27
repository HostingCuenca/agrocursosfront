import { create } from 'zustand';
import { courseService } from '../services';

const useCourseStore = create((set, get) => ({
    // Estado
    courses: [],
    currentCourse: null,
    myCourses: [],
    courseEnrollments: [],
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    },
    filters: {
        category: '',
        level: '',
        search: ''
    },

    // Acciones - Obtener cursos públicos (con filtros)
    getCourses: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await courseService.getCourses({
                page: params.page || get().pagination.page,
                limit: params.limit || get().pagination.limit,
                category: params.category || get().filters.category,
                level: params.level || get().filters.level,
                search: params.search || get().filters.search,
                ...params
            });

            set({
                courses: response.courses || response.data || [],
                pagination: {
                    page: response.pagination?.page || 1,
                    limit: response.pagination?.limit || 10,
                    total: response.pagination?.total || 0,
                    totalPages: response.pagination?.totalPages || 0
                },
                loading: false
            });

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener cursos';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Obtener curso específico
    getCourseById: async (courseId) => {
        set({ loading: true, error: null });
        try {
            const response = await courseService.getCourseById(courseId);
            set({
                currentCourse: response.course || response,
                loading: false
            });
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener el curso';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Crear curso (instructor/admin)
    createCourse: async (courseData) => {
        set({ loading: true, error: null });
        try {
            const response = await courseService.createCourse(courseData);
            
            // Agregar el nuevo curso a la lista si estamos en la primera página
            const currentPagination = get().pagination;
            if (currentPagination.page === 1) {
                set(state => ({
                    courses: [response.course || response, ...state.courses],
                    loading: false
                }));
            } else {
                set({ loading: false });
            }

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al crear el curso';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Actualizar curso (instructor/admin)
    updateCourse: async (courseId, courseData) => {
        set({ loading: true, error: null });
        try {
            const response = await courseService.updateCourse(courseId, courseData);
            
            // Actualizar en la lista de cursos
            set(state => ({
                courses: state.courses.map(course => 
                    course.id === courseId ? { ...course, ...response.course || response } : course
                ),
                currentCourse: state.currentCourse?.id === courseId 
                    ? { ...state.currentCourse, ...response.course || response }
                    : state.currentCourse,
                loading: false
            }));

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al actualizar el curso';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Eliminar curso (instructor/admin)
    deleteCourse: async (courseId) => {
        set({ loading: true, error: null });
        try {
            const response = await courseService.deleteCourse(courseId);
            
            // Remover de la lista de cursos
            set(state => ({
                courses: state.courses.filter(course => course.id !== courseId),
                currentCourse: state.currentCourse?.id === courseId ? null : state.currentCourse,
                loading: false
            }));

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al eliminar el curso';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Inscribirse en un curso
    enrollInCourse: async (courseId, enrollmentData = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await courseService.enrollInCourse(courseId, enrollmentData);
            
            // Actualizar el estado del curso si está cargado
            set(state => ({
                currentCourse: state.currentCourse?.id === courseId 
                    ? { ...state.currentCourse, isEnrolled: true, enrollment: response.enrollment }
                    : state.currentCourse,
                loading: false
            }));

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al inscribirse en el curso';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Obtener inscripciones de un curso (instructor/admin)
    getCourseEnrollments: async (courseId) => {
        set({ loading: true, error: null });
        try {
            const response = await courseService.getCourseEnrollments(courseId);
            set({
                courseEnrollments: response.enrollments || response.data || [],
                loading: false
            });
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener inscripciones';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Obtener mis cursos (como estudiante - inscripto)
    getMyCourses: async () => {
        set({ loading: true, error: null });
        try {
            // Obtener cursos donde el usuario está inscripto
            const response = await courseService.getCourses({ enrolled: true });
            set({
                myCourses: response.courses || response.data || [],
                loading: false
            });
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener mis cursos';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Obtener cursos creados por el instructor actual
    getInstructorCourses: async () => {
        set({ loading: true, error: null });
        try {
            const response = await courseService.getCourses({ instructor: true });
            set({
                myCourses: response.courses || response.data || [],
                loading: false
            });
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener cursos del instructor';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Actualizar filtros
    setFilters: (newFilters) => {
        set(state => ({
            filters: { ...state.filters, ...newFilters },
            pagination: { ...state.pagination, page: 1 } // Resetear página al cambiar filtros
        }));
    },

    // Cambiar página
    setPage: (page) => {
        set(state => ({
            pagination: { ...state.pagination, page }
        }));
    },

    // Limpiar estado
    clearCurrentCourse: () => set({ currentCourse: null }),
    clearError: () => set({ error: null }),
    clearCourses: () => set({ courses: [], myCourses: [], currentCourse: null }),

    // Utilidades para roles
    canCreateCourse: (userRole) => ['instructor', 'admin'].includes(userRole),
    canEditCourse: (userRole, courseInstructorId, userId) => {
        return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
    },
    canDeleteCourse: (userRole, courseInstructorId, userId) => {
        return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
    },
    canManageEnrollments: (userRole, courseInstructorId, userId) => {
        return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
    }
}));

export default useCourseStore;