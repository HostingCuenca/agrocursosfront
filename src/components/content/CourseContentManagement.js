import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import ModuleModal from '../modules/ModuleModal';
import ClassModal from '../classes/ClassModal';
import { moduleService } from '../../services/moduleService';
import { classService } from '../../services/classService';

const CourseContentManagement = ({ course, onContentUpdate }) => {
    const [modules, setModules] = useState([]);
    const [expandedModules, setExpandedModules] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Modal states
    const [moduleModal, setModuleModal] = useState({ isOpen: false, module: null });
    const [classModal, setClassModal] = useState({ isOpen: false, class: null, moduleId: null });

    // Load modules and their classes
    useEffect(() => {
        if (course?.id) {
            loadCourseModules();
        }
    }, [course?.id]);

    const loadCourseModules = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Loading modules for course:', course.id);
            const response = await moduleService.getCourseModules(course.id);
            console.log('Raw response:', response);
            
            // Extract modules array from response
            const modulesData = response.modules || response || [];
            console.log('Extracted modules:', modulesData);
            
            // Load classes for each module
            const modulesWithClasses = await Promise.all(
                modulesData.map(async (module) => {
                    try {
                        const classResponse = await classService.getModuleClasses(module.id);
                        const classes = classResponse.classes || classResponse || [];
                        return { ...module, classes: classes };
                    } catch (error) {
                        console.error(`Error loading classes for module ${module.id}:`, error);
                        return { ...module, classes: [] };
                    }
                })
            );

            setModules(modulesWithClasses);
            console.log('Loaded modules with classes:', modulesWithClasses);
        } catch (error) {
            console.error('Error loading course modules:', error);
            setError('Error al cargar los módulos del curso');
        } finally {
            setLoading(false);
        }
    };

    const toggleModuleExpansion = (moduleId) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    // Module handlers
    const handleCreateModule = () => {
        setModuleModal({ isOpen: true, module: null });
    };

    const handleEditModule = (module) => {
        setModuleModal({ isOpen: true, module });
    };

    const handleSaveModule = async (moduleId, moduleData) => {
        try {
            if (moduleId) {
                // Edit existing module
                await moduleService.updateModule(moduleId, moduleData);
            } else {
                // Create new module
                await moduleService.createModule(course.id, moduleData);
            }
            
            setModuleModal({ isOpen: false, module: null });
            await loadCourseModules();
            onContentUpdate?.();
        } catch (error) {
            console.error('Error saving module:', error);
            throw error;
        }
    };

    const handleDeleteModule = async (moduleId, moduleTitle) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar el módulo "${moduleTitle}"? Esta acción no se puede deshacer.`)) {
            try {
                await moduleService.deleteModule(moduleId);
                await loadCourseModules();
                onContentUpdate?.();
            } catch (error) {
                console.error('Error deleting module:', error);
                alert('Error al eliminar el módulo');
            }
        }
    };

    // Class handlers
    const handleCreateClass = (moduleId) => {
        setClassModal({ isOpen: true, class: null, moduleId });
    };

    const handleEditClass = (classItem, moduleId) => {
        setClassModal({ isOpen: true, class: classItem, moduleId });
    };

    const handleSaveClass = async (classIdOrModuleId, classData) => {
        try {
            if (classModal.class?.id) {
                // Edit existing class
                await classService.updateClass(classModal.class.id, classData);
            } else {
                // Create new class
                await classService.createClass(classIdOrModuleId, classData);
            }
            
            setClassModal({ isOpen: false, class: null, moduleId: null });
            await loadCourseModules();
            onContentUpdate?.();
        } catch (error) {
            console.error('Error saving class:', error);
            throw error;
        }
    };

    const handleDeleteClass = async (classId, classTitle) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la clase "${classTitle}"? Esta acción no se puede deshacer.`)) {
            try {
                await classService.deleteClass(classId);
                await loadCourseModules();
                onContentUpdate?.();
            } catch (error) {
                console.error('Error deleting class:', error);
                alert('Error al eliminar la clase');
            }
        }
    };

    const getContentTypeIcon = (contentType) => {
        switch (contentType) {
            case 'video': return '🎥';
            case 'text': return '📝';
            case 'mixed': return '🔀';
            default: return '📄';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-gray-600">Cargando contenido del curso...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                    <div className="text-red-500 mb-4">⚠️ {error}</div>
                    <button
                        onClick={loadCourseModules}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center">
                            <span className="mr-2">📚</span>
                            Gestión de Contenido
                        </h2>
                        <p className="text-blue-100 mt-1">
                            {course?.title}
                        </p>
                    </div>
                    <button
                        onClick={handleCreateModule}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Nuevo Módulo
                    </button>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-blue-100">Total Módulos</div>
                        <div className="text-xl font-semibold">{modules.length}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-blue-100">Total Clases</div>
                        <div className="text-xl font-semibold">
                            {modules.reduce((total, module) => total + (module.classes?.length || 0), 0)}
                        </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-blue-100">Publicados</div>
                        <div className="text-xl font-semibold">
                            {modules.filter(m => m.is_published).length}/{modules.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules List */}
            <div className="bg-white rounded-lg shadow-md">
                {modules.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">📚</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No hay módulos creados
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Crea el primer módulo para comenzar a estructurar tu curso
                        </p>
                        <button
                            onClick={handleCreateModule}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Crear Primer Módulo
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {modules
                            .sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0))
                            .map((module) => (
                            <div key={module.id} className="p-4">
                                {/* Module Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                        <GripVertical className="text-gray-400" size={18} />
                                        
                                        <button
                                            onClick={() => toggleModuleExpansion(module.id)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            {expandedModules.has(module.id) ? (
                                                <ChevronDown size={18} />
                                            ) : (
                                                <ChevronRight size={18} />
                                            )}
                                        </button>

                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-mono text-gray-500">
                                                    #{module.order_sequence}
                                                </span>
                                                <h3 className="font-medium text-gray-900">
                                                    {module.title}
                                                </h3>
                                                <span className="text-lg">
                                                    {module.is_published ? '🟢' : '🔴'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {module.description}
                                            </p>
                                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                <span>📚 {module.classes?.length || 0} clases</span>
                                                <span>
                                                    {module.is_published ? 'Publicado' : 'Borrador'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleCreateClass(module.id)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                            title="Agregar Clase"
                                        >
                                            <Plus size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleEditModule(module)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Editar Módulo"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteModule(module.id, module.title)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Eliminar Módulo"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Classes List (Expanded) */}
                                {expandedModules.has(module.id) && module.classes && (
                                    <div className="ml-12 mt-4 space-y-2">
                                        {module.classes.length === 0 ? (
                                            <div className="text-center py-6 bg-gray-50 rounded-lg">
                                                <div className="text-2xl mb-2">🎬</div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Este módulo no tiene clases aún
                                                </p>
                                                <button
                                                    onClick={() => handleCreateClass(module.id)}
                                                    className="px-3 py-1 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 inline-flex items-center gap-1"
                                                >
                                                    <Plus size={14} />
                                                    Crear Primera Clase
                                                </button>
                                            </div>
                                        ) : (
                                            module.classes
                                                .sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0))
                                                .map((classItem) => (
                                                <div
                                                    key={classItem.id}
                                                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <GripVertical className="text-gray-400" size={14} />
                                                        <span className="text-xs font-mono text-gray-500">
                                                            #{classItem.order_sequence}
                                                        </span>
                                                        <span className="text-sm">
                                                            {getContentTypeIcon(classItem.content_type)}
                                                        </span>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {classItem.title}
                                                                </span>
                                                                <span className="text-sm">
                                                                    {classItem.is_published ? '🟢' : '🔴'}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-600 flex items-center space-x-3">
                                                                <span>Tipo: {classItem.content_type}</span>
                                                                <span>
                                                                    {classItem.is_published ? 'Publicada' : 'Borrador'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-1">
                                                        <button
                                                            onClick={() => handleEditClass(classItem, module.id)}
                                                            className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                                            title="Editar Clase"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClass(classItem.id, classItem.title)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Eliminar Clase"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <ModuleModal
                isOpen={moduleModal.isOpen}
                onClose={() => setModuleModal({ isOpen: false, module: null })}
                module={moduleModal.module}
                courseId={course?.id}
                onSave={handleSaveModule}
                loading={false}
            />

            <ClassModal
                isOpen={classModal.isOpen}
                onClose={() => setClassModal({ isOpen: false, class: null, moduleId: null })}
                classItem={classModal.class}
                moduleId={classModal.moduleId}
                onSave={handleSaveClass}
                loading={false}
            />
        </div>
    );
};

export default CourseContentManagement;