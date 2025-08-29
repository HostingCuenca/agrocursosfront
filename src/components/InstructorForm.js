import React, { useState, useEffect } from 'react';
import { Save, X, Eye, EyeOff } from 'lucide-react';

const InstructorForm = ({ instructor = null, onSubmit, onCancel, isCreating = true }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        country: '',
        specialization: '',
        bio: ''
    });
    
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Inicializar formulario con datos del instructor si está editando
    useEffect(() => {
        if (instructor && !isCreating) {
            setFormData({
                email: instructor.email || '',
                password: '', // No mostrar contraseña existente
                first_name: instructor.first_name || '',
                last_name: instructor.last_name || '',
                phone: instructor.phone || '',
                country: instructor.country || '',
                specialization: instructor.specialization || '',
                bio: instructor.bio || ''
            });
        }
    }, [instructor, isCreating]);

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

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        // Email requerido y formato válido
        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'El formato del email no es válido';
        }

        // Contraseña requerida solo al crear
        if (isCreating && !formData.password.trim()) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Nombre y apellido requeridos
        if (!formData.first_name.trim()) {
            newErrors.first_name = 'El nombre es requerido';
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = 'El apellido es requerido';
        }

        // Validación de teléfono (opcional pero si se proporciona debe ser válido)
        if (formData.phone && !/^[\+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'El formato del teléfono no es válido';
        }

        // Biografía no debe exceder 1000 caracteres
        if (formData.bio && formData.bio.length > 1000) {
            newErrors.bio = 'La biografía no puede exceder 1000 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        
        try {
            // Crear datos para enviar (solo incluir campos con valor)
            const submitData = {};
            
            Object.keys(formData).forEach(key => {
                const value = formData[key].trim();
                if (value) {
                    submitData[key] = value;
                } else if (key === 'password' && !isCreating) {
                    // No incluir password vacío al editar
                    return;
                } else if (key === 'bio' || key === 'phone' || key === 'country' || key === 'specialization') {
                    // Incluir campos opcionales incluso si están vacíos para limpiarlos
                    submitData[key] = value;
                }
            });

            await onSubmit(submitData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Lista de países comunes para el select
    const countries = [
        'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador', 
        'El Salvador', 'España', 'Guatemala', 'Honduras', 'México', 'Nicaragua', 'Panamá', 
        'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela'
    ];

    // Lista de especializaciones comunes
    const specializations = [
        'Agricultura Sostenible',
        'Ganadería',
        'Avicultura',
        'Porcicultura',
        'Apicultura',
        'Cultivos Orgánicos',
        'Hidroponía',
        'Agroecología',
        'Manejo de Suelos',
        'Riego y Drenaje',
        'Control de Plagas',
        'Biotecnología Agrícola',
        'Agroindustria',
        'Desarrollo Rural'
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                    </label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.first_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nombre del instructor"
                    />
                    {errors.first_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                    )}
                </div>

                {/* Apellido */}
                <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido *
                    </label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.last_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Apellido del instructor"
                    />
                    {errors.last_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                    )}
                </div>
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="email@ejemplo.com"
                />
                {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
            </div>

            {/* Contraseña (solo al crear o si se quiere cambiar) */}
            {(isCreating || showPassword) && (
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña {isCreating ? '*' : '(dejar vacío para mantener actual)'}
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                                errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder={isCreating ? "Contraseña (mín. 6 caracteres)" : "Nueva contraseña (opcional)"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                </div>
            )}

            {/* Mostrar/ocultar campo de contraseña al editar */}
            {!isCreating && !showPassword && (
                <div>
                    <button
                        type="button"
                        onClick={() => setShowPassword(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        + Cambiar contraseña
                    </button>
                </div>
            )}

            {/* Información de contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teléfono */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+1 234 567 8900"
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                </div>

                {/* País */}
                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        País
                    </label>
                    <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Seleccionar país</option>
                        {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Especialización */}
            <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                    Especialización
                </label>
                <select
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Seleccionar especialización</option>
                    {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                    ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                    También puedes escribir una especialización personalizada
                </p>
                <input
                    type="text"
                    placeholder="O escribe una especialización personalizada"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    name="specialization"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                />
            </div>

            {/* Biografía */}
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Biografía
                </label>
                <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={1000}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.bio ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Descripción breve sobre la experiencia y especialidades del instructor..."
                />
                <div className="flex justify-between items-center mt-1">
                    {errors.bio ? (
                        <p className="text-red-500 text-sm">{errors.bio}</p>
                    ) : (
                        <div></div>
                    )}
                    <p className="text-sm text-gray-500">
                        {formData.bio.length}/1000
                    </p>
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
                    {submitting ? 'Guardando...' : (isCreating ? 'Crear Instructor' : 'Actualizar Instructor')}
                </button>
            </div>
        </form>
    );
};

export default InstructorForm;