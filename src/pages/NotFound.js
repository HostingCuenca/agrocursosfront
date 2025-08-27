import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    const { isAuthenticated } = useAuthStore();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md mx-auto">
                {/* Número 404 grande */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
                    <div className="flex items-center justify-center mb-4">
                        <AlertTriangle className="w-16 h-16 text-yellow-500" />
                    </div>
                </div>

                {/* Mensaje */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Página no encontrada
                    </h2>
                    <p className="text-gray-600 mb-2">
                        Lo sentimos, la página que estás buscando no existe.
                    </p>
                    <p className="text-gray-500">
                        Puede que la URL esté mal escrita o que la página haya sido movida.
                    </p>
                </div>

                {/* Botones de navegación */}
                <div className="space-y-4">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold transition-colors"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Ir al Dashboard
                            </Link>
                            <div className="text-sm text-gray-500">
                                <button
                                    onClick={() => window.history.back()}
                                    className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Volver atrás
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/"
                                className="inline-flex items-center px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold transition-colors"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Ir al Inicio
                            </Link>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* Información adicional */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Si crees que esto es un error, contacta al administrador
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;