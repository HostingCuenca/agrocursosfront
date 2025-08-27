import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { BookOpen, Users, BarChart3, Calendar } from 'lucide-react';

const InstructorDashboard = () => {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Panel del Instructor</h1>
                    <p className="text-gray-600">Gestiona tus cursos y estudiantes</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Mis Cursos</p>
                                <p className="text-2xl font-semibold text-gray-900">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                                <p className="text-2xl font-semibold text-gray-900">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
                                <p className="text-2xl font-semibold text-gray-900">0%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Clases Hoy</p>
                                <p className="text-2xl font-semibold text-gray-900">0</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <h3 className="font-medium text-gray-900">Crear Curso</h3>
                            <p className="text-sm text-gray-600">Añadir nuevo curso a tu catálogo</p>
                        </button>
                        <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <h3 className="font-medium text-gray-900">Ver Estudiantes</h3>
                            <p className="text-sm text-gray-600">Revisar progreso de estudiantes</p>
                        </button>
                        <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <h3 className="font-medium text-gray-900">Programar Clase</h3>
                            <p className="text-sm text-gray-600">Agendar clase virtual</p>
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
                    <div className="text-center py-8">
                        <p className="text-gray-500">No hay actividad reciente</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InstructorDashboard;