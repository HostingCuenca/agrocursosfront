import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import VirtualClassForm from '../components/VirtualClassForm';
import { virtualClassService } from '../services/virtualClassService';
import { courseService } from '../services/courseService';
import useAuthStore from '../store/authStore';
import {
    Calendar,
    Users,
    Video,
    Plus,
    Search,
    RefreshCw,
    Edit3,
    Trash2,
    ExternalLink,
    Clock,
    Eye,
    UserCheck,
    AlertCircle,
    Filter,
    ChevronDown,
    ChevronRight,
    PlayCircle
} from 'lucide-react';

const VirtualClassManagement = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [courses, setCourses] = useState([]);
    const [virtualClasses, setVirtualClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(new Set());
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [expandedClasses, setExpandedClasses] = useState(new Set());
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        upcoming: false
    });

    // Verificar permisos
    useEffect(() => {
        if (user?.role !== 'instructor' && user?.role !== 'admin') {
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
                
                // Seleccionar el primer curso por defecto
                if (coursesData.courses && coursesData.courses.length > 0) {
                    setSelectedCourse(coursesData.courses[0].id);
                }
            } catch (error) {
                console.error('Error loading courses:', error);
            }
        };

        if (user?.id) {
            loadCourses();
        }
    }, [user]);

    // Cargar clases virtuales
    useEffect(() => {
        if (selectedCourse) {
            loadVirtualClasses();
        }
    }, [selectedCourse, filters]);

    const loadVirtualClasses = async () => {
        if (!selectedCourse) return;
        
        setLoading(true);
        try {
            const params = {
                upcoming: filters.upcoming || undefined,
                status: filters.status || undefined
            };
            
            const result = await virtualClassService.getVirtualClassesByCourse(selectedCourse, params);
            
            if (result.success) {
                let classes = result.virtual_classes || [];
                
                // Filtrar por búsqueda
                if (filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    classes = classes.filter(vc => 
                        vc.title?.toLowerCase().includes(searchTerm) ||
                        vc.description?.toLowerCase().includes(searchTerm) ||
                        vc.instructor_name?.toLowerCase().includes(searchTerm)
                    );
                }
                
                setVirtualClasses(classes);
            }
        } catch (error) {
            console.error('Error loading virtual classes:', error);
            setVirtualClasses([]);
        } finally {
            setLoading(false);
        }
    };

    // Crear clase virtual
    const handleCreateClass = async (classData) => {
        try {
            const result = await virtualClassService.createVirtualClass(selectedCourse, classData);
            
            if (result.success) {
                alert('Clase virtual creada exitosamente');
                setShowCreateForm(false);
                loadVirtualClasses();
            } else {
                alert('Error: ' + (result.error || 'No se pudo crear la clase'));
            }
        } catch (error) {
            console.error('Error creating virtual class:', error);
            alert('Error al crear la clase virtual: ' + error.message);
        }
    };

    // Editar clase virtual
    const handleUpdateClass = async (classData) => {
        if (!editingClass) return;
        
        try {
            const result = await virtualClassService.updateVirtualClass(editingClass.id, classData);
            
            if (result.success) {
                alert('Clase virtual actualizada exitosamente');
                setEditingClass(null);
                loadVirtualClasses();
            } else {
                alert('Error: ' + (result.error || 'No se pudo actualizar la clase'));
            }
        } catch (error) {
            console.error('Error updating virtual class:', error);
            alert('Error al actualizar la clase virtual: ' + error.message);
        }
    };

    // Eliminar clase virtual
    const handleDeleteClass = async (virtualClass) => {
        if (processing.has(virtualClass.id)) return;
        
        const confirmMessage = `¿Estás seguro de que quieres cancelar la clase "${virtualClass.title}"?`;
        if (!window.confirm(confirmMessage)) return;
        
        setProcessing(prev => new Set([...prev, virtualClass.id]));
        
        try {
            const result = await virtualClassService.deleteVirtualClass(virtualClass.id);
            
            if (result.success) {
                alert('Clase virtual cancelada exitosamente');
                loadVirtualClasses();
            } else {
                alert('Error: ' + (result.error || 'No se pudo cancelar la clase'));
            }
        } catch (error) {
            console.error('Error deleting virtual class:', error);
            alert('Error al cancelar la clase virtual: ' + error.message);
        } finally {
            setProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(virtualClass.id);
                return newSet;
            });
        }
    };

    // Expandir/contraer clase
    const toggleClassExpanded = (classId) => {
        setExpandedClasses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(classId)) {
                newSet.delete(classId);
            } else {
                newSet.add(classId);
            }
            return newSet;
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Clases Virtuales
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Gestiona las clases virtuales de tus cursos
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={loadVirtualClasses}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                        
                        <button
                            onClick={() => setShowCreateForm(true)}
                            disabled={!selectedCourse}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Clase Virtual
                        </button>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Video className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{virtualClasses.length}</p>
                                <p className="text-gray-600">Total Clases</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    {virtualClasses.filter(vc => virtualClassService.getClassStatus(vc.scheduled_at, vc.status).status === 'scheduled').length}
                                </p>
                                <p className="text-gray-600">Programadas</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <PlayCircle className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    {virtualClasses.filter(vc => virtualClassService.getClassStatus(vc.scheduled_at, vc.status).status === 'ongoing').length}
                                </p>
                                <p className="text-gray-600">En Vivo</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    {virtualClasses.reduce((total, vc) => total + parseInt(vc.registered_attendees || 0), 0)}
                                </p>
                                <p className="text-gray-600">Estudiantes Registrados</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                <option value="">Seleccionar curso</option>
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
                                Buscar clase
                            </label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Título o descripción..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

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
                                <option value="">Todos los estados</option>
                                <option value="scheduled">Programadas</option>
                                <option value="ongoing">En vivo</option>
                                <option value="completed">Completadas</option>
                                <option value="cancelled">Canceladas</option>
                            </select>
                        </div>

                        {/* Solo próximas */}
                        <div className="flex items-center">
                            <div className="flex items-center h-9">
                                <input
                                    id="upcoming-only"
                                    type="checkbox"
                                    checked={filters.upcoming}
                                    onChange={(e) => setFilters(prev => ({ ...prev, upcoming: e.target.checked }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="upcoming-only" className="ml-2 text-sm text-gray-700">
                                    Solo próximas clases
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de clases virtuales */}
                <div className="bg-white rounded-lg shadow-sm border">
                    {!selectedCourse ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Selecciona un curso
                            </h3>
                            <p className="text-gray-600">
                                Selecciona un curso para ver y gestionar sus clases virtuales
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                            <span>Cargando clases virtuales...</span>
                        </div>
                    ) : virtualClasses.length === 0 ? (
                        <div className="text-center py-12">
                            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay clases virtuales
                            </h3>
                            <p className="text-gray-600">
                                Crea tu primera clase virtual para este curso
                            </p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="mt-4 flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Clase Virtual
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {virtualClasses.map((virtualClass) => {
                                const isExpanded = expandedClasses.has(virtualClass.id);
                                const classStatus = virtualClassService.getClassStatus(
                                    virtualClass.scheduled_at,
                                    virtualClass.status,
                                    virtualClass.duration_minutes
                                );
                                const formattedDate = virtualClassService.formatScheduledDate(virtualClass.scheduled_at);

                                return (
                                    <div key={virtualClass.id} className="p-6">
                                        {/* Información principal */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 flex-1">
                                                {/* Avatar/Icono */}
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    classStatus.color === 'green' ? 'bg-green-100' :
                                                    classStatus.color === 'orange' ? 'bg-orange-100' :
                                                    classStatus.color === 'blue' ? 'bg-blue-100' :
                                                    classStatus.color === 'red' ? 'bg-red-100' : 'bg-gray-100'
                                                }`}>
                                                    <Video className={`w-6 h-6 ${
                                                        classStatus.color === 'green' ? 'text-green-600' :
                                                        classStatus.color === 'orange' ? 'text-orange-600' :
                                                        classStatus.color === 'blue' ? 'text-blue-600' :
                                                        classStatus.color === 'red' ? 'text-red-600' : 'text-gray-600'
                                                    }`} />
                                                </div>
                                                
                                                {/* Datos básicos */}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {virtualClass.title}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            {formattedDate.datetime}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            {virtualClass.duration_minutes} min
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Users className="w-4 h-4 mr-1" />
                                                            {virtualClass.registered_attendees || 0} registrados
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Estado y acciones */}
                                            <div className="flex items-center space-x-4">
                                                {/* Badge de estado */}
                                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                                    classStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                                                    classStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                                    classStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                                    classStatus.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {classStatus.text}
                                                </span>

                                                {/* Botón de unirse (si está disponible) */}
                                                {classStatus.canJoin && virtualClass.meeting_url && (
                                                    <a
                                                        href={virtualClass.meeting_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                                    >
                                                        <ExternalLink className="w-4 h-4 mr-1" />
                                                        Unirse
                                                    </a>
                                                )}

                                                {/* Acciones */}
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => toggleClassExpanded(virtualClass.id)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    
                                                    {classStatus.canEdit && (
                                                        <button
                                                            onClick={() => setEditingClass(virtualClass)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Editar"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => handleDeleteClass(virtualClass)}
                                                        disabled={processing.has(virtualClass.id)}
                                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                        title="Cancelar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Botón expandir */}
                                                <button
                                                    onClick={() => toggleClassExpanded(virtualClass.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Detalles expandidos */}
                                        {isExpanded && (
                                            <div className="mt-6 border-t pt-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Información de la Clase</h4>
                                                        {virtualClass.description && (
                                                            <div className="mb-3">
                                                                <label className="text-sm font-medium text-gray-700">Descripción:</label>
                                                                <p className="text-sm text-gray-900 mt-1">{virtualClass.description}</p>
                                                            </div>
                                                        )}
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-700">Máximo participantes:</span>
                                                                <span className="text-gray-900">{virtualClass.max_participants}</span>
                                                            </div>
                                                            {virtualClass.meeting_id && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-700">ID de reunión:</span>
                                                                    <span className="text-gray-900">{virtualClass.meeting_id}</span>
                                                                </div>
                                                            )}
                                                            {virtualClass.meeting_password && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-700">Contraseña:</span>
                                                                    <span className="text-gray-900">{virtualClass.meeting_password}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Enlaces y Acciones</h4>
                                                        <div className="space-y-2">
                                                            {virtualClass.meeting_url && (
                                                                <a
                                                                    href={virtualClass.meeting_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                                                >
                                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                                    Enlace de la reunión
                                                                </a>
                                                            )}
                                                            <button className="flex items-center text-purple-600 hover:text-purple-800 text-sm">
                                                                <UserCheck className="w-4 h-4 mr-2" />
                                                                Ver asistencia ({virtualClass.registered_attendees || 0} estudiantes)
                                                            </button>
                                                        </div>
                                                    </div>
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

            {/* Modal para crear clase virtual */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">Crear Nueva Clase Virtual</h2>
                        </div>
                        <div className="p-6">
                            <VirtualClassForm
                                courseId={selectedCourse}
                                onSubmit={handleCreateClass}
                                onCancel={() => setShowCreateForm(false)}
                                isCreating={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para editar clase virtual */}
            {editingClass && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">Editar Clase Virtual</h2>
                        </div>
                        <div className="p-6">
                            <VirtualClassForm
                                courseId={selectedCourse}
                                virtualClass={editingClass}
                                onSubmit={handleUpdateClass}
                                onCancel={() => setEditingClass(null)}
                                isCreating={false}
                            />
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default VirtualClassManagement;