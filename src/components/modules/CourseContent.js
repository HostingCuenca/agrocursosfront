import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, PlayCircle, FileText, Plus, Settings, Clock, CheckCircle, BookOpen } from 'lucide-react';
import moduleService from '../../services/moduleService';
import classService from '../../services/classService';
import useAuthStore from '../../store/authStore';
import useRolePermissions from '../../hooks/useRolePermissions';

const CourseContent = ({ courseId, isEnrolled = false }) => {
    const { user } = useAuthStore();
    const permissions = useRolePermissions();
    
    const [modules, setModules] = useState([]);
    const [expandedModules, setExpandedModules] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [moduleClasses, setModuleClasses] = useState({});

    // Cargar módulos del curso
    useEffect(() => {
        const loadModules = async () => {
            try {
                setLoading(true);
                const response = await moduleService.getCourseModules(courseId);
                console.log('Modules response:', response);
                
                // La API puede tener diferentes estructuras de respuesta
                const modulesList = response.modules || response.data || response;
                setModules(Array.isArray(modulesList) ? modulesList : []);
            } catch (error) {
                console.error('Error loading modules:', error);
                setError('Error al cargar el contenido del curso');
                setModules([]);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            loadModules();
        }
    }, [courseId]);

    // Cargar clases cuando se expande un módulo
    const toggleModule = async (moduleId) => {
        const newExpanded = new Set(expandedModules);
        
        if (expandedModules.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
            
            // Cargar clases si no están cargadas
            if (!moduleClasses[moduleId]) {
                try {
                    const response = await classService.getModuleClasses(moduleId);
                    console.log('Classes response:', response);
                    
                    const classesList = response.classes || response.data || response;
                    setModuleClasses(prev => ({
                        ...prev,
                        [moduleId]: Array.isArray(classesList) ? classesList : []
                    }));
                } catch (error) {
                    console.error('Error loading classes:', error);
                    setModuleClasses(prev => ({
                        ...prev,
                        [moduleId]: []
                    }));
                }
            }
        }
        
        setExpandedModules(newExpanded);
    };

    // Función para determinar el icono del tipo de clase
    const getClassIcon = (type) => {
        switch (type) {
            case 'video':
                return <PlayCircle className="w-4 h-4 text-blue-500" />;
            case 'text':
                return <FileText className="w-4 h-4 text-green-500" />;
            case 'quiz':
                return <CheckCircle className="w-4 h-4 text-purple-500" />;
            case 'assignment':
                return <FileText className="w-4 h-4 text-orange-500" />;
            default:
                return <PlayCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    // Función para obtener el color del badge del tipo de clase
    const getClassBadgeColor = (type) => {
        switch (type) {
            case 'video':
                return 'bg-blue-100 text-blue-800';
            case 'text':
                return 'bg-green-100 text-green-800';
            case 'quiz':
                return 'bg-purple-100 text-purple-800';
            case 'assignment':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Contenido del Curso</h2>
                    {permissions.canManageCourses && (
                        <button className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                            <Plus className="w-4 h-4" />
                            <span>Agregar Módulo</span>
                        </button>
                    )}
                </div>
                
                {modules.length > 0 && (
                    <div className="mt-2 text-sm text-gray-500">
                        {modules.length} módulo{modules.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            <div className="divide-y divide-gray-200">
                {modules.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p>No hay módulos disponibles en este curso.</p>
                        {permissions.canManageCourses && (
                            <p className="text-sm mt-2">Comienza agregando el primer módulo.</p>
                        )}
                    </div>
                ) : (
                    modules.map((module, moduleIndex) => (
                        <div key={module.id || moduleIndex} className="border-0">
                            {/* Header del Módulo */}
                            <div 
                                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => toggleModule(module.id)}
                            >
                                <div className="flex items-center flex-1">
                                    {expandedModules.has(module.id) ? 
                                        <ChevronDown className="w-5 h-5 text-gray-400 mr-3" /> : 
                                        <ChevronRight className="w-5 h-5 text-gray-400 mr-3" />
                                    }
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-900">
                                                {module.title || `Módulo ${moduleIndex + 1}`}
                                            </h3>
                                            {permissions.canManageCourses && (
                                                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        {module.description && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                {module.description}
                                            </p>
                                        )}
                                        
                                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                            <span>Secuencia: {module.order_sequence || moduleIndex + 1}</span>
                                            {module.duration_minutes && (
                                                <span className="flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {module.duration_minutes}min
                                                </span>
                                            )}
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                module.is_published 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {module.is_published ? 'Publicado' : 'Borrador'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contenido del Módulo (Clases) */}
                            {expandedModules.has(module.id) && (
                                <div className="bg-gray-50 border-t border-gray-200">
                                    <div className="p-4">
                                        {moduleClasses[module.id] ? (
                                            moduleClasses[module.id].length > 0 ? (
                                                <div className="space-y-2">
                                                    {moduleClasses[module.id].map((classItem, classIndex) => (
                                                        <div 
                                                            key={classItem.id || classIndex} 
                                                            className="flex items-center p-3 bg-white rounded-lg border hover:border-blue-200 transition-colors cursor-pointer"
                                                        >
                                                            <div className="flex items-center space-x-3 flex-1">
                                                                {getClassIcon(classItem.type)}
                                                                
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className="font-medium text-gray-900 text-sm">
                                                                            {classItem.title || `Clase ${classIndex + 1}`}
                                                                        </h4>
                                                                        
                                                                        <div className="flex items-center space-x-2">
                                                                            {classItem.duration_minutes && (
                                                                                <span className="text-xs text-gray-500 flex items-center">
                                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                                    {classItem.duration_minutes}min
                                                                                </span>
                                                                            )}
                                                                            
                                                                            <span className={`px-2 py-1 rounded-full text-xs ${getClassBadgeColor(classItem.type)}`}>
                                                                                {classItem.type || 'video'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {classItem.description && (
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            {classItem.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500 py-4">
                                                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm">No hay clases en este módulo.</p>
                                                    {permissions.canManageCourses && (
                                                        <button className="mt-2 text-xs text-blue-600 hover:underline">
                                                            Agregar Primera Clase
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        ) : (
                                            <div className="text-center text-gray-500 py-4">
                                                <div className="animate-pulse">
                                                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {permissions.canManageCourses && moduleClasses[module.id]?.length > 0 && (
                                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                                            <button className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors">
                                                <Plus className="w-4 h-4" />
                                                <span>Agregar Clase</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseContent;