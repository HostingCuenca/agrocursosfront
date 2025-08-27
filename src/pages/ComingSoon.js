import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Construction, ArrowLeft, Clock, Wrench } from 'lucide-react';

const ComingSoon = () => {
    const location = useLocation();
    const pathName = location.pathname;

    // Mapear rutas a nombres amigables
    const getPageName = (path) => {
        const pageNames = {
            '/cursos': 'Cursos',
            '/mis-cursos': 'Mis Cursos',
            '/explorar': 'Explorar Cursos',
            '/estudiantes': 'Estudiantes',
            '/mis-estudiantes': 'Mis Estudiantes',
            '/instructores': 'Instructores',
            '/modulos': 'Módulos',
            '/certificados': 'Certificados',
            '/mis-certificados': 'Mis Certificados',
            '/aprobaciones': 'Aprobaciones',
            '/reportes': 'Reportes',
            '/estadisticas': 'Estadísticas',
            '/configuracion': 'Configuración',
            '/continuar': 'Continuar Estudiando',
            '/calendario': 'Calendario',
            '/progreso': 'Mi Progreso'
        };
        return pageNames[path] || 'Página';
    };

    return (
        <DashboardLayout>
            <div className="min-h-96 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    {/* Icono animado */}
                    <div className="mb-8">
                        <div className="relative">
                            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Construction className="w-12 h-12 text-yellow-600" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
                                <Wrench className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Título */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {getPageName(pathName)}
                    </h1>

                    {/* Mensaje */}
                    <div className="mb-8">
                        <p className="text-lg text-gray-600 mb-4">
                            Estamos trabajando en esta sección
                        </p>
                        <p className="text-gray-500">
                            Esta funcionalidad estará disponible próximamente.
                            Mientras tanto, puedes explorar otras secciones del sistema.
                        </p>
                    </div>

                    {/* Información de progreso */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <Clock className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Tiempo estimado: 2-3 semanas
                            </span>
                        </div>

                        {/* Barra de progreso */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '35%'}}></div>
                        </div>

                        <div className="text-sm text-gray-600">
                            Progreso del desarrollo: 35%
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-4">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver al Dashboard
                        </Link>

                        <div className="text-sm text-gray-500">
                            <p>¿Necesitas ayuda? Contacta al administrador</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ComingSoon;