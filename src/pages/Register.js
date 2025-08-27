import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
    BookOpen,
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    Phone,
    UserCheck
} from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'student'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);

    const { register, loading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Verificar coincidencia de contraseñas
        if (name === 'confirmPassword' || name === 'password') {
            const password = name === 'password' ? value : formData.password;
            const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;
            setPasswordMatch(password === confirmPassword || confirmPassword === '');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setPasswordMatch(false);
            return;
        }

        try {
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    const roleOptions = [
        { value: 'student', label: 'Estudiante', description: 'Acceso a cursos y contenido educativo' },
        { value: 'instructor', label: 'Instructor', description: 'Crear y gestionar cursos' },
        { value: 'admin', label: 'Administrador', description: 'Acceso completo al sistema' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-lime-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-neutral-900" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900">Crear Cuenta</h1>
                        <p className="text-neutral-600 mt-1">Centro de Formación Desarrollo Agropecuario</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Información Personal */}
                        <div>
                            <h3 className="text-lg font-medium text-neutral-900 mb-4">Información Personal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Nombre *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className="pl-10 w-full"
                                            placeholder="Tu nombre"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Apellido *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className="pl-10 w-full"
                                            placeholder="Tu apellido"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información de Contacto */}
                        <div>
                            <h3 className="text-lg font-medium text-neutral-900 mb-4">Información de Contacto</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Correo Electrónico *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="pl-10 w-full"
                                            placeholder="tu@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Teléfono
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="pl-10 w-full"
                                            placeholder="+593 99 999 9999"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tipo de Cuenta */}
                        <div>
                            <h3 className="text-lg font-medium text-neutral-900 mb-4">Tipo de Cuenta</h3>
                            <div className="space-y-3">
                                {roleOptions.map((role) => (
                                    <label
                                        key={role.value}
                                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            formData.role === role.value
                                                ? 'border-yellow-400 bg-yellow-50'
                                                : 'border-neutral-200 hover:border-neutral-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role.value}
                                            checked={formData.role === role.value}
                                            onChange={handleChange}
                                            className="mt-1 text-yellow-400 focus:ring-yellow-400"
                                        />
                                        <div className="ml-3">
                                            <div className="flex items-center">
                                                <UserCheck className="w-5 h-5 text-neutral-600 mr-2" />
                                                <span className="font-medium text-neutral-900">{role.label}</span>
                                            </div>
                                            <p className="text-sm text-neutral-600 mt-1">{role.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Contraseñas */}
                        <div>
                            <h3 className="text-lg font-medium text-neutral-900 mb-4">Seguridad</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Contraseña *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="pl-10 pr-10 w-full"
                                            placeholder="Mínimo 6 caracteres"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Confirmar Contraseña *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`pl-10 pr-10 w-full ${
                                                !passwordMatch && formData.confirmPassword
                                                    ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                                                    : ''
                                            }`}
                                            placeholder="Repite tu contraseña"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {!passwordMatch && formData.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">Las contraseñas no coinciden</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !passwordMatch}
                            className="w-full btn-primary py-3 disabled:opacity-50"
                        >
                            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center space-y-2">
                        <Link to="/login" className="text-yellow-600 hover:text-yellow-700 font-medium">
                            ¿Ya tienes cuenta? Inicia sesión
                        </Link>
                        <div className="text-sm text-neutral-500">
                            <Link to="/" className="hover:text-neutral-700">
                                ← Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;