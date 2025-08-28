import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const CourseForm = ({ course, onSubmit, onCancel, loading = false }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        difficulty_level: 'Básico',
        price: 0,
        currency: 'USD',
        duration_hours: 0,
        language: 'es',
        thumbnail: '',
        tags: [],
        is_published: false
    });

    const [errors, setErrors] = useState({});

    // Categorías según documentación
    const categories = [
        'agriculture',
        'livestock',
        'horticulture',
        'agroecology',
        'technology',
        'marketing',
        'sustainability'
    ];

    const subcategories = {
        agriculture: ['organic_farming', 'crop_management', 'soil_science', 'irrigation'],
        livestock: ['cattle', 'poultry', 'sheep', 'pigs', 'animal_health'],
        horticulture: ['vegetables', 'fruits', 'flowers', 'greenhouse'],
        agroecology: ['permaculture', 'biodiversity', 'ecosystem_management'],
        technology: ['precision_agriculture', 'drones', 'sensors', 'automation'],
        marketing: ['sales', 'e_commerce', 'branding', 'market_analysis'],
        sustainability: ['renewable_energy', 'waste_management', 'carbon_footprint']
    };

    const difficultyLevels = ['Básico', 'Intermedio', 'Avanzado'];
    const currencies = ['USD', 'PEN', 'EUR'];
    const languages = ['es', 'en', 'pt'];

    // Enlaces de video reales según documentación
    const exampleVideos = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/watch?v=oHg5SJYRHA0',
        'https://www.youtube.com/watch?v=9bZkp7q19f0',
        'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
        'https://www.youtube.com/watch?v=astISOttCQ0'
    ];

    // Inicializar formulario con datos del curso si existe
    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                category: course.category || '',
                subcategory: course.subcategory || '',
                difficulty_level: course.difficulty_level || 'Básico',
                price: course.price || 0,
                currency: course.currency || 'USD',
                duration_hours: course.duration_hours || 0,
                language: course.language || 'es',
                thumbnail: course.thumbnail || '',
                tags: course.tags || [],
                is_published: Boolean(course.is_published)
            });
        }
    }, [course]);

    const validateForm = () => {
        const newErrors = {};

        // Validaciones según documentación
        if (!formData.title.trim()) {
            newErrors.title = 'El título es requerido';
        } else if (formData.title.length < 3) {
            newErrors.title = 'El título debe tener al menos 3 caracteres';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La descripción es requerida';
        } else if (formData.description.length < 10) {
            newErrors.description = 'La descripción debe tener al menos 10 caracteres';
        }

        if (formData.price < 0) {
            newErrors.price = 'El precio no puede ser negativo';
        }

        if (formData.duration_hours < 0) {
            newErrors.duration_hours = 'La duración no puede ser negativa';
        }

        if (!difficultyLevels.includes(formData.difficulty_level)) {
            newErrors.difficulty_level = 'Nivel de dificultad inválido';
        }

        if (!currencies.includes(formData.currency)) {
            newErrors.currency = 'Moneda inválida';
        }

        if (!languages.includes(formData.language)) {
            newErrors.language = 'Idioma inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar subcategoría si cambia la categoría
        if (field === 'category') {
            setFormData(prev => ({
                ...prev,
                subcategory: ''
            }));
        }

        // Limpiar error cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleTagAdd = (tag) => {
        if (tag.trim() && !formData.tags.includes(tag.trim())) {
            handleChange('tags', [...formData.tags, tag.trim()]);
        }
    };

    const handleTagRemove = (index) => {
        const newTags = formData.tags.filter((_, i) => i !== index);
        handleChange('tags', newTags);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Preparar datos según documentación API
        const cleanedData = {
            ...formData,
            price: parseFloat(formData.price),
            duration_hours: parseInt(formData.duration_hours)
        };

        onSubmit(cleanedData);
    };

    const fillExampleData = () => {
        setFormData({
            title: 'Cultivo Avanzado de Tomates Orgánicos',
            description: 'Aprende todas las técnicas para cultivar tomates orgánicos de alta calidad en tu huerto. Desde la preparación del suelo hasta la cosecha.',
            category: 'agriculture',
            subcategory: 'organic_farming',
            difficulty_level: 'Avanzado',
            price: 99.99,
            currency: 'USD',
            duration_hours: 35,
            language: 'es',
            thumbnail: 'https://images.unsplash.com/photo-1592841200221-471592b6d231',
            tags: ['agricultura', 'orgánico', 'tomates', 'cultivo'],
            is_published: false
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {course ? 'Editar Curso' : 'Crear Nuevo Curso'}
                        </h2>
                        {!course && (
                            <button
                                type="button"
                                onClick={fillExampleData}
                                className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                            >
                                Usar ejemplo
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Título */}
                        <div className="md:col-span-2">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Título del Curso * (min: 3 caracteres)
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                    errors.title ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Ej: Cultivo Avanzado de Tomates Orgánicos"
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                            )}
                        </div>

                        {/* Categoría */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                Categoría
                            </label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                    errors.category ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Seleccionar categoría</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                            )}
                        </div>

                        {/* Subcategoría */}
                        <div>
                            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                                Subcategoría
                            </label>
                            <select
                                id="subcategory"
                                value={formData.subcategory}
                                onChange={(e) => handleChange('subcategory', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                disabled={!formData.category}
                            >
                                <option value="">Seleccionar subcategoría</option>
                                {formData.category && subcategories[formData.category]?.map((subcategory) => (
                                    <option key={subcategory} value={subcategory}>
                                        {subcategory}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nivel de dificultad */}
                        <div>
                            <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-2">
                                Nivel de Dificultad *
                            </label>
                            <select
                                id="difficulty_level"
                                value={formData.difficulty_level}
                                onChange={(e) => handleChange('difficulty_level', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            >
                                {difficultyLevels.map((level) => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Precio */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                Precio * (min: 0)
                            </label>
                            <div className="flex space-x-2">
                                <select
                                    value={formData.currency}
                                    onChange={(e) => handleChange('currency', e.target.value)}
                                    className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                >
                                    {currencies.map((currency) => (
                                        <option key={currency} value={currency}>
                                            {currency}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    id="price"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => handleChange('price', e.target.value)}
                                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                        errors.price ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.price && (
                                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">Usa 0 para cursos gratuitos</p>
                        </div>

                        {/* Duración */}
                        <div>
                            <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-700 mb-2">
                                Duración (horas) *
                            </label>
                            <input
                                type="number"
                                id="duration_hours"
                                min="0"
                                value={formData.duration_hours}
                                onChange={(e) => handleChange('duration_hours', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                    errors.duration_hours ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="35"
                            />
                            {errors.duration_hours && (
                                <p className="text-red-500 text-sm mt-1">{errors.duration_hours}</p>
                            )}
                        </div>

                        {/* Idioma */}
                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                                Idioma *
                            </label>
                            <select
                                id="language"
                                value={formData.language}
                                onChange={(e) => handleChange('language', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            >
                                <option value="es">Español</option>
                                <option value="en">Inglés</option>
                                <option value="pt">Portugués</option>
                            </select>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción * (min: 10 caracteres)
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                errors.description ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Descripción completa del curso, metodología, objetivos de aprendizaje, etc..."
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                            {formData.description.length} caracteres
                        </p>
                    </div>

                    {/* URL de imagen (thumbnail) */}
                    <div>
                        <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                            URL de Imagen del Curso
                        </label>
                        <input
                            type="url"
                            id="thumbnail"
                            value={formData.thumbnail}
                            onChange={(e) => handleChange('thumbnail', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            placeholder="https://images.unsplash.com/photo-1592841200221-471592b6d231"
                        />
                        {formData.thumbnail && (
                            <div className="mt-2">
                                <img
                                    src={formData.thumbnail}
                                    alt="Preview"
                                    className="h-32 w-48 object-cover rounded-lg border border-gray-300"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Etiquetas (Tags)
                        </label>
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleTagRemove(index)}
                                            className="ml-1 text-yellow-600 hover:text-yellow-800"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Agregar etiqueta (presiona Enter)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleTagAdd(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Estado de publicación */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_published"
                                checked={Boolean(formData.is_published)}
                                onChange={(e) => handleChange('is_published', e.target.checked)}
                                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_published" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                                Publicar curso (visible para estudiantes)
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-7">
                            {formData.is_published 
                                ? 'El curso será visible para todos los estudiantes'
                                : 'El curso estará en borrador y solo visible para instructores'
                            }
                        </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                            {loading ? 'Guardando...' : (course ? 'Actualizar Curso' : 'Crear Curso')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseForm;