import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    BookOpen, 
    PlayCircle, 
    FileText, 
    CheckCircle,
    Clock,
    ArrowLeft
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import useCourseStore from '../store/courseStore';
import { classService } from '../services/classService';
import useAuthStore from '../store/authStore';
import ModuleClasses from '../components/courses/ModuleClasses';

const CoursePlayerPage = () => {
    const { id } = useParams(); // courseId
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { currentCourse, getCourseById, clearCurrentCourse } = useCourseStore();
    
    // Estados para el reproductor
    const [currentClass, setCurrentClass] = useState(null);
    const [currentModule, setCurrentModule] = useState(null);
    const [completedClasses, setCompletedClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cargar datos inicial
    useEffect(() => {
        const loadCourseData = async () => {
            try {
                setLoading(true);
                
                // Cargar información del curso
                if (id) {
                    await getCourseById(id);
                }
                
                // TODO: Cargar progreso del usuario cuando el endpoint esté disponible
                // Por ahora usamos un array vacío
                setCompletedClasses([]);
                
            } catch (error) {
                console.error('Error loading course data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCourseData();
        
        return () => {
            clearCurrentCourse();
        };
    }, [id, getCourseById, clearCurrentCourse]);

    // Manejar selección de clase desde el sidebar
    const handleClassSelect = async (selectedClass, selectedModule) => {
        console.log('Class selected:', selectedClass, selectedModule);
        setCurrentClass(selectedClass);
        setCurrentModule(selectedModule);
        
        // TODO: Marcar como vista cuando el endpoint esté disponible
    };

    // Marcar clase como completada
    const markClassCompleted = async () => {
        if (!currentClass) return;
        
        try {
            // Usar el endpoint correcto para completar clase
            const response = await classService.completeClass(currentClass.id);
            
            if (response.success) {
                // Actualizar estado local
                if (!completedClasses.includes(currentClass.id)) {
                    setCompletedClasses(prev => [...prev, currentClass.id]);
                }
                console.log('Class marked as completed:', currentClass.title);
            }
        } catch (error) {
            console.error('Error marking class as completed:', error);
        }
    };

    // Navegación simplificada (será manejada por el componente ModuleClasses)
    const navigateToNext = () => {
        // La navegación se maneja desde el sidebar
        console.log('Navigate to next class');
    };

    const navigateToPrev = () => {
        // La navegación se maneja desde el sidebar
        console.log('Navigate to previous class');
    };

    // Verificar si es video de YouTube
    const isYouTubeVideo = (url) => {
        if (!url) return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    // Extraer ID de video de YouTube
    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Renderizar contenido de la clase
    const renderClassContent = () => {
        if (!currentClass) {
            return (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Selecciona una clase para comenzar</p>
                    </div>
                </div>
            );
        }

        switch (currentClass.type) {
            case 'video':
                if (isYouTubeVideo(currentClass.content_url)) {
                    const videoId = getYouTubeVideoId(currentClass.content_url);
                    return (
                        <div className="w-full h-full">
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                title={currentClass.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                    );
                } else if (currentClass.content_url) {
                    return (
                        <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                            <video 
                                controls 
                                autoPlay 
                                className="w-full h-full rounded-lg"
                                src={currentClass.content_url}
                            >
                                Tu navegador no soporta videos.
                            </video>
                        </div>
                    );
                } else {
                    return (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <PlayCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>Video no disponible</p>
                            </div>
                        </div>
                    );
                }

            case 'text':
                return (
                    <div className="h-full overflow-y-auto bg-white rounded-lg p-8">
                        <div className="prose max-w-none">
                            <h1 className="text-3xl font-bold mb-6">{currentClass.title}</h1>
                            {currentClass.description && (
                                <p className="text-lg text-gray-600 mb-8">{currentClass.description}</p>
                            )}
                            {currentClass.content_text ? (
                                <div className="whitespace-pre-wrap">
                                    {currentClass.content_text}
                                </div>
                            ) : (
                                <p className="text-gray-500">Contenido de texto no disponible</p>
                            )}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>Tipo de contenido no soportado: {currentClass.type}</p>
                        </div>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando curso...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Si no hay curso después de cargar, mostrar mensaje de error
    if (!loading && !currentCourse) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center p-8">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">Curso no encontrado</h2>
                        <p className="text-gray-600 mb-6">
                            No se pudo cargar la información de este curso.
                        </p>
                        <button
                            onClick={() => navigate('/cursos')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                            Volver a Cursos
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Breadcrumb y navegación */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(`/cursos/${id}`)}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al curso
                </button>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {currentCourse?.title || 'Cargando...'}
                        </h1>
                        {currentClass && (
                            <p className="text-gray-600">
                                Reproduciendo: <span className="font-medium">{currentClass.title}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Área de contenido principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video/Contenido */}
                    <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                        {renderClassContent()}
                    </div>

                    {/* Información de la clase */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {currentClass ? (
                            <>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            {currentClass.title}
                                        </h2>
                                        {currentClass.description && (
                                            <p className="text-gray-600 mb-4 leading-relaxed">
                                                {currentClass.description}
                                            </p>
                                        )}
                                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                                            {currentClass.duration_minutes && (
                                                <span className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    {currentClass.duration_minutes} min
                                                </span>
                                            )}
                                            <span className="flex items-center capitalize">
                                                {currentClass.type === 'video' ? (
                                                    <PlayCircle className="w-4 h-4 mr-2 text-blue-500" />
                                                ) : (
                                                    <FileText className="w-4 h-4 mr-2 text-green-500" />
                                                )}
                                                {currentClass.type || 'Contenido'}
                                            </span>
                                            {completedClasses.includes(currentClass.id) && (
                                                <span className="flex items-center text-green-600">
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Completada
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-6 flex flex-col space-y-3">
                                        {!completedClasses.includes(currentClass.id) && (
                                            <button 
                                                onClick={markClassCompleted}
                                                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                <span>Marcar Completada</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>Selecciona una clase para comenzar</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar con contenido del curso */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
                        <ModuleClasses 
                            courseId={id}
                            currentClassId={currentClass?.id}
                            onClassSelect={handleClassSelect}
                            completedClasses={completedClasses}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CoursePlayerPage;