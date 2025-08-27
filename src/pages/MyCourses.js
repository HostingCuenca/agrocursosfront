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
import useAuthStore from '../store/authStore';

const MyCourses = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, completed
    const [searchTerm, setSearchTerm] = useState('');

    // Simular carga de cursos del estudiante
    useEffect(() => {
        const loadMyCourses = async () => {
            try {
                setLoading(true);
                
                // TODO: Implementar llamada real a la API
                // Simulando datos por ahora
                setTimeout(() => {
                    const mockCourses = [
                        {
                            id: '6da30409-f5f3-4687-a737-05ba38ce6c80',
                            title: 'Curso de Agricultura Moderna',
                            description: 'Curso completo sobre técnicas modernas de agricultura',
                            thumbnail: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
                            instructor_name: 'Test Instructor',
                            progress_percentage: 15,
                            total_modules: 2,
                            completed_modules: 0,
                            total_classes: 3,
                            completed_classes: 1,
                            estimated_duration: '4h 30min',
                            enrollment_date: '2025-08-27',
                            last_accessed: '2025-08-27',
                            status: 'active',
                            next_class: {
                                id: 'next-class-1',
                                title: 'Preparación del Suelo',
                                duration: '25min'
                            }
                        },
                        {
                            id: 'course-2',
                            title: 'Agricultura Orgánica Básica',
                            description: 'Aprende los fundamentos de la agricultura orgánica desde cero',
                            thumbnail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
                            instructor_name: 'Carlos Mendez',
                            progress_percentage: 75,
                            total_modules: 3,
                            completed_modules: 2,
                            total_classes: 8,
                            completed_classes: 6,
                            estimated_duration: '6h 15min',
                            enrollment_date: '2025-08-20',
                            last_accessed: '2025-08-26',
                            status: 'active',
                            next_class: {
                                id: 'next-class-2',
                                title: 'Certificación Orgánica',
                                duration: '35min'
                            }
                        },
                        {
                            id: 'course-3',
                            title: 'Fundamentos de Compostaje',
                            description: 'Técnicas avanzadas de compostaje y fertilización natural',
                            thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
                            instructor_name: 'María González',
                            progress_percentage: 100,
                            total_modules: 2,
                            completed_modules: 2,
                            total_classes: 5,
                            completed_classes: 5,
                            estimated_duration: '3h 45min',
                            enrollment_date: '2025-08-10',
                            last_accessed: '2025-08-25',
                            status: 'completed',
                            completion_date: '2025-08-25',
                            final_grade: 95
                        }
                    ];
                    setCourses(mockCourses);
                    setLoading(false);
                }, 1000);
                
            } catch (error) {
                console.error('Error loading my courses:', error);
                setLoading(false);
            }
        };

        loadMyCourses();
    }, []);

    // Filtrar cursos
    const filteredCourses = courses.filter(course => {
        const matchesFilter = filter === 'all' || course.status === filter;
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Estadísticas generales
    const stats = {
        total: courses.length,
        active: courses.filter(c => c.status === 'active').length,
        completed: courses.filter(c => c.status === 'completed').length,
        totalHours: courses.reduce((acc, course) => {
            const hours = parseFloat(course.estimated_duration.split('h')[0] || 0);
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Cursos</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Completados</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Horas Totales</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalHours}h</p>
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
                                    onClick={() => setFilter('active')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        filter === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    En Progreso ({stats.active})
                                </button>
                                <button
                                    onClick={() => setFilter('completed')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        filter === 'completed'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Completados ({stats.completed})
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

                {/* Lista de cursos */}
                <div className="space-y-6">
                    {filteredCourses.length === 0 ? (
                        <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cursos</h3>
                            <p className="text-gray-600 mb-6">
                                {filter === 'all' 
                                    ? 'Aún no te has inscrito en ningún curso'
                                    : `No tienes cursos ${filter === 'active' ? 'en progreso' : 'completados'}`
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
                        filteredCourses.map((course) => (
                            <div key={course.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row">
                                    {/* Thumbnail */}
                                    <div className="md:w-64 h-48 md:h-auto bg-gray-200 rounded-t-lg md:rounded-l-lg md:rounded-t-none overflow-hidden">
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1 p-6">
                                        <div className="flex flex-col h-full">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                        {course.title}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        course.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {course.status === 'completed' ? 'Completado' : 'En Progreso'}
                                                    </span>
                                                </div>

                                                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                                    <span>Instructor: {course.instructor_name}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {course.estimated_duration}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{course.total_modules} módulos</span>
                                                </div>

                                                {/* Progreso */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Progreso: {course.progress_percentage}%
                                                        </span>
                                                        {course.status === 'completed' && course.final_grade && (
                                                            <div className="flex items-center">
                                                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {course.final_grade}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.progress_percentage)}`}
                                                            style={{ width: `${course.progress_percentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                        <span>{course.completed_classes} de {course.total_classes} clases</span>
                                                        {course.next_class && course.status === 'active' && (
                                                            <span>Siguiente: {course.next_class.title}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Botones de acción */}
                                            <div className="flex items-center space-x-3">
                                                {course.status === 'active' ? (
                                                    <button
                                                        onClick={() => handleContinueLearning(course.id)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                                    >
                                                        <PlayCircle className="w-4 h-4" />
                                                        <span>Continuar</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleViewCourse(course.id)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Ver Certificado</span>
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleViewCourse(course.id)}
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