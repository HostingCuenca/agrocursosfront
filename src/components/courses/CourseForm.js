import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';

const CourseForm = ({ course, onSubmit, onCancel, loading = false }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        detailed_description: '',
        category: '',
        difficulty_level: 'beginner',
        price: 0,
        duration_hours: 0,
        thumbnail_url: '',
        learning_objectives: [''],
        is_published: false
    });

    const [errors, setErrors] = useState({});

    const categories = [
        'Agricultura',
        'Ganadería', 
        'Horticultura',
        'Agroecología',
        'Tecnología Agrícola',
        'Comercialización',
        'Sostenibilidad'
    ];

    const difficultyLevels = [
        { value: 'beginner', label: 'Principiante' },
        { value: 'intermediate', label: 'Intermedio' },
        { value: 'advanced', label: 'Avanzado' }
    ];

    // Inicializar formulario con datos del curso si existe
    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                detailed_description: course.detailed_description || '',
                category: course.category || '',
                difficulty_level: course.difficulty_level || 'beginner',
                price: course.price || 0,
                duration_hours: course.duration_hours || 0,
                thumbnail_url: course.thumbnail_url || '',
                learning_objectives: (Array.isArray(course.learning_objectives) && course.learning_objectives.length > 0)
                    ? course.learning_objectives.filter(obj => obj && obj.trim())
                    : [''],
                is_published: Boolean(course.is_published) // Asegurar que sea boolean
            });
        }
    }, [course]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'El título es requerido';
        } else if (formData.title.length < 5) {
            newErrors.title = 'El título debe tener al menos 5 caracteres';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La descripción es requerida';
        } else if (formData.description.length < 20) {
            newErrors.description = 'La descripción debe tener al menos 20 caracteres';
        }

        if (!formData.category) {
            newErrors.category = 'La categoría es requerida';
        }

        if (formData.price < 0) {
            newErrors.price = 'El precio no puede ser negativo';
        }

        if (formData.duration_hours <= 0) {
            newErrors.duration_hours = 'La duración debe ser mayor a 0';
        }

        // Validar objetivos de aprendizaje
        const validObjectives = formData.learning_objectives
            .filter(obj => obj && obj.trim && obj.trim())
            .map(obj => obj.trim());
        if (validObjectives.length === 0) {
            newErrors.learning_objectives = 'Al menos un objetivo de aprendizaje es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleObjectiveChange = (index, value) => {
        const newObjectives = [...formData.learning_objectives];
        newObjectives[index] = value;
        handleChange('learning_objectives', newObjectives);
    };

    const addObjective = () => {
        handleChange('learning_objectives', [...formData.learning_objectives, '']);
    };

    const removeObjective = (index) => {
        if (formData.learning_objectives.length > 1) {
            const newObjectives = formData.learning_objectives.filter((_, i) => i !== index);
            handleChange('learning_objectives', newObjectives);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Filtrar objetivos vacíos
        const cleanedData = {
            ...formData,
            learning_objectives: formData.learning_objectives.filter(obj => obj.trim()),
            price: parseFloat(formData.price),
            duration_hours: parseInt(formData.duration_hours)
        };

        onSubmit(cleanedData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {course ? 'Editar Curso' : 'Crear Nuevo Curso'}
                    </h2>
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
                                Título del Curso *
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                    errors.title ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Ej: Agricultura Orgánica para Principiantes"
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                            )}
                        </div>

                        {/* Categoría */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                Categoría *
                            </label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
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

                        {/* Nivel de dificultad */}
                        <div>
                            <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-2">
                                Nivel de Dificultad *
                            </label>
                            <select
                                id="difficulty_level"
                                value={formData.difficulty_level}
                                onChange={(e) => handleChange('difficulty_level', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                {difficultyLevels.map((level) => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Precio */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                Precio (USD) *
                            </label>
                            <input
                                type="number"
                                id="price"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => handleChange('price', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                    errors.price ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="0.00"
                            />
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
                                min="1"
                                value={formData.duration_hours}
                                onChange={(e) => handleChange('duration_hours', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                    errors.duration_hours ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="40"
                            />
                            {errors.duration_hours && (
                                <p className="text-red-500 text-sm mt-1">{errors.duration_hours}</p>
                            )}
                        </div>
                    </div>

                    {/* Descripción corta */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción Corta *
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                errors.description ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Breve descripción que aparecerá en la tarjeta del curso..."
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                            {formData.description.length}/200 caracteres
                        </p>
                    </div>

                    {/* Descripción detallada */}
                    <div>
                        <label htmlFor="detailed_description" className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción Detallada
                        </label>
                        <textarea
                            id="detailed_description"
                            rows={5}
                            value={formData.detailed_description}
                            onChange={(e) => handleChange('detailed_description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Descripción completa del curso, metodología, requisitos, etc..."
                        />
                    </div>

                    {/* URL de imagen */}
                    <div>
                        <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 mb-2">
                            URL de Imagen del Curso
                        </label>
                        <input
                            type="url"
                            id="thumbnail_url"
                            value={formData.thumbnail_url}
                            onChange={(e) => handleChange('thumbnail_url', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        {formData.thumbnail_url && (
                            <div className="mt-2">
                                <img
                                    src={formData.thumbnail_url}
                                    alt="Preview"
                                    className="h-32 w-48 object-cover rounded-lg border border-gray-300"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Objetivos de aprendizaje */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Objetivos de Aprendizaje *
                            </label>
                            <button
                                type="button"
                                onClick={addObjective}
                                className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar objetivo
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            {formData.learning_objectives.map((objective, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={objective}
                                        onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Ej: Comprender los principios básicos de la agricultura orgánica"
                                    />
                                    {formData.learning_objectives.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeObjective(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {errors.learning_objectives && (
                            <p className="text-red-500 text-sm mt-1">{errors.learning_objectives}</p>
                        )}
                    </div>

                    {/* Estado de publicación */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_published"
                                checked={Boolean(formData.is_published)}
                                onChange={(e) => handleChange('is_published', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
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
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg transition-colors"
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