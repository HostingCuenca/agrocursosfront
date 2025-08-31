import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Award, User, BookOpen, BarChart3, AlertTriangle } from 'lucide-react';
import useCertificateStore from '../../store/certificateStore';
import { useRolePermissions } from '../../hooks/useRolePermissions';

const CertificateEligibilityChecker = ({ 
    studentId, 
    courseId, 
    onGenerateCertificate,
    showGenerateButton = true 
}) => {
    const [generating, setGenerating] = useState(false);
    const permissions = useRolePermissions();
    
    const { 
        eligibility,
        loading,
        error,
        checkEligibility,
        generateCertificate,
        clearError,
        clearEligibility
    } = useCertificateStore();

    useEffect(() => {
        if (studentId && courseId) {
            loadEligibility();
        }
        return () => clearEligibility();
    }, [studentId, courseId]);

    const loadEligibility = async () => {
        try {
            await checkEligibility(studentId, courseId);
        } catch (error) {
            console.error('Error loading eligibility:', error);
        }
    };

    const handleGenerateCertificate = async () => {
        setGenerating(true);
        try {
            const result = await generateCertificate(studentId, courseId, { 
                automatic: permissions.isStudent,
                override: !permissions.isStudent 
            });
            
            if (onGenerateCertificate) {
                onGenerateCertificate(result.certificate);
            }
            
            // Recargar elegibilidad después de generar
            await loadEligibility();
        } catch (error) {
            console.error('Error generating certificate:', error);
        } finally {
            setGenerating(false);
        }
    };

    const getCheckIcon = (passed) => {
        return passed ? 
            <CheckCircle className="w-5 h-5 text-green-500" /> : 
            <XCircle className="w-5 h-5 text-red-500" />;
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        if (percentage >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getGradeColor = (grade) => {
        if (grade >= 70) return 'text-green-600';
        if (grade >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-neutral-200 rounded w-full"></div>
                        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg border border-red-200 p-6">
                <div className="flex items-center text-red-700 mb-3">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <h3 className="font-semibold">Error al verificar elegibilidad</h3>
                </div>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <div className="flex space-x-3">
                    <button
                        onClick={loadEligibility}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                        Reintentar
                    </button>
                    <button
                        onClick={clearError}
                        className="px-4 py-2 text-red-600 hover:text-red-800 text-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    if (!eligibility) {
        return null;
    }

    const { is_eligible, checks, existing_certificate, course_info } = eligibility;

    return (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 border-b ${is_eligible ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center">
                    <Award className={`w-6 h-6 mr-3 ${is_eligible ? 'text-green-600' : 'text-yellow-600'}`} />
                    <div>
                        <h3 className={`font-semibold ${is_eligible ? 'text-green-900' : 'text-yellow-900'}`}>
                            {is_eligible ? 'Elegible para Certificado' : 'Requisitos Pendientes'}
                        </h3>
                        <p className={`text-sm ${is_eligible ? 'text-green-700' : 'text-yellow-700'}`}>
                            {is_eligible ? 
                                'Cumples todos los requisitos para obtener el certificado' :
                                'Completa los requisitos faltantes para obtener tu certificado'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Información del curso */}
            {course_info && (
                <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50">
                    <h4 className="font-medium text-neutral-900 mb-2 flex items-center">
                        <BookOpen className="w-4 h-4 mr-2 text-neutral-500" />
                        {course_info.title}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
                        <div>
                            <span className="font-medium">Instructor:</span> {course_info.instructor}
                        </div>
                        <div>
                            <span className="font-medium">Duración:</span> {course_info.duration_hours}h
                        </div>
                    </div>
                </div>
            )}

            {/* Verificaciones de elegibilidad */}
            <div className="px-6 py-4">
                <h4 className="font-medium text-neutral-900 mb-4 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-neutral-500" />
                    Requisitos de Certificación
                </h4>
                
                <div className="space-y-4">
                    {/* Progreso de clases */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {getCheckIcon(checks.class_progress_ok)}
                            <span className="ml-3 text-sm font-medium text-neutral-700">
                                Progreso de Clases
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-neutral-900">
                                {eligibility.completed_classes || 0}/{eligibility.total_classes || 0} clases
                            </div>
                            <div className="text-xs text-neutral-500">
                                {eligibility.class_progress_percentage}% (mínimo 80%)
                            </div>
                            <div className="w-24 h-2 bg-neutral-200 rounded-full mt-1">
                                <div 
                                    className={`h-full rounded-full ${getProgressColor(eligibility.class_progress_percentage)}`}
                                    style={{ width: `${Math.min(eligibility.class_progress_percentage, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Calificación general */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {getCheckIcon(checks.overall_grade_ok)}
                            <span className="ml-3 text-sm font-medium text-neutral-700">
                                Calificación General
                            </span>
                        </div>
                        <div className="text-right">
                            <div className={`text-sm font-bold ${getGradeColor(eligibility.overall_grade)}`}>
                                {eligibility.overall_grade}%
                            </div>
                            <div className="text-xs text-neutral-500">
                                (mínimo 70%)
                            </div>
                        </div>
                    </div>

                    {/* Examen final */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {getCheckIcon(checks.final_exam_passed)}
                            <span className="ml-3 text-sm font-medium text-neutral-700">
                                Examen Final
                            </span>
                        </div>
                        <div className="text-right">
                            <div className={`text-sm font-medium ${
                                eligibility.final_exam_score !== null ? 
                                getGradeColor(eligibility.final_exam_score) : 
                                'text-neutral-500'
                            }`}>
                                {eligibility.final_exam_score !== null ? 
                                    `${eligibility.final_exam_score}%` : 
                                    'No realizado'
                                }
                            </div>
                            <div className="text-xs text-neutral-500">
                                (mínimo 70%)
                            </div>
                        </div>
                    </div>

                    {/* Todas las evaluaciones */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {getCheckIcon(checks.all_evaluations_attempted)}
                            <span className="ml-3 text-sm font-medium text-neutral-700">
                                Evaluaciones Completadas
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-neutral-900">
                                {eligibility.evaluations ? eligibility.evaluations.length : 0} evaluaciones
                            </div>
                            <div className="text-xs text-neutral-500">
                                {checks.all_evaluations_attempted ? 'Todas completadas' : 'Pendientes'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evaluaciones detalladas */}
                {eligibility.evaluations && eligibility.evaluations.length > 0 && (
                    <div className="mt-6">
                        <h5 className="font-medium text-neutral-900 mb-3">Detalle de Evaluaciones</h5>
                        <div className="space-y-2">
                            {eligibility.evaluations.map((evaluation, index) => (
                                <div key={index} className="flex justify-between items-center py-2 px-3 bg-neutral-50 rounded">
                                    <div className="text-sm">
                                        <div className="font-medium text-neutral-900">{evaluation.title}</div>
                                        <div className="text-xs text-neutral-500">
                                            {evaluation.is_final ? 'Examen Final' : 'Evaluación Regular'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-medium ${getGradeColor(evaluation.percentage)}`}>
                                            {evaluation.best_score}/{evaluation.max_points}
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            {evaluation.percentage.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Certificado existente o acción */}
            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50">
                {existing_certificate ? (
                    <div className="text-center">
                        <div className="flex items-center justify-center text-green-600 mb-2">
                            <Award className="w-5 h-5 mr-2" />
                            <span className="font-medium">Certificado Obtenido</span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-3">
                            Ya tienes un certificado para este curso: 
                            <span className="font-mono font-medium"> {existing_certificate.certificate_number}</span>
                        </p>
                        <button
                            onClick={() => window.open(`/verificar/${existing_certificate.certificate_number}`, '_blank')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                            Ver Certificado
                        </button>
                    </div>
                ) : is_eligible && showGenerateButton ? (
                    <div className="text-center">
                        <button
                            onClick={handleGenerateCertificate}
                            disabled={generating}
                            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center mx-auto"
                        >
                            <Award className="w-4 h-4 mr-2" />
                            {generating ? 'Generando Certificado...' : 'Obtener Certificado'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-sm text-neutral-600 mb-3">
                            Complete los requisitos faltantes para obtener su certificado.
                        </p>
                        <button
                            onClick={loadEligibility}
                            className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 text-sm"
                        >
                            Verificar Nuevamente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificateEligibilityChecker;