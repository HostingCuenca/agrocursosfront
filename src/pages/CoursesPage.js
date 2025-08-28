import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import CourseCard from '../components/courses/CourseCard';
import CourseModal from '../components/courses/CourseModal';
import TestButton from '../components/courses/TestButton';
import useCourseStore from '../store/courseStore';
import useRolePermissions from '../hooks/useRolePermissions';
import useAuthStore from '../store/authStore';

const CoursesPage = () => {
    const { user } = useAuthStore();
    const permissions = useRolePermissions();
    const {
        courses,
        loading,
        error,
        pagination,
        getCourses,
        getCourseById,
        createCourse,
        updateCourse,
        deleteCourse,
        clearError
    } = useCourseStore();

    // Estados del modal
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    
    // Estados de filtros y vista
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    
    // Filtrar cursos localmente
    const filteredCourses = courses.filter(course => {
        const matchesSearch = !searchTerm || 
            course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !categoryFilter || course.category === categoryFilter;
        const matchesLevel = !levelFilter || course.difficulty_level === levelFilter;
        
        return matchesSearch && matchesCategory && matchesLevel;
    });

    // Categorías disponibles
    const categories = {
        'agriculture': 'Agricultura',
        'livestock': 'Ganadería',
        'horticulture': 'Horticultura',
        'agroecology': 'Agroecología',
        'technology': 'Tecnología',
        'marketing': 'Comercialización',
        'sustainability': 'Sostenibilidad'
    };

    const difficultyLevels = ['Básico', 'Intermedio', 'Avanzado'];

    // Cargar cursos al montar
    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            // Llamar sin parámetros para obtener TODOS los cursos
            await getCourses({});
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    };

    // Crear nuevo curso
    const handleCreateCourse = () => {
        setEditingCourse(null);
        setShowModal(true);
    };

    // Editar curso existente
    const handleEditCourse = async (course) => {
        setModalLoading(true);
        try {
            // Intentar obtener datos completos del curso
            const fullCourseData = await getCourseById(course.id);
            setEditingCourse(fullCourseData.course || fullCourseData || course);
        } catch (error) {
            console.error('Error al obtener detalles del curso:', error);
            // Si falla, usar datos parciales
            setEditingCourse(course);
        } finally {
            setModalLoading(false);
            setShowModal(true);
        }
    };

    // Guardar curso (crear o actualizar)
    const handleSaveCourse = async (courseData) => {
        setModalLoading(true);
        try {
            if (editingCourse) {
                // Actualizar curso existente
                await updateCourse(editingCourse.id, courseData);
            } else {
                // Crear nuevo curso
                await createCourse(courseData);
            }
            
            setShowModal(false);
            setEditingCourse(null);
            
            // Recargar cursos para ver cambios
            await loadCourses();
            
        } catch (error) {
            console.error('Error saving course:', error);
            throw error; // Let the modal handle the error display
        } finally {
            setModalLoading(false);
        }
    };

    // Eliminar curso
    const handleDeleteCourse = async (course) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el curso "${course.title}"?`)) {
            try {
                await deleteCourse(course.id);
                await loadCourses(); // Recargar lista
            } catch (error) {
                console.error('Error al eliminar curso:', error);
            }
        }
    };

    // Cerrar modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCourse(null);
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setLevelFilter('');
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {permissions.isStudent ? 'Explorar Cursos' : 'Gestión de Cursos'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {permissions.isStudent 
                                ? 'Descubre y explora nuestro catálogo de cursos'
                                : `Administra y gestiona ${user?.role === 'instructor' ? 'tus' : 'todos los'} cursos`
                            }
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === 'grid'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === 'list'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Create Course Button */}
                        {permissions.courses.canCreate && (
                            <button
                                onClick={handleCreateCourse}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Crear Curso</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por título o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="lg:w-48">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            >
                                <option value="">Todas las categorías</option>
                                {Object.entries(categories).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Level Filter */}
                        <div className="lg:w-40">
                            <select
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            >
                                <option value="">Todos los niveles</option>
                                {difficultyLevels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(searchTerm || categoryFilter || levelFilter) && (
                            <button
                                onClick={handleClearFilters}
                                className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                        <span>{error}</span>
                        <button
                            onClick={clearError}
                            className="text-red-500 hover:text-red-700"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                    </div>
                )}

                {/* Course Content */}
                {!loading && (
                    <>
                        {/* Results Summary */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                {filteredCourses.length === courses.length
                                    ? `${courses.length} curso${courses.length !== 1 ? 's' : ''} encontrado${courses.length !== 1 ? 's' : ''}`
                                    : `${filteredCourses.length} de ${courses.length} cursos mostrados`
                                }
                            </p>
                        </div>

                        {/* Courses Grid/List */}
                        {filteredCourses.length > 0 ? (
                            <div className={
                                viewMode === 'grid'
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                    : "space-y-4"
                            }>
                                {filteredCourses.map((course) => (
                                    <CourseCard
                                        key={`${course.id}-${course.is_published}-${course.updated_at}`} // Force re-render
                                        course={course}
                                        onEdit={handleEditCourse}
                                        onDelete={handleDeleteCourse}
                                        showActions={permissions.courses.canEdit || permissions.courses.canDelete}
                                        viewMode={viewMode}
                                    />
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="text-center py-12 bg-white rounded-lg border">
                                <div className="text-gray-400 text-6xl mb-4">
                                    {searchTerm || categoryFilter || levelFilter ? '🔍' : '📚'}
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm || categoryFilter || levelFilter
                                        ? 'No se encontraron cursos'
                                        : 'No hay cursos disponibles'
                                    }
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm || categoryFilter || levelFilter
                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                        : 'Comienza creando tu primer curso'
                                    }
                                </p>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    {(searchTerm || categoryFilter || levelFilter) && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Limpiar filtros
                                        </button>
                                    )}
                                    
                                    {permissions.courses.canCreate && (
                                        <button
                                            onClick={handleCreateCourse}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>
                                                {courses.length === 0 ? 'Crear primer curso' : 'Crear curso'}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Course Modal */}
                <CourseModal
                    key={`modal-${editingCourse?.id || 'new'}-${showModal}`} // Force modal re-render
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    course={editingCourse}
                    onSave={handleSaveCourse}
                    loading={modalLoading}
                />

                {/* Test Button - Solo para desarrollo */}
                <TestButton />
            </div>
        </DashboardLayout>
    );
};

export default CoursesPage;