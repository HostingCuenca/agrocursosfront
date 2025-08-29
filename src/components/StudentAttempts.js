import React, { useState, useEffect } from 'react';
import { assignmentService } from '../services/assignmentService';
import {
    Clock,
    CheckCircle,
    AlertCircle,
    Eye,
    Calendar,
    Target,
    FileText,
    Timer,
    X
} from 'lucide-react';

const StudentAttempts = ({ assignment, isOpen, onClose }) => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && assignment) {
            loadAttempts();
        }
    }, [isOpen, assignment]);

    const loadAttempts = async () => {
        setLoading(true);
        try {
            const result = await assignmentService.getMyAttempts(assignment.id);
            if (result.success) {
                setAttempts(result.attempts || []);
            } else {
                setAttempts([]);
            }
        } catch (error) {
            console.error('Error loading attempts:', error);
            setAttempts([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            'in_progress': { 
                text: 'En Curso', 
                color: 'blue', 
                icon: Timer, 
                bgColor: 'bg-blue-100', 
                textColor: 'text-blue-800' 
            },
            'submitted': { 
                text: 'Enviado', 
                color: 'orange', 
                icon: Clock, 
                bgColor: 'bg-orange-100', 
                textColor: 'text-orange-800' 
            },
            'pending_review': { 
                text: 'En Revisión', 
                color: 'yellow', 
                icon: AlertCircle, 
                bgColor: 'bg-yellow-100', 
                textColor: 'text-yellow-800' 
            },
            'completed': { 
                text: 'Calificado', 
                color: 'green', 
                icon: CheckCircle, 
                bgColor: 'bg-green-100', 
                textColor: 'text-green-800' 
            }
        };
        return statusMap[status] || { 
            text: status, 
            color: 'gray', 
            icon: FileText, 
            bgColor: 'bg-gray-100', 
            textColor: 'text-gray-800' 
        };
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Mis Intentos - {assignment?.title}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Historial de intentos para esta evaluación
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                            <span>Cargando intentos...</span>
                        </div>
                    ) : attempts.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay intentos aún
                            </h3>
                            <p className="text-gray-600">
                                Aún no has realizado ningún intento en esta evaluación
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {attempts.map((attempt, index) => {
                                const status = getStatusDisplay(attempt.status);
                                const StatusIcon = status.icon;
                                
                                return (
                                    <div key={attempt.id} className="bg-white border rounded-lg p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Intento #{attempts.length - index}
                                            </h3>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.textColor}`}>
                                                <StatusIcon className="w-4 h-4 mr-1" />
                                                {status.text}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                                <div>
                                                    <p className="font-medium">Iniciado</p>
                                                    <p className="text-gray-600">{formatDate(attempt.started_at)}</p>
                                                </div>
                                            </div>

                                            {attempt.submitted_at && (
                                                <div className="flex items-center">
                                                    <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
                                                    <div>
                                                        <p className="font-medium">Enviado</p>
                                                        <p className="text-gray-600">{formatDate(attempt.submitted_at)}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center">
                                                <Target className="w-4 h-4 mr-2 text-gray-500" />
                                                <div>
                                                    <p className="font-medium">Puntuación</p>
                                                    <p className={`font-bold ${
                                                        attempt.status === 'completed' 
                                                            ? parseFloat(attempt.score) >= 60 
                                                                ? 'text-green-600' 
                                                                : 'text-red-600'
                                                            : 'text-gray-600'
                                                    }`}>
                                                        {attempt.score}/{attempt.max_points}
                                                        {attempt.status === 'completed' && (
                                                            <span className="text-sm ml-1">
                                                                ({Math.round((parseFloat(attempt.score) / attempt.max_points) * 100)}%)
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {attempt.time_spent_minutes !== undefined && (
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                                    <div>
                                                        <p className="font-medium">Tiempo</p>
                                                        <p className="text-gray-600">
                                                            {Math.abs(attempt.time_spent_minutes)} min
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Estado específico */}
                                        {attempt.status === 'pending_review' && (
                                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-center text-yellow-800 text-sm">
                                                    <AlertCircle className="w-4 h-4 mr-2" />
                                                    <span>Esperando revisión manual del instructor. Te notificaremos cuando esté calificado.</span>
                                                </div>
                                            </div>
                                        )}

                                        {attempt.status === 'completed' && attempt.metadata?.general_feedback && (
                                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <h4 className="font-medium text-blue-800 mb-1">Comentarios del instructor:</h4>
                                                <p className="text-blue-700 text-sm">{attempt.metadata.general_feedback}</p>
                                            </div>
                                        )}

                                        {/* Detalles de respuestas si están disponibles */}
                                        {attempt.metadata?.answer_details && attempt.status === 'completed' && (
                                            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                <h4 className="font-medium text-gray-800 mb-2">Detalles por pregunta:</h4>
                                                <div className="space-y-1 text-sm">
                                                    {attempt.metadata.answer_details.map((detail, idx) => (
                                                        <div key={idx} className="flex items-center justify-between">
                                                            <span>Pregunta {detail.question_id}</span>
                                                            <span className={`font-medium ${
                                                                detail.is_correct ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {detail.points_earned} pts
                                                                {detail.needs_manual_review && (
                                                                    <span className="text-yellow-600 ml-1">(Revisión manual)</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentAttempts;