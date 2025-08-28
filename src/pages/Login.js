import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { BookOpen, Mail, Lock, Eye, EyeOff, User, GraduationCap, Shield } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const { login, loading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    // Función para rellenar credenciales rápidamente
    const fillCredentials = (role) => {
        const credentials = {
            student: { email: 'test@test.com', password: '123456' },
            instructor: { email: 'instructor@test.com', password: '123456' },
            admin: { email: 'admin@test.com', password: '123456' }
        };
        setFormData(credentials[role]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-lime-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-neutral-900" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900">Iniciar Sesión</h1>
                        <p className="text-neutral-600 mt-1">Centro de Formación Desarrollo Agropecuario</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-10 w-full"
                                    placeholder="admin@cfda.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="pl-10 pr-10 w-full"
                                    placeholder="123456"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 disabled:opacity-50"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    {/* Credenciales de prueba */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                            Credenciales de Prueba
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                type="button"
                                onClick={() => fillCredentials('student')}
                                className="flex items-center justify-between p-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors text-left"
                            >
                                <div className="flex items-center">
                                    <User className="w-4 h-4 text-blue-600 mr-2" />
                                    <div>
                                        <div className="text-xs font-medium text-gray-900">Estudiante</div>
                                        <div className="text-xs text-gray-600">6 inscripciones (5 enrolled, 1 pending)</div>
                                    </div>
                                </div>
                                <div className="text-xs text-blue-600 font-mono">test@test.com</div>
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => fillCredentials('instructor')}
                                className="flex items-center justify-between p-2 bg-green-50 hover:bg-green-100 rounded-md transition-colors text-left"
                            >
                                <div className="flex items-center">
                                    <GraduationCap className="w-4 h-4 text-green-600 mr-2" />
                                    <div>
                                        <div className="text-xs font-medium text-gray-900">Instructor</div>
                                        <div className="text-xs text-gray-600">Crear cursos, aprobar inscripciones</div>
                                    </div>
                                </div>
                                <div className="text-xs text-green-600 font-mono">instructor@test.com</div>
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => fillCredentials('admin')}
                                className="flex items-center justify-between p-2 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors text-left"
                            >
                                <div className="flex items-center">
                                    <Shield className="w-4 h-4 text-purple-600 mr-2" />
                                    <div>
                                        <div className="text-xs font-medium text-gray-900">Administrador</div>
                                        <div className="text-xs text-gray-600">Todos los permisos del sistema</div>
                                    </div>
                                </div>
                                <div className="text-xs text-purple-600 font-mono">admin@test.com</div>
                            </button>
                        </div>
                        <div className="text-xs text-gray-500 text-center mt-2">
                            Contraseña para todos: <span className="font-mono">123456</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center space-y-2">
                        <Link to="/register" className="text-yellow-600 hover:text-yellow-700 font-medium">
                            ¿No tienes cuenta? Regístrate
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

export default Login;