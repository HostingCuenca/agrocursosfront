import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ClassModal = ({ isOpen, onClose, classItem, moduleId, onSave, loading }) => {
    const [data, setData] = useState({
        title: '',
        description: '',
        content_type: 'video',
        content_url: '',
        content_text: '',
        order_sequence: 1,
        is_published: true
    });

    const [errors, setErrors] = useState({});

    const contentTypes = [
        { value: 'video', label: '🎥 Video', emoji: '🎥' },
        { value: 'text', label: '📝 Texto/Artículo', emoji: '📝' },
        { value: 'mixed', label: '🔀 Contenido Mixto', emoji: '🔀' }
    ];

    // Cargar datos cuando se abre
    useEffect(() => {
        if (isOpen) {
            if (classItem?.id) {
                // EDITAR - cargar datos de la clase
                console.log('EDIT MODE - Loading class:', classItem.id);
                setData({
                    title: classItem.title || '',
                    description: classItem.description || '',
                    content_type: classItem.content_type || 'video',
                    content_url: classItem.content_url || '',
                    content_text: classItem.content_text || '',
                    order_sequence: Number(classItem.order_sequence) || 1,
                    is_published: classItem.is_published === true || classItem.is_published === 'true'
                });
            } else {
                // CREAR - reset
                console.log('CREATE MODE - Reset form');
                setData({
                    title: '',
                    description: '',
                    content_type: 'video',
                    content_url: '',
                    content_text: '',
                    order_sequence: 1,
                    is_published: true
                });
            }
            setErrors({});
        }
    }, [isOpen, classItem]);

    const handleSave = async () => {
        console.log('SAVING - Mode:', classItem?.id ? 'EDIT' : 'CREATE');
        console.log('Class ID:', classItem?.id);
        console.log('Module ID:', moduleId);
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

        // Validaciones específicas por tipo de contenido
        if (data.content_type === 'video' && !data.content_url?.trim()) {
            setErrors({ content_url: 'URL del video requerida para contenido de video' });
            return;
        }
        if (data.content_type === 'text' && !data.content_text?.trim()) {
            setErrors({ content_text: 'Contenido de texto requerido para contenido de texto' });
            return;
        }

        // Preparar datos limpios
        const payload = {
            title: data.title.trim(),
            description: data.description.trim(),
            content_type: data.content_type,
            order_sequence: Number(data.order_sequence),
            is_published: Boolean(data.is_published)
        };

        // Agregar contenido según el tipo
        if (data.content_url?.trim()) {
            payload.content_url = data.content_url.trim();
        }
        if (data.content_text?.trim()) {
            payload.content_text = data.content_text.trim();
        }

        console.log('API Payload:', payload);

        try {
            if (classItem?.id) {
                console.log('Calling UPDATE with ID:', classItem.id);
                await onSave(classItem.id, payload);
            } else {
                console.log('Calling CREATE for module:', moduleId);
                await onSave(moduleId, payload);
            }
            console.log('Save successful');
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    if (!isOpen) return null;

    const selectedContentType = contentTypes.find(type => type.value === data.content_type);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-purple-200 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                        <span className="mr-2">🎬</span>
                        {classItem?.id ? 'Editar Clase' : 'Nueva Clase'}
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto max-h-[70vh] space-y-4">
                    {/* Título */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            📝 Título de la Clase *
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData({...data, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                            placeholder="Ej: Introducción a los Suelos Orgánicos"
                            disabled={loading}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            📖 Descripción *
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData({...data, description: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                            placeholder="Describe el contenido y objetivos de la clase..."
                            disabled={loading}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tipo de Contenido */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                🎭 Tipo de Contenido *
                            </label>
                            <select
                                value={data.content_type}
                                onChange={(e) => setData({...data, content_type: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                disabled={loading}
                            >
                                {contentTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Orden */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                🔢 Orden de Secuencia
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.order_sequence}
                                onChange={(e) => setData({...data, order_sequence: parseInt(e.target.value) || 1})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Contenido específico según el tipo */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center mb-3">
                            <span className="text-lg mr-2">{selectedContentType?.emoji}</span>
                            <h4 className="font-medium text-gray-800">
                                Contenido: {selectedContentType?.label}
                            </h4>
                        </div>

                        {(data.content_type === 'video' || data.content_type === 'mixed') && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    🔗 URL del Video {data.content_type === 'video' ? '*' : ''}
                                </label>
                                <input
                                    type="url"
                                    value={data.content_url}
                                    onChange={(e) => setData({...data, content_url: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                    placeholder="https://youtube.com/watch?v=..."
                                    disabled={loading}
                                />
                                {errors.content_url && <p className="text-red-500 text-xs mt-1">{errors.content_url}</p>}
                                <p className="text-xs text-gray-500 mt-1">
                                    Soporta YouTube, Vimeo, y otras plataformas de video
                                </p>
                            </div>
                        )}

                        {(data.content_type === 'text' || data.content_type === 'mixed') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    📄 Contenido de Texto {data.content_type === 'text' ? '*' : ''}
                                </label>
                                <textarea
                                    value={data.content_text}
                                    onChange={(e) => setData({...data, content_text: e.target.value})}
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                    placeholder="Escribe el contenido de la clase aquí... (soporta Markdown)"
                                    disabled={loading}
                                />
                                {errors.content_text && <p className="text-red-500 text-xs mt-1">{errors.content_text}</p>}
                                <p className="text-xs text-gray-500 mt-1">
                                    Puedes usar Markdown para formato (negrita, cursiva, listas, etc.)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Publicar */}
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="class_is_published"
                                    checked={data.is_published}
                                    onChange={(e) => {
                                        console.log('✅ Class Checkbox clicked:', e.target.checked);
                                        console.log('📋 Previous state:', data.is_published);
                                        setData({...data, is_published: e.target.checked});
                                    }}
                                    className="h-5 w-5 rounded border-2 border-purple-300 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 bg-white checked:bg-purple-600 checked:border-purple-600"
                                    disabled={loading}
                                />
                            </div>
                            <label htmlFor="class_is_published" className="cursor-pointer select-none">
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg">
                                        {data.is_published ? '🟢' : '🔴'}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-800">
                                        {data.is_published ? 'PUBLICADA' : 'BORRADOR'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    {data.is_published 
                                        ? 'La clase es visible para estudiantes' 
                                        : 'La clase está oculta (solo visible para ti)'
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
                <div className="flex gap-3 p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-md hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <span>🎬</span>
                                <span>{classItem?.id ? 'Actualizar' : 'Crear'} Clase</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassModal;