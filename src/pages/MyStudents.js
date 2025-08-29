import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import EnrollmentStatus, { EnrollmentBadge } from '../components/EnrollmentStatus';
import { enrollmentService } from '../services/enrollmentService';
import { courseService } from '../services/courseService';
import useAuthStore from '../store/authStore';
import {
    Users,
    Search,
    RefreshCw,
    User,
    Mail,
    Calendar,
    BookOpen,
    ChevronDown,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
    Award,
    TrendingUp,
    UserCheck,
    AlertCircle
} from 'lucide-react';

const MyStudents = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingEnrollments, setProcessingEnrollments] = useState(new Set());
    const [expandedStudents, setExpandedStudents] = useState(new Set());
    const [selectedCourse, setSelectedCourse] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: 'pending' // Instructores normalmente quieren ver pendientes primero
    });
    const [stats, setStats] = useState({
        totalStudents: 0,
        pendingEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0
    });

    // Verificar permisos de instructor
    useEffect(() => {
        if (user?.role !== 'instructor') {
            navigate('/dashboard');
            return;
        }
    }, [user, navigate]);

    // Cargar cursos del instructor
    useEffect(() => {
        const loadInstructorCourses = async () => {
            try {
                // Para instructores, obtenemos todos los cursos donde el instructor tiene estudiantes
                // Esto lo haremos mediante el endpoint de enrollments más tarde
                const coursesData = await courseService.getCourses();
                // Filtrar cursos del instructor (asumiendo que el backend ya filtra por instructor_id si está logueado)
                setCourses(coursesData.courses || []);
                
                // Seleccionar el primer curso por defecto si hay cursos
                if (coursesData.courses && coursesData.courses.length > 0) {
                    setSelectedCourse(coursesData.courses[0].id);
                }
            } catch (error) {
                console.error('Error loading instructor courses:', error);
            }
        };

        if (user?.id && user?.role === 'instructor') {
            loadInstructorCourses();
        }
    }, [user]);

    // Cargar estudiantes de los cursos del instructor
    const loadStudents = async () => {
        if (!courses.length) return;
        
        setLoading(true);
        try {
            const studentsMap = new Map();
            let totalPending = 0;
            let totalActive = 0;
            let totalCompleted = 0;
            
            // Filtrar cursos según selección
            const coursesToLoad = selectedCourse 
                ? courses.filter(c => c.id === selectedCourse)
                : courses;

            // Recopilar inscripciones de los cursos del instructor
            for (const course of coursesToLoad) {
                try {
                    const response = await enrollmentService.getCourseEnrollments(course.id, {
                        status: filters.status || undefined
                    });
                    const enrollments = response.enrollments || [];
                    
                    enrollments.forEach(enrollment => {
                        const studentKey = enrollment.student_email;
                        if (!studentsMap.has(studentKey)) {
                            studentsMap.set(studentKey, {
                                id: enrollment.student_id || enrollment.student_email,
                                name: enrollment.student_name,
                                email: enrollment.student_email,
                                enrollments: []
                            });
                        }
                        
                        studentsMap.get(studentKey).enrollments.push({
                            ...enrollment,
                            course_title: course.title,
                            course_id: course.id,
                            course_description: course.description
                        });

                        // Contar por estados
                        if (enrollment.status === 'pending') totalPending++;
                        else if (enrollment.status === 'enrolled') totalActive++;
                        else if (enrollment.status === 'completed') totalCompleted++;
                    });
                } catch (error) {
                    console.error(`Error loading enrollments for course ${course.id}:`, error);
                }
            }

            let studentsArray = Array.from(studentsMap.values());

            // Filtrar por búsqueda
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                studentsArray = studentsArray.filter(student => 
                    student.name?.toLowerCase().includes(searchTerm) ||
                    student.email?.toLowerCase().includes(searchTerm)
                );
            }

            // Ordenar estudiantes por nombre
            studentsArray.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            setStudents(studentsArray);
            setStats({
                totalStudents: studentsArray.length,
                pendingEnrollments: totalPending,
                activeEnrollments: totalActive,
                completedEnrollments: totalCompleted
            });
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courses.length > 0) {
            loadStudents();
        }
    }, [courses, selectedCourse, filters]);

    // Aprobar inscripción
    const handleApproveEnrollment = async (enrollmentId) => {
        if (processingEnrollments.has(enrollmentId)) return;
        
        setProcessingEnrollments(prev => new Set([...prev, enrollmentId]));
        
        try {
            await enrollmentService.approveEnrollment(enrollmentId);
            await loadStudents();
            alert('Inscripción aprobada exitosamente');
        } catch (error) {
            console.error('Error approving enrollment:', error);
            alert('Error al aprobar inscripción');
        } finally {
            setProcessingEnrollments(prev => {
                const newSet = new Set(prev);
                newSet.delete(enrollmentId);
                return newSet;
            });
        }
    };

    // Rechazar inscripción
    const handleRejectEnrollment = async (enrollmentId) => {
        if (processingEnrollments.has(enrollmentId)) return;
        
        const reason = prompt('¿Por qué razón rechazas esta inscripción?');
        if (!reason) return;
        
        setProcessingEnrollments(prev => new Set([...prev, enrollmentId]));
        
        try {
            await enrollmentService.rejectEnrollment(enrollmentId, reason);
            await loadStudents();
            alert('Inscripción rechazada exitosamente');
        } catch (error) {
            console.error('Error rejecting enrollment:', error);
            alert('Error al rechazar inscripción');
        } finally {
            setProcessingEnrollments(prev => {
                const newSet = new Set(prev);
                newSet.delete(enrollmentId);
                return newSet;
            });
        }
    };

    // Expandir/contraer estudiante
    const toggleStudentExpanded = (studentId) => {
        setExpandedStudents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };

    // Contar inscripciones por estado para un estudiante
    const getStudentStats = (enrollments) => {
        return {
            total: enrollments.length,
            pending: enrollments.filter(e => e.status === 'pending').length,
            enrolled: enrollments.filter(e => e.status === 'enrolled').length,
            rejected: enrollments.filter(e => e.status === 'rejected').length,
            completed: enrollments.filter(e => e.status === 'completed').length
        };
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Mis Estudiantes
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Gestiona los estudiantes de tus cursos
                        </p>
                    </div>
                    
                    <button
                        onClick={loadStudents}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                </div>

                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <UserCheck className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                                <p className="text-gray-600">Estudiantes</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingEnrollments}</p>
                                <p className="text-gray-600">Solicitudes Pendientes</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.activeEnrollments}</p>
                                <p className="text-gray-600">Inscripciones Activas</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Award className="w-8 h-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.completedEnrollments}</p>
                                <p className="text-gray-600">Completados</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Curso */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Curso
                            </label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos mis cursos</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title} ({course.enrolled_students || 0} estudiantes)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estado de inscripción
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos los estados</option>
                                <option value="pending">Pendientes de aprobación</option>
                                <option value="enrolled">Aprobadas (Activas)</option>
                                <option value="completed">Completadas</option>
                                <option value="rejected">Rechazadas</option>
                            </select>
                        </div>

                        {/* Búsqueda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buscar estudiante
                            </label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Nombre o email..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensaje informativo para instructores */}
                {courses.length === 0 && !loading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
                            <div>
                                <h3 className="text-blue-800 font-medium">No tienes cursos asignados</h3>
                                <p className="text-blue-700 text-sm mt-1">
                                    Para ver estudiantes aquí, primero debes crear o tener cursos asignados como instructor.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de estudiantes */}
                <div className="bg-white rounded-lg shadow-sm border">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                            <span>Cargando estudiantes...</span>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {filters.status === 'pending' ? 'No hay solicitudes pendientes' : 'No hay estudiantes'}
                            </h3>
                            <p className="text-gray-600">
                                {filters.status === 'pending' 
                                    ? 'Todas las solicitudes de inscripción han sido procesadas'
                                    : 'No se encontraron estudiantes con los filtros seleccionados'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {students.map((student) => {
                                const stats = getStudentStats(student.enrollments);
                                const isExpanded = expandedStudents.has(student.id);
                                
                                return (
                                    <div key={student.id} className="p-6">
                                        {/* Información principal del estudiante */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 flex-1">
                                                {/* Avatar */}
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-6 h-6 text-blue-600" />
                                                </div>
                                                
                                                {/* Datos básicos */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {student.name}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                        <div className="flex items-center">
                                                            <Mail className="w-4 h-4 mr-1" />
                                                            {student.email}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <BookOpen className="w-4 h-4 mr-1" />
                                                            {selectedCourse ? '1 curso' : `${stats.total} inscripciones`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Estadísticas rápidas y controles */}
                                            <div className="flex items-center space-x-4">
                                                {/* Badges de estado */}
                                                <div className="flex items-center space-x-2">
                                                    {stats.pending > 0 && (
                                                        <div className="flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {stats.pending} pendiente{stats.pending > 1 ? 's' : ''}
                                                        </div>
                                                    )}
                                                    {stats.enrolled > 0 && (
                                                        <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            {stats.enrolled} activa{stats.enrolled > 1 ? 's' : ''}
                                                        </div>
                                                    )}
                                                    {stats.completed > 0 && (
                                                        <div className="flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                                            <Award className="w-3 h-3 mr-1" />
                                                            {stats.completed} completada{stats.completed > 1 ? 's' : ''}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Botón expandir */}
                                                <button
                                                    onClick={() => toggleStudentExpanded(student.id)}
                                                    className="flex items-center px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-md"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                    <span className="ml-1 text-sm">
                                                        {isExpanded ? 'Ocultar' : 'Ver'} cursos
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Detalles expandidos - Inscripciones del estudiante */}
                                        {isExpanded && (
                                            <div className="mt-6 border-t pt-6">
                                                <h4 className="text-sm font-medium text-gray-900 mb-4">
                                                    Cursos del estudiante ({student.enrollments.length})
                                                </h4>
                                                <div className="space-y-3">
                                                    {student.enrollments.map((enrollment) => (
                                                        <div key={enrollment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                            <div className="flex items-center space-x-4 flex-1">
                                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-900">{enrollment.course_title}</p>
                                                                    <p className="text-sm text-gray-600 flex items-center mt-1">
                                                                        <Calendar className="w-3 h-3 mr-1" />
                                                                        Inscrito: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                                                        {enrollment.progress_percentage && (
                                                                            <>
                                                                                <TrendingUp className="w-3 h-3 ml-3 mr-1" />
                                                                                Progreso: {parseFloat(enrollment.progress_percentage).toFixed(0)}%
                                                                            </>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center space-x-3">
                                                                <EnrollmentBadge status={enrollment.status} />
                                                                
                                                                {enrollment.status === 'pending' && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <button
                                                                            onClick={() => handleApproveEnrollment(enrollment.id)}
                                                                            disabled={processingEnrollments.has(enrollment.id)}
                                                                            className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                                                        >
                                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                                            Aprobar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRejectEnrollment(enrollment.id)}
                                                                            disabled={processingEnrollments.has(enrollment.id)}
                                                                            className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                                                        >
                                                                            <XCircle className="w-3 h-3 mr-1" />
                                                                            Rechazar
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
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
        </DashboardLayout>
    );
};

export default MyStudents;