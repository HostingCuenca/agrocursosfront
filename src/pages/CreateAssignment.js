import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { assignmentService } from '../services/assignmentService';
import { courseService } from '../services/courseService';
import useAuthStore from '../store/authStore';
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    Clock,
    Target,
    Calendar,
    Eye,
    EyeOff,
    HelpCircle,
    AlertCircle
} from 'lucide-react';

const CreateAssignment = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        course_id: '',
        title: '',
        description: '',
        max_points: 100,
        time_limit_minutes: 120,
        due_date: '',
        is_published: false,
        questions: []
    });

    const [errors, setErrors] = useState({});

    // Tipos de preguntas disponibles
    const questionTypes = [
        { value: 'multiple_choice', label: 'Opción Múltiple', icon: '📝' },
        { value: 'true_false', label: 'Verdadero/Falso', icon: '✅' },
        { value: 'short_text', label: 'Respuesta Corta', icon: '💬' },
        { value: 'essay', label: 'Ensayo', icon: '📄' }
    ];

    useEffect(() => {
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            navigate('/dashboard');
            return;
        }
        loadCourses();
    }, [user, navigate]);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const response = await courseService.getCourses();
            if (response.success) {
                // Filtrar cursos del instructor o todos si es admin
                const userCourses = user.role === 'admin' 
                    ? response.courses
                    : response.courses.filter(course => course.instructor_id === user.id);
                setCourses(userCourses);
                
                // Seleccionar primer curso por defecto
                if (userCourses.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        course_id: userCourses[0].id
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Limpiar error del campo cuando se modifica
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const addQuestion = () => {
        const newQuestion = {
            id: Date.now(), // ID temporal
            question: '',
            type: 'multiple_choice',
            options: ['', '', '', ''],
            correct_answer: 0,
            points: 10
        };

        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
    };

    const removeQuestion = (questionIndex) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, index) => index !== questionIndex)
        }));
    };

    const updateQuestion = (questionIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map((question, index) => 
                index === questionIndex 
                    ? { ...question, [field]: value }
                    : question
            )
        }));
    };

    const updateQuestionOption = (questionIndex, optionIndex, value) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map((question, index) => 
                index === questionIndex 
                    ? {
                        ...question,
                        options: question.options.map((option, oIndex) =>
                            oIndex === optionIndex ? value : option
                        )
                    }
                    : question
            )
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.course_id) newErrors.course_id = 'Selecciona un curso';
        if (!formData.title.trim()) newErrors.title = 'El título es requerido';
        if (formData.title.length < 3) newErrors.title = 'El título debe tener al menos 3 caracteres';
        if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
        if (formData.max_points <= 0) newErrors.max_points = 'Los puntos deben ser mayor a 0';
        if (formData.questions.length === 0) newErrors.questions = 'Debes agregar al menos una pregunta';

        // Validar preguntas
        formData.questions.forEach((question, index) => {
            if (!question.question.trim()) {
                newErrors[`question_${index}`] = 'La pregunta es requerida';
            }
            if (question.points <= 0) {
                newErrors[`question_${index}_points`] = 'Los puntos deben ser mayor a 0';
            }
            
            if (question.type === 'multiple_choice') {
                const validOptions = question.options.filter(option => option.trim() !== '');
                if (validOptions.length < 2) {
                    newErrors[`question_${index}_options`] = 'Debes tener al menos 2 opciones';
                }
                if (question.correct_answer >= validOptions.length) {
                    newErrors[`question_${index}_correct`] = 'Selecciona una respuesta correcta válida';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            // Preparar datos para el backend
            const assignmentData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                questions: formData.questions.map(q => ({
                    question: q.question,
                    type: q.type,
                    options: q.type === 'multiple_choice' ? q.options.filter(opt => opt.trim() !== '') : [],
                    correct_answer: q.type === 'multiple_choice' ? q.correct_answer : null,
                    points: parseInt(q.points)
                })),
                max_points: parseInt(formData.max_points),
                time_limit_minutes: formData.time_limit_minutes ? parseInt(formData.time_limit_minutes) : null,
                due_date: formData.due_date || null,
                is_published: formData.is_published
            };

            const response = await assignmentService.createAssignment(formData.course_id, assignmentData);
            
            if (response.success) {
                alert('Evaluación creada exitosamente');
                navigate('/gestion-evaluaciones');
            } else {
                alert('Error al crear la evaluación: ' + (response.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error creating assignment:', error);
            alert('Error al crear la evaluación: ' + (error.message || 'Error desconocido'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span>Cargando...</span>
                </div>
            </DashboardLayout>
        );
    }

    if (courses.length === 0) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cursos disponibles</h3>
                    <p className="text-gray-600 mb-4">
                        Necesitas tener al menos un curso para crear evaluaciones
                    </p>
                    <button
                        onClick={() => navigate('/cursos')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Ir a Cursos
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/gestion-evaluaciones')}
                            className="flex items-center text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Evaluación</h1>
                            <p className="text-gray-600">Configura las preguntas y parámetros de tu evaluación</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Configuración básica */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración Básica</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Curso *
                                </label>
                                <select
                                    name="course_id"
                                    value={formData.course_id}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.course_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Selecciona un curso</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.course_id && <p className="text-red-500 text-sm mt-1">{errors.course_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Puntos Máximos *
                                </label>
                                <input
                                    type="number"
                                    name="max_points"
                                    value={formData.max_points}
                                    onChange={handleInputChange}
                                    min="1"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.max_points ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.max_points && <p className="text-red-500 text-sm mt-1">{errors.max_points}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Tiempo Límite (minutos)
                                </label>
                                <input
                                    type="number"
                                    name="time_limit_minutes"
                                    value={formData.time_limit_minutes}
                                    onChange={handleInputChange}
                                    min="1"
                                    placeholder="Sin límite"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Fecha de Vencimiento
                                </label>
                                <input
                                    type="datetime-local"
                                    name="due_date"
                                    value={formData.due_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Ej: Examen Final de Agricultura"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Describe el objetivo y contenido de esta evaluación..."
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div className="mt-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_published"
                                    checked={formData.is_published}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {formData.is_published ? <Eye className="w-4 h-4 inline mr-1" /> : <EyeOff className="w-4 h-4 inline mr-1" />}
                                    Publicar inmediatamente (visible para estudiantes)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Preguntas */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Preguntas ({formData.questions.length})
                            </h2>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Pregunta
                            </button>
                        </div>

                        {errors.questions && <p className="text-red-500 text-sm mb-4">{errors.questions}</p>}

                        {formData.questions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p>No hay preguntas aún. Agrega la primera pregunta para comenzar.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {formData.questions.map((question, questionIndex) => (
                                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium text-gray-900">
                                                Pregunta {questionIndex + 1}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(questionIndex)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tipo de Pregunta
                                                </label>
                                                <select
                                                    value={question.type}
                                                    onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {questionTypes.map(type => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.icon} {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Target className="w-4 h-4 inline mr-1" />
                                                    Puntos
                                                </label>
                                                <input
                                                    type="number"
                                                    value={question.points}
                                                    onChange={(e) => updateQuestion(questionIndex, 'points', e.target.value)}
                                                    min="1"
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        errors[`question_${questionIndex}_points`] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors[`question_${questionIndex}_points`] && 
                                                    <p className="text-red-500 text-sm mt-1">{errors[`question_${questionIndex}_points`]}</p>
                                                }
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Pregunta *
                                            </label>
                                            <textarea
                                                value={question.question}
                                                onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                                                rows="2"
                                                placeholder="Escribe tu pregunta aquí..."
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    errors[`question_${questionIndex}`] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors[`question_${questionIndex}`] && 
                                                <p className="text-red-500 text-sm mt-1">{errors[`question_${questionIndex}`]}</p>
                                            }
                                        </div>

                                        {/* Opciones para multiple choice */}
                                        {question.type === 'multiple_choice' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Opciones de Respuesta *
                                                </label>
                                                <div className="space-y-2">
                                                    {question.options.map((option, optionIndex) => (
                                                        <div key={optionIndex} className="flex items-center space-x-2">
                                                            <input
                                                                type="radio"
                                                                name={`correct_${questionIndex}`}
                                                                checked={question.correct_answer === optionIndex}
                                                                onChange={() => updateQuestion(questionIndex, 'correct_answer', optionIndex)}
                                                                className="text-blue-600"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={option}
                                                                onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                                                                placeholder={`Opción ${optionIndex + 1}`}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                {errors[`question_${questionIndex}_options`] && 
                                                    <p className="text-red-500 text-sm mt-1">{errors[`question_${questionIndex}_options`]}</p>
                                                }
                                                {errors[`question_${questionIndex}_correct`] && 
                                                    <p className="text-red-500 text-sm mt-1">{errors[`question_${questionIndex}_correct`]}</p>
                                                }
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Marca el círculo de la opción correcta
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/gestion-evaluaciones')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Crear Evaluación
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default CreateAssignment;