import React, { useState, useEffect } from 'react';
import { 
    Plus, Edit, Trash2, Eye, Save, X, 
    Palette, FileImage
} from 'lucide-react';
import certificateService from '../../services/certificateService';

const CertificateTemplateManager = ({ permissions = {} }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [previewTemplate, setPreviewTemplate] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        template_config: {
            title: { x: 400, y: 120, size: 36, color: '#000000', font: 'serif' },
            student_name: { x: 400, y: 200, size: 24, color: '#000000', font: 'serif' },
            course_title: { x: 400, y: 280, size: 20, color: '#000000', font: 'serif' },
            instructor_name: { x: 400, y: 320, size: 16, color: '#666666', font: 'sans-serif' },
            completion_date: { x: 400, y: 360, size: 16, color: '#666666', font: 'sans-serif' },
            grade: { x: 400, y: 400, size: 16, color: '#000000', font: 'sans-serif' }
        },
        preview_image: ''
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const response = await certificateService.getCertificateTemplates();
            setTemplates(response.templates || []);
        } catch (error) {
            setError('Error al cargar las plantillas: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async () => {
        if (!formData.name.trim() || !formData.category.trim()) {
            setError('Nombre y categoría son obligatorios');
            return;
        }

        try {
            setLoading(true);
            await certificateService.createCertificateTemplate(formData);
            setShowCreateModal(false);
            resetForm();
            await loadTemplates();
            setError(null);
        } catch (error) {
            setError('Error al crear plantilla: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTemplate = async () => {
        if (!editingTemplate) return;

        try {
            setLoading(true);
            await certificateService.updateCertificateTemplate(editingTemplate.id, formData);
            setShowEditModal(false);
            setEditingTemplate(null);
            resetForm();
            await loadTemplates();
            setError(null);
        } catch (error) {
            setError('Error al actualizar plantilla: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) return;

        try {
            setLoading(true);
            await certificateService.deleteCertificateTemplate(templateId);
            await loadTemplates();
            setError(null);
        } catch (error) {
            setError('Error al eliminar plantilla: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            description: '',
            template_config: {
                title: { x: 400, y: 120, size: 36, color: '#000000', font: 'serif' },
                student_name: { x: 400, y: 200, size: 24, color: '#000000', font: 'serif' },
                course_title: { x: 400, y: 280, size: 20, color: '#000000', font: 'serif' },
                instructor_name: { x: 400, y: 320, size: 16, color: '#666666', font: 'sans-serif' },
                completion_date: { x: 400, y: 360, size: 16, color: '#666666', font: 'sans-serif' },
                grade: { x: 400, y: 400, size: 16, color: '#000000', font: 'sans-serif' }
            },
            preview_image: ''
        });
    };

    const startEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            category: template.category,
            description: template.description || '',
            template_config: template.template_config || formData.template_config,
            preview_image: template.preview_image || ''
        });
        setShowEditModal(true);
    };

    const updateConfigField = (field, property, value) => {
        setFormData(prev => ({
            ...prev,
            template_config: {
                ...prev.template_config,
                [field]: {
                    ...prev.template_config[field],
                    [property]: value
                }
            }
        }));
    };

    if (loading && templates.length === 0) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Plantillas de Certificados</h2>
                    <p className="text-neutral-600">Gestiona las plantillas para generar certificados personalizados</p>
                </div>
                
                {permissions.canCreateTemplate && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Plantilla
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div key={template.id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        {/* Vista previa de imagen */}
                        {template.preview_image && (
                            <div className="aspect-video bg-neutral-50 overflow-hidden">
                                <img 
                                    src={template.preview_image} 
                                    alt={`Vista previa de ${template.name}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.parentElement.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                        
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-neutral-900">{template.name}</h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {template.category}
                                </span>
                            </div>
                            
                            {template.description && (
                                <p className="text-sm text-neutral-600 mb-4">{template.description}</p>
                            )}

                            <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
                                <span>Creado: {new Date(template.created_at).toLocaleDateString()}</span>
                                {template.updated_at && template.updated_at !== template.created_at && (
                                    <span>Actualizado: {new Date(template.updated_at).toLocaleDateString()}</span>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setPreviewTemplate(template)}
                                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-neutral-700 bg-neutral-100 rounded hover:bg-neutral-200 transition-colors"
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Ver
                                </button>
                                
                                {permissions.canEditTemplate && (
                                    <button
                                        onClick={() => startEdit(template)}
                                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Editar
                                    </button>
                                )}
                                
                                {permissions.canDeleteTemplate && (
                                    <button
                                        onClick={() => handleDeleteTemplate(template.id)}
                                        className="flex items-center justify-center p-2 text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12">
                        <FileImage className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                            No hay plantillas disponibles
                        </h3>
                        <p className="text-neutral-600 mb-4">
                            Crea tu primera plantilla para personalizar los certificados
                        </p>
                        {permissions.canCreateTemplate && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Plantilla
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Create Template Modal */}
            {showCreateModal && (
                <TemplateModal
                    title="Crear Nueva Plantilla"
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleCreateTemplate}
                    onClose={() => {
                        setShowCreateModal(false);
                        resetForm();
                    }}
                    loading={loading}
                    updateConfigField={updateConfigField}
                />
            )}

            {/* Edit Template Modal */}
            {showEditModal && editingTemplate && (
                <TemplateModal
                    title="Editar Plantilla"
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleUpdateTemplate}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingTemplate(null);
                        resetForm();
                    }}
                    loading={loading}
                    updateConfigField={updateConfigField}
                    isEdit={true}
                />
            )}

            {/* Preview Modal */}
            {previewTemplate && (
                <PreviewModal
                    template={previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                />
            )}
        </div>
    );
};

// Template Modal Component
const TemplateModal = ({ 
    title, formData, setFormData, onSave, onClose, loading, updateConfigField, isEdit = false 
}) => {
    const fields = [
        { key: 'title', label: 'Título del Certificado' },
        { key: 'student_name', label: 'Nombre del Estudiante' },
        { key: 'course_title', label: 'Título del Curso' },
        { key: 'instructor_name', label: 'Nombre del Instructor' },
        { key: 'completion_date', label: 'Fecha de Finalización' },
        { key: 'grade', label: 'Calificación' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-neutral-500 hover:text-neutral-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Nombre de la Plantilla *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: Plantilla Agricultura"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Categoría *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar categoría</option>
                                <option value="agricultura">Agricultura</option>
                                <option value="ganaderia">Ganadería</option>
                                <option value="horticultura">Horticultura</option>
                                <option value="apicultura">Apicultura</option>
                                <option value="general">General</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Descripción opcional de la plantilla"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            URL de Imagen de Vista Previa
                        </label>
                        <input
                            type="url"
                            value={formData.preview_image}
                            onChange={(e) => setFormData({ ...formData, preview_image: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/certificate-template.jpg"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                            URL de la imagen que se usará como vista previa de la plantilla
                        </p>
                    </div>

                    {/* Template Configuration */}
                    <div>
                        <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                            <Palette className="w-5 h-5 mr-2" />
                            Configuración de Elementos
                        </h4>

                        <div className="space-y-4">
                            {fields.map(({ key, label }) => (
                                <div key={key} className="p-4 bg-neutral-50 rounded-lg">
                                    <h5 className="font-medium text-neutral-900 mb-3">{label}</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <div>
                                            <label className="block text-xs text-neutral-600 mb-1">X</label>
                                            <input
                                                type="number"
                                                value={formData.template_config[key]?.x || 0}
                                                onChange={(e) => updateConfigField(key, 'x', parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-600 mb-1">Y</label>
                                            <input
                                                type="number"
                                                value={formData.template_config[key]?.y || 0}
                                                onChange={(e) => updateConfigField(key, 'y', parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-600 mb-1">Tamaño</label>
                                            <input
                                                type="number"
                                                value={formData.template_config[key]?.size || 16}
                                                onChange={(e) => updateConfigField(key, 'size', parseInt(e.target.value) || 16)}
                                                className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-600 mb-1">Color</label>
                                            <input
                                                type="color"
                                                value={formData.template_config[key]?.color || '#000000'}
                                                onChange={(e) => updateConfigField(key, 'color', e.target.value)}
                                                className="w-full h-8 border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-600 mb-1">Fuente</label>
                                            <select
                                                value={formData.template_config[key]?.font || 'serif'}
                                                onChange={(e) => updateConfigField(key, 'font', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="serif">Serif</option>
                                                <option value="sans-serif">Sans-serif</option>
                                                <option value="monospace">Monospace</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t border-neutral-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSave}
                        disabled={loading || !formData.name.trim() || !formData.category.trim()}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Plantilla')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Preview Modal Component
const PreviewModal = ({ template, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                    <h3 className="text-lg font-semibold text-neutral-900">
                        Vista Previa: {template.name}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-neutral-500 hover:text-neutral-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Información de la plantilla */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-medium text-neutral-900">
                                {template.name}
                            </h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {template.category}
                            </span>
                        </div>
                        {template.description && (
                            <p className="text-neutral-600">{template.description}</p>
                        )}
                    </div>

                    {/* Vista previa de la imagen */}
                    {template.preview_image ? (
                        <div className="mb-6">
                            <h5 className="font-semibold text-neutral-900 mb-3">Vista Previa del Certificado:</h5>
                            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                                <img 
                                    src={template.preview_image} 
                                    alt={`Vista previa de ${template.name}`}
                                    className="w-full max-h-96 object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                <div 
                                    className="hidden p-8 text-center text-neutral-500"
                                    style={{ display: 'none' }}
                                >
                                    <FileImage className="w-16 h-16 mx-auto mb-2" />
                                    <p>No se pudo cargar la imagen de vista previa</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                                <FileImage className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                                <h5 className="text-lg font-medium text-neutral-900 mb-2">
                                    Sin imagen de vista previa
                                </h5>
                                <p className="text-neutral-600">
                                    Esta plantilla no tiene una imagen de vista previa configurada
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Configuración de la plantilla */}
                    {template.template_config && (
                        <div>
                            <h5 className="font-semibold text-neutral-900 mb-3">Configuración de Elementos:</h5>
                            <div className="bg-neutral-50 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(template.template_config).map(([field, config]) => (
                                        <div key={field} className="bg-white rounded-lg p-3 border border-neutral-200">
                                            <h6 className="font-medium text-neutral-900 mb-2 capitalize">
                                                {field.replace(/_/g, ' ')}
                                            </h6>
                                            <div className="space-y-1 text-sm text-neutral-600">
                                                <div>Posición: x:{config.x}, y:{config.y}</div>
                                                <div>Tamaño: {config.size}px</div>
                                                <div>Color: <span className="inline-block w-4 h-4 rounded border border-neutral-300 ml-1" style={{backgroundColor: config.color}}></span> {config.color}</div>
                                                <div>Fuente: {config.font}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información adicional */}
                    <div className="mt-6 pt-6 border-t border-neutral-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600">
                            <div>
                                <strong>Creado:</strong> {new Date(template.created_at).toLocaleDateString('es-ES')}
                            </div>
                            {template.updated_at && template.updated_at !== template.created_at && (
                                <div>
                                    <strong>Actualizado:</strong> {new Date(template.updated_at).toLocaleDateString('es-ES')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end p-4 border-t border-neutral-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CertificateTemplateManager;