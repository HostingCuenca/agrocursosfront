import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const CourseModal = ({ 
    isOpen, 
    onClose, 
    course = null, 
    onSave, 
    loading = false 
}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        difficulty_level: 'Básico',
        price: '',
        currency: 'USD',
        duration_hours: '',
        language: 'es',
        thumbnail: '',
        tags: [],
        is_published: false
    });

    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState({});

    // Categorías y subcategorías según documentación
    const categories = {
        'agriculture': 'Agricultura',
        'livestock': 'Ganadería', 
        'horticulture': 'Horticultura',
        'agroecology': 'Agroecología',
        'technology': 'Tecnología Agrícola',
        'marketing': 'Comercialización',
        'sustainability': 'Sostenibilidad'
    };

    const subcategories = {
        agriculture: {
            'organic_farming': 'Agricultura Orgánica',
            'crop_management': 'Manejo de Cultivos',
            'soil_science': 'Ciencias del Suelo',
            'irrigation': 'Riego'
        },
        livestock: {
            'cattle': 'Ganado Bovino',
            'poultry': 'Avicultura',
            'sheep': 'Ganado Ovino',
            'pigs': 'Porcicultura',
            'animal_health': 'Salud Animal'
        },
        horticulture: {
            'vegetables': 'Hortalizas',
            'fruits': 'Frutales',
            'flowers': 'Floricultura',
            'greenhouse': 'Invernaderos'
        },
        agroecology: {
            'permaculture': 'Permacultura',
            'biodiversity': 'Biodiversidad',
            'ecosystem_management': 'Manejo de Ecosistemas'
        },
        technology: {
            'precision_agriculture': 'Agricultura de Precisión',
            'drones': 'Drones Agrícolas',
            'sensors': 'Sensores',
            'automation': 'Automatización'
        },
        marketing: {
            'sales': 'Ventas',
            'e_commerce': 'Comercio Electrónico',
            'branding': 'Branding',
            'market_analysis': 'Análisis de Mercado'
        },
        sustainability: {
            'renewable_energy': 'Energía Renovable',
            'waste_management': 'Gestión de Residuos',
            'carbon_footprint': 'Huella de Carbono'
        }
    };

    const difficultyLevels = ['Básico', 'Intermedio', 'Avanzado'];
    const currencies = ['USD', 'PEN', 'EUR'];

    // Inicializar formulario cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            if (course) {
                // Editar curso existente
                setFormData({
                    title: course.title || '',
                    description: course.description || '',
                    category: course.category || '',
                    subcategory: course.subcategory || '',
                    difficulty_level: course.difficulty_level || 'Básico',
                    price: course.price ? course.price.toString() : '',
                    currency: course.currency || 'USD',
                    duration_hours: course.duration_hours ? course.duration_hours.toString() : '',
                    language: course.language || 'es',
                    thumbnail: course.thumbnail || '',
                    tags: course.tags || [],
                    is_published: Boolean(course.is_published)
                });
            } else {
                // Crear nuevo curso
                resetForm();
            }
            setErrors({});
        }
    }, [isOpen, course]);

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            subcategory: '',
            difficulty_level: 'Básico',
            price: '',
            currency: 'USD',
            duration_hours: '',
            language: 'es',
            thumbnail: '',
            tags: [],
            is_published: false
        });
        setTagInput('');
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'El título es requerido';
        } else if (formData.title.trim().length < 3) {
            newErrors.title = 'El título debe tener al menos 3 caracteres';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La descripción es requerida';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'La descripción debe tener al menos 10 caracteres';
        }

        if (formData.price && isNaN(parseFloat(formData.price))) {
            newErrors.price = 'El precio debe ser un número válido';
        }

        if (formData.price && parseFloat(formData.price) < 0) {
            newErrors.price = 'El precio no puede ser negativo';
        }

        if (formData.duration_hours && isNaN(parseInt(formData.duration_hours))) {
            newErrors.duration_hours = 'La duración debe ser un número válido';
        }

        if (formData.duration_hours && parseInt(formData.duration_hours) < 0) {
            newErrors.duration_hours = 'La duración no puede ser negativa';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
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

        // Limpiar error cuando el usuario escriba
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleAddTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleTagKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Preparar datos para enviar
        const courseData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category || undefined,
            subcategory: formData.subcategory || undefined,
            difficulty_level: formData.difficulty_level,
            price: formData.price ? parseFloat(formData.price) : 0,
            currency: formData.currency,
            duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : 0,
            language: formData.language,
            thumbnail: formData.thumbnail.trim() || undefined,
            tags: formData.tags,
            is_published: formData.is_published
        };

        try {
            await onSave(courseData);
        } catch (error) {
            console.error('Error saving course:', error);
        }
    };

    const fillExampleData = () => {
        setFormData({
            title: 'Cultivo Avanzado de Tomates Orgánicos',
            description: 'Aprende todas las técnicas para cultivar tomates orgánicos de alta calidad en tu huerto. Desde la preparación del suelo hasta la cosecha.',
            category: 'agriculture',
            subcategory: 'organic_farming',
            difficulty_level: 'Avanzado',
            price: '99.99',
            currency: 'USD',
            duration_hours: '35',
            language: 'es',
            thumbnail: 'https://images.unsplash.com/photo-1592841200221-471592b6d231',
            tags: ['agricultura', 'orgánico', 'tomates', 'cultivo'],
            is_published: false
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {course ? 'Editar Curso' : 'Crear Nuevo Curso'}
                        </h2>
                        {!course && (
                            <button
                                type="button"
                                onClick={fillExampleData}
                                className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                            >
                                Llenar ejemplo
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Información Básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Título */}
                            <div className="md:col-span-2">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Título del Curso *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                        errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Ej: Cultivo Avanzado de Tomates Orgánicos"
                                    disabled={loading}
                                />
                                {errors.title && (
                                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                                )}
                            </div>

                            {/* Categoría */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoría
                                </label>
                                <select
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    disabled={loading}
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {Object.entries(categories).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Subcategoría */}
                            <div>
                                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                                    Subcategoría
                                </label>
                                <select
                                    id="subcategory"
                                    value={formData.subcategory}
                                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    disabled={!formData.category || loading}
                                >
                                    <option value="">Seleccionar subcategoría</option>
                                    {formData.category && subcategories[formData.category] && 
                                        Object.entries(subcategories[formData.category]).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            {/* Dificultad */}
                            <div>
                                <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nivel de Dificultad *
                                </label>
                                <select
                                    id="difficulty_level"
                                    value={formData.difficulty_level}
                                    onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    disabled={loading}
                                >
                                    {difficultyLevels.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Precio */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio
                                </label>
                                <div className="flex space-x-2">
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => handleInputChange('currency', e.target.value)}
                                        className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                        disabled={loading}
                                    >
                                        {currencies.map(currency => (
                                            <option key={currency} value={currency}>{currency}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        id="price"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                            errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="0.00"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.price && (
                                    <p className="text-red-600 text-sm mt-1">{errors.price}</p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">Deja vacío o 0 para cursos gratuitos</p>
                            </div>

                            {/* Duración */}
                            <div>
                                <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-700 mb-1">
                                    Duración (horas)
                                </label>
                                <input
                                    type="number"
                                    id="duration_hours"
                                    min="0"
                                    value={formData.duration_hours}
                                    onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                        errors.duration_hours ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="35"
                                    disabled={loading}
                                />
                                {errors.duration_hours && (
                                    <p className="text-red-600 text-sm mt-1">{errors.duration_hours}</p>
                                )}
                            </div>

                            {/* Idioma */}
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                                    Idioma *
                                </label>
                                <select
                                    id="language"
                                    value={formData.language}
                                    onChange={(e) => handleInputChange('language', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    disabled={loading}
                                >
                                    <option value="es">Español</option>
                                    <option value="en">Inglés</option>
                                    <option value="pt">Portugués</option>
                                </select>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción del Curso *
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Describe el curso, objetivos, metodología, etc..."
                                disabled={loading}
                            />
                            {errors.description && (
                                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">{formData.description.length} caracteres</p>
                        </div>

                        {/* Imagen del curso */}
                        <div>
                            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
                                URL de Imagen del Curso
                            </label>
                            <input
                                type="url"
                                id="thumbnail"
                                value={formData.thumbnail}
                                onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                placeholder="https://images.unsplash.com/photo-..."
                                disabled={loading}
                            />
                            {formData.thumbnail && (
                                <div className="mt-3">
                                    <img
                                        src={formData.thumbnail}
                                        alt="Preview"
                                        className="h-32 w-48 object-cover rounded-lg border shadow-sm"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Etiquetas
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 text-yellow-600 hover:text-yellow-800"
                                            disabled={loading}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={handleTagKeyPress}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="Escribe una etiqueta y presiona Enter"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    disabled={loading}
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>

                        {/* Estado de publicación */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_published"
                                    checked={formData.is_published}
                                    onChange={(e) => handleInputChange('is_published', e.target.checked)}
                                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                                    disabled={loading}
                                />
                                <label htmlFor="is_published" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                                    Publicar curso inmediatamente
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 ml-7">
                                {formData.is_published 
                                    ? 'El curso será visible para estudiantes' 
                                    : 'El curso quedará como borrador'
                                }
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer con botones */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>{course ? 'Actualizar' : 'Crear'} Curso</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseModal;