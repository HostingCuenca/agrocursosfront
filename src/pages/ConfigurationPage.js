import React, { useState, useEffect } from 'react';
import {
    Settings, Users, UserCheck, Key, Search, RefreshCw,
    Edit, Save, X, Eye, EyeOff, AlertCircle, CheckCircle,
    User, Mail, Phone, MapPin, BookOpen, Award, Activity,
    Shield, Clock, DollarSign, TrendingUp, Filter
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { userConfigService } from '../services/userConfigService';
import useAuthStore from '../store/authStore';
import { useRolePermissions } from '../hooks/useRolePermissions';

const ConfigurationPage = () => {
    const { user } = useAuthStore();
    const permissions = useRolePermissions();

    // Estados principales
    const [activeView, setActiveView] = useState(permissions.isAdmin ? 'users' : 'profile');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Estados para admin - gestión de usuarios
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [resetPasswordModal, setResetPasswordModal] = useState(false);

    // Estados para usuario - perfil propio
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country: '',
        specialization: '',
        bio: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        if (permissions.isAdmin && activeView === 'users') {
            loadAllUsers();
        } else if (activeView === 'profile') {
            loadMyProfile();
        }
    }, [permissions.isAdmin, activeView]);

    // ========== FUNCIONES PARA ADMIN ==========

    const loadAllUsers = async (search = '') => {
        try {
            setLoading(true);
            setError(null);
            const params = search ? { search, limit: 50 } : { limit: 50 };
            const response = await userConfigService.getAllStudents(params);
            
            console.log('🏗️ ConfigurationPage - loadAllUsers response:', response);
            if (response.success) {
                console.log('🏗️ ConfigurationPage - Setting users:', response.students);
                setUsers(response.students || []);
                console.log('🏗️ ConfigurationPage - Users set in state');
            } else {
                console.log('🏗️ ConfigurationPage - Response not successful:', response);
            }
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Error al cargar la lista de usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadAllUsers(searchTerm);
    };

    const openResetPasswordModal = (selectedUser) => {
        setSelectedUser(selectedUser);
        setResetPasswordModal(true);
    };

    const handleResetPassword = async () => {
        if (!selectedUser) return;
        
        try {
            setLoading(true);
            const newPassword = userConfigService.generateSecurePassword(12);
            
            await userConfigService.resetStudentPassword(selectedUser.user_id, newPassword);
            
            setSuccess(`Contraseña reseteada exitosamente para ${selectedUser.first_name} ${selectedUser.last_name}. Nueva contraseña: ${newPassword}`);
            setResetPasswordModal(false);
            setSelectedUser(null);
            
            // Actualizar la lista
            loadAllUsers(searchTerm);
        } catch (err) {
            console.error('Error resetting password:', err);
            setError('Error al resetear la contraseña');
        } finally {
            setLoading(false);
        }
    };

    // ========== FUNCIONES PARA USUARIO ==========

    const loadMyProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userConfigService.getMyProfile();
            
            if (response.success) {
                setProfile(response.profile);
                setFormData({
                    first_name: response.profile.first_name || '',
                    last_name: response.profile.last_name || '',
                    email: response.profile.email || '',
                    phone: response.profile.phone || '',
                    country: response.profile.country || '',
                    specialization: response.profile.specialization || '',
                    bio: response.profile.bio || '',
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
            }
        } catch (err) {
            console.error('Error loading profile:', err);
            setError('Error al cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        if (!formData.first_name.trim()) {
            return { isValid: false, message: 'El nombre es obligatorio' };
        }
        if (!formData.last_name.trim()) {
            return { isValid: false, message: 'El apellido es obligatorio' };
        }
        if (!userConfigService.validateEmail(formData.email)) {
            return { isValid: false, message: 'Email inválido' };
        }
        if (formData.phone && !userConfigService.validatePhone(formData.phone)) {
            return { isValid: false, message: 'Formato de teléfono inválido' };
        }
        if (formData.new_password && formData.new_password !== formData.confirm_password) {
            return { isValid: false, message: 'Las contraseñas no coinciden' };
        }
        if (formData.new_password) {
            const passwordValidation = userConfigService.validatePassword(formData.new_password);
            if (!passwordValidation.isValid) {
                return { isValid: false, message: passwordValidation.message };
            }
        }
        return { isValid: true, message: '' };
    };

    const handleSaveProfile = async () => {
        const validation = validateForm();
        if (!validation.isValid) {
            setError(validation.message);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const updateData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                country: formData.country,
                specialization: formData.specialization,
                bio: formData.bio
            };

            // Solo incluir contraseñas si se va a cambiar
            if (formData.new_password) {
                updateData.current_password = formData.current_password;
                updateData.new_password = formData.new_password;
            }

            const response = await userConfigService.updateProfile(updateData);
            
            if (response.success) {
                setSuccess('Perfil actualizado exitosamente');
                setEditMode(false);
                loadMyProfile(); // Recargar datos
                
                // Limpiar contraseñas
                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                }));
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Configuración
                            </h1>
                            <p className="text-gray-600">
                                {permissions.isAdmin 
                                    ? 'Administra usuarios del sistema y tu perfil personal'
                                    : 'Administra tu perfil y configuración personal'
                                }
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => activeView === 'users' ? loadAllUsers(searchTerm) : loadMyProfile()}
                                disabled={loading}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </button>
                        </div>
                    </div>

                    {/* Tabs de navegación (solo si es admin) */}
                    {permissions.isAdmin && (
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                {[
                                    { id: 'users', label: 'Gestión de Usuarios', icon: Users },
                                    { id: 'profile', label: 'Mi Perfil', icon: User }
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveView(tab.id);
                                                clearMessages();
                                            }}
                                            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                activeView === tab.id
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    )}
                </div>

                {/* Mensajes de estado */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-700">{error}</p>
                            <button 
                                onClick={clearMessages}
                                className="ml-auto text-red-600 hover:text-red-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <p className="text-green-700">{success}</p>
                            <button 
                                onClick={clearMessages}
                                className="ml-auto text-green-600 hover:text-green-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Contenido basado en vista activa */}
                {activeView === 'users' && permissions.isAdmin && (
                    <div>
                        {/* Búsqueda de usuarios */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, email o teléfono..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Search className="w-4 h-4 mr-2 inline" />
                                    Buscar
                                </button>
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('');
                                            loadAllUsers('');
                                        }}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Lista de usuarios */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Usuarios del Sistema ({users.length})
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Administra todos los usuarios registrados en la plataforma
                                </p>
                            </div>
                            
                            {loading && !users.length ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Cargando usuarios...</p>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">
                                        {searchTerm ? 'No se encontraron usuarios con esos criterios' : 'No hay usuarios registrados'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {users.map((user) => {
                                        const stats = userConfigService.formatUserStats(user);
                                        const status = userConfigService.getUserStatus(user);
                                        
                                        return (
                                            <div key={user.user_id} className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <User className="w-6 h-6 text-gray-600" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <h4 className="font-semibold text-gray-900">
                                                                    {user.first_name} {user.last_name}
                                                                </h4>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
                                                                    {status.text}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 flex items-center">
                                                                <Mail className="w-3 h-3 mr-1" />
                                                                {user.email}
                                                                {user.phone && (
                                                                    <>
                                                                        <span className="mx-2">•</span>
                                                                        <Phone className="w-3 h-3 mr-1" />
                                                                        {user.phone}
                                                                    </>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-right text-sm">
                                                            <div className="flex items-center text-gray-600">
                                                                <BookOpen className="w-3 h-3 mr-1" />
                                                                {stats.enrollments} cursos
                                                            </div>
                                                            <div className="flex items-center text-gray-600">
                                                                <DollarSign className="w-3 h-3 mr-1" />
                                                                {formatCurrency(stats.totalSpent)}
                                                            </div>
                                                        </div>
                                                        
                                                        <button
                                                            onClick={() => openResetPasswordModal(user)}
                                                            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                                        >
                                                            <Key className="w-4 h-4 mr-1" />
                                                            Reset
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Estadísticas expandidas */}
                                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <Award className="w-4 h-4 mr-2 text-yellow-500" />
                                                        {stats.certificates} certificados
                                                    </div>
                                                    <div className="flex items-center">
                                                        <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                                                        {stats.avgProgress}% progreso
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                                        Último acceso: {stats.lastActivity}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Shield className="w-4 h-4 mr-2 text-purple-500" />
                                                        Rol: {user.role}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeView === 'profile' && (
                    <div>
                        {/* Información del perfil */}
                        <div className="bg-white rounded-lg border border-gray-200 mb-6">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Mi Perfil Personal
                                    </h3>
                                    <button
                                        onClick={() => editMode ? setEditMode(false) : setEditMode(true)}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        {editMode ? (
                                            <>
                                                <X className="w-4 h-4 mr-2" />
                                                Cancelar
                                            </>
                                        ) : (
                                            <>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Editar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {loading && !profile ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Cargando perfil...</p>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Información básica */}
                                        <div className="space-y-4">
                                            <h4 className="text-md font-semibold text-gray-900 mb-4">
                                                Información Personal
                                            </h4>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nombre
                                                    </label>
                                                    {editMode ? (
                                                        <input
                                                            type="text"
                                                            value={formData.first_name}
                                                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    ) : (
                                                        <p className="px-3 py-2 bg-gray-50 rounded-lg">
                                                            {profile?.first_name || 'No especificado'}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Apellido
                                                    </label>
                                                    {editMode ? (
                                                        <input
                                                            type="text"
                                                            value={formData.last_name}
                                                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    ) : (
                                                        <p className="px-3 py-2 bg-gray-50 rounded-lg">
                                                            {profile?.last_name || 'No especificado'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                                                    {profile?.email} (no editable)
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Teléfono
                                                </label>
                                                {editMode ? (
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                                        placeholder="+593 99 123 4567"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                ) : (
                                                    <p className="px-3 py-2 bg-gray-50 rounded-lg">
                                                        {profile?.phone || 'No especificado'}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    País
                                                </label>
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        value={formData.country}
                                                        onChange={(e) => handleInputChange('country', e.target.value)}
                                                        placeholder="Ecuador"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                ) : (
                                                    <p className="px-3 py-2 bg-gray-50 rounded-lg">
                                                        {profile?.country || 'No especificado'}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Especialización
                                                </label>
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        value={formData.specialization}
                                                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                                                        placeholder="Agricultura Orgánica"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                ) : (
                                                    <p className="px-3 py-2 bg-gray-50 rounded-lg">
                                                        {profile?.specialization || 'No especificado'}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Biografía
                                                </label>
                                                {editMode ? (
                                                    <textarea
                                                        value={formData.bio}
                                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                                        placeholder="Cuéntanos sobre ti..."
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                ) : (
                                                    <p className="px-3 py-2 bg-gray-50 rounded-lg min-h-[80px]">
                                                        {profile?.bio || 'No especificado'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Cambio de contraseña y estadísticas */}
                                        <div className="space-y-4">
                                            {editMode && (
                                                <div>
                                                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                                                        Cambiar Contraseña (Opcional)
                                                    </h4>
                                                    
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Contraseña Actual
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type={showPasswords.current ? "text" : "password"}
                                                                    value={formData.current_password}
                                                                    onChange={(e) => handleInputChange('current_password', e.target.value)}
                                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                                >
                                                                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Nueva Contraseña
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type={showPasswords.new ? "text" : "password"}
                                                                    value={formData.new_password}
                                                                    onChange={(e) => handleInputChange('new_password', e.target.value)}
                                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                                >
                                                                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Confirmar Nueva Contraseña
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type={showPasswords.confirm ? "text" : "password"}
                                                                    value={formData.confirm_password}
                                                                    onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                                >
                                                                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Estadísticas del usuario */}
                                            {profile && !editMode && (
                                                <div>
                                                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                                                        Mis Estadísticas
                                                    </h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                            <span className="flex items-center text-blue-800">
                                                                <BookOpen className="w-4 h-4 mr-2" />
                                                                Cursos Inscritos
                                                            </span>
                                                            <span className="font-semibold text-blue-600">
                                                                {profile.enrollments_count || 0}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                            <span className="flex items-center text-green-800">
                                                                <Award className="w-4 h-4 mr-2" />
                                                                Certificados
                                                            </span>
                                                            <span className="font-semibold text-green-600">
                                                                {profile.certificates_count || 0}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                                            <span className="flex items-center text-purple-800">
                                                                <TrendingUp className="w-4 h-4 mr-2" />
                                                                Progreso Promedio
                                                            </span>
                                                            <span className="font-semibold text-purple-600">
                                                                {profile.avg_progress || 0}%
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                                            <span className="flex items-center text-orange-800">
                                                                <DollarSign className="w-4 h-4 mr-2" />
                                                                Total Invertido
                                                            </span>
                                                            <span className="font-semibold text-orange-600">
                                                                {formatCurrency(profile.total_spent)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botones de acción */}
                                    {editMode && (
                                        <div className="mt-6 flex items-center justify-end space-x-3">
                                            <button
                                                onClick={() => setEditMode(false)}
                                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={loading}
                                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal de confirmación para reset de contraseña */}
                {resetPasswordModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Confirmar Reset de Contraseña
                            </h3>
                            <p className="text-gray-600 mb-6">
                                ¿Estás seguro de que quieres resetear la contraseña de{' '}
                                <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>?
                                <br /><br />
                                Se generará una nueva contraseña automáticamente que deberás compartir con el usuario.
                            </p>
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setResetPasswordModal(false);
                                        setSelectedUser(null);
                                    }}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {loading ? 'Reseteando...' : 'Confirmar Reset'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ConfigurationPage;