import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Clock, 
    Users, 
    BookOpen, 
    Star, 
    DollarSign, 
    Calendar,
    CheckCircle,
    PlayCircle,
    FileText,
    User,
    ArrowLeft,
    Settings
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import CourseContent from '../components/modules/CourseContent';
import useCourseStore from '../store/courseStore';
import useRolePermissions from '../hooks/useRolePermissions';
import useAuthStore from '../store/authStore';

const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const permissions = useRolePermissions();
    
    const {
        currentCourse,
        loading,
        error,
        getCourseById,
        enrollInCourse,
        clearCurrentCourse,
        clearError
    } = useCourseStore();

    const [enrolling, setEnrolling] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);

    useEffect(() => {
        if (id) {
            getCourseById(id);
        }
        
        return () => {
            clearCurrentCourse();
        };
    }, [id, getCourseById, clearCurrentCourse]);

    const canManageThisCourse = currentCourse && permissions.courses.canEdit(currentCourse.instructor_id);

    const handleEnroll = async () => {
        if (!permissions.courses.canEnroll) {
            alert('No tienes permisos para inscribirte en cursos');
            return;
        }

        setEnrolling(true);
        try {
            const coursePrice = parseFloat(currentCourse.price) || 0;
            await enrollInCourse(currentCourse.id, {
                payment_status: coursePrice === 0 ? 'free' : 'pending',
                payment_amount: coursePrice
            });
            
            alert('¡Te has inscrito exitosamente en el curso!');
            setShowEnrollModal(false);
            
            // Recargar el curso para mostrar el estado actualizado
            getCourseById(id);
        } catch (error) {
            console.error('Error al inscribirse:', error);
            alert(error.response?.data?.message || 'Error al inscribirse en el curso');
        } finally {
            setEnrolling(false);
        }
    };

    const getDifficultyColor = (level) => {
        switch (level) {
            case 'beginner':
                return 'bg-green-100 text-green-800';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-800';
            case 'advanced':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifficultyText = (level) => {
        switch (level) {
            case 'beginner':
                return 'Principiante';
            case 'intermediate':
                return 'Intermedio';
            case 'advanced':
                return 'Avanzado';
            default:
                return level;
        }
    };

    const formatPrice = (price) => {
        // Manejar casos donde price no es un número válido
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice === 0) return 'Gratis';
        return `$${numPrice.toFixed(2)}`;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !currentCourse) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Error al cargar el curso
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {error || 'El curso no existe o no tienes permisos para verlo'}
                    </p>
                    <button
                        onClick={() => navigate('/cursos')}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg"
                    >
                        Volver a Cursos
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Navegación superior */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/cursos')}
                        className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a cursos
                    </button>

                    {canManageThisCourse && (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => navigate(`/cursos/${id}/edit`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Gestionar Curso</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contenido principal */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header del curso */}
                        <div>
                            {/* Imagen del curso */}
                            {currentCourse.thumbnail_url && (
                                <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden mb-6">
                                    <img
                                        src={currentCourse.thumbnail_url}
                                        alt={currentCourse.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Metadatos */}
                            <div className="flex flex-wrap gap-3 mb-4">
                                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {currentCourse.category}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentCourse.difficulty_level)}`}>
                                    {getDifficultyText(currentCourse.difficulty_level)}
                                </span>
                                {currentCourse.enrollment_status && (
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        currentCourse.enrollment_status === 'active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : currentCourse.enrollment_status === 'completed'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {currentCourse.enrollment_status === 'active' && 'Inscrito'}
                                        {currentCourse.enrollment_status === 'completed' && 'Completado'}
                                        {currentCourse.enrollment_status === 'pending' && 'Pendiente'}
                                    </span>
                                )}
                            </div>

                            {/* Título y descripción */}
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {currentCourse.title}
                            </h1>
                            
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                {currentCourse.description}
                            </p>

                            {/* Instructor */}
                            {currentCourse.instructor_name && (
                                <div className="flex items-center mb-6">
                                    <User className="w-5 h-5 text-gray-400 mr-2" />
                                    <span className="text-gray-700">
                                        Instructor: <strong>{currentCourse.instructor_name}</strong>
                                    </span>
                                </div>
                            )}

                            {/* Progreso si está inscrito */}
                            {currentCourse.progress_percentage !== undefined && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-700">Tu progreso</span>
                                        <span className="text-sm text-gray-600">{currentCourse.progress_percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${currentCourse.progress_percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Contenido del curso */}
                        <CourseContent 
                            courseId={id} 
                            isEnrolled={!!currentCourse.enrollment_status}
                        />

                        {/* Descripción detallada */}
                        {currentCourse.detailed_description && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Acerca de este curso</h2>
                                <div className="prose max-w-none text-gray-600">
                                    <p>{currentCourse.detailed_description}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Tarjeta de inscripción/precio */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
                            <div className="text-center mb-6">
                                <div className="text-3xl font-bold text-gray-900 mb-2">
                                    {formatPrice(currentCourse.price || 0)}
                                </div>
                                {(currentCourse.price && currentCourse.price > 0) && (
                                    <p className="text-sm text-gray-500">Pago único</p>
                                )}
                            </div>

                            {/* Botón de acción principal */}
                            {!currentCourse.enrollment_status && permissions.courses.canEnroll ? (
                                <button
                                    onClick={() => setShowEnrollModal(true)}
                                    disabled={enrolling}
                                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium mb-4"
                                >
                                    {enrolling ? 'Inscribiendo...' : 'Inscribirse Ahora'}
                                </button>
                            ) : currentCourse.enrollment_status === 'active' ? (
                                <button
                                    onClick={() => navigate(`/cursos/${id}/learn`)}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium mb-4"
                                >
                                    Continuar Aprendiendo
                                </button>
                            ) : currentCourse.enrollment_status === 'completed' ? (
                                <button
                                    onClick={() => navigate(`/cursos/${id}/certificate`)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium mb-4"
                                >
                                    Ver Certificado
                                </button>
                            ) : null}

                            {/* Información del curso */}
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-600">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span>Duración</span>
                                    </div>
                                    <span className="font-medium">{currentCourse.duration_hours || 0}h</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-600">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span>Estudiantes</span>
                                    </div>
                                    <span className="font-medium">{currentCourse.enrolled_count || 0}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-600">
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        <span>Módulos</span>
                                    </div>
                                    <span className="font-medium">{currentCourse.modules_count || 0}</span>
                                </div>
                                
                                {currentCourse.rating && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-600">
                                            <Star className="w-4 h-4 mr-2" />
                                            <span>Valoración</span>
                                        </div>
                                        <span className="font-medium">{currentCourse.rating}/5</span>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Creado</span>
                                    </div>
                                    <span className="font-medium">
                                        {new Date(currentCourse.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Lo que aprenderás</h3>
                            {currentCourse.learning_objectives && currentCourse.learning_objectives.length > 0 ? (
                                <ul className="space-y-2 text-sm text-gray-600">
                                    {currentCourse.learning_objectives.map((objective, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <span>{objective}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    Los objetivos de aprendizaje se actualizarán pronto.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal de confirmación de inscripción */}
                {showEnrollModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold mb-4">Confirmar Inscripción</h3>
                            <p className="text-gray-600 mb-6">
                                ¿Estás seguro de que quieres inscribirte en el curso "{currentCourse.title}"?
                                {(currentCourse.price && currentCourse.price > 0) && (
                                    <span className="block mt-2 font-medium">
                                        Costo: {formatPrice(currentCourse.price || 0)}
                                    </span>
                                )}
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowEnrollModal(false)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg"
                                >
                                    {enrolling ? 'Inscribiendo...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CourseDetailPage;