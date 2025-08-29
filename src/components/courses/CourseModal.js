import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CourseModal = ({ isOpen, onClose, course, onSave, loading }) => {
    const [data, setData] = useState({
        title: '',
        description: '',
        category: 'agriculture',
        subcategory: 'organic_farming',
        difficulty_level: 'Básico',
        price: 0,
        currency: 'USD',
        duration_hours: 0,
        language: 'es',
        thumbnail: '',
        is_published: false
    });

    const [errors, setErrors] = useState({});

    // Cargar datos
    useEffect(() => {
        if (isOpen) {
            if (course?.id) {
                // EDITAR - cargar datos del curso
                console.log('EDIT MODE - Loading course:', course.id);
                setData({
                    title: course.title || '',
                    description: course.description || '',
                    category: course.category || 'agriculture',
                    subcategory: course.subcategory || 'organic_farming',
                    difficulty_level: course.difficulty_level || 'Básico',
                    price: parseFloat(course.price) || 0,
                    currency: course.currency || 'USD',
                    duration_hours: parseInt(course.duration_hours) || 0,
                    language: course.language || 'es',
                    thumbnail: course.thumbnail || '',
                    is_published: course.is_published === true || course.is_published === 'true'
                });
            } else {
                // CREAR - reset
                console.log('CREATE MODE - Reset form');
                setData({
                    title: '',
                    description: '',
                    category: 'agriculture',
                    subcategory: 'organic_farming',
                    difficulty_level: 'Básico',
                    price: 0,
                    currency: 'USD',
                    duration_hours: 0,
                    language: 'es',
                    thumbnail: '',
                    is_published: false
                });
            }
            setErrors({});
        }
    }, [isOpen, course]);

    const handleSave = async () => {
        console.log('SAVING - Mode:', course?.id ? 'EDIT' : 'CREATE');
        console.log('Course ID:', course?.id);
        console.log('Form data:', data);

        // Validación simple
        if (!data.title?.trim()) {
            setErrors({ title: 'Título requerido' });
            return;
        }
        if (!data.description?.trim()) {
            setErrors({ description: 'Descripción requerida' });
            return;
        }

        // Preparar datos - SIN CAMPOS JSON COMPLICADOS
        const payload = {
            title: data.title.trim(),
            description: data.description.trim(),
            category: data.category,
            subcategory: data.subcategory,
            difficulty_level: data.difficulty_level,
            price: Number(data.price),
            currency: data.currency,
            duration_hours: Number(data.duration_hours),
            language: data.language,
            thumbnail: data.thumbnail?.trim() || null,
            is_published: Boolean(data.is_published)
        };

        console.log('API Payload:', payload);

        try {
            if (course?.id) {
                console.log('Calling UPDATE with ID:', course.id);
                await onSave(course.id, payload);
            } else {
                console.log('Calling CREATE');
                await onSave(payload);
            }
            console.log('Save successful');
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">
                        {course?.id ? 'Editar Curso' : 'Nuevo Curso'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
                    {/* Título */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Título *</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData({...data, title: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombre del curso"
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Descripción *</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData({...data, description: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe el curso..."
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Categoría */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Categoría</label>
                            <select
                                value={data.category}
                                onChange={(e) => setData({...data, category: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="agriculture">Agricultura</option>
                                <option value="technology">Tecnología</option>
                            </select>
                        </div>

                        {/* Subcategoría */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Subcategoría</label>
                            <select
                                value={data.subcategory}
                                onChange={(e) => setData({...data, subcategory: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="organic_farming">Agricultura Orgánica</option>
                                <option value="home_gardening">Huerto Casero</option>
                                <option value="pest_control">Control Plagas</option>
                                <option value="precision">Agricultura Precisión</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Nivel */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Nivel</label>
                            <select
                                value={data.difficulty_level}
                                onChange={(e) => setData({...data, difficulty_level: e.target.value})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Básico">Básico</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                            </select>
                        </div>

                        {/* Duración */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Horas</label>
                            <input
                                type="number"
                                value={data.duration_hours}
                                onChange={(e) => setData({...data, duration_hours: parseInt(e.target.value) || 0})}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Precio */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Precio</label>
                        <div className="flex">
                            <select
                                value={data.currency}
                                onChange={(e) => setData({...data, currency: e.target.value})}
                                className="px-3 py-2 border rounded-l-md focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="USD">USD</option>
                                <option value="PEN">PEN</option>
                            </select>
                            <input
                                type="number"
                                step="0.01"
                                value={data.price}
                                onChange={(e) => setData({...data, price: parseFloat(e.target.value) || 0})}
                                className="flex-1 px-3 py-2 border-t border-r border-b rounded-r-md focus:ring-2 focus:ring-blue-500"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* URL Imagen */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Imagen URL</label>
                        <input
                            type="url"
                            value={data.thumbnail}
                            onChange={(e) => setData({...data, thumbnail: e.target.value})}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                    </div>

                    {/* Publicar */}
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="is_published"
                                    checked={data.is_published}
                                    onChange={(e) => {
                                        console.log('✅ Checkbox clicked:', e.target.checked);
                                        console.log('📋 Previous state:', data.is_published);
                                        setData({...data, is_published: e.target.checked});
                                    }}
                                    className="h-5 w-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 bg-white checked:bg-blue-600 checked:border-blue-600"
                                />
                            </div>
                            <label htmlFor="is_published" className="cursor-pointer select-none">
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg">
                                        {data.is_published ? '🟢' : '🔴'}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-800">
                                        {data.is_published ? 'PUBLICADO' : 'BORRADOR'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    {data.is_published 
                                        ? 'El curso es visible para estudiantes' 
                                        : 'El curso está oculto (solo visible para ti)'
                                    }
                                </div>
                            </label>
                        </div>
                        <div className="mt-2 text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded">
                            DEBUG: is_published = {String(data.is_published)}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : (course?.id ? 'Actualizar' : 'Crear')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseModal;