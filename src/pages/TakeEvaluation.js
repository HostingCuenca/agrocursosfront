import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { assignmentService } from '../services/assignmentService';
import useAuthStore from '../store/authStore';
import {
    Clock,
    CheckCircle,
    AlertCircle,
    Send,
    ArrowLeft,
    Timer,
    AlertTriangle
} from 'lucide-react';

const TakeEvaluation = () => {
    const { assignmentId } = useParams();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [assignment, setAssignment] = useState(null);
    const [sessionToken, setSessionToken] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Verificar permisos y cargar datos
    useEffect(() => {
        if (user?.role !== 'student') {
            navigate('/dashboard');
            return;
        }
        startEvaluation();
    }, [user, navigate, assignmentId]);

    // Timer para el examen
    useEffect(() => {
        if (timeRemaining > 0) {
            const timer = setTimeout(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeRemaining === 0 && sessionToken && assignment) {
            // Auto-envío cuando se acaba el tiempo
            handleSubmitEvaluation(true);
        }
    }, [timeRemaining, sessionToken, assignment]);

    const startEvaluation = async () => {
        setLoading(true);
        try {
            console.log('Starting evaluation with ID:', assignmentId);
            
            // ✅ NUEVO: Usar endpoint /start que no crea registro en DB
            const result = await assignmentService.startEvaluation(assignmentId);
            
            if (result.success) {
                console.log('Evaluation started successfully:', result);
                console.log('Questions structure:', result.assignment.questions);
                if (result.assignment.questions?.[0]?.options) {
                    console.log('First question options:', result.assignment.questions[0].options);
                    console.log('Option types:', result.assignment.questions[0].options.map(opt => typeof opt));
                }
                
                setAssignment(result.assignment);
                setSessionToken(result.session_token);
                
                // Configurar tiempo límite
                if (result.assignment.time_limit_minutes) {
                    setTimeRemaining(result.assignment.time_limit_minutes * 60);
                }
                
                // ✅ NUEVO: Intentar cargar respuestas guardadas de localStorage
                const savedAnswersKey = `evaluation_${assignmentId}_answers`;
                const savedAnswers = localStorage.getItem(savedAnswersKey);
                
                let initialAnswers = {};
                if (savedAnswers) {
                    try {
                        initialAnswers = JSON.parse(savedAnswers);
                        console.log('Loaded saved answers from localStorage:', initialAnswers);
                    } catch (error) {
                        console.warn('Error parsing saved answers:', error);
                        initialAnswers = {};
                    }
                }
                
                // Asegurar que todas las preguntas tienen una respuesta inicializada
                result.assignment.questions?.forEach((question, index) => {
                    if (initialAnswers[index] === undefined) {
                        initialAnswers[index] = '';
                    }
                });
                
                setAnswers(initialAnswers);
            } else {
                alert('Error: ' + (result.error || 'No se pudo iniciar la evaluación'));
                navigate('/evaluaciones');
            }
        } catch (error) {
            console.error('Error starting evaluation:', error);
            
            // Mejorar manejo de errores específicos
            let errorMessage = 'Error al iniciar la evaluación';
            
            if (error.response?.status === 404) {
                errorMessage = 'Esta evaluación no existe o no tienes acceso a ella';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            alert(errorMessage);
            navigate('/evaluaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        const newAnswers = {
            ...answers,
            [questionId]: value
        };
        
        setAnswers(newAnswers);
        
        // ✅ NUEVO: Guardar respuestas en localStorage para persistencia
        const savedAnswersKey = `evaluation_${assignmentId}_answers`;
        try {
            localStorage.setItem(savedAnswersKey, JSON.stringify(newAnswers));
        } catch (error) {
            console.warn('Error saving answers to localStorage:', error);
        }
    };

    const handleSubmitEvaluation = async (isAutoSubmit = false) => {
        if (submitting) return;

        if (!isAutoSubmit) {
            if (!window.confirm('¿Estás seguro de enviar tu evaluación? No podrás modificar las respuestas después.')) {
                return;
            }
        }

        setSubmitting(true);
        try {
            // ✅ NUEVO: Convertir respuestas al formato simple del nuevo endpoint
            const answersArray = Object.values(answers);

            console.log('Submitting answers:', answersArray);
            console.log('Session token:', sessionToken);
            
            // ✅ NUEVO: Usar endpoint /submit con session token
            const result = await assignmentService.submitEvaluation(assignmentId, answersArray, sessionToken);
            
            if (result.success) {
                // ✅ NUEVO: Limpiar localStorage después de envío exitoso
                const savedAnswersKey = `evaluation_${assignmentId}_answers`;
                localStorage.removeItem(savedAnswersKey);
                
                alert(isAutoSubmit 
                    ? 'Tiempo agotado. Examen enviado automáticamente.'
                    : 'Examen enviado exitosamente'
                );
                navigate('/evaluaciones');
            } else {
                alert('Error: ' + (result.error || 'No se pudo enviar la evaluación'));
            }
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            alert('Error al enviar la evaluación: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderQuestion = (question, index) => {
        const currentAnswer = answers[index] || '';

        return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border mb-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {index + 1}. {question.question}
                    </h3>
                    <p className="text-sm text-blue-600">
                        {question.points} puntos
                    </p>
                </div>

                {question.type === 'true_false' && (
                    <div className="space-y-3">
                        <label className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                            currentAnswer === "true" ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
                        }`}>
                            <input
                                type="radio"
                                name={`question-${index}`}
                                value="true"
                                checked={currentAnswer === "true"}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                className="mr-3 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className={`${currentAnswer === "true" ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                                Verdadero
                            </span>
                        </label>
                        <label className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                            currentAnswer === "false" ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
                        }`}>
                            <input
                                type="radio"
                                name={`question-${index}`}
                                value="false"
                                checked={currentAnswer === "false"}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                className="mr-3 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className={`${currentAnswer === "false" ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                                Falso
                            </span>
                        </label>
                    </div>
                )}

                {question.type === 'multiple_choice' && question.options && (
                    <div className="space-y-3">
                        {question.options.map((option, optionIndex) => {
                            // Manejar diferentes formatos de opciones
                            const optionText = typeof option === 'string' 
                                ? option 
                                : (option.text || option.label || JSON.stringify(option));
                            const optionValue = typeof option === 'string' 
                                ? optionIndex.toString()
                                : (option.id?.toString() || optionIndex.toString());
                            
                            return (
                                <label key={optionIndex} className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                                    currentAnswer === optionValue ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
                                }`}>
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value={optionValue}
                                        checked={currentAnswer === optionValue}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        className="mr-3 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className={`${currentAnswer === optionValue ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                                        {optionText}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                )}

                {question.type === 'short_text' && (
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Escribe tu respuesta..."
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                    />
                )}

                {question.type === 'essay' && (
                    <div>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Escribe tu ensayo${question.min_words ? ` (mínimo ${question.min_words} palabras)` : ''}...`}
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                        />
                        {question.min_words && (
                            <p className="text-sm text-gray-500 mt-2">
                                Palabras: {currentAnswer.split(' ').filter(word => word.trim() !== '').length} / {question.min_words} mínimo
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p>Iniciando evaluación...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!assignment || !sessionToken) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Error al cargar la evaluación
                    </h2>
                    <button
                        onClick={() => navigate('/evaluaciones')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver a Evaluaciones
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const answeredCount = Object.values(answers).filter(answer => 
        answer && answer.toString().trim() !== ''
    ).length;
    const totalQuestions = assignment.questions?.length || 0;
    const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
                            <p className="text-gray-600">{assignment.description}</p>
                        </div>
                        
                        {/* Tiempo restante */}
                        {timeRemaining > 0 && (
                            <div className={`flex items-center px-4 py-2 rounded-lg ${
                                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 
                                timeRemaining < 600 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                            }`}>
                                <Timer className="w-5 h-5 mr-2" />
                                <span className="font-mono text-lg">
                                    {assignmentService.formatTimeRemaining(timeRemaining)}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* Información del examen */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span>Preguntas: {totalQuestions}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Puntos: {assignment.max_points}</span>
                        </div>
                        <div className="flex items-center">
                            <Timer className="w-4 h-4 mr-2" />
                            <span>Tiempo: {assignment.time_limit_minutes || 'Sin límite'} min</span>
                        </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        Progreso: {answeredCount} de {totalQuestions} preguntas ({progress}%)
                    </p>
                </div>

                {/* Advertencia de tiempo */}
                {timeRemaining > 0 && timeRemaining < 300 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center text-red-800">
                            <AlertTriangle className="w-5 h-5 mr-3" />
                            <div>
                                <h4 className="font-medium">¡Tiempo casi agotado!</h4>
                                <p className="text-sm mt-1">El examen se enviará automáticamente cuando se acabe el tiempo.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preguntas */}
                <div className="space-y-6">
                    {assignment.questions?.map((question, index) => 
                        renderQuestion(question, index)
                    )}
                </div>

                {/* Controles */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/evaluaciones')}
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver
                        </button>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {answeredCount} de {totalQuestions} respondidas
                            </span>
                            
                            <button
                                onClick={() => handleSubmitEvaluation()}
                                disabled={submitting}
                                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                <Send className={`w-4 h-4 mr-1 ${submitting ? 'animate-spin' : ''}`} />
                                {submitting ? 'Enviando...' : 'Enviar Evaluación'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TakeEvaluation;