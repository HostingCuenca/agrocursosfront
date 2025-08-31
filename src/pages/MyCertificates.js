import React, { useEffect, useState } from 'react';
import { Award, Search, Filter, Download, Eye, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import CertificateCard from '../components/certificates/CertificateCard';
import useCertificateStore from '../store/certificateStore';
import useAuthStore from '../store/authStore';

const MyCertificates = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    
    const { user } = useAuthStore();
    const { 
        myCertificates, 
        loading, 
        error, 
        getStudentCertificates, 
        clearError 
    } = useCertificateStore();

    useEffect(() => {
        if (user?.id) {
            loadCertificates();
        }
    }, [user]);

    const loadCertificates = async () => {
        try {
            await getStudentCertificates(user.id);
        } catch (error) {
            console.error('Error loading certificates:', error);
        }
    };

    // Filtrar y ordenar certificados
    const filteredCertificates = myCertificates
        .filter(cert => {
            const matchesSearch = cert.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date_desc':
                    return new Date(b.issued_at) - new Date(a.issued_at);
                case 'date_asc':
                    return new Date(a.issued_at) - new Date(b.issued_at);
                case 'grade_desc':
                    return parseFloat(b.final_grade) - parseFloat(a.final_grade);
                case 'grade_asc':
                    return parseFloat(a.final_grade) - parseFloat(b.final_grade);
                case 'course_name':
                    return (a.course_title || '').localeCompare(b.course_title || '');
                default:
                    return 0;
            }
        });

    const handleVerifyCertificate = (certificateNumber) => {
        // Abrir verificador en nueva ventana
        window.open(`/verificar/${certificateNumber}`, '_blank');
    };

    const getStatusCounts = () => {
        const counts = myCertificates.reduce((acc, cert) => {
            acc[cert.status] = (acc[cert.status] || 0) + 1;
            acc.total++;
            return acc;
        }, { total: 0, issued: 0, active: 0, revoked: 0 });
        
        return counts;
    };

    const statusCounts = getStatusCounts();

    if (loading) {
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
                                Mis Certificados
                            </h1>
                            <p className="text-neutral-600">
                                Gestiona y visualiza todos tus certificados obtenidos
                            </p>
                        </div>
                        
                        <button
                            onClick={loadCertificates}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
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

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg border border-neutral-200 p-4">
                        <div className="flex items-center">
                            <Award className="w-8 h-8 text-blue-600 mr-3" />
                            <div>
                                <p className="text-sm text-neutral-600">Total</p>
                                <p className="text-2xl font-bold text-neutral-900">{statusCounts.total}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-neutral-200 p-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <Award className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Válidos</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {(statusCounts.issued || 0) + (statusCounts.active || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-neutral-200 p-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                <Award className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Revocados</p>
                                <p className="text-2xl font-bold text-red-600">{statusCounts.revoked || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-neutral-200 p-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                                <Award className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Promedio</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {myCertificates.length > 0 
                                        ? (myCertificates.reduce((sum, cert) => sum + parseFloat(cert.final_grade), 0) / myCertificates.length).toFixed(1)
                                        : '0'
                                    }%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Búsqueda */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre de curso o número de certificado..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Filtro por estado */}
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

                        {/* Ordenamiento */}
                        <div className="w-full md:w-48">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="date_desc">Más reciente</option>
                                <option value="date_asc">Más antiguo</option>
                                <option value="grade_desc">Mayor calificación</option>
                                <option value="grade_asc">Menor calificación</option>
                                <option value="course_name">Nombre del curso</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Lista de certificados */}
                {filteredCertificates.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-12 h-12 text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                            {searchTerm || statusFilter !== 'all' 
                                ? 'No se encontraron certificados'
                                : 'Aún no tienes certificados'
                            }
                        </h3>
                        <p className="text-neutral-600 mb-6">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Intenta ajustar tus filtros de búsqueda'
                                : 'Completa cursos para obtener tus primeros certificados'
                            }
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                            <button 
                                onClick={() => window.location.href = '/cursos'}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Explorar Cursos
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredCertificates.map((certificate) => (
                            <CertificateCard
                                key={certificate.id}
                                certificate={certificate}
                                onVerify={handleVerifyCertificate}
                                showCourseInfo={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MyCertificates;