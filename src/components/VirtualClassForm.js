import React, { useState, useEffect } from 'react';
import { Save, X, Video, Link, Users, Clock, Calendar, Info } from 'lucide-react';
import { virtualClassService } from '../services/virtualClassService';

const VirtualClassForm = ({ 
    courseId, 
    virtualClass = null, 
    onSubmit, 
    onCancel, 
    isCreating = true 
}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        meeting_url: '',
        meeting_id: '',
        meeting_password: '',
        scheduled_at: '',
        duration_minutes: '60',
        max_participants: '50'
    });
    
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Inicializar formulario con datos de la clase virtual si está editando
    useEffect(() => {
        if (virtualClass && !isCreating) {
            // Formatear la fecha para datetime-local input
            const scheduledDate = new Date(virtualClass.scheduled_at);
            const formattedDateTime = scheduledDate.toISOString().slice(0, 16);
            
            setFormData({
                title: virtualClass.title || '',
                description: virtualClass.description || '',
                meeting_url: virtualClass.meeting_url || '',
                meeting_id: virtualClass.meeting_id || '',
                meeting_password: virtualClass.meeting_password || '',
                scheduled_at: formattedDateTime,
                duration_minutes: virtualClass.duration_minutes?.toString() || '60',
                max_participants: virtualClass.max_participants?.toString() || '50'
            });
        }
    }, [virtualClass, isCreating]);

    // Manejar cambios en campos del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validar formulario usando el servicio
    const validateForm = () => {
        const validation = virtualClassService.validateClassData(formData, !isCreating);
        setErrors(validation.errors);
        return validation.isValid;
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        
        try {
            // Preparar datos para enviar
            const submitData = {
                ...formData,
                duration_minutes: parseInt(formData.duration_minutes),
                max_participants: parseInt(formData.max_participants),
                scheduled_at: new Date(formData.scheduled_at).toISOString()
            };

            await onSubmit(submitData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Sugerencias de plataformas de reunión
    const meetingPlatforms = [
        { name: 'Zoom', urlPattern: 'https://zoom.us/j/', placeholder: 'https://zoom.us/j/123456789' },
        { name: 'Google Meet', urlPattern: 'https://meet.google.com/', placeholder: 'https://meet.google.com/abc-defg-hij' },
        { name: 'Microsoft Teams', urlPattern: 'https://teams.microsoft.com/', placeholder: 'https://teams.microsoft.com/l/meetup-join/...' },
        { name: 'Jitsi Meet', urlPattern: 'https://meet.jit.si/', placeholder: 'https://meet.jit.si/MiClaseVirtual' }
    ];

    // Generar sugerencias de título basadas en el horario
    const getTitleSuggestions = () => {
        if (!formData.scheduled_at) return [];
        
        const date = new Date(formData.scheduled_at);
        const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
        const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        return [
            `Clase Virtual - ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`,
            `Sesión en Vivo - ${time}`,
            `Conferencia Virtual`,
            `Clase Interactiva Online`
        ];
    };

    const titleSuggestions = getTitleSuggestions();

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Información Básica
                </h3>

                {/* Título */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Título de la Clase *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ej: Introducción a la Agricultura Sostenible"
                    />
                    {errors.title && (
                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                    
                    {/* Sugerencias de título */}
                    {titleSuggestions.length > 0 && !formData.title && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-1">Sugerencias:</p>
                            <div className="flex flex-wrap gap-2">
                                {titleSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, title: suggestion }))}
                                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Descripción */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Descripción opcional de los temas que se cubrirán en la clase..."
                    />
                </div>
            </div>

            {/* Configuración de la reunión */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
                    <Video className="w-5 h-5 mr-2" />
                    Configuración de la Reunión
                </h3>

                {/* URL de la reunión */}
                <div>
                    <label htmlFor="meeting_url" className="block text-sm font-medium text-gray-700 mb-2">
                        URL de la Reunión *
                    </label>
                    <input
                        type="url"
                        id="meeting_url"
                        name="meeting_url"
                        value={formData.meeting_url}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.meeting_url ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="https://zoom.us/j/123456789"
                    />
                    {errors.meeting_url && (
                        <p className="text-red-500 text-sm mt-1">{errors.meeting_url}</p>
                    )}
                    
                    {/* Sugerencias de plataformas */}
                    <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Plataformas compatibles:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {meetingPlatforms.map((platform, index) => (
                                <div key={index} className="text-sm">
                                    <span className="font-medium">{platform.name}:</span>
                                    <br />
                                    <span className="text-gray-600">{platform.placeholder}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ID y contraseña de reunión */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="meeting_id" className="block text-sm font-medium text-gray-700 mb-2">
                            ID de Reunión
                        </label>
                        <input
                            type="text"
                            id="meeting_id"
                            name="meeting_id"
                            value={formData.meeting_id}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="123456789"
                        />
                        <p className="text-sm text-gray-500 mt-1">Opcional - ID numérico de la reunión</p>
                    </div>

                    <div>
                        <label htmlFor="meeting_password" className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña de Reunión
                        </label>
                        <input
                            type="text"
                            id="meeting_password"
                            name="meeting_password"
                            value={formData.meeting_password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="contraseña123"
                        />
                        <p className="text-sm text-gray-500 mt-1">Opcional - Para mayor seguridad</p>
                    </div>
                </div>
            </div>

            {/* Programación */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Programación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fecha y hora */}
                    <div>
                        <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha y Hora *
                        </label>
                        <input
                            type="datetime-local"
                            id="scheduled_at"
                            name="scheduled_at"
                            value={formData.scheduled_at}
                            onChange={handleInputChange}
                            min={new Date().toISOString().slice(0, 16)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.scheduled_at ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.scheduled_at && (
                            <p className="text-red-500 text-sm mt-1">{errors.scheduled_at}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">Los estudiantes podrán unirse 15 min antes</p>
                    </div>

                    {/* Duración */}
                    <div>
                        <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                            Duración (minutos) *
                        </label>
                        <select
                            id="duration_minutes"
                            name="duration_minutes"
                            value={formData.duration_minutes}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.duration_minutes ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="15">15 minutos</option>
                            <option value="30">30 minutos</option>
                            <option value="45">45 minutos</option>
                            <option value="60">1 hora</option>
                            <option value="90">1.5 horas</option>
                            <option value="120">2 horas</option>
                            <option value="180">3 horas</option>
                        </select>
                        {errors.duration_minutes && (
                            <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>
                        )}
                        
                        {/* También permitir input manual */}
                        <div className="mt-2">
                            <label className="block text-sm text-gray-600">O especifica duración personalizada:</label>
                            <input
                                type="number"
                                min="15"
                                max="480"
                                value={formData.duration_minutes}
                                onChange={handleInputChange}
                                name="duration_minutes"
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1"
                                placeholder="Ej: 75"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Configuración de participantes */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Participantes
                </h3>

                <div>
                    <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
                        Máximo de Participantes
                    </label>
                    <select
                        id="max_participants"
                        name="max_participants"
                        value={formData.max_participants}
                        onChange={handleInputChange}
                        className={`w-full md:w-64 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.max_participants ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="10">10 participantes</option>
                        <option value="25">25 participantes</option>
                        <option value="50">50 participantes</option>
                        <option value="100">100 participantes</option>
                        <option value="200">200 participantes</option>
                        <option value="500">500 participantes</option>
                        <option value="1000">1000 participantes</option>
                    </select>
                    {errors.max_participants && (
                        <p className="text-red-500 text-sm mt-1">{errors.max_participants}</p>
                    )}
                    
                    {/* Input personalizado */}
                    <div className="mt-2">
                        <label className="block text-sm text-gray-600">O especifica cantidad personalizada:</label>
                        <input
                            type="number"
                            min="1"
                            max="1000"
                            value={formData.max_participants}
                            onChange={handleInputChange}
                            name="max_participants"
                            className="w-full md:w-64 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1"
                            placeholder="Ej: 75"
                        />
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                        <h4 className="text-blue-800 font-medium">Información Importante</h4>
                        <ul className="text-blue-700 text-sm mt-1 space-y-1">
                            <li>• Los estudiantes deben registrarse para recibir acceso a la clase</li>
                            <li>• Solo estudiantes inscritos en el curso pueden registrarse</li>
                            <li>• El enlace estará disponible 15 minutos antes del inicio</li>
                            <li>• La asistencia se registrará automáticamente</li>
                            <li>• Puedes editar los detalles hasta el inicio de la clase</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                </button>
                
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {submitting 
                        ? 'Guardando...' 
                        : isCreating 
                            ? 'Crear Clase Virtual' 
                            : 'Actualizar Clase Virtual'
                    }
                </button>
            </div>
        </form>
    );
};

export default VirtualClassForm;