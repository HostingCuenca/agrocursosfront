import React, { useEffect, useState } from 'react';
import { 
    CheckCircle, XCircle, Clock, Search, Filter, 
    ChevronDown, ChevronUp, UserCheck, Users, 
    BookOpen, Calendar, RefreshCw, AlertTriangle,
    BarChart3, CheckSquare, Square, Eye, MoreHorizontal
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import useEnrollmentStore from '../store/enrollmentStore';
import useCourseStore from '../store/courseStore';
import useAuthStore from '../store/authStore';
import { useRolePermissions } from '../hooks/useRolePermissions';
import { enrollmentService } from '../services/enrollmentService';

const ApprovalsPage = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingEnrollment, setRejectingEnrollment] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [expandedEnrollment, setExpandedEnrollment] = useState(null);
    
    // ✅ NUEVO: Estado para dashboard batch optimizado
    const [dashboardStats, setDashboardStats] = useState(null);
    const [batchLoading, setBatchLoading] = useState(true);

    const { user } = useAuthStore();
    const permissions = useRolePermissions();

    const {
        enrollments,
        pendingEnrollments,
        stats,
        loading,
        error,
        selectedEnrollments,
        filters,
        getAllEnrollments,
        getPendingEnrollments,
        getEnrollmentStats,
        getCourseEnrollments,
        approveEnrollment,
        rejectEnrollment,
        approveMultipleEnrollments,
        selectEnrollment,
        selectAllEnrollments,
        clearSelection,
        setFilters,
        clearError
    } = useEnrollmentStore();

    const { myCourses, getMyCourses } = useCourseStore();

    useEffect(() => {
        loadInitialData();
    }, [user, activeTab]);

    const loadInitialData = async () => {
        try {
            setBatchLoading(true);
            
            if (permissions.isAdmin) {
                // ✅ OPTIMIZADO: Para admin, usar endpoint batch que obtiene TODO
                const batchResponse = await enrollmentService.getAdminDashboardBatch();
                if (batchResponse.success) {
                    setDashboardStats(batchResponse.dashboard);
                    console.log('✅ BATCH LOADED - Admin Dashboard:', batchResponse.dashboard.statistics);
                }
            } else {
                // Para instructores, usar lógica anterior
                await Promise.all([
                    getMyCourses(),
                    loadEnrollmentsData(),
                    getEnrollmentStats({ instructor_id: user.id })
                ]);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setBatchLoading(false);
        }
    };

    const loadEnrollmentsData = async () => {
        try {
            const params = {
                status: activeTab === 'pending' ? 'pending' : (activeTab === 'all' ? null : activeTab),
                course_id: selectedCourse !== 'all' ? selectedCourse : null
            };

            if (permissions.isAdmin) {
                await getAllEnrollments(params);
            } else {
                // Para instructores, cargar solo inscripciones de sus cursos
                if (selectedCourse !== 'all') {
                    await getCourseEnrollments(selectedCourse, params);
                } else {
                    await getPendingEnrollments(params);
                }
            }
        } catch (error) {
            console.error('Error loading enrollments:', error);
        }
    };

    const handleApprove = async (enrollmentId) => {
        try {
            await approveEnrollment(enrollmentId);
            await loadEnrollmentsData();
        } catch (error) {
            console.error('Error approving enrollment:', error);
        }
    };

    const handleReject = async () => {
        if (!rejectingEnrollment || !rejectReason.trim()) return;

        try {
            await rejectEnrollment(rejectingEnrollment, rejectReason.trim());
            setShowRejectModal(false);
            setRejectingEnrollment(null);
            setRejectReason('');
            await loadEnrollmentsData();
        } catch (error) {
            console.error('Error rejecting enrollment:', error);
        }
    };

    const handleApproveSelected = async () => {
        if (selectedEnrollments.length === 0) return;

        try {
            await approveMultipleEnrollments(selectedEnrollments);
            await loadEnrollmentsData();
        } catch (error) {
            console.error('Error approving multiple enrollments:', error);
        }
    };

    const openRejectModal = (enrollmentId) => {
        setRejectingEnrollment(enrollmentId);
        setShowRejectModal(true);
    };

    const handleCourseFilter = (courseId) => {
        setSelectedCourse(courseId);
    };

    useEffect(() => {
        if (selectedCourse || activeTab) {
            loadEnrollmentsData();
        }
    }, [selectedCourse, activeTab]);

    const currentEnrollments = (() => {
        if (permissions.isAdmin && dashboardStats?.recent_pending) {
            // ✅ OPTIMIZADO: Para admin, usar datos del batch
            if (activeTab === 'pending') {
                return dashboardStats.recent_pending;
            }
            // Para otros tabs, usar enrollments del store  
            return enrollments;
        } else {
            // Para instructores, usar lógica anterior
            return activeTab === 'pending' ? 
                (permissions.isAdmin ? enrollments.filter(e => e.status === 'pending') : pendingEnrollments) : 
                enrollments;
        }
    })();

    const filteredEnrollments = currentEnrollments.filter(enrollment => {
        const matchesSearch = !searchTerm || 
            enrollment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.course_title?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const tabs = [
        { 
            id: 'pending', 
            label: 'Pendientes', 
            icon: Clock, 
            count: dashboardStats?.statistics?.pending?.count || pendingEnrollments.length 
        },
        { 
            id: 'enrolled', 
            label: 'Aprobadas', 
            icon: CheckCircle,
            count: dashboardStats?.statistics?.enrolled?.count
        },
        { 
            id: 'rejected', 
            label: 'Rechazadas', 
            icon: XCircle,
            count: dashboardStats?.statistics?.rejected?.count
        },
        { id: 'all', label: 'Todas', icon: Users }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'enrolled': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'enrolled': return 'Aprobada';
            case 'rejected': return 'Rechazada';
            case 'completed': return 'Completada';
            default: return status;
        }
    };

    if (loading && enrollments.length === 0) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                                Gestión de Aprobaciones
                            </h1>
                            <p className="text-neutral-600">
                                {permissions.isAdmin ? 
                                    'Administra todas las inscripciones del sistema' : 
                                    'Gestiona las inscripciones de tus cursos'
                                }
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            {selectedEnrollments.length > 0 && (
                                <button
                                    onClick={handleApproveSelected}
                                    disabled={loading}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Aprobar Seleccionadas ({selectedEnrollments.length})
                                </button>
                            )}
                            
                            <button
                                onClick={loadInitialData}
                                disabled={loading}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    {(dashboardStats?.statistics || stats) && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                <div className="flex items-center">
                                    <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-neutral-600">Pendientes</p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {dashboardStats?.statistics?.pending?.count || stats?.pending_enrollments || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                <div className="flex items-center">
                                    <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-neutral-600">Aprobadas</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {dashboardStats?.statistics?.enrolled?.count || stats?.approved_enrollments || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                <div className="flex items-center">
                                    <Users className="w-8 h-8 text-blue-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-neutral-600">Total Estudiantes</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {dashboardStats ? (
                                                dashboardStats.statistics.enrolled.count + 
                                                dashboardStats.statistics.pending.count + 
                                                dashboardStats.statistics.completed.count
                                            ) : (stats?.total_students || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                <div className="flex items-center">
                                    <BookOpen className="w-8 h-8 text-purple-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-neutral-600">Cursos Activos</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {dashboardStats?.total_active_courses || stats?.active_courses || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                                <p className="text-red-700">{error}</p>
                            </div>
                            <button
                                onClick={clearError}
                                className="text-red-500 hover:text-red-700"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-neutral-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {tab.label}
                                        {tab.count !== undefined && (
                                            <span className="ml-2 bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full text-xs">
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 bg-white rounded-lg border border-neutral-200 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar por estudiante, email o curso..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        <div className="w-full md:w-64">
                            <select
                                value={selectedCourse}
                                onChange={(e) => handleCourseFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Todos los cursos</option>
                                {myCourses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Enrollments List */}
                <div className="bg-white rounded-lg border border-neutral-200">
                    {filteredEnrollments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-12 h-12 text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-medium text-neutral-900 mb-2">
                                No se encontraron inscripciones
                            </h3>
                            <p className="text-neutral-600">
                                {activeTab === 'pending' ? 
                                    'No hay inscripciones pendientes de aprobaci�n' :
                                    'No hay inscripciones que coincidan con los filtros seleccionados'
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Header con selecci�n masiva */}
                            {activeTab === 'pending' && filteredEnrollments.length > 0 && (
                                <div className="border-b border-neutral-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => {
                                                    const allIds = filteredEnrollments.map(e => e.id);
                                                    const allSelected = allIds.every(id => selectedEnrollments.includes(id));
                                                    
                                                    if (allSelected) {
                                                        clearSelection();
                                                    } else {
                                                        selectAllEnrollments(allIds);
                                                    }
                                                }}
                                                className="mr-3"
                                            >
                                                {filteredEnrollments.every(e => selectedEnrollments.includes(e.id)) ? 
                                                    <CheckSquare className="w-5 h-5 text-blue-600" /> :
                                                    <Square className="w-5 h-5 text-neutral-400" />
                                                }
                                            </button>
                                            <span className="text-sm text-neutral-600">
                                                {selectedEnrollments.length} de {filteredEnrollments.length} seleccionadas
                                            </span>
                                        </div>
                                        
                                        {selectedEnrollments.length > 0 && (
                                            <button
                                                onClick={handleApproveSelected}
                                                disabled={loading}
                                                className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                            >
                                                <UserCheck className="w-4 h-4 mr-1" />
                                                Aprobar Seleccionadas
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Lista de inscripciones */}
                            <div className="divide-y divide-neutral-200">
                                {filteredEnrollments.map((enrollment) => (
                                    <div key={enrollment.id} className="p-4 hover:bg-neutral-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center flex-1">
                                                {activeTab === 'pending' && (
                                                    <button
                                                        onClick={() => selectEnrollment(enrollment.id)}
                                                        className="mr-3"
                                                    >
                                                        {selectedEnrollments.includes(enrollment.id) ? 
                                                            <CheckSquare className="w-5 h-5 text-blue-600" /> :
                                                            <Square className="w-5 h-5 text-neutral-400" />
                                                        }
                                                    </button>
                                                )}
                                                
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-lg font-medium text-neutral-900">
                                                            {enrollment.student_name}
                                                        </h3>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(enrollment.status)}`}>
                                                            {getStatusLabel(enrollment.status)}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="space-y-1 text-sm text-neutral-600">
                                                        <div className="flex items-center">
                                                            <span className="font-medium w-20">Email:</span>
                                                            <span>{enrollment.student_email}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <BookOpen className="w-4 h-4 mr-2" />
                                                            <span className="font-medium mr-2">Curso:</span>
                                                            <span>{enrollment.course_title}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            <span className="font-medium mr-2">Inscripci�n:</span>
                                                            <span>{new Date(enrollment.enrollment_date).toLocaleDateString('es-ES')}</span>
                                                        </div>
                                                        {enrollment.rejection_reason && (
                                                            <div className="flex items-center text-red-600">
                                                                <AlertTriangle className="w-4 h-4 mr-2" />
                                                                <span className="font-medium mr-2">Raz�n rechazo:</span>
                                                                <span>{enrollment.rejection_reason}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-2 ml-4">
                                                {enrollment.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(enrollment.id)}
                                                            disabled={loading}
                                                            className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Aprobar
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => openRejectModal(enrollment.id)}
                                                            disabled={loading}
                                                            className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            <XCircle className="w-4 h-4 mr-1" />
                                                            Rechazar
                                                        </button>
                                                    </>
                                                )}
                                                
                                                <button
                                                    onClick={() => setExpandedEnrollment(
                                                        expandedEnrollment === enrollment.id ? null : enrollment.id
                                                    )}
                                                    className="p-1 text-neutral-400 hover:text-neutral-600"
                                                >
                                                    {expandedEnrollment === enrollment.id ? 
                                                        <ChevronUp className="w-4 h-4" /> :
                                                        <ChevronDown className="w-4 h-4" />
                                                    }
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedEnrollment === enrollment.id && (
                                            <div className="mt-4 pt-4 border-t border-neutral-200">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <h4 className="font-medium text-neutral-900 mb-2">Informaci�n del Estudiante</h4>
                                                        <div className="space-y-1 text-neutral-600">
                                                            <div>ID: {enrollment.student_id}</div>
                                                            <div>Tel�fono: {enrollment.student_phone || 'No especificado'}</div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-neutral-900 mb-2">Informaci�n del Curso</h4>
                                                        <div className="space-y-1 text-neutral-600">
                                                            <div>ID: {enrollment.course_id}</div>
                                                            <div>Instructor: {enrollment.instructor_name}</div>
                                                            <div>Nivel: {enrollment.course_level}</div>
                                                            <div>Duraci�n: {enrollment.course_duration} horas</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                                Rechazar Inscripci�n
                            </h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Motivo del rechazo *
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Explica brevemente el motivo del rechazo..."
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectingEnrollment(null);
                                        setRejectReason('');
                                    }}
                                    className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectReason.trim() || loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {loading ? 'Rechazando...' : 'Rechazar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ApprovalsPage;