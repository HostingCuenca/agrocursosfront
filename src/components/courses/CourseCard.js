import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen, Star, DollarSign } from 'lucide-react';
import useRolePermissions from '../../hooks/useRolePermissions';

const CourseCard = ({ course, showActions = true, onEdit, onDelete, onEnroll }) => {
    const permissions = useRolePermissions();

    // Validar que course existe y tiene las propiedades necesarias
    if (!course) {
        return <div className="bg-white rounded-lg shadow-md p-6">Error: Datos del curso no disponibles</div>;
    }

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

    const canManageThisCourse = permissions.courses.canEdit(course.instructor_id);

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            {/* Imagen del curso */}
            {course.thumbnail_url && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="p-6">
                {/* Header con categoría y nivel */}
                <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                        {course.category}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(course.difficulty_level)}`}>
                        {getDifficultyText(course.difficulty_level)}
                    </span>
                </div>

                {/* Título y descripción */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                </p>

                {/* Instructor */}
                {course.instructor_name && (
                    <p className="text-sm text-gray-500 mb-3">
                        Por: {course.instructor_name}
                    </p>
                )}

                {/* Estadísticas del curso */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{course.duration_hours || 0}h</span>
                        </div>
                        <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{course.enrolled_count || 0}</span>
                        </div>
                        <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            <span>{course.modules_count || 0} módulos</span>
                        </div>
                    </div>
                </div>

                {/* Precio */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-lg font-semibold text-gray-900">
                            {formatPrice(course.price || 0)}
                        </span>
                    </div>
                    
                    {course.rating && (
                        <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                    )}
                </div>

                {/* Estado de inscripción */}
                {course.enrollment_status && (
                    <div className="mb-4">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                            course.enrollment_status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : course.enrollment_status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            {course.enrollment_status === 'active' && 'Inscrito'}
                            {course.enrollment_status === 'completed' && 'Completado'}
                            {course.enrollment_status === 'pending' && 'Pendiente'}
                        </span>
                    </div>
                )}

                {/* Progreso si está inscrito */}
                {course.progress_percentage !== undefined && (
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progreso</span>
                            <span>{course.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress_percentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Acciones */}
                {showActions && (
                    <div className="flex gap-2">
                        {/* Ver curso */}
                        <Link
                            to={`/cursos/${course.id}`}
                            className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                        >
                            Ver Curso
                        </Link>

                        {/* Inscribirse (solo estudiantes) */}
                        {permissions.courses.canEnroll && !course.enrollment_status && onEnroll && (
                            <button
                                onClick={() => onEnroll(course)}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                                Inscribirse
                            </button>
                        )}

                        {/* Editar (instructor propietario/admin) */}
                        {canManageThisCourse && onEdit && (
                            <button
                                onClick={() => onEdit(course)}
                                className="bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                title="Editar curso"
                            >
                                ✏️
                            </button>
                        )}

                        {/* Eliminar (instructor propietario/admin) */}
                        {canManageThisCourse && onDelete && (
                            <button
                                onClick={() => onDelete(course)}
                                className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                title="Eliminar curso"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseCard;