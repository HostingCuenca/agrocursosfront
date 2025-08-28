import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Settings, Users, BookOpen } from 'lucide-react';
import CourseModal from './CourseModal';
import useCourseStore from '../../store/courseStore';
import useAuthStore from '../../store/authStore';

const CourseManager = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [loading, setLoading] = useState(false);

    const { user } = useAuthStore();
    const { 
        courses, 
        loading: coursesLoading, 
        error,
        getCourses,
        createCourse, 
        updateCourse, 
        deleteCourse,
        clearError
    } = useCourseStore();

    // Cargar cursos al montar el componente
    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            await getCourses();
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    };

    const handleCreateCourse = () => {
        setSelectedCourse(null);
        setShowModal(true);
    };

    const handleEditCourse = (course) => {
        setSelectedCourse(course);
        setShowModal(true);
    };

    const handleSaveCourse = async (courseData) => {
        setLoading(true);
        try {
            if (selectedCourse) {
                // Actualizar curso existente
                await updateCourse(selectedCourse.id, courseData);
            } else {
                // Crear nuevo curso
                await createCourse(courseData);
            }
            setShowModal(false);
            setSelectedCourse(null);
            // Recargar cursos para ver los cambios
            await loadCourses();
        } catch (error) {
            console.error('Error saving course:', error);
            // El error se maneja en el store y se muestra en la UI
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (courseId, courseName) => {
        if (window.confirm(`¿Estás seguro que deseas eliminar el curso "${courseName}"?`)) {
            try {
                await deleteCourse(courseId);
                await loadCourses(); // Recargar lista
            } catch (error) {
                console.error('Error deleting course:', error);
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCourse(null);
    };

    // Filtrar cursos según búsqueda y categoría
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            course.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || course.category === filterCategory;
        
        // Si es instructor, solo mostrar sus cursos
        if (user?.role === 'instructor') {
            return matchesSearch && matchesCategory && course.instructor_id === user.id;
        }
        
        return matchesSearch && matchesCategory;
    });

    const categories = {
        'agriculture': 'Agricultura',
        'livestock': 'Ganadería',
        'horticulture': 'Horticultura',
        'agroecology': 'Agroecología',
        'technology': 'Tecnología',
        'marketing': 'Comercialización',
        'sustainability': 'Sostenibilidad'
    };

    if (coursesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando cursos...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Cursos</h1>
                    <p className="text-gray-600">
                        {user?.role === 'instructor' ? 'Administra tus cursos' : 'Administra todos los cursos'}
                    </p>
                </div>
                <button
                    onClick={handleCreateCourse}
                    className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Crear Curso</span>
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={clearError}
                        className="text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar cursos por título o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                    </div>
                    
                    {/* Category Filter */}
                    <div className="md:w-64">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        >
                            <option value="">Todas las categorías</option>
                            {Object.entries(categories).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>
                            {searchTerm || filterCategory 
                                ? 'No se encontraron cursos con los filtros seleccionados'
                                : 'No hay cursos creados aún'
                            }
                        </p>
                        {!searchTerm && !filterCategory && (
                            <button
                                onClick={handleCreateCourse}
                                className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
                            >
                                Crear tu primer curso
                            </button>
                        )}
                    </div>
                ) : (
                    filteredCourses.map((course) => (
                        <div key={course.id} className="bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            {/* Course Image */}
                            <div className="h-48 bg-gray-200 relative">
                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <BookOpen className="w-16 h-16" />
                                    </div>
                                )}
                                
                                {/* Status Badge */}
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        course.is_published 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {course.is_published ? 'Publicado' : 'Borrador'}
                                    </span>
                                </div>
                            </div>

                            {/* Course Info */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                        {course.title}
                                    </h3>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {course.description}
                                </p>

                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <span>{categories[course.category] || course.category}</span>
                                    <span>{course.difficulty_level}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm mb-4">
                                    <span className="font-semibold text-yellow-600">
                                        {course.price && parseFloat(course.price) > 0 
                                            ? `${course.currency || 'USD'} ${parseFloat(course.price).toFixed(2)}`
                                            : 'Gratis'
                                        }
                                    </span>
                                    <span className="text-gray-500">
                                        {course.duration_hours ? `${course.duration_hours}h` : 'Sin especificar'}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <div className="flex items-center space-x-1">
                                        <Users className="w-3 h-3" />
                                        <span>0 estudiantes</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <BookOpen className="w-3 h-3" />
                                        <span>0 módulos</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditCourse(course)}
                                        className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                                    >
                                        <Edit className="w-3 h-3" />
                                        <span>Editar</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => {/* TODO: Abrir gestión de contenido */}}
                                        className="flex-1 flex items-center justify-center space-x-1 bg-yellow-100 text-yellow-700 px-3 py-2 rounded text-sm hover:bg-yellow-200 transition-colors"
                                    >
                                        <Settings className="w-3 h-3" />
                                        <span>Contenido</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDeleteCourse(course.id, course.title)}
                                        className="flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Course Modal */}
            <CourseModal
                isOpen={showModal}
                onClose={handleCloseModal}
                course={selectedCourse}
                onSave={handleSaveCourse}
                loading={loading}
            />
        </div>
    );
};

export default CourseManager;