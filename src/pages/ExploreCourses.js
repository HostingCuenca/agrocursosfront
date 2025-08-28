import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Filter, 
    Clock, 
    Users, 
    BookOpen, 
    Play, 
    ChevronRight,
    User,
    RefreshCw
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { EnrollmentBadge } from '../components/EnrollmentStatus';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import useAuthStore from '../store/authStore';

const ExploreCourses = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    // Estados para datos
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para filtros y búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Estados para datos procesados
    const [categories, setCategories] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [requestingCourses, setRequestingCourses] = useState(new Set());

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, [user]);

    // Filtrar cursos cuando cambian los filtros
    useEffect(() => {
        filterCourses();
    }, [courses, searchQuery, selectedCategory, selectedLevel, priceFilter]);

    // Cargar todos los datos iniciales
    const loadInitialData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Cargar cursos con estado de inscripción incluido
            const coursesResponse = await courseService.getCourses();
            const allCourses = coursesResponse.courses || [];
            setCourses(allCourses);
            
            // Extraer categorías únicas
            const uniqueCategories = [...new Set(allCourses.map(course => course.category).filter(Boolean))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Error al cargar los cursos');
        } finally {
            setLoading(false);
        }
    };

    // Recargar cursos después de una acción
    const reloadCourses = async () => {
        try {
            const coursesResponse = await courseService.getCourses();
            const allCourses = coursesResponse.courses || [];
            setCourses(allCourses);
        } catch (error) {
            console.error('Error reloading courses:', error);
        }
    };

    // Manejar solicitud de inscripción
    const handleRequestEnrollment = async (courseId) => {
        if (requestingCourses.has(courseId)) return;

        setRequestingCourses(prev => new Set([...prev, courseId]));
        
        try {
            const response = await enrollmentService.requestEnrollment(courseId);
            
            if (response.success) {
                // Recargar cursos para obtener el estado actualizado
                await reloadCourses();
                
                // Mostrar notificación de éxito
                alert(response.message || 'Solicitud de inscripción enviada. Esperando aprobación del instructor.');
            }
        } catch (error) {
            console.error('Error requesting enrollment:', error);
            const errorMessage = error.response?.data?.error || 'Error al solicitar inscripción';
            alert(errorMessage);
        } finally {
            setRequestingCourses(prev => {
                const newSet = new Set(prev);
                newSet.delete(courseId);
                return newSet;
            });
        }
    };

    // Filtrar cursos según criterios
    const filterCourses = () => {
        let filtered = [...courses];

        // Filtro por texto
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(course =>
                course.title?.toLowerCase().includes(query) ||
                course.description?.toLowerCase().includes(query) ||
                course.instructor_name?.toLowerCase().includes(query)
            );
        }

        // Filtro por categoría
        if (selectedCategory) {
            filtered = filtered.filter(course => course.category === selectedCategory);
        }

        // Filtro por nivel
        if (selectedLevel) {
            filtered = filtered.filter(course => {
                const courseLevel = (course.level || course.difficulty_level || '').toLowerCase();
                const selectedLevelNorm = selectedLevel.toLowerCase();
                
                return courseLevel === selectedLevelNorm ||
                       (selectedLevelNorm === 'beginner' && courseLevel.includes('básico')) ||
                       (selectedLevelNorm === 'intermediate' && courseLevel.includes('intermedio')) ||
                       (selectedLevelNorm === 'advanced' && courseLevel.includes('avanzado'));
            });
        }

        // Filtro por precio
        if (priceFilter === 'free') {
            filtered = filtered.filter(course => !course.price || parseFloat(course.price) === 0);
        } else if (priceFilter === 'paid') {
            filtered = filtered.filter(course => course.price && parseFloat(course.price) > 0);
        }

        setFilteredCourses(filtered);
    };

    // Manejar cambios de búsqueda
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Limpiar todos los filtros
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedLevel('');
        setPriceFilter('');
    };

    // Recargar datos
    const handleRefresh = () => {
        loadInitialData();
    };

    // Funciones helper para formateo
    const formatPrice = (price) => {
        const numPrice = parseFloat(price || 0);
        if (numPrice === 0) return 'Gratis';
        return `$${numPrice.toLocaleString()}`;
    };

    const formatDuration = (duration) => {
        if (!duration) return '';
        return `${duration}h`;
    };

    const getDifficultyLabel = (difficulty) => {
        if (!difficulty) return '';
        const diff = difficulty.toLowerCase();
        if (diff.includes('beginner') || diff.includes('básico')) return 'Principiante';
        if (diff.includes('intermediate') || diff.includes('intermedio')) return 'Intermedio';  
        if (diff.includes('advanced') || diff.includes('avanzado')) return 'Avanzado';
        return difficulty;
    };

    const getDifficultyStyle = (difficulty) => {
        if (!difficulty) return 'text-gray-600 bg-gray-100';
        const diff = difficulty.toLowerCase();
        if (diff.includes('beginner') || diff.includes('básico')) return 'text-green-600 bg-green-100';
        if (diff.includes('intermediate') || diff.includes('intermedio')) return 'text-yellow-600 bg-yellow-100';
        if (diff.includes('advanced') || diff.includes('avanzado')) return 'text-red-600 bg-red-100';
        return 'text-gray-600 bg-gray-100';
    };

    // Componente de tarjeta de curso mejorado
    const CourseCard = ({ course }) => {
        const isRequesting = requestingCourses.has(course.id);
        const hasValidThumbnail = course.thumbnail && course.thumbnail.trim() && course.thumbnail !== 'null';
        
        // Determinar acción según enrollment_status
        const getActionButton = () => {
            if (user?.role !== 'student') return null;
            
            switch (course.enrollment_status) {
                case 'enrolled':
                    return (
                        <button
                            onClick={() => navigate(`/cursos/${course.id}/learn`)}
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                            <Play className="w-4 h-4" />
                            <span>Continuar</span>
                        </button>
                    );
                case 'pending':
                    return (
                        <div className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>Pendiente</span>
                        </div>
                    );
                case 'not_enrolled':
                default:
                    return (
                        <button
                            onClick={() => handleRequestEnrollment(course.id)}
                            disabled={isRequesting}
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isRequesting ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Solicitando...</span>
                                </>
                            ) : (
                                <>
                                    <BookOpen className="w-4 h-4" />
                                    <span>Solicitar</span>
                                </>
                            )}
                        </button>
                    );
            }
        };
        
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                {/* Imagen del curso */}
                <div className="aspect-video bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center relative">
                    {hasValidThumbnail ? (
                        <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center" style={{display: hasValidThumbnail ? 'none' : 'flex'}}>
                        <BookOpen className="w-12 h-12 text-white opacity-80" />
                    </div>
                    
                    {/* Badge de progreso para cursos inscritos */}
                    {course.enrollment_status === 'enrolled' && course.my_progress && parseFloat(course.my_progress) > 0 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                            {parseFloat(course.my_progress)}%
                        </div>
                    )}
                </div>

                {/* Contenido */}
                <div className="p-4">
                    {/* Meta información */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            {course.category && (
                                <span className="px-2 py-1 text-xs font-medium text-primary-600 bg-primary-100 rounded-full">
                                    {course.category}
                                </span>
                            )}
                            {(course.level || course.difficulty_level) && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    getDifficultyStyle(course.level || course.difficulty_level)
                                }`}>
                                    {getDifficultyLabel(course.level || course.difficulty_level)}
                                </span>
                            )}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {formatPrice(course.price)}
                        </div>
                    </div>

                    {/* Título */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                        {course.title}
                    </h3>

                    {/* Descripción */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                        {course.description}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center mb-3">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 truncate">
                            {course.instructor_name || 'Instructor'}
                        </span>
                    </div>

                    {/* Estadísticas */}
                    <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                        {(course.duration || course.duration_hours) && (
                            <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDuration(course.duration || course.duration_hours)}
                            </span>
                        )}
                        <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {course.enrolled_count || 0}
                        </span>
                        <span className="flex items-center">
                            <Play className="w-3 h-3 mr-1" />
                            {course.modules_count || 0}
                        </span>
                    </div>

                    {/* Badge de estado para estudiantes */}
                    {user?.role === 'student' && course.enrollment_status !== 'not_enrolled' && (
                        <div className="mb-3">
                            <EnrollmentBadge status={course.enrollment_status} />
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2">
                        {/* Botón de acción contextual para estudiantes */}
                        {getActionButton()}
                        
                        {/* Botón ver detalles */}
                        <button
                            onClick={() => navigate(`/cursos/${course.id}`)}
                            className={`${user?.role === 'student' ? 'flex-1' : 'w-full'} flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm`}
                        >
                            <span>Ver detalles</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Estados de carga y error
    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                        <p className="text-gray-600">Cargando cursos...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <div className="text-red-500 text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header con stats */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Explorar Cursos
                        </h1>
                        <p className="text-gray-600">
                            Descubre nuevos cursos y amplía tus conocimientos
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Actualizar</span>
                    </button>
                </div>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar cursos, instructores o temas..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
                                showFilters 
                                    ? 'bg-primary-50 border-primary-200 text-primary-700' 
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filtros</span>
                        </button>
                        
                        {(searchQuery || selectedCategory || selectedLevel || priceFilter) && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* Panel de filtros expandible */}
                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-gray-200 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Filtro por categoría */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoría
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtro por nivel */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nivel
                                </label>
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Todos los niveles</option>
                                    <option value="beginner">Principiante</option>
                                    <option value="intermediate">Intermedio</option>
                                    <option value="advanced">Avanzado</option>
                                </select>
                            </div>

                            {/* Filtro por precio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio
                                </label>
                                <select
                                    value={priceFilter}
                                    onChange={(e) => setPriceFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Todos los precios</option>
                                    <option value="free">Gratis</option>
                                    <option value="paid">De pago</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Resultados y stats */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {searchQuery ? `"${searchQuery}"` : 'Cursos disponibles'}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                            {filteredCourses.length} de {courses.length} cursos
                        </span>
                        {user?.role === 'student' && (
                            <span className="text-primary-600">
                                {courses.filter(c => c.enrollment_status === 'enrolled' || c.enrollment_status === 'pending').length} inscripciones
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid de cursos */}
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-16">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay cursos disponibles
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Aún no se han publicado cursos en la plataforma
                    </p>
                    <button
                        onClick={handleRefresh}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Actualizar
                    </button>
                </div>
            ) : (
                <div className="text-center py-16">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No se encontraron cursos
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchQuery 
                            ? `No hay cursos que coincidan con "${searchQuery}"`
                            : 'Intenta ajustar tus filtros para ver más cursos'
                        }
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Limpiar filtros
                        </button>
                        <button
                            onClick={() => navigate('/mis-cursos')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Ver mis cursos
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ExploreCourses;