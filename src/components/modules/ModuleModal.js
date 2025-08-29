import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ModuleModal = ({ isOpen, onClose, module, courseId, onSave, loading }) => {
    const [data, setData] = useState({
        title: '',
        description: '',
        order_sequence: 1,
        is_published: true
    });

    const [errors, setErrors] = useState({});

    // Cargar datos cuando se abre
    useEffect(() => {
        if (isOpen) {
            if (module?.id) {
                // EDITAR - cargar datos del módulo
                console.log('EDIT MODE - Loading module:', module.id);
                setData({
                    title: module.title || '',
                    description: module.description || '',
                    order_sequence: Number(module.order_sequence) || 1,
                    is_published: module.is_published === true || module.is_published === 'true'
                });
            } else {
                // CREAR - reset
                console.log('CREATE MODE - Reset form');
                setData({
                    title: '',
                    description: '',
                    order_sequence: 1,
                    is_published: true
                });
            }
            setErrors({});
        }
    }, [isOpen, module]);

    const handleSave = async () => {
        console.log('SAVING - Mode:', module?.id ? 'EDIT' : 'CREATE');
        console.log('Module ID:', module?.id);
        console.log('Course ID:', courseId);
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

        // Preparar datos limpios
        const payload = {
            title: data.title.trim(),
            description: data.description.trim(),
            order_sequence: Number(data.order_sequence),
            is_published: Boolean(data.is_published)
        };

        console.log('API Payload:', payload);

        try {
            if (module?.id) {
                console.log('Calling UPDATE with ID:', module.id);
                await onSave(module.id, payload);
            } else {
                console.log('Calling CREATE for course:', courseId);
                await onSave(courseId, payload);
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
                <div className="flex justify-between items-center p-4 border-b border-blue-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                        <span className="mr-2">📚</span>
                        {module?.id ? 'Editar Módulo' : 'Nuevo Módulo'}
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
                    {/* Título */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            📝 Título del Módulo *
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData({...data, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Introducción a la Agricultura Orgánica"
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
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe el contenido y objetivos del módulo..."
                            disabled={loading}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Orden en que aparecerá el módulo en el curso
                        </p>
                    </div>

                    {/* Publicar */}
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="module_is_published"
                                    checked={data.is_published}
                                    onChange={(e) => {
                                        console.log('✅ Module Checkbox clicked:', e.target.checked);
                                        console.log('📋 Previous state:', data.is_published);
                                        setData({...data, is_published: e.target.checked});
                                    }}
                                    className="h-5 w-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 bg-white checked:bg-blue-600 checked:border-blue-600"
                                    disabled={loading}
                                />
                            </div>
                            <label htmlFor="module_is_published" className="cursor-pointer select-none">
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
                                        ? 'El módulo es visible para estudiantes' 
                                        : 'El módulo está oculto (solo visible para ti)'
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
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <span>📚</span>
                                <span>{module?.id ? 'Actualizar' : 'Crear'} Módulo</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModuleModal;