import { create } from 'zustand';
import { moduleService, classService } from '../services';

const useContentStore = create((set, get) => ({
    // Estado para módulos
    modules: [],
    currentModule: null,
    modulesLoading: false,
    modulesError: null,

    // Estado para clases
    classes: [],
    currentClass: null,
    classesLoading: false,
    classesError: null,

    // Estado general
    loading: false,
    error: null,

    // ========== ACCIONES PARA MÓDULOS ==========

    // Obtener módulos de un curso
    getCourseModules: async (courseId) => {
        set({ modulesLoading: true, modulesError: null });
        try {
            const response = await moduleService.getCourseModules(courseId);
            set({
                modules: response.modules || [],
                modulesLoading: false
            });
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener módulos';
            set({ modulesError: errorMessage, modulesLoading: false });
            throw error;
        }
    },

    // Crear módulo
    createModule: async (courseId, moduleData) => {
        set({ loading: true, error: null });
        try {
            const response = await moduleService.createModule(courseId, moduleData);
            
            // Agregar el nuevo módulo a la lista
            set(state => ({
                modules: [...state.modules, response.module || response].sort((a, b) => a.order_sequence - b.order_sequence),
                loading: false
            }));
            
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al crear módulo';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Actualizar módulo
    updateModule: async (moduleId, moduleData) => {
        set({ loading: true, error: null });
        try {
            const response = await moduleService.updateModule(moduleId, moduleData);
            
            // Actualizar el módulo en la lista
            set(state => ({
                modules: state.modules.map(module => 
                    module.id === moduleId 
                        ? { ...module, ...response.module || response }
                        : module
                ).sort((a, b) => a.order_sequence - b.order_sequence),
                currentModule: state.currentModule?.id === moduleId 
                    ? { ...state.currentModule, ...response.module || response }
                    : state.currentModule,
                loading: false
            }));
            
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al actualizar módulo';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Eliminar módulo
    deleteModule: async (moduleId) => {
        set({ loading: true, error: null });
        try {
            const response = await moduleService.deleteModule(moduleId);
            
            // Remover el módulo de la lista
            set(state => ({
                modules: state.modules.filter(module => module.id !== moduleId),
                currentModule: state.currentModule?.id === moduleId ? null : state.currentModule,
                loading: false
            }));
            
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al eliminar módulo';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Reordenar módulos
    reorderModules: async (courseId, reorderedModules) => {
        set({ loading: true, error: null });
        try {
            const response = await moduleService.reorderModules(courseId, reorderedModules);
            
            // Actualizar el orden en la lista local
            set(state => ({
                modules: state.modules.map(module => {
                    const reordered = reorderedModules.find(r => r.id === module.id);
                    return reordered ? { ...module, order_sequence: reordered.order_sequence } : module;
                }).sort((a, b) => a.order_sequence - b.order_sequence),
                loading: false
            }));
            
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al reordenar módulos';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // ========== ACCIONES PARA CLASES ==========

    // Obtener clases de un módulo
    getModuleClasses: async (moduleId) => {
        set({ classesLoading: true, classesError: null });
        try {
            const response = await classService.getModuleClasses(moduleId);
            set({
                classes: response.classes || [],
                classesLoading: false
            });
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener clases';
            set({ classesError: errorMessage, classesLoading: false });
            throw error;
        }
    },

    // Crear clase
    createClass: async (moduleId, classData) => {
        set({ loading: true, error: null });
        try {
            const response = await classService.createClass(moduleId, classData);
            
            // Agregar la nueva clase a la lista
            set(state => ({
                classes: [...state.classes, response.class || response].sort((a, b) => a.order_sequence - b.order_sequence),
                loading: false
            }));
            
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al crear clase';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Actualizar clase
    updateClass: async (classId, classData) => {
        set({ loading: true, error: null });
        try {
            const response = await classService.updateClass(classId, classData);
            
            // Actualizar la clase en la lista
            set(state => ({
                classes: state.classes.map(clazz => 
                    clazz.id === classId 
                        ? { ...clazz, ...response.class || response }
                        : clazz
                ).sort((a, b) => a.order_sequence - b.order_sequence),
                currentClass: state.currentClass?.id === classId 
                    ? { ...state.currentClass, ...response.class || response }
                    : state.currentClass,
                loading: false
            }));
            
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al actualizar clase';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Eliminar clase
    deleteClass: async (classId) => {
        set({ loading: true, error: null });
        try {
            const response = await classService.deleteClass(classId);
            
            // Remover la clase de la lista
            set(state => ({
                classes: state.classes.filter(clazz => clazz.id !== classId),
                currentClass: state.currentClass?.id === classId ? null : state.currentClass,
                loading: false
            }));
            
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al eliminar clase';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Reordenar clases
    reorderClasses: async (moduleId, reorderedClasses) => {
        set({ loading: true, error: null });
        try {
            const response = await classService.reorderClasses(moduleId, reorderedClasses);
            
            // Actualizar el orden en la lista local
            set(state => ({
                classes: state.classes.map(clazz => {
                    const reordered = reorderedClasses.find(r => r.id === clazz.id);
                    return reordered ? { ...clazz, order_sequence: reordered.order_sequence } : clazz;
                }).sort((a, b) => a.order_sequence - b.order_sequence),
                loading: false
            }));
            
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al reordenar clases';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // Obtener clase específica
    getClassById: async (classId) => {
        set({ loading: true, error: null });
        try {
            const response = await classService.getClassById(classId);
            set({
                currentClass: response.class || response,
                loading: false
            });
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener clase';
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    // ========== ACCIONES DE SELECCIÓN ==========

    // Seleccionar módulo actual
    setCurrentModule: (module) => {
        set({ currentModule: module });
    },

    // Seleccionar clase actual
    setCurrentClass: (clazz) => {
        set({ currentClass: clazz });
    },

    // ========== ACCIONES DE LIMPIEZA ==========

    // Limpiar módulos
    clearModules: () => {
        set({ 
            modules: [], 
            currentModule: null, 
            modulesError: null 
        });
    },

    // Limpiar clases
    clearClasses: () => {
        set({ 
            classes: [], 
            currentClass: null, 
            classesError: null 
        });
    },

    // Limpiar todo
    clearAll: () => {
        set({
            modules: [],
            currentModule: null,
            modulesError: null,
            classes: [],
            currentClass: null,
            classesError: null,
            error: null
        });
    },

    // Limpiar errores
    clearError: () => {
        set({ error: null, modulesError: null, classesError: null });
    },

    // ========== UTILIDADES ==========

    // Obtener siguiente orden para módulo
    getNextModuleOrder: () => {
        const modules = get().modules;
        return moduleService.getNextOrderSequence(modules);
    },

    // Obtener siguiente orden para clase
    getNextClassOrder: () => {
        const classes = get().classes;
        return classService.getNextOrderSequence(classes);
    },

    // Verificar si un módulo tiene clases
    moduleHasClasses: (moduleId) => {
        const modules = get().modules;
        const module = modules.find(m => m.id === moduleId);
        return module?.classes_count > 0;
    },

    // Obtener estadísticas de contenido
    getContentStats: () => {
        const { modules, classes } = get();
        
        return {
            totalModules: modules.length,
            publishedModules: modules.filter(m => m.is_published).length,
            totalClasses: classes.length,
            publishedClasses: classes.filter(c => c.is_published).length,
            videoClasses: classes.filter(c => c.type === 'video').length,
            textClasses: classes.filter(c => c.type === 'text').length,
            quizClasses: classes.filter(c => c.type === 'quiz').length,
            assignmentClasses: classes.filter(c => c.type === 'assignment').length
        };
    }
}));

export default useContentStore;