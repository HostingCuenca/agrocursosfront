import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import StudentAttempts from '../components/StudentAttempts';
import { assignmentService } from '../services/assignmentService';
import { courseService } from '../services/courseService';
import useAuthStore from '../store/authStore';
import {
    BookOpen,
    Clock,
    CheckCircle,
    AlertCircle,
    Play,
    RefreshCw,
    FileText,
    Award,
    Timer,
    Target,
    Search,
    Filter,
    Info,
    Eye
} from 'lucide-react';

const StudentEvaluations = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showAttemptsModal, setShowAttemptsModal] = useState(false);
    const [assignmentAttempts, setAssignmentAttempts] = useState({});

    // Verificar permisos de estudiante
    useEffect(() => {
        if (user?.role !== 'student') {
            navigate('/dashboard');
            return;
        }
        loadStudentEvaluations();
    }, [user, navigate]);

    const loadStudentEvaluations = async () => {
        setLoading(true);
        try {
            // ✅ OPTIMIZADO: Una sola llamada obtiene TODO
            // Antes: 1 + N cursos + M assignments = 26+ requests
            // Ahora: 1 request con todos los datos
            const batchResponse = await assignmentService.getStudentAssignmentsBatch();
            
            if (batchResponse.success && batchResponse.courses_with_assignments) {
                // Extraer cursos inscritos
                const enrolledCoursesList = batchResponse.courses_with_assignments.map(course => ({
                    id: course.course_id,
                    title: course.course_title,
                    enrollment_status: course.enrollment_status
                }));
                setEnrolledCourses(enrolledCoursesList);

                // Extraer assignments con intentos ya incluidos
                const allAssignments = [];
                const attempts = {};
                
                batchResponse.courses_with_assignments.forEach(course => {
                    course.assignments.forEach(assignment => {
                        // Agregar assignment con datos del curso
                        const assignmentWithCourse = {
                            ...assignment,
                            id: assignment.assignment_id,
                            course_title: course.course_title,
                            course_id: course.course_id
                        };
                        allAssignments.push(assignmentWithCourse);
                        
                        // Los intentos ya vienen incluidos - no necesitamos llamadas adicionales
                        attempts[assignment.assignment_id] = assignment.attempts || [];
                    });
                });

                setAssignments(allAssignments);
                setAssignmentAttempts(attempts);
                
                console.log('✅ OPTIMIZED - Single batch call loaded:');
                console.log('📚 Enrolled courses:', enrolledCoursesList.length);
                console.log('📝 Total assignments:', allAssignments.length);
                console.log('🎯 Statistics:', batchResponse.statistics);
            } else {
                console.log('No courses found or API error');
                setEnrolledCourses([]);
                setAssignments([]);
                setAssignmentAttempts({});
            }
        } catch (error) {
            console.error('Error loading student evaluations:', error);
            setEnrolledCourses([]);
            setAssignments([]);
            setAssignmentAttempts({});
        } finally {
            setLoading(false);
        }
    };

    // ✅ ELIMINADO: loadAssignmentAttempts ya no necesario
    // Los intentos ahora vienen incluidos en el batch response

    const handleStartAssignment = (assignment) => {
        navigate(`/evaluaciones/${assignment.id}/realizar`);
    };

    const handleViewAttempts = (assignment) => {
        setSelectedAssignment(assignment);
        setShowAttemptsModal(true);
    };

    const closeAttemptsModal = () => {
        setShowAttemptsModal(false);
        setSelectedAssignment(null);
    };

    // Filtrar evaluaciones
    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            assignment.course_title.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCourse = selectedCourse === 'all' || assignment.course_id === selectedCourse;
        
        const status = assignmentService.getAssignmentStatus(assignment, []);
        const matchesStatus = filterStatus === 'all' || status.status === filterStatus;
        
        return matchesSearch && matchesCourse && matchesStatus;
    });

    // Calcular estadísticas
    const stats = {
        total: assignments.length,
        available: assignments.filter(a => {
            const attempts = assignmentAttempts[a.id] || [];
            const status = assignmentService.getAssignmentStatus(a, attempts);
            return status.canAttempt;
        }).length,
        completed: assignments.filter(a => {
            const attempts = assignmentAttempts[a.id] || [];
            const completedAttempts = attempts.filter(att => att.status === 'completed');
            return completedAttempts.length > 0;
        }).length,
        inProgress: assignments.filter(a => {
            const attempts = assignmentAttempts[a.id] || [];
            const inProgressAttempts = attempts.filter(att => att.status === 'in_progress' || att.status === 'pending_review');
            return inProgressAttempts.length > 0;
        }).length
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Mis Evaluaciones
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Evaluaciones disponibles de tus cursos inscritos
                        </p>
                    </div>
                    
                    <button
                        onClick={loadStudentEvaluations}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-gray-600">Total Evaluaciones</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Play className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
                                <p className="text-gray-600">Disponibles</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Timer className="w-8 h-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                                <p className="text-gray-600">En Progreso</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                                <p className="text-gray-600">Completadas</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Búsqueda */}
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar evaluaciones..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filtro por curso */}
                        <div className="relative">
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos los cursos</option>
                                {enrolledCourses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por estado */}
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos los estados</option>
                                <option value="available">Disponibles</option>
                                <option value="in_progress">En Progreso</option>
                                <option value="completed">Completadas</option>
                                <option value="expired">Expiradas</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Lista de evaluaciones */}
                <div className="bg-white rounded-lg shadow-sm border">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                            <span>Cargando evaluaciones...</span>
                        </div>
                    ) : filteredAssignments.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay evaluaciones disponibles
                            </h3>
                            <p className="text-gray-600">
                                {assignments.length === 0 
                                    ? 'No tienes evaluaciones en tus cursos inscritos'
                                    : 'No hay evaluaciones que coincidan con los filtros aplicados'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredAssignments.map((assignment) => {
                                const attempts = assignmentAttempts[assignment.id] || [];
                                const status = assignmentService.getAssignmentStatus(assignment, attempts);
                                const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
                                const completedAttempts = attempts.filter(att => att.status === 'completed');
                                const bestScore = completedAttempts.length > 0 
                                    ? Math.max(...completedAttempts.map(att => parseFloat(att.score))) 
                                    : null;
                                
                                return (
                                    <div key={assignment.id} className="p-6 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            {/* Información de la evaluación */}
                                            <div className="flex items-start space-x-4 flex-1">
                                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                                                    status.color === 'green' ? 'bg-green-100' :
                                                    status.color === 'orange' ? 'bg-orange-100' :
                                                    status.color === 'blue' ? 'bg-blue-100' :
                                                    status.color === 'red' ? 'bg-red-100' : 'bg-gray-100'
                                                }`}>
                                                    <FileText className={`w-8 h-8 ${
                                                        status.color === 'green' ? 'text-green-600' :
                                                        status.color === 'orange' ? 'text-orange-600' :
                                                        status.color === 'blue' ? 'text-blue-600' :
                                                        status.color === 'red' ? 'text-red-600' : 'text-gray-600'
                                                    }`} />
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                        {assignment.title}
                                                    </h3>
                                                    
                                                    {assignment.description && (
                                                        <p className="text-gray-600 mb-3">
                                                            {assignment.description}
                                                        </p>
                                                    )}
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center">
                                                                <BookOpen className="w-4 h-4 mr-2" />
                                                                <span className="font-medium">Curso:</span>
                                                                <span className="ml-1">{assignment.course_title}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Target className="w-4 h-4 mr-2" />
                                                                <span className="font-medium">Puntos:</span>
                                                                <span className="ml-1">{assignment.max_points || 100} puntos</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="space-y-2">
                                                            <div className="flex items-center">
                                                                <Clock className="w-4 h-4 mr-2" />
                                                                <span className="font-medium">Tiempo límite:</span>
                                                                <span className="ml-1">{assignment.time_limit_minutes || 'Sin límite'} min</span>
                                                            </div>
                                                            {assignment.due_date && (
                                                                <div className="flex items-center">
                                                                    <AlertCircle className="w-4 h-4 mr-2" />
                                                                    <span className="font-medium">Vence:</span>
                                                                    <span className="ml-1">{new Date(assignment.due_date).toLocaleDateString('es-ES')}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Información de intentos */}
                                                    {attempts.length > 0 && (
                                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                            <div className="text-sm text-blue-800">
                                                                <p className="font-medium">Intentos: {attempts.length}</p>
                                                                {lastAttempt && (
                                                                    <p>Estado actual: <span className="font-medium">{
                                                                        lastAttempt.status === 'completed' ? 'Calificado' :
                                                                        lastAttempt.status === 'pending_review' ? 'En revisión' :
                                                                        lastAttempt.status === 'submitted' ? 'Enviado' :
                                                                        'En progreso'
                                                                    }</span></p>
                                                                )}
                                                                {bestScore !== null && (
                                                                    <p>Mejor puntuación: <span className={`font-medium ${
                                                                        bestScore >= 60 ? 'text-green-600' : 'text-red-600'
                                                                    }`}>{bestScore}%</span></p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Descripción del estado */}
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm text-gray-700">
                                                            {status.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Estado y acciones */}
                                            <div className="flex flex-col items-end space-y-3">
                                                {/* Badge de estado */}
                                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                                    status.color === 'green' ? 'bg-green-100 text-green-800' :
                                                    status.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                                    status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                                    status.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {status.text}
                                                </span>

                                                {/* Botones de acción */}
                                                <div className="flex flex-col space-y-2">
                                                    {status.canAttempt && (
                                                        <button
                                                            onClick={() => handleStartAssignment(assignment)}
                                                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                                        >
                                                            <Play className="w-4 h-4 mr-1" />
                                                            {attempts.length > 0 ? 'Nuevo Intento' : 'Realizar Evaluación'}
                                                        </button>
                                                    )}

                                                    {attempts.length > 0 && (
                                                        <button
                                                            onClick={() => handleViewAttempts(assignment)}
                                                            className="flex items-center px-4 py-2 bg-green-100 text-green-700 border border-green-300 rounded-md hover:bg-green-200 text-sm"
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            Ver Intentos ({attempts.length})
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                        <div>
                            <h3 className="text-blue-800 font-medium">Información sobre las Evaluaciones</h3>
                            <div className="text-blue-700 text-sm mt-1 space-y-1">
                                <p>• Solo puedes ver evaluaciones de cursos en los que estés inscrito</p>
                                <p>• Algunas evaluaciones pueden tener límite de tiempo</p>
                                <p>• Puedes tener múltiples intentos dependiendo de la configuración</p>
                                <p>• Las respuestas se guardan automáticamente durante el examen</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de intentos */}
                <StudentAttempts 
                    assignment={selectedAssignment}
                    isOpen={showAttemptsModal}
                    onClose={closeAttemptsModal}
                />
            </div>
        </DashboardLayout>
    );
};

export default StudentEvaluations;