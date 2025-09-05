import api from './authService';

export const assignmentService = {
    // ✅ OPTIMIZADO: Obtener TODAS las asignaciones con datos completos para Admin/Instructor
    // Reemplaza múltiples llamadas a getCourseAssignments() + getAssignmentAttempts()
    // De 50+ requests a 1 request - elimina problema N×M queries
    getAllAssignments: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.status) queryParams.append('status', params.status);
            if (params.page) queryParams.append('page', params.page);
            
            const url = `/assignments/all${
                queryParams.toString() ? '?' + queryParams.toString() : ''
            }`;
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Get all assignments error:', error);
            throw error;
        }
    },

    // ========== PARA ESTUDIANTES ==========
    
    // Obtener evaluaciones disponibles para estudiante
    getStudentAssignments: async (courseId) => {
        try {
            const response = await api.get(`/assignments/courses/${courseId}/assignments`);
            return response.data;
        } catch (error) {
            console.error('Get student assignments error:', error);
            throw error;
        }
    },

    // Obtener mis intentos para una evaluación específica
    getMyAttempts: async (assignmentId) => {
        try {
            const response = await api.get(`/assignments/${assignmentId}/my-attempts`);
            return response.data;
        } catch (error) {
            console.error('Get my attempts error:', error);
            throw error;
        }
    },

    // ========== PARA INSTRUCTORES/ADMINISTRADORES ==========

    // Obtener asignaciones de un curso
    getCourseAssignments: async (courseId) => {
        try {
            const response = await api.get(`/assignments/courses/${courseId}/assignments`);
            return response.data;
        } catch (error) {
            console.error('Get course assignments error:', error);
            throw error;
        }
    },

    // Obtener asignación específica (incluye intentos del estudiante)
    getAssignmentById: async (assignmentId) => {
        try {
            const response = await api.get(`/assignments/${assignmentId}`);
            return response.data;
        } catch (error) {
            console.error('Get assignment by ID error:', error);
            throw error;
        }
    },

    // Crear asignación/examen (instructor/admin)
    createAssignment: async (courseId, assignmentData) => {
        try {
            const response = await api.post(`/assignments/courses/${courseId}/assignments`, assignmentData);
            return response.data;
        } catch (error) {
            console.error('Create assignment error:', error);
            throw error;
        }
    },

    // Actualizar asignación (instructor/admin)
    updateAssignment: async (assignmentId, assignmentData) => {
        try {
            const response = await api.put(`/assignments/${assignmentId}`, assignmentData);
            return response.data;
        } catch (error) {
            console.error('Update assignment error:', error);
            throw error;
        }
    },

    // Eliminar asignación (instructor/admin)
    deleteAssignment: async (assignmentId) => {
        try {
            const response = await api.delete(`/assignments/${assignmentId}`);
            return response.data;
        } catch (error) {
            console.error('Delete assignment error:', error);
            throw error;
        }
    },

    // ✅ NUEVO: Iniciar evaluación sin crear registro (student)
    startEvaluation: async (assignmentId) => {
        try {
            const response = await api.post(`/assignments/${assignmentId}/start`);
            return response.data;
        } catch (error) {
            console.error('Start evaluation error:', error);
            throw error;
        }
    },

    // ✅ NUEVO: Enviar evaluación completa con session token (student)
    submitEvaluation: async (assignmentId, answers, sessionToken) => {
        try {
            const response = await api.post(`/assignments/${assignmentId}/submit`, {
                answers,
                session_token: sessionToken
            });
            return response.data;
        } catch (error) {
            console.error('Submit evaluation error:', error);
            throw error;
        }
    },

    // ⚠️ DEPRECATED: Iniciar intento de examen (usa startEvaluation)
    startAttempt: async (assignmentId) => {
        try {
            const response = await api.post(`/assignments/${assignmentId}/attempt`);
            return response.data;
        } catch (error) {
            console.error('Start attempt error:', error);
            throw error;
        }
    },

    // ⚠️ DEPRECATED: Enviar respuestas del examen (usa submitEvaluation)
    submitAttempt: async (attemptId, answers) => {
        try {
            const response = await api.post(`/assignments/attempts/${attemptId}/submit`, {
                answers
            });
            return response.data;
        } catch (error) {
            console.error('Submit attempt error:', error);
            throw error;
        }
    },

    // Ver todos los intentos de una asignación (instructor/admin)
    getAssignmentAttempts: async (assignmentId) => {
        try {
            const response = await api.get(`/assignments/${assignmentId}/attempts`);
            return response.data;
        } catch (error) {
            console.error('Get assignment attempts error:', error);
            throw error;
        }
    },

    // Obtener intento específico
    getAttemptById: async (attemptId) => {
        try {
            const response = await api.get(`/assignments/attempts/${attemptId}`);
            return response.data;
        } catch (error) {
            console.error('Get attempt by ID error:', error);
            throw error;
        }
    },

    // Calificar intento manualmente (instructor/admin)
    gradeAttempt: async (attemptId, gradeData) => {
        try {
            const response = await api.post(`/assignments/attempts/${attemptId}/manual-grade`, gradeData);
            return response.data;
        } catch (error) {
            console.error('Grade attempt error:', error);
            throw error;
        }
    },

    // Ver intentos pendientes de revisión
    getPendingReviews: async (assignmentId) => {
        try {
            const response = await api.get(`/assignments/${assignmentId}/pending-reviews`);
            return response.data;
        } catch (error) {
            console.error('Get pending reviews error:', error);
            throw error;
        }
    },

    // ========== FUNCIONES AUXILIARES ==========

    // Formatear tiempo restante
    formatTimeRemaining: (seconds) => {
        if (!seconds || seconds <= 0) return '00:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Calcular progreso del examen
    calculateProgress: (answers, totalQuestions) => {
        if (!answers || !totalQuestions) return 0;
        
        const answeredCount = Object.keys(answers).filter(key => {
            const answer = answers[key];
            return answer !== null && answer !== undefined && answer.toString().trim() !== '';
        }).length;
        
        return Math.round((answeredCount / totalQuestions) * 100);
    },

    // Validar respuestas antes del envío
    validateAnswers: (questions, answers) => {
        const errors = {};
        const warnings = {};

        questions.forEach(question => {
            const answer = answers[question.id];

            if (!answer || answer.toString().trim() === '') {
                errors[question.id] = 'Esta pregunta es obligatoria';
                return;
            }

            switch (question.type) {
                case 'essay':
                    if (question.min_words) {
                        const wordCount = answer.split(' ').filter(word => word.trim() !== '').length;
                        if (wordCount < question.min_words) {
                            errors[question.id] = `Mínimo ${question.min_words} palabras requeridas (tienes ${wordCount})`;
                        }
                    }
                    break;

                case 'short_text':
                    if (answer.length < 3) {
                        errors[question.id] = 'La respuesta debe tener al menos 3 caracteres';
                    }
                    break;

                case 'multiple_choice':
                    if (!question.options || !question.options.some(option => option.id === answer)) {
                        errors[question.id] = 'Selecciona una opción válida';
                    }
                    break;

                case 'true_false':
                    if (answer !== 'true' && answer !== 'false') {
                        errors[question.id] = 'Selecciona Verdadero o Falso';
                    }
                    break;

                default:
                    break;
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            warnings,
            hasWarnings: Object.keys(warnings).length > 0
        };
    },

    // Determinar estado de evaluación
    getAssignmentStatus: (assignment, userAttempts = []) => {
        if (!assignment.is_published) {
            return {
                status: 'draft',
                text: 'Borrador',
                color: 'gray',
                canAttempt: false,
                description: 'Esta evaluación aún no está disponible'
            };
        }

        const now = new Date();
        const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;

        if (dueDate && now > dueDate) {
            return {
                status: 'expired',
                text: 'Expirado',
                color: 'red',
                canAttempt: false,
                description: 'El plazo para realizar esta evaluación ha terminado'
            };
        }

        const completedAttempts = userAttempts.filter(attempt => 
            attempt.status === 'completed' || attempt.status === 'pending_review'
        );

        const maxAttempts = parseInt(assignment.max_attempts) || Infinity;
        const hasAttemptsRemaining = completedAttempts.length < maxAttempts;

        if (completedAttempts.length > 0) {
            const bestAttempt = completedAttempts.reduce((best, current) => 
                (current.score || 0) > (best.score || 0) ? current : best
            );

            const passScore = assignment.pass_score || 60;
            const hasPassed = (bestAttempt.score || 0) >= passScore;

            if (hasPassed) {
                return {
                    status: 'completed',
                    text: 'Completado',
                    color: 'green',
                    canAttempt: hasAttemptsRemaining,
                    description: `Aprobado con ${bestAttempt.score}% (${completedAttempts.length}/${maxAttempts === Infinity ? '∞' : maxAttempts} intentos)`
                };
            } else if (hasAttemptsRemaining) {
                return {
                    status: 'in_progress',
                    text: 'En Progreso',
                    color: 'orange',
                    canAttempt: true,
                    description: `Mejor puntuación: ${bestAttempt.score}% (${completedAttempts.length}/${maxAttempts === Infinity ? '∞' : maxAttempts} intentos)`
                };
            } else {
                return {
                    status: 'failed',
                    text: 'No Aprobado',
                    color: 'red',
                    canAttempt: false,
                    description: `Puntuación final: ${bestAttempt.score}% (${completedAttempts.length}/${maxAttempts} intentos agotados)`
                };
            }
        }

        return {
            status: 'available',
            text: 'Disponible',
            color: 'blue',
            canAttempt: true,
            description: dueDate 
                ? `Disponible hasta ${dueDate.toLocaleDateString('es-ES')}`
                : 'Evaluación disponible para realizar'
        };
    }
};

export default assignmentService;