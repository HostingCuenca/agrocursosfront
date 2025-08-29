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
    Filter,
    RefreshCw,
    User,
    Mail,
    Calendar,
    BookOpen,
    ChevronDown,
    ChevronRight,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    Clock,
    Award,
    AlertTriangle,
    Eye
} from 'lucide-react';

const StudentManagement = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingEnrollments, setProcessingEnrollments] = useState(new Set());
    const [expandedStudents, setExpandedStudents] = useState(new Set());
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        courseId: ''
    });
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalEnrollments: 0,
        pendingEnrollments: 0,
        activeEnrollments: 0
    });

    // Verificar permisos de administrador
    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
    }, [user, navigate]);

    // Cargar cursos
    useEffect(() => {
        const loadCourses = async () => {
            try {
                const coursesData = await courseService.getCourses();
                setCourses(coursesData.courses || []);
            } catch (error) {
                console.error('Error loading courses:', error);
            }
        };

        if (user?.role === 'admin') {
            loadCourses();
        }
    }, [user]);

    // Cargar estadísticas generales
    const loadStats = async () => {
        try {
            const statsData = await enrollmentService.getEnrollmentStats();
            setStats({
                totalStudents: parseInt(statsData.stats?.total_students || '0'),
                totalEnrollments: parseInt(statsData.stats?.total_enrollments || '0'),
                pendingEnrollments: parseInt(statsData.stats?.pending_enrollments || '0'),
                activeEnrollments: parseInt(statsData.stats?.active_enrollments || '0')
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    // Cargar todos los estudiantes con sus inscripciones
    const loadStudents = async () => {
        if (!courses.length) return;
        
        setLoading(true);
        try {
            const studentsMap = new Map();
            
            // Recopilar inscripciones de todos los cursos
            for (const course of courses) {
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
                            course_id: course.id
                        });
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

            // Filtrar por curso específico
            if (filters.courseId) {
                studentsArray = studentsArray.map(student => ({
                    ...student,
                    enrollments: student.enrollments.filter(enrollment => 
                        enrollment.course_id === filters.courseId
                    )
                })).filter(student => student.enrollments.length > 0);
            }

            // Ordenar estudiantes por nombre
            studentsArray.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            setStudents(studentsArray);
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courses.length > 0) {
            loadStudents();
            loadStats();
        }
    }, [courses, filters]);

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
                {/* Header con estadísticas */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestión de Estudiantes
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Administra todos los estudiantes y sus inscripciones
                        </p>
                    </div>
                    
                    <button
                        onClick={() => {loadStudents(); loadStats();}}
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
                            <Users className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                                <p className="text-gray-600">Estudiantes Activos</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <BookOpen className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
                                <p className="text-gray-600">Total Inscripciones</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingEnrollments}</p>
                                <p className="text-gray-600">Pendientes</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.activeEnrollments}</p>
                                <p className="text-gray-600">Activas</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <option value="pending">Pendientes</option>
                                <option value="enrolled">Aprobadas</option>
                                <option value="rejected">Rechazadas</option>
                                <option value="completed">Completadas</option>
                            </select>
                        </div>

                        {/* Curso */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Curso específico
                            </label>
                            <select
                                value={filters.courseId}
                                onChange={(e) => setFilters(prev => ({ ...prev, courseId: e.target.value }))}
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
                                No hay estudiantes
                            </h3>
                            <p className="text-gray-600">
                                No se encontraron estudiantes con los filtros seleccionados
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
                                                            {stats.total} inscripciones
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
                                                            {stats.pending}
                                                        </div>
                                                    )}
                                                    {stats.enrolled > 0 && (
                                                        <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            {stats.enrolled}
                                                        </div>
                                                    )}
                                                    {stats.rejected > 0 && (
                                                        <div className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            {stats.rejected}
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
                                                        {isExpanded ? 'Ocultar' : 'Ver'} detalles
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Detalles expandidos */}
                                        {isExpanded && (
                                            <div className="mt-6 border-t pt-6">
                                                <h4 className="text-sm font-medium text-gray-900 mb-4">
                                                    Inscripciones ({student.enrollments.length})
                                                </h4>
                                                <div className="space-y-3">
                                                    {student.enrollments.map((enrollment) => (
                                                        <div key={enrollment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                            <div className="flex items-center space-x-4 flex-1">
                                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                                    <BookOpen className="w-4 h-4 text-gray-600" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-900">{enrollment.course_title}</p>
                                                                    <p className="text-sm text-gray-600 flex items-center">
                                                                        <Calendar className="w-3 h-3 mr-1" />
                                                                        {new Date(enrollment.enrollment_date).toLocaleDateString()}
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
                                                                            className="flex items-center px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                                                                        >
                                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                                            Aprobar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRejectEnrollment(enrollment.id)}
                                                                            disabled={processingEnrollments.has(enrollment.id)}
                                                                            className="flex items-center px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
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

export default StudentManagement;