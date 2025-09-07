import React, { useState, useEffect } from 'react';
import {
    TrendingUp, DollarSign, Users, BookOpen, Calendar, 
    Download, Filter, RefreshCw, BarChart3, PieChart,
    ArrowUp, ArrowDown, Activity, Target, Award,
    Search, ChevronDown, ChevronUp, Eye, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { enrollmentService } from '../services/enrollmentService';
import useAuthStore from '../store/authStore';
import { useRolePermissions } from '../hooks/useRolePermissions';

const ReportsPage = () => {
    const { user } = useAuthStore();
    const permissions = useRolePermissions();

    // Estados para reportes
    const [financialReport, setFinancialReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para filtros
    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: ''
    });
    const [activeView, setActiveView] = useState('overview');
    const [expandedCourse, setExpandedCourse] = useState(null);

    useEffect(() => {
        if (permissions.isAdmin) {
            loadFinancialReport();
        }
    }, [permissions.isAdmin]);

    const loadFinancialReport = async (filters = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                ...filters,
                ...dateRange
            };

            const response = await enrollmentService.getFinancialReport(params);
            if (response.success && response.financial_report) {
                setFinancialReport(response.financial_report);
                console.log('📊 Financial Report Loaded:', response.financial_report);
            } else {
                console.error('Invalid response structure:', response);
                throw new Error('Estructura de respuesta inválida');
            }
        } catch (err) {
            console.error('Error loading financial report:', err);
            setError('Error al cargar el reporte financiero');
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const applyFilters = () => {
        loadFinancialReport();
    };

    const clearFilters = () => {
        setDateRange({ start_date: '', end_date: '' });
        setTimeout(() => loadFinancialReport(), 100);
    };

    const formatCurrency = (amount) => {
        if (!amount) return '$0.00';
        return new Intl.NumberFormat('es-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatPercent = (percent) => {
        if (!percent) return '0%';
        return `${parseFloat(percent).toFixed(1)}%`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'enrolled': return 'text-green-600 bg-green-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'rejected': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (!permissions.isAdmin) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Acceso Restringido
                        </h2>
                        <p className="text-gray-600">
                            Solo los administradores pueden acceder a los reportes del sistema.
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (loading && !financialReport) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <span className="ml-3 text-lg">Cargando reportes...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const summary = financialReport?.platform_summary || {};
    const topCourses = financialReport?.top_performing_courses || [];
    const categories = financialReport?.category_breakdown || [];

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Reportes Financieros
                            </h1>
                            <p className="text-gray-600">
                                Análisis completo de ingresos, ventas y performance de la plataforma
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => loadFinancialReport()}
                                disabled={loading}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </button>
                            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                <Download className="w-4 h-4 mr-2" />
                                Exportar
                            </button>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.start_date}
                                    onChange={(e) => handleDateRangeChange('start_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Fin
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.end_date}
                                    onChange={(e) => handleDateRangeChange('end_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-end space-x-2">
                                <button
                                    onClick={applyFilters}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Filter className="w-4 h-4 mr-2 inline" />
                                    Aplicar
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Indicador de filtros aplicados */}
                    {financialReport?.filters?.date_range_applied && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                📅 Mostrando datos del {financialReport.filters.start_date} al {financialReport.filters.end_date}
                            </p>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(summary.total_confirmed_revenue)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Ingresos Confirmados
                                </div>
                            </div>
                        </div>
                        {summary.total_pending_revenue > 0 && (
                            <div className="text-sm text-gray-600">
                                + {formatCurrency(summary.total_pending_revenue)} pendiente
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                    {summary.total_confirmed_sales || 0}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Ventas Confirmadas
                                </div>
                            </div>
                        </div>
                        {summary.total_pending_sales > 0 && (
                            <div className="text-sm text-gray-600">
                                + {summary.total_pending_sales} pendientes
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Target className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-purple-600">
                                    {formatPercent(summary.conversion_rate)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Tasa de Conversión
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            {summary.total_confirmed_sales} de {summary.total_enrollments} inscripciones
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <BookOpen className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-orange-600">
                                    {summary.courses_with_sales || 0}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Cursos con Ventas
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            Promedio: {formatCurrency(summary.revenue_efficiency || 0)}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'overview', label: 'Resumen General', icon: BarChart3 },
                                { id: 'courses', label: 'Top Cursos', icon: Award },
                                { id: 'categories', label: 'Categorías', icon: PieChart }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveView(tab.id)}
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
                </div>

                {/* Content basado en vista activa */}
                {activeView === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Distribución de Ingresos */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Distribución de Ingresos
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <span className="text-green-800 font-medium">Confirmados</span>
                                    <span className="text-green-600 font-bold">
                                        {formatCurrency(summary.total_confirmed_revenue)}
                                    </span>
                                </div>
                                {summary.total_pending_revenue > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                        <span className="text-yellow-800 font-medium">Pendientes</span>
                                        <span className="text-yellow-600 font-bold">
                                            {formatCurrency(summary.total_pending_revenue)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <span className="text-blue-800 font-medium">Total Potencial</span>
                                    <span className="text-blue-600 font-bold">
                                        {formatCurrency(summary.total_potential_revenue)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Performance General */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Performance General
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Total Inscripciones</span>
                                    <span className="font-semibold">{summary.total_enrollments || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Tasa de Conversión</span>
                                    <span className="font-semibold text-green-600">
                                        {formatPercent(summary.conversion_rate)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Ingreso Promedio por Curso</span>
                                    <span className="font-semibold">
                                        {formatCurrency(summary.revenue_efficiency)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Cursos Activos</span>
                                    <span className="font-semibold">{summary.courses_with_sales || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'courses' && (
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Top Cursos por Ingresos
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Cursos ordenados por ingresos totales generados
                            </p>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {topCourses.map((course, index) => (
                                <div key={course.course_id} className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                                                index === 0 ? 'bg-yellow-500' : 
                                                index === 1 ? 'bg-gray-400' : 
                                                index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                                            }`}>
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">
                                                    {course.course_title}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    Por: {course.instructor_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-600">
                                                {formatCurrency(course.confirmed_revenue)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {course.confirmed_sales} ventas
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => setExpandedCourse(expandedCourse === course.course_id ? null : course.course_id)}
                                        className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Ver detalles
                                        {expandedCourse === course.course_id ? 
                                            <ChevronUp className="w-4 h-4 ml-1" /> : 
                                            <ChevronDown className="w-4 h-4 ml-1" />
                                        }
                                    </button>

                                    {expandedCourse === course.course_id && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Ranking Ventas:</span>
                                                    <div className="font-medium">#{course.sales_rank}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Ranking Ingresos:</span>
                                                    <div className="font-medium">#{course.revenue_rank}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Instructor:</span>
                                                    <div className="font-medium">{course.instructor_name}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeView === 'categories' && (
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Performance por Categorías
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Análisis de ingresos agrupado por categoría de curso
                            </p>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {categories.map((category, index) => (
                                <div key={category.category} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 capitalize">
                                                {category.category}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {category.courses_count} curso{category.courses_count !== 1 ? 's' : ''} • 
                                                {category.total_sales} venta{category.total_sales !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-600">
                                                {formatCurrency(category.total_revenue)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Precio promedio: {formatCurrency(category.avg_price)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ReportsPage;