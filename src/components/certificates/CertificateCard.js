import React from 'react';
import { Award, Calendar, BookOpen, Star, Copy, ExternalLink, AlertCircle, User, Mail } from 'lucide-react';
import CertificateDownloader from './CertificateDownloader';

const CertificateCard = ({ 
    certificate, 
    onVerify, 
    onRevoke, 
    canRevoke = false,
    showCourseInfo = true,
    className = '' 
}) => {
    const handleCopyNumber = () => {
        navigator.clipboard.writeText(certificate.certificate_number);
        // Aquí podrías agregar una notificación de que se copió
    };

    const handleViewCertificate = () => {
        if (onVerify) {
            onVerify(certificate.certificate_number);
        } else {
            // Abrir en nueva ventana la verificación pública
            window.open(`/verificar/${certificate.certificate_number}`, '_blank');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            issued: { color: 'bg-green-100 text-green-800', label: 'Válido' },
            active: { color: 'bg-green-100 text-green-800', label: 'Activo' },
            revoked: { color: 'bg-red-100 text-red-800', label: 'Revocado' },
            expired: { color: 'bg-gray-100 text-gray-800', label: 'Expirado' }
        };
        
        const config = statusConfig[status] || statusConfig.issued;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getGradeColor = (grade) => {
        const numGrade = parseFloat(grade);
        if (numGrade >= 90) return 'text-green-600';
        if (numGrade >= 80) return 'text-blue-600';
        if (numGrade >= 70) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className={`bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors duration-200 ${className}`}>
            {/* Header con icono y estado */}
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                            <Award className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                                Certificado de Finalización
                            </h3>
                            <p className="text-sm text-neutral-500">
                                #{certificate.certificate_number}
                            </p>
                        </div>
                    </div>
                    {getStatusBadge(certificate.status)}
                </div>

                {/* Información del curso */}
                {showCourseInfo && (
                    <div className="mb-4">
                        <h4 className="font-medium text-neutral-900 mb-2 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-neutral-500" />
                            {certificate.course_title || 'Curso sin título'}
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
                            <div>
                                <span className="font-medium">Categoría:</span> {certificate.course_category || 'N/A'}
                            </div>
                            <div>
                                <span className="font-medium">Nivel:</span> {certificate.course_level || 'N/A'}
                            </div>
                            <div>
                                <span className="font-medium">Duración:</span> {certificate.course_duration || 0}h
                            </div>
                            <div>
                                <span className="font-medium">Instructor:</span> {certificate.instructor_name || 'N/A'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Información del estudiante */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-600" />
                        Estudiante Certificado
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center text-blue-800">
                            <User className="w-3 h-3 mr-2 text-blue-600" />
                            <div>
                                <span className="font-medium">Nombre:</span>
                                <p className="font-semibold">{certificate.student_name || 'No disponible'}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-blue-800">
                            <Mail className="w-3 h-3 mr-2 text-blue-600" />
                            <div>
                                <span className="font-medium">Email:</span>
                                <p className="font-mono text-xs">{certificate.student_email || 'No disponible'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información del certificado */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-neutral-600">
                        <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
                        <div>
                            <p className="font-medium">Emitido</p>
                            <p>{formatDate(certificate.issued_at)}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                        <Star className="w-4 h-4 mr-2 text-neutral-400" />
                        <div>
                            <p className="font-medium">Calificación Final</p>
                            <p className={`font-semibold ${getGradeColor(certificate.final_grade)}`}>
                                {parseFloat(certificate.final_grade).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mensaje de estado si está revocado */}
                {certificate.status === 'revoked' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <span className="font-medium">Certificado Revocado</span>
                        </div>
                        {certificate.metadata?.reason && (
                            <p className="text-red-600 text-xs mt-1">
                                Motivo: {certificate.metadata.reason}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Footer con acciones */}
            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50">
                <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                        <button
                            onClick={handleViewCertificate}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        >
                            <ExternalLink className="w-4 h-4 mr-1.5" />
                            Ver Certificado
                        </button>
                        <button
                            onClick={handleCopyNumber}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                        >
                            <Copy className="w-4 h-4 mr-1.5" />
                            Copiar #
                        </button>
                        
                        {/* Botón de descarga - Solo para certificados válidos */}
                        {certificate.status !== 'revoked' && (
                            <CertificateDownloader
                                certificateId={certificate.id}
                                certificateNumber={certificate.certificate_number}
                                studentName={certificate.student_name || certificate.metadata?.student_name}
                                buttonText=""
                                showIcon={true}
                                variant="outline"
                                className="inline-flex"
                            />
                        )}
                    </div>
                    
                    {canRevoke && certificate.status !== 'revoked' && (
                        <button
                            onClick={() => onRevoke && onRevoke(certificate.id)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        >
                            Revocar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificateCard;