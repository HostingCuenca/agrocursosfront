import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen, Edit, Trash2, Eye, DollarSign, Globe, Calendar } from 'lucide-react';
import useRolePermissions from '../../hooks/useRolePermissions';
import useAuthStore from '../../store/authStore';

// Componente de imagen con fallback
const CourseImage = ({ src, alt, className, placeholderSize = 'w-12 h-12' }) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleImageError = () => {
        setImageError(true);
        setIsLoading(false);
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    // Si no hay src o hay error, mostrar placeholder
    if (!src || imageError || src === '' || src === null) {
        return (
            <div className={`${className} flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200`}>
                <BookOpen className={`${placeholderSize} text-primary-500`} />
            </div>
        );
    }

    return (
        <div className={className}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{ display: isLoading ? 'none' : 'block' }}
            />
        </div>
    );
};

const CourseCard = ({ 
    course, 
    showActions = true, 
    onEdit, 
    onDelete, 
    onEnroll, 
    viewMode = 'grid' 
}) => {
    const permissions = useRolePermissions();
    const { user } = useAuthStore();

    if (!course) {
        return (
            <div className="bg-white rounded-lg border p-6 text-center">
                <p className="text-gray-500">Error: Datos del curso no disponibles</p>
            </div>
        );
    }

    // Mapear niveles de dificultad
    const getDifficultyDisplay = (level) => {
        const levelMap = {
            'Básico': { text: 'Básico', color: 'bg-green-100 text-green-800' },
            'Intermedio': { text: 'Intermedio', color: 'bg-yellow-100 text-yellow-800' },
            'Avanzado': { text: 'Avanzado', color: 'bg-red-100 text-red-800' },
            'beginner': { text: 'Básico', color: 'bg-green-100 text-green-800' },
            'intermediate': { text: 'Intermedio', color: 'bg-yellow-100 text-yellow-800' },
            'advanced': { text: 'Avanzado', color: 'bg-red-100 text-red-800' }
        };
        return levelMap[level] || { text: level, color: 'bg-gray-100 text-gray-800' };
    };

    // Mapear categorías para mostrar
    const getCategoryDisplay = (category) => {
        const categoryMap = {
            'agriculture': 'Agricultura',
            'livestock': 'Ganadería',
            'horticulture': 'Horticultura',
            'agroecology': 'Agroecología',
            'technology': 'Tecnología',
            'marketing': 'Comercialización',
            'sustainability': 'Sostenibilidad'
        };
        return categoryMap[category] || category;
    };

    // Formatear precio
    const formatPrice = (price, currency = 'USD') => {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice === 0) return 'Gratis';
        return `${currency} ${numPrice.toFixed(2)}`;
    };

    // Verificar permisos de gestión - Admin e instructor propietario
    const canManageThisCourse = user && (
        user.role === 'admin' || 
        (user.role === 'instructor' && course.instructor_id === user.id)
    );

    const difficultyInfo = getDifficultyDisplay(course.difficulty_level);

    // Vista en lista
    if (viewMode === 'list') {
        return (
            <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex">
                    {/* Imagen del curso */}
                    <CourseImage
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-48 h-32 flex-shrink-0 relative"
                        placeholderSize="w-8 h-8"
                    />

                    {/* Contenido */}
                    <div className="flex-1 p-4 flex justify-between">
                        <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                            {getCategoryDisplay(course.category)}
                                        </span>
                                        <span className={`text-xs font-medium px-2 py-1 rounded ${difficultyInfo.color}`}>
                                            {difficultyInfo.text}
                                        </span>
                                        {course.is_published !== undefined && (
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                course.is_published 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {course.is_published ? 'Publicado' : 'Borrador'}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {course.title}
                                    </h3>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-semibold text-gray-900">
                                        {formatPrice(course.price, course.currency)}
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {course.description}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>{course.duration_hours || 0}h</span>
                                </div>
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-1" />
                                    <span>{course.enrolled_count || 0} estudiantes</span>
                                </div>
                                <div className="flex items-center">
                                    <Globe className="w-4 h-4 mr-1" />
                                    <span>{course.language === 'es' ? 'Español' : course.language === 'en' ? 'Inglés' : 'Portugués'}</span>
                                </div>
                                {course.created_at && (
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        <span>{new Date(course.created_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        {showActions && (
                            <div className="flex items-center space-x-2 ml-4">
                                <Link
                                    to={`/cursos/${course.id}`}
                                    className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Ver curso"
                                >
                                    <Eye className="w-4 h-4" />
                                </Link>

                                {canManageThisCourse && onEdit && (
                                    <button
                                        onClick={() => onEdit(course)}
                                        className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                        title="Editar curso"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                )}

                                {canManageThisCourse && onDelete && (
                                    <button
                                        onClick={() => onDelete(course)}
                                        className="flex items-center justify-center w-10 h-10 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                        title="Eliminar curso"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Vista en grilla (por defecto)
    return (
        <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* Imagen del curso */}
            <div className="h-48 relative">
                <CourseImage
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full"
                    placeholderSize="w-12 h-12"
                />

                {/* Status Badge */}
                {course.is_published !== undefined && (
                    <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            course.is_published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {course.is_published ? 'Publicado' : 'Borrador'}
                        </span>
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        {getCategoryDisplay(course.category)}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${difficultyInfo.color}`}>
                        {difficultyInfo.text}
                    </span>
                </div>

                {/* Título y descripción */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {course.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration_hours || 0}h</span>
                    </div>
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{course.enrolled_count || 0}</span>
                    </div>
                    <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-1" />
                        <span>{course.language === 'es' ? 'ES' : course.language === 'en' ? 'EN' : 'PT'}</span>
                    </div>
                </div>

                {/* Precio */}
                <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-semibold text-gray-900">
                        {formatPrice(course.price, course.currency)}
                    </div>
                </div>

                {/* Actions */}
                {showActions && (
                    <div className="flex space-x-2">
                        <Link
                            to={`/cursos/${course.id}`}
                            className="flex-1 flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                        </Link>

                        {canManageThisCourse && onEdit && (
                            <button
                                onClick={() => onEdit(course)}
                                className="flex-1 flex items-center justify-center bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                            >
                                <Edit className="w-4 h-4 mr-1" />
                                Editar
                            </button>
                        )}

                        {canManageThisCourse && onDelete && (
                            <button
                                onClick={() => onDelete(course)}
                                className="flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseCard;