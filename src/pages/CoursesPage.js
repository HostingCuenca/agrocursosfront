import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import CourseCard from '../components/courses/CourseCard';
import CourseFilters from '../components/courses/CourseFilters';
import CourseForm from '../components/courses/CourseForm';
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
        filters,
        getCourses,
        getCourseById,
        setFilters,
        setPage,
        enrollInCourse,
        createCourse,
        updateCourse,
        deleteCourse,
        clearError
    } = useCourseStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [loadingCourseDetails, setLoadingCourseDetails] = useState(false);
    const [enrollingCourse, setEnrollingCourse] = useState(null);

    // Cargar cursos al montar el componente
    useEffect(() => {
        getCourses();
    }, [getCourses]);

    // Recargar cursos cuando cambien los filtros
    useEffect(() => {
        getCourses(filters);
    }, [filters, getCourses]);

    // Cambiar página
    const handlePageChange = (newPage) => {
        setPage(newPage);
        getCourses({ ...filters, page: newPage });
    };

    // Actualizar filtros
    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        setFilters({ category: '', level: '', search: '', priceRange: '', duration: '', sortBy: 'created_at' });
    };

    // Manejar inscripción
    const handleEnroll = async (course) => {
        if (!permissions.courses.canEnroll) {
            alert('No tienes permisos para inscribirte en cursos');
            return;
        }

        setEnrollingCourse(course.id);
        try {
            const coursePrice = parseFloat(course.price) || 0;
            await enrollInCourse(course.id, {
                payment_status: coursePrice === 0 ? 'free' : 'pending',
                payment_amount: coursePrice
            });
            
            // Mostrar mensaje de éxito
            alert('¡Te has inscrito exitosamente en el curso!');
            
            // Recargar cursos para actualizar el estado
            getCourses(filters);
        } catch (error) {
            console.error('Error al inscribirse:', error);
            alert(error.response?.data?.message || 'Error al inscribirse en el curso');
        } finally {
            setEnrollingCourse(null);
        }
    };

    // Crear curso
    const handleCreateCourse = async (courseData) => {
        try {
            await createCourse(courseData);
            setShowCreateModal(false);
            alert('Curso creado exitosamente');
        } catch (error) {
            console.error('Error al crear curso:', error);
            alert(error.response?.data?.message || 'Error al crear el curso');
        }
    };

    // Manejar edición - obtener datos completos del curso
    const handleEdit = async (course) => {
        setLoadingCourseDetails(true);
        try {
            // Obtener datos completos del curso desde la API
            const fullCourseData = await getCourseById(course.id);
            setEditingCourse(fullCourseData.course || fullCourseData);
        } catch (error) {
            console.error('Error al obtener detalles del curso:', error);
            // Si falla, usar los datos parciales disponibles
            setEditingCourse(course);
        } finally {
            setLoadingCourseDetails(false);
        }
    };

    // Actualizar curso
    const handleUpdateCourse = async (courseData) => {
        try {
            await updateCourse(editingCourse.id, courseData);
            setEditingCourse(null);
            alert('Curso actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar curso:', error);
            alert(error.response?.data?.message || 'Error al actualizar el curso');
        }
    };

    // Manejar eliminación
    const handleDelete = async (course) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el curso "${course.title}"?`)) {
            try {
                await deleteCourse(course.id);
                alert('Curso eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar curso:', error);
                alert(error.response?.data?.message || 'Error al eliminar el curso');
            }
        }
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        const pages = [];
        const maxPages = 5;
        let startPage = Math.max(1, pagination.page - Math.floor(maxPages / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);

        if (endPage - startPage + 1 < maxPages) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }

        // Botón anterior
        if (pagination.page > 1) {
            pages.push(
                <button
                    key="prev"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
                >
                    Anterior
                </button>
            );
        }

        // Páginas numeradas
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 text-sm font-medium border ${
                        i === pagination.page
                            ? 'text-primary-600 bg-primary-50 border-primary-300'
                            : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Botón siguiente
        if (pagination.page < pagination.totalPages) {
            pages.push(
                <button
                    key="next"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
                >
                    Siguiente
                </button>
            );
        }

        return (
            <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-700">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                    {pagination.total} cursos
                </div>
                <div className="flex">{pages}</div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {permissions.isStudent ? 'Explorar Cursos' : 'Gestión de Cursos'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {permissions.isStudent 
                                ? 'Descubre y explora nuestro catálogo de cursos'
                                : 'Administra y gestiona los cursos de la plataforma'
                            }
                        </p>
                    </div>

                    {permissions.courses.canCreate && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Crear Curso</span>
                        </button>
                    )}
                </div>

                {/* Filtros */}
                <CourseFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                />

                {/* Mensaje de error */}
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

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                )}

                {/* Lista de cursos */}
                {!loading && courses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onEnroll={handleEnroll}
                                showActions={true}
                            />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && courses.length === 0 && !error && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📚</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No se encontraron cursos
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filters.search || filters.category || filters.level
                                ? 'Intenta ajustar los filtros para ver más resultados'
                                : 'Aún no hay cursos disponibles'}
                        </p>
                        {permissions.courses.canCreate && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Crear Primer Curso</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Paginación */}
                {!loading && courses.length > 0 && renderPagination()}

                {/* Modal de creación de curso */}
                {showCreateModal && (
                    <CourseForm
                        onSubmit={handleCreateCourse}
                        onCancel={() => setShowCreateModal(false)}
                        loading={loading}
                    />
                )}

                {/* Modal de edición de curso */}
                {(editingCourse || loadingCourseDetails) && (
                    <>
                        {loadingCourseDetails ? (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div className="bg-white rounded-lg p-8">
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-4"></div>
                                        <span className="text-lg">Cargando detalles del curso...</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <CourseForm
                                course={editingCourse}
                                onSubmit={handleUpdateCourse}
                                onCancel={() => setEditingCourse(null)}
                                loading={loading}
                            />
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CoursesPage;