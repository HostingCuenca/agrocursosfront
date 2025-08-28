import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    BookOpen, 
    Clock, 
    PlayCircle, 
    CheckCircle, 
    TrendingUp,
    Calendar,
    Search,
    Filter,
    Star
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import EnrollmentStatus from '../components/EnrollmentStatus';
import { enrollmentService } from '../services/enrollmentService';
import useAuthStore from '../store/authStore';

const MyCourses = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, enrolled, pending, rejected, completed
    const [searchTerm, setSearchTerm] = useState('');

    // Cargar inscripciones del estudiante
    useEffect(() => {
        const loadMyEnrollments = async () => {
            if (!user?.id) return;
            
            try {
                setLoading(true);
                const response = await enrollmentService.getStudentEnrollments(user.id);
                setEnrollments(response.enrollments || []);
            } catch (error) {
                console.error('Error loading my enrollments:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMyEnrollments();
    }, [user]);

    // Filtrar inscripciones
    const filteredEnrollments = enrollments.filter(enrollment => {
        const matchesFilter = filter === 'all' || 
                            (filter === 'active' && enrollment.status === 'enrolled') ||
                            enrollment.status === filter;
        const matchesSearch = enrollment.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            enrollment.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Estadísticas generales
    const stats = {
        total: enrollments.length,
        enrolled: enrollments.filter(e => e.status === 'enrolled').length,
        pending: enrollments.filter(e => e.status === 'pending').length,
        rejected: enrollments.filter(e => e.status === 'rejected').length,
        completed: enrollments.filter(e => e.status === 'completed').length,
        totalHours: enrollments.reduce((acc, enrollment) => {
            const hours = parseFloat(enrollment.course_duration || 0);
            return acc + hours;
        }, 0)
    };

    const getProgressColor = (progress) => {
        if (progress < 30) return 'bg-red-500';
        if (progress < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const handleContinueLearning = (courseId) => {
        navigate(`/cursos/${courseId}/learn`);
    };

    const handleViewCourse = (courseId) => {
        navigate(`/cursos/${courseId}`);
    };

    const canAccessCourse = (status) => {
        return status === 'enrolled' || status === 'completed';
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
                    <p className="text-gray-600">Gestiona tu progreso de aprendizaje y continúa estudiando</p>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Total</p>
                                <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Inscritos</p>
                                <p className="text-xl font-semibold text-gray-900">{stats.enrolled}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                                <p className="text-xl font-semibold text-gray-900">{stats.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Rechazados</p>
                                <p className="text-xl font-semibold text-gray-900">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Star className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Completados</p>
                                <p className="text-xl font-semibold text-gray-900">{stats.completed}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        filter === 'all'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Todos ({stats.total})
                                </button>
                                <button
                                    onClick={() => setFilter('enrolled')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        filter === 'enrolled'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Inscritos ({stats.enrolled})
                                </button>
                                <button
                                    onClick={() => setFilter('pending')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        filter === 'pending'
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Pendientes ({stats.pending})
                                </button>
                                <button
                                    onClick={() => setFilter('rejected')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        filter === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Rechazados ({stats.rejected})
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar cursos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Lista de inscripciones */}
                <div className="space-y-6">
                    {filteredEnrollments.length === 0 ? (
                        <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes inscripciones</h3>
                            <p className="text-gray-600 mb-6">
                                {filter === 'all' 
                                    ? 'Aún no te has inscrito en ningún curso'
                                    : `No tienes inscripciones con estado "${filter}"`
                                }
                            </p>
                            <Link
                                to="/explorar"
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg inline-flex items-center"
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Explorar Cursos
                            </Link>
                        </div>
                    ) : (
                        filteredEnrollments.map((enrollment) => (
                            <div key={enrollment.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row">
                                    {/* Thumbnail */}
                                    <div className="md:w-64 h-48 md:h-auto bg-gray-200 rounded-t-lg md:rounded-l-lg md:rounded-t-none overflow-hidden">
                                        <img
                                            src={enrollment.course_thumbnail || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop'}
                                            alt={enrollment.course_title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1 p-6">
                                        <div className="flex flex-col h-full">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                        {enrollment.course_title}
                                                    </h3>
                                                    <EnrollmentStatus 
                                                        status={enrollment.status}
                                                        metadata={enrollment.metadata}
                                                        size="sm"
                                                        showReason={false}
                                                    />
                                                </div>

                                                <p className="text-gray-600 mb-4 line-clamp-2">{enrollment.course_description}</p>

                                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                                    <span>Instructor: {enrollment.instructor_name}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {enrollment.course_duration || 0}h
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* Progreso solo para cursos inscritos o completados */}
                                                {canAccessCourse(enrollment.status) && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                Progreso: {parseFloat(enrollment.progress_percentage || 0)}%
                                                            </span>
                                                            {enrollment.status === 'completed' && enrollment.final_grade && (
                                                                <div className="flex items-center">
                                                                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                                                    <span className="text-sm font-medium text-gray-700">
                                                                        {enrollment.final_grade}%
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(parseFloat(enrollment.progress_percentage || 0))}`}
                                                                style={{ width: `${parseFloat(enrollment.progress_percentage || 0)}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                            <span>{enrollment.completed_classes || 0} de {enrollment.total_classes_started || 0} clases iniciadas</span>
                                                            {enrollment.status === 'enrolled' && parseFloat(enrollment.progress_percentage || 0) < 100 && (
                                                                <span>En progreso</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Mostrar razón de rechazo si aplica */}
                                                {enrollment.status === 'rejected' && enrollment.metadata?.rejection_reason && (
                                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <p className="text-sm text-red-800">
                                                            <strong>Razón del rechazo:</strong> {enrollment.metadata.rejection_reason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Botones de acción */}
                                            <div className="flex items-center space-x-3">
                                                {enrollment.status === 'enrolled' ? (
                                                    <button
                                                        onClick={() => handleContinueLearning(enrollment.course_id)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                                    >
                                                        <PlayCircle className="w-4 h-4" />
                                                        <span>Continuar Aprendiendo</span>
                                                    </button>
                                                ) : enrollment.status === 'completed' ? (
                                                    <button
                                                        onClick={() => handleViewCourse(enrollment.course_id)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Ver Certificado</span>
                                                    </button>
                                                ) : enrollment.status === 'pending' ? (
                                                    <div className="text-sm text-orange-600 flex items-center">
                                                        <Clock className="w-4 h-4 mr-2" />
                                                        <span>Esperando aprobación del instructor</span>
                                                    </div>
                                                ) : enrollment.status === 'rejected' ? (
                                                    <button
                                                        onClick={() => handleViewCourse(enrollment.course_id)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                                    >
                                                        <BookOpen className="w-4 h-4" />
                                                        <span>Volver a Solicitar</span>
                                                    </button>
                                                ) : null}

                                                <button
                                                    onClick={() => handleViewCourse(enrollment.course_id)}
                                                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    Ver Detalles
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MyCourses;