import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { assignmentService } from '../services/assignmentService';
import { courseService } from '../services/courseService';
import useAuthStore from '../store/authStore';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Users,
    Clock,
    FileText,
    BarChart3,
    RefreshCw,
    Search,
    Filter,
    BookOpen,
    Target,
    Calendar,
    CheckCircle,
    AlertCircle,
    Settings
} from 'lucide-react';

const InstructorEvaluations = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Verificar permisos
    useEffect(() => {
        if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
            navigate('/dashboard');
            return;
        }
        loadInstructorData();
    }, [user, navigate]);

    const loadInstructorData = async () => {
        setLoading(true);
        try {
            // Cargar cursos del instructor
            const coursesResponse = await courseService.getCourses();
            if (coursesResponse.success) {
                // Filtrar solo cursos del instructor o todos si es admin
                const instructorCourses = user.role === 'admin' 
                    ? coursesResponse.courses
                    : coursesResponse.courses.filter(course => course.instructor_id === user.id);
                
                setCourses(instructorCourses);
                
                // ✅ OPTIMIZADO: Una sola llamada para todas las evaluaciones + intentos
                // Antes: N llamadas por curso + M llamadas por assignment = 50+ requests
                // Ahora: 1 llamada con todos los datos = milisegundos
                try {
                    const assignmentsResponse = await assignmentService.getAllAssignments();
                    if (assignmentsResponse.success && assignmentsResponse.assignments) {
                        // Agrupar datos por assignment_id (pueden haber múltiples filas por assignment debido a intentos)
                        const assignmentMap = new Map();
                        
                        assignmentsResponse.assignments.forEach(row => {
                            const assignmentId = row.assignment_id;
                            
                            if (!assignmentMap.has(assignmentId)) {
                                assignmentMap.set(assignmentId, {
                                    id: assignmentId,
                                    title: row.assignment_title,
                                    description: row.assignment_description,
                                    max_points: row.max_points,
                                    time_limit_minutes: row.time_limit_minutes,
                                    due_date: row.due_date,
                                    is_published: row.is_published,
                                    course_id: row.course_id,
                                    course_title: row.course_title,
                                    course_category: row.course_category,
                                    instructor_name: row.instructor_name,
                                    total_attempts: 0,
                                    students_attempted: new Set(),
                                    attempts: []
                                });
                            }
                            
                            const assignment = assignmentMap.get(assignmentId);
                            
                            // Agregar intento si existe
                            if (row.attempt_id) {
                                assignment.attempts.push({
                                    id: row.attempt_id,
                                    student_id: row.student_id,
                                    student_name: row.student_name,
                                    student_email: row.student_email,
                                    started_at: row.started_at,
                                    submitted_at: row.submitted_at,
                                    score: row.score,
                                    status: row.attempt_status,
                                    time_spent_minutes: row.time_spent_minutes
                                });
                                assignment.students_attempted.add(row.student_id);
                                assignment.total_attempts++;
                            }
                        });
                        
                        // Convertir Map a Array y ajustar contador de estudiantes
                        const finalAssignments = Array.from(assignmentMap.values()).map(assignment => ({
                            ...assignment,
                            students_attempted: assignment.students_attempted.size
                        }));
                        
                        setAssignments(finalAssignments);
                    }
                } catch (error) {
                    console.error('Error loading all assignments:', error);
                    setAssignments([]);
                }
            }
        } catch (error) {
            console.error('Error loading instructor data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = () => {
        if (courses.length === 0) {
            alert('Debes tener al menos un curso para crear evaluaciones');
            return;
        }
        navigate('/evaluaciones/crear');
    };

    const handleEditAssignment = (assignment) => {
        navigate(`/evaluaciones/${assignment.id}/editar`);
    };

    const handleDeleteAssignment = async (assignment) => {
        if (!window.confirm(`¿Estás seguro de eliminar la evaluación "${assignment.title}"?`)) {
            return;
        }

        try {
            const result = await assignmentService.deleteAssignment(assignment.id);
            if (result.success) {
                alert('Evaluación eliminada exitosamente');
                loadInstructorData();
            } else {
                alert('Error al eliminar la evaluación');
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            alert('Error al eliminar la evaluación');
        }
    };

    const handleViewAttempts = (assignment) => {
        navigate(`/evaluaciones/${assignment.id}/intentos`);
    };

    const handleViewPendingReviews = (assignment) => {
        navigate(`/evaluaciones/${assignment.id}/revisar`);
    };

    // Filtrar evaluaciones
    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            assignment.course_title.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCourse = selectedCourse === '' || assignment.course_id === selectedCourse;
        
        return matchesSearch && matchesCourse;
    });

    // Calcular estadísticas
    const stats = {
        total: assignments.length,
        published: assignments.filter(a => a.is_published).length,
        draft: assignments.filter(a => !a.is_published).length,
        totalAttempts: assignments.reduce((sum, a) => sum + parseInt(a.total_attempts || 0), 0)
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestión de Evaluaciones
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Crea y administra evaluaciones para tus cursos
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={loadInstructorData}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                        
                        <button
                            onClick={handleCreateAssignment}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Evaluación
                        </button>
                    </div>
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
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                                <p className="text-gray-600">Publicadas</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Edit className="w-8 h-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                                <p className="text-gray-600">Borradores</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
                                <p className="text-gray-600">Total Intentos</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <option value="">Todos los cursos</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
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
                                No hay evaluaciones
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {assignments.length === 0 
                                    ? 'Crea tu primera evaluación para comenzar'
                                    : 'No hay evaluaciones que coincidan con los filtros aplicados'
                                }
                            </p>
                            {courses.length > 0 && (
                                <button
                                    onClick={handleCreateAssignment}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Crear Primera Evaluación
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredAssignments.map((assignment) => {
                                const totalStudents = parseInt(assignment.students_attempted) || 0;
                                const totalAttempts = parseInt(assignment.total_attempts) || 0;
                                
                                return (
                                    <div key={assignment.id} className="p-6 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            {/* Información principal */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900">
                                                            {assignment.title}
                                                        </h3>
                                                        <p className="text-gray-600 mt-1">
                                                            {assignment.description}
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Estado */}
                                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                                        assignment.is_published 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {assignment.is_published ? 'Publicada' : 'Borrador'}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center">
                                                            <BookOpen className="w-4 h-4 mr-2" />
                                                            <span className="font-medium">Curso:</span>
                                                            <span className="ml-1">{assignment.course_title}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Target className="w-4 h-4 mr-2" />
                                                            <span className="font-medium">Puntos:</span>
                                                            <span className="ml-1">{assignment.max_points || 100}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-2" />
                                                            <span className="font-medium">Tiempo:</span>
                                                            <span className="ml-1">{assignment.time_limit_minutes || 'Sin límite'} min</span>
                                                        </div>
                                                        {assignment.due_date && (
                                                            <div className="flex items-center">
                                                                <Calendar className="w-4 h-4 mr-2" />
                                                                <span className="font-medium">Vence:</span>
                                                                <span className="ml-1">{new Date(assignment.due_date).toLocaleDateString('es-ES')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <div className="flex items-center">
                                                            <Users className="w-4 h-4 mr-2" />
                                                            <span className="font-medium">Estudiantes:</span>
                                                            <span className="ml-1">{totalStudents}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <BarChart3 className="w-4 h-4 mr-2" />
                                                            <span className="font-medium">Intentos:</span>
                                                            <span className="ml-1">{totalAttempts}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Alertas */}
                                                {!assignment.is_published && (
                                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                                                        <div className="flex items-center text-yellow-800 text-sm">
                                                            <AlertCircle className="w-4 h-4 mr-2" />
                                                            Esta evaluación está en borrador y no es visible para los estudiantes
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex flex-col space-y-2 ml-6">
                                                <button
                                                    onClick={() => handleEditAssignment(assignment)}
                                                    className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Editar
                                                </button>

                                                <button
                                                    onClick={() => handleViewAttempts(assignment)}
                                                    className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Ver Intentos
                                                </button>

                                                {totalAttempts > 0 && (
                                                    <button
                                                        onClick={() => handleViewPendingReviews(assignment)}
                                                        className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm"
                                                    >
                                                        <Settings className="w-4 h-4 mr-1" />
                                                        Revisar
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDeleteAssignment(assignment)}
                                                    className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InstructorEvaluations;