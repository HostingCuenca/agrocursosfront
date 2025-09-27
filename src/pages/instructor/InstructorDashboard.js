import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import CourseManager from '../../components/courses/CourseManager';
import { BookOpen, Users, BarChart3, Calendar, Plus, TrendingUp } from 'lucide-react';
import useCourseStore from '../../store/courseStore';
import useAuthStore from '../../store/authStore';

const InstructorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { user } = useAuthStore();
    const { courses, getCourses } = useCourseStore();

    useEffect(() => {
        // Cargar cursos del instructor
        getCourses();
    }, []);

    // Filtrar solo cursos del instructor actual
    const myCourses = courses.filter(course => course.instructor_id === user?.id) || [];

    // Calcular estadísticas
    const stats = {
        totalCourses: myCourses.length,
        publishedCourses: myCourses.filter(c => c.is_published).length,
        draftCourses: myCourses.filter(c => !c.is_published).length,
        totalStudents: 0, // TODO: Implementar cuando tengamos datos de inscripciones
        avgProgress: 0 // TODO: Implementar cuando tengamos datos de progreso
    };

    const tabs = [
        { id: 'overview', label: 'Resumen', icon: BarChart3 },
        { id: 'courses', label: 'Mis Cursos', icon: BookOpen },
        { id: 'students', label: 'Estudiantes', icon: Users },
        // { id: 'analytics', label: 'Estadísticas', icon: TrendingUp } // Comentado: página no lista
    ];

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">
                    ¡Hola, {user?.first_name || 'Instructor'}! 👋
                </h2>
                <p className="text-yellow-100 mb-4">
                    Bienvenido a tu panel de instructor. Aquí puedes gestionar tus cursos y hacer seguimiento del progreso de tus estudiantes.
                </p>
                <button
                    onClick={() => setActiveTab('courses')}
                    className="bg-white text-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-50 transition-colors font-medium"
                >
                    <Plus className="inline w-4 h-4 mr-2" />
                    Crear Nuevo Curso
                </button>
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
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        {stats.publishedCourses} publicados, {stats.draftCourses} borradores
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        En todos tus cursos
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.avgProgress}%</p>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        De todos los estudiantes
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Clases Pendientes</p>
                            <p className="text-2xl font-semibold text-gray-900">0</p>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        Programadas para esta semana
                    </div>
                </div>
            </div>

            {/* Recent Courses */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Cursos Recientes</h3>
                    <button
                        onClick={() => setActiveTab('courses')}
                        className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                    >
                        Ver todos
                    </button>
                </div>
                
                {myCourses.length === 0 ? (
                    <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 mb-4">No has creado ningún curso aún</p>
                        <button
                            onClick={() => setActiveTab('courses')}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                            Crear tu primer curso
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {myCourses.slice(0, 3).map((course) => (
                            <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                        {course.thumbnail ? (
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="w-full h-full object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <BookOpen className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                                        <p className="text-sm text-gray-500">
                                            {course.is_published ? 'Publicado' : 'Borrador'} · {course.difficulty_level}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {course.price && parseFloat(course.price) > 0 
                                            ? `${course.currency || 'USD'} ${parseFloat(course.price).toFixed(2)}`
                                            : 'Gratis'
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500">0 estudiantes</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        onClick={() => setActiveTab('courses')}
                        className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                                <Plus className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Crear Curso</h4>
                                <p className="text-sm text-gray-600">Añadir nuevo curso a tu catálogo</p>
                            </div>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('students')}
                        className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Ver Estudiantes</h4>
                                <p className="text-sm text-gray-600">Revisar progreso de estudiantes</p>
                            </div>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('analytics')}
                        className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Ver Estadísticas</h4>
                                <p className="text-sm text-gray-600">Analizar rendimiento de cursos</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'courses':
                return <CourseManager />;
            case 'students':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Estudiantes</h3>
                        <p className="text-gray-600 mb-4">
                            Aquí podrás ver y gestionar todos los estudiantes inscritos en tus cursos.
                        </p>
                        <p className="text-sm text-gray-500">Esta funcionalidad se implementará próximamente.</p>
                    </div>
                );
            case 'analytics':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Estadísticas y Análisis</h3>
                        <p className="text-gray-600 mb-4">
                            Aquí podrás ver métricas detalladas sobre el rendimiento de tus cursos.
                        </p>
                        <p className="text-sm text-gray-500">Esta funcionalidad se implementará próximamente.</p>
                    </div>
                );
            default:
                return renderOverview();
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Navigation Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-yellow-500 text-yellow-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className={`mr-2 h-5 w-5 ${
                                        activeTab === tab.id 
                                            ? 'text-yellow-500' 
                                            : 'text-gray-400 group-hover:text-gray-500'
                                    }`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                {renderContent()}
            </div>
        </DashboardLayout>
    );
};

export default InstructorDashboard;