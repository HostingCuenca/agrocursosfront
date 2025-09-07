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
import CourseContentManagement from '../components/content/CourseContentManagement';
import EnrollmentStatus from '../components/EnrollmentStatus';
import { enrollmentService } from '../services/enrollmentService';
import { courseService } from '../services/courseService';
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
        clearCurrentCourse,
        clearError
    } = useCourseStore();

    const [enrolling, setEnrolling] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [userEnrollment, setUserEnrollment] = useState(null);
    const [loadingEnrollment, setLoadingEnrollment] = useState(false);
    const [activeTab, setActiveTab] = useState('content'); // 'content' or 'manage'

    useEffect(() => {
        if (id) {
            getCourseById(id);
            loadUserEnrollment();
        }
        
        return () => {
            clearCurrentCourse();
        };
    }, [id, getCourseById, clearCurrentCourse]);

    // Cargar estado de inscripción del usuario
    const loadUserEnrollment = async () => {
        if (!user?.id || !id) return;
        
        setLoadingEnrollment(true);
        try {
            const response = await enrollmentService.getStudentEnrollments(user.id);
            const enrollment = response.enrollments?.find(e => e.course_id === id);
            setUserEnrollment(enrollment || null);
        } catch (error) {
            console.error('Error loading user enrollment:', error);
            setUserEnrollment(null);
        } finally {
            setLoadingEnrollment(false);
        }
    };

    const canManageThisCourse = currentCourse && permissions.courses.canEdit(currentCourse.instructor_id);

    const handleRequestEnrollment = async () => {
        if (!permissions.courses.canEnroll) {
            alert('No tienes permisos para inscribirte en cursos');
            return;
        }

        setEnrolling(true);
        try {
            const response = await enrollmentService.requestEnrollment(currentCourse.id);
            
            if (response.success) {
                alert(response.message || 'Solicitud de inscripción enviada. Esperando aprobación del instructor.');
                setShowEnrollModal(false);
                
                // Recargar el estado de inscripción
                await loadUserEnrollment();
            }
        } catch (error) {
            console.error('Error al solicitar inscripción:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error al solicitar inscripción';
            alert(errorMessage);
        } finally {
            setEnrolling(false);
        }
    };

    const canAccessCourse = () => {
        return userEnrollment?.status === 'enrolled' || userEnrollment?.status === 'completed';
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
                        onClick={() => navigate('/explorar')}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg"
                    >
                        Volver a Explorar
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
                        onClick={() => navigate('/explorar')}
                        className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a explorar
                    </button>

                    {canManageThisCourse && (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setActiveTab('manage')}
                                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                                    activeTab === 'manage'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                            >
                                <Settings className="w-4 h-4" />
                                <span>Gestionar Contenido</span>
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
                                {userEnrollment && (
                                    <EnrollmentStatus 
                                        status={userEnrollment.status}
                                        metadata={userEnrollment.metadata}
                                        size="sm"
                                        showReason={false}
                                    />
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
                            {canAccessCourse() && userEnrollment?.progress_percentage !== undefined && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-700">Tu progreso</span>
                                        <span className="text-sm text-gray-600">{parseFloat(userEnrollment.progress_percentage || 0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${parseFloat(userEnrollment.progress_percentage || 0)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>Inscrito: {new Date(userEnrollment.enrollment_date).toLocaleDateString()}</span>
                                        <span>{userEnrollment.completed_classes || 0} clases completadas</span>
                                    </div>
                                </div>
                            )}

                            {/* Mostrar razón de rechazo si aplica */}
                            {userEnrollment?.status === 'rejected' && userEnrollment?.metadata?.rejection_reason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <h4 className="font-medium text-red-800 mb-2">Solicitud rechazada</h4>
                                    <p className="text-sm text-red-700">
                                        <strong>Razón:</strong> {userEnrollment.metadata.rejection_reason}
                                    </p>
                                    <p className="text-xs text-red-600 mt-2">
                                        Puedes solicitar inscripción nuevamente si lo deseas.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Tabs para contenido */}
                        {canManageThisCourse && (
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('content')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'content'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        📖 Vista del Curso
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('manage')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'manage'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        ⚙️ Gestionar Contenido
                                    </button>
                                </nav>
                            </div>
                        )}

                        {/* Contenido según tab activa */}
                        {activeTab === 'content' ? (
                            <CourseContent 
                                courseId={id} 
                                isEnrolled={canAccessCourse()}
                            />
                        ) : activeTab === 'manage' && canManageThisCourse ? (
                            <CourseContentManagement 
                                course={currentCourse}
                                onContentUpdate={() => {
                                    // Recargar el curso para actualizar estadísticas
                                    getCourseById(id);
                                }}
                            />
                        ) : null}

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
                            {loadingEnrollment ? (
                                <div className="w-full py-3 px-4 rounded-lg bg-gray-100 text-center mb-4">
                                    <span className="text-gray-600">Cargando estado...</span>
                                </div>
                            ) : !userEnrollment && permissions.courses.canEnroll ? (
                                <button
                                    onClick={() => setShowEnrollModal(true)}
                                    disabled={enrolling}
                                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium mb-4"
                                >
                                    {enrolling ? 'Enviando solicitud...' : 'Solicitar Inscripción'}
                                </button>
                            ) : userEnrollment?.status === 'pending' ? (
                                <div className="w-full py-3 px-4 rounded-lg bg-orange-100 text-center mb-4">
                                    <span className="text-orange-800 font-medium">Esperando aprobación</span>
                                    <p className="text-xs text-orange-600 mt-1">
                                        El instructor revisará tu solicitud pronto
                                    </p>
                                </div>
                            ) : userEnrollment?.status === 'enrolled' ? (
                                <button
                                    onClick={() => navigate(`/cursos/${id}/learn`)}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium mb-4"
                                >
                                    Continuar Aprendiendo
                                </button>
                            ) : userEnrollment?.status === 'completed' ? (
                                <button
                                    onClick={() => navigate(`/cursos/${id}/certificate`)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium mb-4"
                                >
                                    Ver Certificado
                                </button>
                            ) : userEnrollment?.status === 'rejected' ? (
                                <button
                                    onClick={() => setShowEnrollModal(true)}
                                    disabled={enrolling}
                                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium mb-4"
                                >
                                    {enrolling ? 'Enviando solicitud...' : 'Volver a Solicitar'}
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
                                ¿Estás seguro de que quieres solicitar inscripción en el curso "{currentCourse.title}"?
                                <span className="block mt-2 text-sm text-orange-600">
                                    Tu solicitud será enviada al instructor para su aprobación.
                                </span>
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
                                    onClick={handleRequestEnrollment}
                                    disabled={enrolling}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg"
                                >
                                    {enrolling ? 'Enviando...' : 'Solicitar Inscripción'}
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