import React, { useEffect, useState } from 'react';
import { 
    Award, Search, BarChart3, Users, 
    Calendar, RefreshCw, AlertCircle, FileText 
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import CertificateCard from '../components/certificates/CertificateCard';
import CertificateTemplateManager from '../components/certificates/CertificateTemplateManager';
import useCertificateStore from '../store/certificateStore';
import useCourseStore from '../store/courseStore';
import useAuthStore from '../store/authStore';
import { useRolePermissions } from '../hooks/useRolePermissions';

const CertificateManagement = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [certificateToRevoke, setCertificateToRevoke] = useState(null);
    const [revokeReason, setRevokeReason] = useState('');
    
    const { user } = useAuthStore();
    const permissions = useRolePermissions();
    
    const { 
        courseCertificates, 
        stats, 
        loading, 
        error,
        getCertificateStats,
        getCourseCertificates,
        revokeCertificate,
        clearError 
    } = useCertificateStore();
    
    const { myCourses, getMyCourses } = useCourseStore();

    useEffect(() => {
        loadInitialData();
    }, [user]);

    const loadInitialData = async () => {
        try {
            // Solo filtrar por instructor_id si el usuario es instructor
            const statsParams = permissions.isAdmin ? {} : { instructor_id: user.id };
            
            await Promise.all([
                getCertificateStats(statsParams),
                getMyCourses()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    };

    const handleCourseChange = async (courseId) => {
        setSelectedCourse(courseId);
        if (courseId !== 'all') {
            try {
                await getCourseCertificates(courseId);
            } catch (error) {
                console.error('Error loading course certificates:', error);
            }
        }
    };

    const handleRevokeCertificate = async (certificateId) => {
        setCertificateToRevoke(certificateId);
        setShowRevokeModal(true);
    };

    const confirmRevoke = async () => {
        if (!certificateToRevoke || !revokeReason.trim()) return;
        
        try {
            await revokeCertificate(certificateToRevoke, revokeReason.trim());
            setShowRevokeModal(false);
            setCertificateToRevoke(null);
            setRevokeReason('');
            
            // Recargar certificados del curso
            if (selectedCourse !== 'all') {
                await getCourseCertificates(selectedCourse);
            }
        } catch (error) {
            console.error('Error revoking certificate:', error);
        }
    };

    // Filtrar certificados
    const filteredCertificates = courseCertificates.filter(cert => {
        const matchesSearch = cert.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cert.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const tabs = [
        { id: 'overview', label: 'Resumen', icon: BarChart3 },
        { id: 'certificates', label: 'Certificados', icon: Award },
        ...(permissions.certificates.canViewTemplates ? [
            { id: 'templates', label: 'Plantillas', icon: FileText }
        ] : []),
        { id: 'students', label: 'Estudiantes', icon: Users }
    ];

    if (loading && !stats && courseCertificates.length === 0) {
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                                Gestión de Certificados
                            </h1>
                            <p className="text-neutral-600">
                                Administra certificados emitidos y estadísticas
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
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
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-red-700">{error}</p>
                            <button
                                onClick={clearError}
                                className="text-red-500 hover:text-red-700"
                            >
                                ×
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
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Estadísticas - Tab Overview */}
                {activeTab === 'overview' && stats && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg border border-neutral-200 p-6">
                                <div className="flex items-center">
                                    <Award className="w-8 h-8 text-blue-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-neutral-600">Total Certificados</p>
                                        <p className="text-2xl font-bold text-neutral-900">
                                            {stats.total_certificates || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg border border-neutral-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                        <Award className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-600">Certificados Activos</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {stats.active_certificates || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg border border-neutral-200 p-6">
                                <div className="flex items-center">
                                    <Users className="w-8 h-8 text-purple-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-neutral-600">Estudiantes Únicos</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {stats.unique_students || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg border border-neutral-200 p-6">
                                <div className="flex items-center">
                                    <BarChart3 className="w-8 h-8 text-yellow-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-neutral-600">Promedio General</p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {stats.average_grade ? parseFloat(stats.average_grade).toFixed(1) : '0'}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg border border-neutral-200 p-6">
                                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                                    Certificados por Mes
                                </h3>
                                <div className="flex items-center justify-center h-32 text-neutral-500">
                                    <div className="text-center">
                                        <Calendar className="w-8 h-8 mx-auto mb-2" />
                                        <p>Último mes: {stats.issued_last_month || 0} certificados</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg border border-neutral-200 p-6">
                                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                                    Cursos con Certificados
                                </h3>
                                <div className="flex items-center justify-center h-32 text-neutral-500">
                                    <div className="text-center">
                                        <Award className="w-8 h-8 mx-auto mb-2" />
                                        <p>{stats.courses_with_certificates || 0} cursos activos</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Certificados - Tab Certificates */}
                {activeTab === 'certificates' && (
                    <div className="space-y-6">
                        {/* Filtros */}
                        <div className="bg-white rounded-lg border border-neutral-200 p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-64">
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) => handleCourseChange(e.target.value)}
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
                                
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por estudiante o número de certificado..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                
                                <div className="w-full md:w-48">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Todos los estados</option>
                                        <option value="issued">Válidos</option>
                                        <option value="active">Activos</option>
                                        <option value="revoked">Revocados</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Lista de certificados */}
                        {selectedCourse === 'all' ? (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-12 h-12 text-neutral-400" />
                                </div>
                                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                                    Selecciona un curso
                                </h3>
                                <p className="text-neutral-600">
                                    Elige un curso específico para ver sus certificados emitidos
                                </p>
                            </div>
                        ) : filteredCertificates.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-12 h-12 text-neutral-400" />
                                </div>
                                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                                    No se encontraron certificados
                                </h3>
                                <p className="text-neutral-600">
                                    Este curso aún no tiene certificados emitidos o no coinciden con los filtros
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {filteredCertificates.map((certificate) => (
                                    <CertificateCard
                                        key={certificate.id}
                                        certificate={certificate}
                                        canRevoke={permissions.certificates.canRevoke}
                                        onRevoke={handleRevokeCertificate}
                                        showCourseInfo={false}
                                        className="bg-white"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Plantillas - Tab Templates */}
                {activeTab === 'templates' && permissions.certificates.canViewTemplates && (
                    <CertificateTemplateManager 
                        permissions={{
                            canCreateTemplate: permissions.certificates.canCreateTemplate,
                            canEditTemplate: permissions.certificates.canEditTemplate,
                            canDeleteTemplate: permissions.certificates.canDeleteTemplate
                        }}
                    />
                )}

                {/* Modal de revocación */}
                {showRevokeModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                                Revocar Certificado
                            </h3>
                            <div className="mb-4">
                                <div className="flex items-center text-red-600 mb-3">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    <span className="font-medium">Esta acción no se puede deshacer</span>
                                </div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Motivo de la revocación *
                                </label>
                                <textarea
                                    value={revokeReason}
                                    onChange={(e) => setRevokeReason(e.target.value)}
                                    placeholder="Describe el motivo por el cual se revoca este certificado..."
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowRevokeModal(false);
                                        setCertificateToRevoke(null);
                                        setRevokeReason('');
                                    }}
                                    className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmRevoke}
                                    disabled={!revokeReason.trim() || loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {loading ? 'Revocando...' : 'Revocar Certificado'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CertificateManagement;