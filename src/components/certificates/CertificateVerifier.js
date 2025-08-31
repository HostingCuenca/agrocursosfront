import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Award, Calendar, BookOpen, User, Star } from 'lucide-react';
import useCertificateStore from '../../store/certificateStore';

const CertificateVerifier = () => {
    const { certificateNumber: urlCertificateNumber } = useParams();
    const [certificateNumber, setCertificateNumber] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    
    const { verifyCertificate, loading, error, clearError } = useCertificateStore();

    // Verificar automáticamente si viene certificateNumber en la URL
    useEffect(() => {
        if (urlCertificateNumber) {
            setCertificateNumber(urlCertificateNumber);
            handleVerifyWithNumber(urlCertificateNumber);
        }
    }, [urlCertificateNumber]);

    const handleVerifyWithNumber = async (certNumber) => {
        if (!certNumber.trim()) {
            setVerificationResult({
                success: false,
                error: 'Por favor ingrese un número de certificado válido'
            });
            return;
        }

        setIsVerifying(true);
        clearError();
        setVerificationResult(null);

        try {
            const result = await verifyCertificate(certNumber.trim());
            setVerificationResult(result);
        } catch (error) {
            setVerificationResult({
                success: false,
                valid: false,
                error: error.response?.data?.message || 'Error al verificar certificado'
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        await handleVerifyWithNumber(certificateNumber);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Verificador de Certificados
                </h1>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                    Verifica la autenticidad de un certificado emitido por el Centro de Formación Desarrollo Agropecuario (CFDA)
                </p>
            </div>

            {/* Formulario de verificación */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="certificate-number" className="block text-sm font-medium text-neutral-700 mb-2">
                            Número de Certificado
                        </label>
                        <input
                            id="certificate-number"
                            type="text"
                            value={certificateNumber}
                            onChange={(e) => setCertificateNumber(e.target.value)}
                            placeholder="Ej: AGRO-1756572958564-FO4KBD"
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isVerifying}
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                            Ingrese el número completo del certificado (formato: AGRO-XXXXXX-XXXXXX)
                        </p>
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={isVerifying || !certificateNumber.trim()}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <Search className="w-4 h-4 mr-2" />
                            {isVerifying ? 'Verificando...' : 'Verificar'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Resultado de verificación */}
            {verificationResult && (
                <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                    {verificationResult.valid ? (
                        /* Certificado válido */
                        <div>
                            {/* Header de éxito */}
                            <div className="bg-green-50 border-b border-green-200 p-6">
                                <div className="flex items-center">
                                    <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
                                    <div>
                                        <h2 className="text-xl font-bold text-green-900">
                                            ✅ Certificado Válido y Auténtico
                                        </h2>
                                        <p className="text-green-700 mt-1">
                                            Este certificado ha sido verificado correctamente
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Información del certificado */}
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Información del estudiante y curso */}
                                    <div>
                                        <h3 className="font-semibold text-lg text-neutral-900 mb-4">
                                            Información del Certificado
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 text-neutral-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-neutral-500">Estudiante</p>
                                                    <p className="font-medium text-neutral-900">
                                                        {verificationResult.certificate.student_name}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <BookOpen className="w-4 h-4 text-neutral-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-neutral-500">Curso</p>
                                                    <p className="font-medium text-neutral-900">
                                                        {verificationResult.certificate.course_title}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 text-neutral-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-neutral-500">Instructor</p>
                                                    <p className="font-medium text-neutral-900">
                                                        {verificationResult.certificate.instructor_name}
                                                        {verificationResult.certificate.instructor_specialization && (
                                                            <span className="text-neutral-500 text-sm block">
                                                                {verificationResult.certificate.instructor_specialization}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalles del curso y calificación */}
                                    <div>
                                        <h3 className="font-semibold text-lg text-neutral-900 mb-4">
                                            Detalles del Curso
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-neutral-600">Categoría:</span>
                                                <span className="font-medium capitalize">
                                                    {verificationResult.certificate.course_category}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <span className="text-neutral-600">Nivel:</span>
                                                <span className="font-medium">
                                                    {verificationResult.certificate.course_level}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <span className="text-neutral-600">Duración:</span>
                                                <span className="font-medium">
                                                    {verificationResult.certificate.course_duration} horas
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <span className="text-neutral-600">Calificación Final:</span>
                                                <div className="flex items-center">
                                                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                                    <span className="font-bold text-green-600">
                                                        {parseFloat(verificationResult.certificate.final_grade).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <span className="text-neutral-600">Fecha de Emisión:</span>
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 text-neutral-400 mr-2" />
                                                    <span className="font-medium">
                                                        {formatDate(verificationResult.certificate.issued_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Número de certificado */}
                                <div className="mt-6 pt-6 border-t border-neutral-200">
                                    <div className="bg-neutral-50 rounded-lg p-4">
                                        <div className="text-center">
                                            <p className="text-sm text-neutral-600 mb-1">Número de Certificado</p>
                                            <p className="font-mono text-lg font-bold text-neutral-900">
                                                {verificationResult.certificate.certificate_number}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Certificado inválido */
                        <div className="bg-red-50 border-red-200 p-6">
                            <div className="flex items-center">
                                <XCircle className="w-8 h-8 text-red-600 mr-4" />
                                <div>
                                    <h2 className="text-xl font-bold text-red-900">
                                        ❌ Certificado No Válido
                                    </h2>
                                    <p className="text-red-700 mt-1">
                                        {verificationResult.error || 'El certificado no pudo ser verificado o no existe'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-4 p-4 bg-red-100 rounded-lg">
                                <p className="text-red-800 text-sm">
                                    <strong>Posibles causas:</strong>
                                </p>
                                <ul className="text-red-700 text-sm mt-2 list-disc list-inside space-y-1">
                                    <li>El número de certificado es incorrecto</li>
                                    <li>El certificado ha sido revocado</li>
                                    <li>El certificado no existe en nuestros registros</li>
                                    <li>Error temporal del sistema</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Información adicional */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">
                    ℹ️ Información sobre la Verificación
                </h3>
                <div className="text-blue-800 text-sm space-y-2">
                    <p>
                        • Los certificados emitidos por CFDA incluyen un número único de verificación
                    </p>
                    <p>
                        • Este verificador valida certificados en tiempo real con nuestra base de datos
                    </p>
                    <p>
                        • Si tiene dudas sobre un certificado, contacte directamente con la institución
                    </p>
                    <p>
                        • Todos los certificados válidos muestran información completa del curso y estudiante
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CertificateVerifier;