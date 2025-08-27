import React, { useState, useEffect } from 'react';
import { Play, FileText, HelpCircle, Award, Clock, CheckCircle } from 'lucide-react';
import { moduleService } from '../../services/moduleService';
import { classService } from '../../services/classService';

const ModuleClasses = ({ courseId, currentClassId, onClassSelect, completedClasses = [] }) => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedModules, setExpandedModules] = useState(new Set());

    useEffect(() => {
        loadModules();
    }, [courseId]);

    const loadModules = async () => {
        try {
            setLoading(true);
            console.log('Loading modules for course:', courseId);
            const response = await moduleService.getCourseModules(courseId);
            console.log('Modules response:', response);
            
            // La respuesta puede venir como response.modules o response.data o directamente response
            const modulesList = response?.modules || response?.data || response;
            console.log('Modules list:', modulesList);
            
            if (Array.isArray(modulesList)) {
                setModules(modulesList);
                // Auto-expand all modules for better UX
                const allModuleIds = new Set(modulesList.map(module => module.id));
                setExpandedModules(allModuleIds);
                
                // Load classes for each module
                const modulesWithClasses = await Promise.all(
                    modulesList.map(async (module) => {
                        try {
                            console.log(`Loading classes for module ${module.id}:`, module.title);
                            const classesResponse = await classService.getModuleClasses(module.id);
                            console.log(`Classes response for module ${module.id}:`, classesResponse);
                            
                            // La respuesta puede venir como response.classes o response.data
                            const classesList = classesResponse?.classes || classesResponse?.data || classesResponse || [];
                            console.log(`Classes list for module ${module.id}:`, classesList);
                            
                            return {
                                ...module,
                                classes: Array.isArray(classesList) ? classesList : []
                            };
                        } catch (error) {
                            console.error(`Error loading classes for module ${module.id}:`, error);
                            return {
                                ...module,
                                classes: []
                            };
                        }
                    })
                );
                
                console.log('Final modules with classes:', modulesWithClasses);
                setModules(modulesWithClasses);
            } else {
                console.error('Modules is not an array:', modulesList);
                setModules([]);
            }
        } catch (error) {
            console.error('Error loading modules:', error);
            setError('Error al cargar el contenido del curso');
            setModules([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = (moduleId) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const getClassIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'video':
                return <Play className="w-4 h-4" />;
            case 'text':
            case 'reading':
                return <FileText className="w-4 h-4" />;
            case 'quiz':
            case 'assessment':
                return <HelpCircle className="w-4 h-4" />;
            case 'assignment':
                return <Award className="w-4 h-4" />;
            default:
                return <Play className="w-4 h-4" />;
        }
    };


    const isClassCompleted = (classId) => {
        return completedClasses.includes(classId);
    };

    const isCurrentClass = (classId) => {
        return currentClassId === classId;
    };

    if (loading) {
        return (
            <div className="p-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i}>
                                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                <div className="ml-4 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="text-center text-red-600">
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={loadModules}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    if (!modules.length) {
        return (
            <div className="p-4">
                <div className="text-center text-gray-500">
                    <p className="text-sm">No hay contenido disponible</p>
                </div>
            </div>
        );
    }

    const totalClasses = modules.reduce((total, module) => total + (module.classes?.length || 0), 0);
    const completedCount = completedClasses.length;
    const progressPercentage = totalClasses > 0 ? Math.round((completedCount / totalClasses) * 100) : 0;

    return (
        <div className="h-full flex flex-col">
            {/* Progress header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-2">Contenido del Curso</h3>
                <div className="text-sm text-gray-600 mb-2">
                    {completedCount} de {totalClasses} clases completadas
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{progressPercentage}% completado</div>
            </div>

            {/* Module list */}
            <div className="flex-1 overflow-y-auto">
                {modules.map((module, moduleIndex) => (
                    <div key={module.id} className="border-b border-gray-100">
                        {/* Module header */}
                        <button
                            onClick={() => toggleModule(module.id)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-medium text-gray-500">
                                            {moduleIndex + 1}
                                        </span>
                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                            {module.title}
                                        </h4>
                                    </div>
                                    {module.classes && (
                                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                            <span>{module.classes.length} clases</span>
                                            {module.duration_minutes && (
                                                <span className="flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {module.duration_minutes} min
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="text-gray-400">
                                    <svg
                                        className={`w-4 h-4 transition-transform ${
                                            expandedModules.has(module.id) ? 'rotate-180' : ''
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </button>

                        {/* Module classes */}
                        {expandedModules.has(module.id) && module.classes && (
                            <div className="bg-white">
                                {module.classes && module.classes.length > 0 ? (
                                    module.classes.map((classItem, classIndex) => (
                                    <button
                                        key={classItem.id}
                                        onClick={() => onClassSelect(classItem, module)}
                                        className={`w-full px-4 py-3 text-left hover:bg-blue-50 focus:outline-none border-l-4 transition-colors ${
                                            isCurrentClass(classItem.id)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                {isClassCompleted(classItem.id) ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <div className="text-gray-400">
                                                        {getClassIcon(classItem.type)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">
                                                        {moduleIndex + 1}.{classIndex + 1}
                                                    </span>
                                                    <h5 className={`text-sm truncate ${
                                                        isCurrentClass(classItem.id) 
                                                            ? 'font-medium text-blue-600' 
                                                            : 'text-gray-700'
                                                    }`}>
                                                        {classItem.title}
                                                    </h5>
                                                </div>
                                                
                                                <div className="flex items-center space-x-3 mt-1">
                                                    <span className="text-xs text-gray-500 capitalize">
                                                        {classItem.type || 'video'}
                                                    </span>
                                                    {classItem.duration_minutes && (
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {classItem.duration_minutes} min
                                                        </span>
                                                    )}
                                                    {isClassCompleted(classItem.id) && (
                                                        <span className="text-xs text-green-600">Completada</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500">
                                        No hay clases disponibles
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModuleClasses;