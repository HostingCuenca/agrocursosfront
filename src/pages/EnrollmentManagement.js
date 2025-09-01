import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import EnrollmentStatus from '../components/EnrollmentStatus';
import { enrollmentService } from '../services/enrollmentService';
import { courseService } from '../services/courseService';
import useAuthStore from '../store/authStore';
import {
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    RefreshCw,
    User,
    Mail,
    Calendar,
    BookOpen,
    UserPlus
} from 'lucide-react';

const EnrollmentManagement = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [enrollments, setEnrollments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingEnrollments, setProcessingEnrollments] = useState(new Set());
    const [filters, setFilters] = useState({
        status: 'pending',
        courseId: '',
        search: ''
    });

    // Verificar permisos
    useEffect(() => {
        if (user?.role !== 'instructor' && user?.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
    }, [user, navigate]);

    // Cargar cursos del instructor
    useEffect(() => {
        const loadCourses = async () => {
            try {
                // Tanto admin como instructor pueden usar getCourses
                const coursesData = await courseService.getCourses();
                setCourses(coursesData.courses || []);
            } catch (error) {
                console.error('Error loading courses:', error);
            }
        };

        if (user?.id) {
            loadCourses();
        }
    }, [user]);

    // Cargar inscripciones
    const loadEnrollments = async () => {
        if (!user?.id || courses.length === 0) return;
        
        setLoading(true);
        try {
            let allEnrollments = [];
            
            // Si hay un curso específico seleccionado
            if (filters.courseId) {
                const response = await enrollmentService.getCourseEnrollments(
                    filters.courseId, 
                    { status: filters.status }
                );
                allEnrollments = response.enrollments || [];
            } else {
                // ✅ OPTIMIZADO: Una sola llamada para todos los enrollments
                // Antes: N llamadas (una por curso) = 11+ segundos
                // Ahora: 1 llamada con todos los datos = milisegundos
                try {
                    const response = await enrollmentService.getAllEnrollments({
                        status: filters.status
                    });
                    // Los datos ya vienen completos con course_title, student_name, etc.
                    allEnrollments = response.enrollments || [];
                } catch (error) {
                    console.error('Error loading all enrollments:', error);
                }
            }

            // Filtrar por búsqueda si hay texto
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                allEnrollments = allEnrollments.filter(enrollment => 
                    enrollment.student_name?.toLowerCase().includes(searchTerm) ||
                    enrollment.student_email?.toLowerCase().includes(searchTerm) ||
                    enrollment.course_title?.toLowerCase().includes(searchTerm)
                );
            }

            setEnrollments(allEnrollments);
        } catch (error) {
            console.error('Error loading enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEnrollments();
    }, [user, courses, filters]);

    // Aprobar inscripción
    const handleApproveEnrollment = async (enrollmentId) => {
        if (processingEnrollments.has(enrollmentId)) return;
        
        setProcessingEnrollments(prev => new Set([...prev, enrollmentId]));
        
        try {
            await enrollmentService.approveEnrollment(enrollmentId);
            
            // Actualizar la lista
            setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
            
            alert('Inscripción aprobada exitosamente');
        } catch (error) {
            console.error('Error approving enrollment:', error);
            alert('Error al aprobar inscripción. Intenta de nuevo.');
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
            
            // Actualizar la lista
            setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
            
            alert('Inscripción rechazada exitosamente');
        } catch (error) {
            console.error('Error rejecting enrollment:', error);
            alert('Error al rechazar inscripción. Intenta de nuevo.');
        } finally {
            setProcessingEnrollments(prev => {
                const newSet = new Set(prev);
                newSet.delete(enrollmentId);
                return newSet;
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestión de Inscripciones
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Administra las solicitudes de inscripción de tus cursos
                        </p>
                    </div>
                    
                    <button
                        onClick={loadEnrollments}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estado
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="pending">Pendientes</option>
                                <option value="enrolled">Aprobadas</option>
                                <option value="rejected">Rechazadas</option>
                                <option value="">Todas</option>
                            </select>
                        </div>

                        {/* Curso */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Curso
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

                {/* Lista de inscripciones */}
                <div className="bg-white rounded-lg shadow-sm border">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                            <span>Cargando inscripciones...</span>
                        </div>
                    ) : enrollments.length === 0 ? (
                        <div className="text-center py-12">
                            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay inscripciones
                            </h3>
                            <p className="text-gray-600">
                                {filters.status === 'pending' 
                                    ? 'No tienes solicitudes pendientes por revisar'
                                    : `No hay inscripciones con estado "${filters.status}"`
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {enrollments.map((enrollment) => (
                                <div key={enrollment.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        {/* Información del estudiante */}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4">
                                                {/* Avatar */}
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-6 h-6 text-blue-600" />
                                                </div>
                                                
                                                {/* Datos */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {enrollment.student_name}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                        <div className="flex items-center">
                                                            <Mail className="w-4 h-4 mr-1" />
                                                            {enrollment.student_email}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <BookOpen className="w-4 h-4 mr-1" />
                                                            {enrollment.course_title}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Estado y acciones */}
                                        <div className="flex items-center space-x-4">
                                            <EnrollmentStatus 
                                                status={enrollment.status}
                                                metadata={enrollment.metadata}
                                                size="md"
                                            />
                                            
                                            {enrollment.status === 'pending' && (
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleApproveEnrollment(enrollment.id)}
                                                        disabled={processingEnrollments.has(enrollment.id)}
                                                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectEnrollment(enrollment.id)}
                                                        disabled={processingEnrollments.has(enrollment.id)}
                                                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Rechazar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EnrollmentManagement;