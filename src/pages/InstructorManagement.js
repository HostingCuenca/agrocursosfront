import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import InstructorForm from '../components/InstructorForm';
import { instructorService } from '../services/instructorService';
import useAuthStore from '../store/authStore';
import {
    Users,
    UserPlus,
    Search,
    RefreshCw,
    User,
    Mail,
    Phone,
    MapPin,
    BookOpen,
    MoreHorizontal,
    Edit3,
    Eye,
    Ban,
    CheckCircle,
    AlertCircle,
    BarChart3,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const InstructorManagement = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(new Set());
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [pagination, setPagination] = useState({});
    
    // Filtros y paginación
    const [filters, setFilters] = useState({
        search: '',
        status: '', // '', 'active', 'inactive'
        page: 1,
        limit: 10
    });
    
    // Verificar permisos de administrador
    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
    }, [user, navigate]);

    // Cargar instructores cuando cambien los filtros
    useEffect(() => {
        loadInstructors();
    }, [filters.page, filters.status]);

    // Cargar instructores con debounce para búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (filters.page === 1) {
                loadInstructors();
            } else {
                setFilters(prev => ({ ...prev, page: 1 }));
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [filters.search]);

    // Cargar lista de instructores
    const loadInstructors = async () => {
        setLoading(true);
        try {
            const result = await instructorService.getInstructors({
                page: filters.page,
                limit: filters.limit,
                status: filters.status || undefined,
                search: filters.search || undefined
            });

            if (result.success) {
                const formattedInstructors = result.data.instructors.map(
                    instructor => instructorService.formatInstructorData(instructor)
                );
                setInstructors(formattedInstructors);
                setPagination(result.data.pagination);
            }
        } catch (error) {
            console.error('Error loading instructors:', error);
            alert('Error al cargar instructores');
        } finally {
            setLoading(false);
        }
    };

    // Crear nuevo instructor
    const handleCreateInstructor = async (instructorData) => {
        try {
            const result = await instructorService.createInstructor(instructorData);
            instructorService.handleAPIError(result);
            
            alert(result.message || 'Instructor creado exitosamente');
            setShowCreateForm(false);
            loadInstructors();
        } catch (error) {
            console.error('Error creating instructor:', error);
            alert(error.message);
        }
    };

    // Editar instructor
    const handleUpdateInstructor = async (instructorData) => {
        if (!editingInstructor) return;
        
        try {
            const result = await instructorService.updateInstructor(editingInstructor.id, instructorData);
            instructorService.handleAPIError(result);
            
            alert(result.message || 'Instructor actualizado exitosamente');
            setEditingInstructor(null);
            loadInstructors();
        } catch (error) {
            console.error('Error updating instructor:', error);
            alert(error.message);
        }
    };

    // Deshabilitar instructor
    const handleDisableInstructor = async (instructor) => {
        if (processing.has(instructor.id)) return;
        
        const confirmMessage = `¿Estás seguro de que quieres DESHABILITAR a ${instructor.fullName}?\n\nEsto impedirá que el instructor acceda al sistema y gestione sus cursos.`;
        if (!window.confirm(confirmMessage)) return;
        
        setProcessing(prev => new Set([...prev, instructor.id]));
        
        try {
            const result = await instructorService.disableInstructor(instructor.id);
            instructorService.handleAPIError(result);
            
            alert(result.message || `Instructor ${instructor.fullName} deshabilitado`);
            loadInstructors();
        } catch (error) {
            console.error('Error disabling instructor:', error);
            alert(error.message);
        } finally {
            setProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(instructor.id);
                return newSet;
            });
        }
    };

    // Habilitar instructor
    const handleEnableInstructor = async (instructor) => {
        if (processing.has(instructor.id)) return;
        
        setProcessing(prev => new Set([...prev, instructor.id]));
        
        try {
            const result = await instructorService.enableInstructor(instructor.id);
            instructorService.handleAPIError(result);
            
            alert(result.message || `Instructor ${instructor.fullName} habilitado`);
            loadInstructors();
        } catch (error) {
            console.error('Error enabling instructor:', error);
            alert(error.message);
        } finally {
            setProcessing(prev => {
                const newSet = new Set(prev);
                newSet.delete(instructor.id);
                return newSet;
            });
        }
    };

    // Ver detalles del instructor
    const handleViewDetails = async (instructor) => {
        try {
            const result = await instructorService.getInstructorById(instructor.id);
            if (result.success) {
                setSelectedInstructor(result.data);
            }
        } catch (error) {
            console.error('Error loading instructor details:', error);
            alert('Error al cargar detalles del instructor');
        }
    };

    // Cambiar página
    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestión de Instructores
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Administra todos los instructores de la plataforma
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={loadInstructors}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                        
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Nuevo Instructor
                        </button>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    {pagination.total_instructors || 0}
                                </p>
                                <p className="text-gray-600">Total Instructores</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    {instructors.filter(i => i.is_active).length}
                                </p>
                                <p className="text-gray-600">Activos</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Ban className="w-8 h-8 text-red-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    {instructors.filter(i => !i.is_active).length}
                                </p>
                                <p className="text-gray-600">Inactivos</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Búsqueda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buscar instructor
                            </label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Nombre, email o especialización..."
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
                                <option value="active">Activos</option>
                                <option value="inactive">Inactivos</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Lista de instructores */}
                <div className="bg-white rounded-lg shadow-sm border">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                            <span>Cargando instructores...</span>
                        </div>
                    ) : instructors.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay instructores
                            </h3>
                            <p className="text-gray-600">
                                No se encontraron instructores con los filtros seleccionados
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Tabla de instructores */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Instructor
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contacto
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Especialización
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cursos
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {instructors.map((instructor) => (
                                            <tr key={instructor.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <User className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {instructor.fullName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                ID: {instructor.id.substring(0, 8)}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="flex items-center mb-1">
                                                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                                                            {instructor.email}
                                                        </div>
                                                        {instructor.phone && (
                                                            <div className="flex items-center">
                                                                <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                                                {instructor.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {instructor.specialization || 'No especificada'}
                                                    </div>
                                                    {instructor.country && (
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <MapPin className="w-3 h-3 mr-1" />
                                                            {instructor.country}
                                                        </div>
                                                    )}
                                                </td>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <BookOpen className="w-4 h-4 mr-1 text-gray-400" />
                                                        <span className="text-sm text-gray-900">
                                                            {instructor.courseCount}
                                                        </span>
                                                    </div>
                                                </td>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        instructor.is_active 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {instructor.statusText}
                                                    </span>
                                                </td>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleViewDetails(instructor)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => setEditingInstructor(instructor)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Editar"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        
                                                        {instructor.is_active ? (
                                                            <button
                                                                onClick={() => handleDisableInstructor(instructor)}
                                                                disabled={processing.has(instructor.id)}
                                                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                                title="Deshabilitar"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleEnableInstructor(instructor)}
                                                                disabled={processing.has(instructor.id)}
                                                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                                title="Habilitar"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        
                                                        <button
                                                            onClick={() => {/* TODO: Ver estadísticas */}}
                                                            className="text-gray-600 hover:text-gray-900"
                                                            title="Estadísticas"
                                                        >
                                                            <BarChart3 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {pagination.total_pages > 1 && (
                                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            <button
                                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                                disabled={!pagination.has_prev}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Anterior
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                                disabled={!pagination.has_next}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Mostrando página <span className="font-medium">{pagination.current_page}</span> de{' '}
                                                    <span className="font-medium">{pagination.total_pages}</span> ({pagination.total_instructors} instructores)
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                    <button
                                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                                        disabled={!pagination.has_prev}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                    
                                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                        {pagination.current_page} / {pagination.total_pages}
                                                    </span>
                                                    
                                                    <button
                                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                                        disabled={!pagination.has_next}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal para crear instructor */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">Crear Nuevo Instructor</h2>
                        </div>
                        <div className="p-6">
                            <InstructorForm
                                onSubmit={handleCreateInstructor}
                                onCancel={() => setShowCreateForm(false)}
                                isCreating={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para editar instructor */}
            {editingInstructor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">Editar Instructor</h2>
                        </div>
                        <div className="p-6">
                            <InstructorForm
                                instructor={editingInstructor}
                                onSubmit={handleUpdateInstructor}
                                onCancel={() => setEditingInstructor(null)}
                                isCreating={false}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para ver detalles */}
            {selectedInstructor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Detalles del Instructor</h2>
                            <button
                                onClick={() => setSelectedInstructor(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <p className="text-sm text-gray-900">{selectedInstructor.first_name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                    <p className="text-sm text-gray-900">{selectedInstructor.last_name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="text-sm text-gray-900">{selectedInstructor.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                    <p className="text-sm text-gray-900">{selectedInstructor.phone || 'No especificado'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">País</label>
                                    <p className="text-sm text-gray-900">{selectedInstructor.country || 'No especificado'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Especialización</label>
                                    <p className="text-sm text-gray-900">{selectedInstructor.specialization || 'No especificada'}</p>
                                </div>
                            </div>
                            
                            {selectedInstructor.bio && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Biografía</label>
                                    <p className="text-sm text-gray-900">{selectedInstructor.bio}</p>
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-4 border-t">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    selectedInstructor.is_active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {selectedInstructor.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                                <div className="text-sm text-gray-500">
                                    Creado: {new Date(selectedInstructor.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default InstructorManagement;