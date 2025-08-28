import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Filter, 
    Clock, 
    Users, 
    Star, 
    BookOpen, 
    Play, 
    ChevronRight,
    DollarSign,
    Award,
    User,
    CheckCircle
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import useCourseStore from '../store/courseStore';
import useAuthStore from '../store/authStore';
import { enrollmentService } from '../services/enrollmentService';

const ExploreCourses = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { courses, loading, getAllCourses, searchCourses } = useCourseStore();
    
    // Estados para filtros y búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Estados para datos
    const [categories, setCategories] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [enrollingCourses, setEnrollingCourses] = useState(new Set());
    const [enrolledCourses, setEnrolledCourses] = useState(new Set());

    // Cargar cursos al montar el componente
    useEffect(() => {
        loadAllCourses();
    }, []);

    // Filtrar cursos cuando cambian los filtros
    useEffect(() => {
        filterCourses();
    }, [courses, searchQuery, selectedCategory, selectedLevel, priceFilter]);

    const loadAllCourses = async () => {
        try {
            await getAllCourses();
            
            // Extraer categorías únicas de los cursos
            const uniqueCategories = [...new Set(courses.map(course => course.category).filter(Boolean))];
            setCategories(uniqueCategories);
            
            // Cargar inscripciones del usuario si es estudiante
            if (user?.id && user?.role === 'student') {
                await loadUserEnrollments();
            }
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    };

    const loadUserEnrollments = async () => {
        try {
            const response = await enrollmentService.getStudentEnrollments(user.id);
            if (response.success && response.enrollments) {
                const enrolledCourseIds = new Set(
                    response.enrollments.map(enrollment => enrollment.course_id)
                );
                setEnrolledCourses(enrolledCourseIds);
            }
        } catch (error) {
            console.error('Error loading user enrollments:', error);
        }
    };

    const handleEnrollInCourse = async (courseId) => {
        if (enrollingCourses.has(courseId)) return;

        setEnrollingCourses(prev => new Set([...prev, courseId]));
        
        try {
            const response = await enrollmentService.enrollInCourse(courseId);
            
            if (response.success) {
                setEnrolledCourses(prev => new Set([...prev, courseId]));
                // Mostrar mensaje de éxito
                alert('¡Te has inscrito exitosamente en el curso!');
            } else {
                alert('Error al inscribirse en el curso. Intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error enrolling in course:', error);
            alert('Error al inscribirse en el curso. Intenta de nuevo.');
        } finally {
            setEnrollingCourses(prev => {
                const newSet = new Set(prev);
                newSet.delete(courseId);
                return newSet;
            });
        }
    };

    const filterCourses = () => {
        let filtered = [...courses];

        // Filtro por búsqueda de texto
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

        // Filtro por nivel (maneja tanto level como difficulty_level)
        if (selectedLevel) {
            filtered = filtered.filter(course => {
                const courseLevel = course.level || course.difficulty_level;
                if (!courseLevel) return false;
                
                // Normalizar los valores para comparación
                const normalizedCourseLevel = courseLevel.toLowerCase();
                const normalizedSelectedLevel = selectedLevel.toLowerCase();
                
                return normalizedCourseLevel === normalizedSelectedLevel ||
                       (normalizedSelectedLevel === 'beginner' && (normalizedCourseLevel === 'básico' || normalizedCourseLevel === 'beginner')) ||
                       (normalizedSelectedLevel === 'intermediate' && (normalizedCourseLevel === 'intermedio' || normalizedCourseLevel === 'intermediate')) ||
                       (normalizedSelectedLevel === 'advanced' && (normalizedCourseLevel === 'avanzado' || normalizedCourseLevel === 'advanced'));
            });
        }

        // Filtro por precio
        if (priceFilter === 'free') {
            filtered = filtered.filter(course => !course.price || course.price === 0);
        } else if (priceFilter === 'paid') {
            filtered = filtered.filter(course => course.price && course.price > 0);
        }

        setFilteredCourses(filtered);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedLevel('');
        setPriceFilter('');
    };

    const formatPrice = (price) => {
        if (!price || price === 0) return 'Gratis';
        return `$${price.toLocaleString()}`;
    };

    const formatDuration = (duration) => {
        if (!duration) return '';
        return `${duration} horas`;
    };

    const getDifficultyLabel = (difficulty) => {
        if (!difficulty) return '';
        const diff = difficulty.toLowerCase();
        if (diff === 'beginner' || diff === 'básico') return 'Principiante';
        if (diff === 'intermediate' || diff === 'intermedio') return 'Intermedio';  
        if (diff === 'advanced' || diff === 'avanzado') return 'Avanzado';
        return difficulty;
    };

    const getDifficultyStyle = (difficulty) => {
        if (!difficulty) return '';
        const diff = difficulty.toLowerCase();
        if (diff === 'beginner' || diff === 'básico') return 'text-green-600 bg-green-100';
        if (diff === 'intermediate' || diff === 'intermedio') return 'text-yellow-600 bg-yellow-100';
        if (diff === 'advanced' || diff === 'avanzado') return 'text-red-600 bg-red-100';
        return 'text-gray-600 bg-gray-100';
    };

    const CourseCard = ({ course }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Imagen del curso */}
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                {course.image_url ? (
                    <img 
                        src={course.image_url} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <BookOpen className="w-12 h-12 text-white opacity-80" />
                )}
            </div>

            {/* Contenido de la tarjeta */}
            <div className="p-6">
                {/* Categoría y nivel */}
                <div className="flex items-center justify-between mb-2">
                    {course.category && (
                        <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                            {course.category}
                        </span>
                    )}
                    {(course.level || course.difficulty_level) && (
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            getDifficultyStyle(course.level || course.difficulty_level)
                        }`}>
                            {getDifficultyLabel(course.level || course.difficulty_level)}
                        </span>
                    )}
                </div>

                {/* Título */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                </h3>

                {/* Descripción */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center mb-4">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                        {course.instructor_name || 'Instructor'}
                    </span>
                </div>

                {/* Estadísticas */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                        {(course.duration || course.duration_hours) && (
                            <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatDuration(course.duration || course.duration_hours)}
                            </span>
                        )}
                        <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {course.enrolled_count || 0}
                        </span>
                        <span className="flex items-center">
                            <Play className="w-4 h-4 mr-1" />
                            {course.modules_count || 0} módulos
                        </span>
                    </div>
                </div>

                {/* Precio y acción */}
                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">
                        {formatPrice(course.price)}
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Botón de inscripción solo para estudiantes */}
                        {user?.role === 'student' && (
                            <>
                                {enrolledCourses.has(course.id) ? (
                                    <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">Inscrito</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleEnrollInCourse(course.id)}
                                        disabled={enrollingCourses.has(course.id)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {enrollingCourses.has(course.id) ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span className="text-sm">Inscribiendo...</span>
                                            </>
                                        ) : (
                                            <>
                                                <BookOpen className="w-4 h-4" />
                                                <span className="text-sm">Inscribirse</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                        
                        {/* Botón ver curso */}
                        <button
                            onClick={() => navigate(`/cursos/${course.id}`)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <span>Ver curso</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando cursos...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Explorar Cursos
                </h1>
                <p className="text-gray-600">
                    Descubre nuevos cursos y amplía tus conocimientos en agricultura y desarrollo agropecuario
                </p>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Botón de filtros */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="w-5 h-5" />
                        <span>Filtros</span>
                    </button>
                </div>

                {/* Panel de filtros expandible */}
                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {/* Filtro por categoría */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoría
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos los precios</option>
                                    <option value="free">Gratis</option>
                                    <option value="paid">De pago</option>
                                </select>
                            </div>

                            {/* Botón limpiar filtros */}
                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Resultados */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos los cursos'}
                    </h2>
                    <span className="text-gray-600">
                        {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Grid de cursos */}
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No se encontraron cursos
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Intenta ajustar tus filtros o buscar otros términos
                    </p>
                    <button
                        onClick={clearFilters}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Ver todos los cursos
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ExploreCourses;