import React, { useState, useEffect } from 'react';
import { Eye, X, Download, ExternalLink } from 'lucide-react';
import CertificateDownloader from './CertificateDownloader';
import { certificateService } from '../../services';

const CertificatePreview = ({ 
    certificateId, 
    certificateNumber,
    isOpen, 
    onClose, 
    className = '' 
}) => {
    const [downloadData, setDownloadData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && certificateId) {
            loadDownloadData();
        }
        return () => {
            setDownloadData(null);
            setError(null);
        };
    }, [isOpen, certificateId]);

    const loadDownloadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await certificateService.getCertificateDownloadData(certificateId);
            if (response.success) {
                setDownloadData(response.download_data);
            } else {
                setError(response.error || 'Error al cargar datos del certificado');
            }
        } catch (error) {
            console.error('Error loading certificate preview data:', error);
            setError(error.response?.data?.message || 'Error al cargar vista previa');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = () => {
        if (certificateNumber) {
            window.open(`/verificar/${certificateNumber}`, '_blank');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <h2 className="text-xl font-semibold text-neutral-900">
                        Vista Previa del Certificado
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-neutral-500 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="text-red-600 mb-4">
                                <p className="text-lg font-medium">Error al cargar vista previa</p>
                                <p className="text-sm">{error}</p>
                            </div>
                            <button
                                onClick={loadDownloadData}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : downloadData ? (
                        <div className="space-y-6">
                            {/* Certificate Preview */}
                            <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-lg p-8 border-2 border-dashed border-blue-200">
                                <div className="text-center space-y-4">
                                    {/* Template Background Preview */}
                                    {downloadData.template.background_image && (
                                        <div className="mb-6">
                                            <img
                                                src={downloadData.template.background_image}
                                                alt="Template Preview"
                                                className="max-w-full h-48 object-contain mx-auto rounded-lg shadow-md"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Certificate Title */}
                                    <div className="text-2xl font-bold text-blue-900 mb-4">
                                        CERTIFICADO DE FINALIZACIÓN
                                    </div>

                                    {/* Student Name */}
                                    <div className="text-3xl font-bold text-neutral-900 mb-2">
                                        {downloadData.certificate.student_name}
                                    </div>

                                    {/* Completion Text */}
                                    <div className="text-lg text-neutral-600 mb-4">
                                        ha completado exitosamente el curso
                                    </div>

                                    {/* Course Title */}
                                    <div className="text-xl font-semibold text-neutral-900 mb-6">
                                        {downloadData.certificate.course_title}
                                    </div>

                                    {/* Course Details */}
                                    <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600 mb-6 max-w-md mx-auto">
                                        <div>
                                            <strong>Nivel:</strong> {downloadData.certificate.course_level}
                                        </div>
                                        <div>
                                            <strong>Duración:</strong> {downloadData.certificate.course_duration}
                                        </div>
                                        <div>
                                            <strong>Categoría:</strong> {downloadData.certificate.course_category}
                                        </div>
                                        <div>
                                            <strong>Calificación:</strong> {downloadData.certificate.final_grade}
                                        </div>
                                    </div>

                                    {/* Date and Instructor */}
                                    <div className="text-sm text-neutral-600 space-y-1">
                                        <div>
                                            <strong>Emitido el:</strong> {downloadData.certificate.issued_date}
                                        </div>
                                        <div>
                                            <strong>Instructor:</strong> {downloadData.certificate.instructor_name}
                                        </div>
                                        <div>
                                            <strong>N°:</strong> {downloadData.certificate.number}
                                        </div>
                                    </div>

                                    {/* QR Code Info */}
                                    <div className="mt-6 p-3 bg-white rounded-lg border">
                                        <div className="text-xs text-neutral-500 mb-2">
                                            Código QR incluirá:
                                        </div>
                                        <div className="font-mono text-xs text-neutral-700">
                                            {downloadData.qr_data.verification_url}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Template Information */}
                            <div className="bg-neutral-50 rounded-lg p-4">
                                <h3 className="font-semibold text-neutral-900 mb-2">
                                    Información de la Plantilla
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
                                    <div>
                                        <strong>Nombre:</strong> {downloadData.template.name}
                                    </div>
                                    <div>
                                        <strong>Fuente:</strong> {downloadData.template.config?.font_family || 'Arial'}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-center space-x-4 pt-4 border-t border-neutral-200">
                                <CertificateDownloader
                                    certificateId={certificateId}
                                    certificateNumber={certificateNumber}
                                    studentName={downloadData.certificate.student_name}
                                    buttonText="Descargar PDF"
                                    showIcon={true}
                                    variant="primary"
                                />
                                
                                <button
                                    onClick={handleVerify}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Verificar Online
                                </button>
                                
                                <button
                                    onClick={onClose}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

// Hook to use CertificatePreview
export const useCertificatePreview = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [certificateData, setCertificateData] = useState(null);

    const openPreview = (certificateId, certificateNumber) => {
        setCertificateData({ certificateId, certificateNumber });
        setIsOpen(true);
    };

    const closePreview = () => {
        setIsOpen(false);
        setCertificateData(null);
    };

    const PreviewComponent = () => (
        <CertificatePreview
            certificateId={certificateData?.certificateId}
            certificateNumber={certificateData?.certificateNumber}
            isOpen={isOpen}
            onClose={closePreview}
        />
    );

    return {
        openPreview,
        closePreview,
        isOpen,
        PreviewComponent
    };
};

export default CertificatePreview;