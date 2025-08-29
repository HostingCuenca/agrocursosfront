import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { virtualClassService } from '../services/virtualClassService';
import useAuthStore from '../store/authStore';
import {
    Calendar,
    Clock,
    Video,
    ExternalLink,
    RefreshCw,
    User,
    BookOpen,
    AlertCircle,
    CheckCircle,
    PlayCircle,
    Filter,
    Search,
    Eye,
    UserPlus,
    UserX,
    Info,
    Copy,
    Link
} from 'lucide-react';

const StudentVirtualClasses = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [virtualClasses, setVirtualClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(new Set());
    const [filters, setFilters] = useState({
        search: '',
        upcoming: true, // Por defecto mostrar solo próximas
        showAll: false
    });
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'all'

    // Verificar permisos de estudiante
    useEffect(() => {
        if (user?.role !== 'student') {
            navigate('/dashboard');
            return;
        }
    }, [user, navigate]);

    // Cargar clases virtuales del estudiante
    useEffect(() => {
        if (user?.id) {
            loadMyVirtualClasses();
        }
    }, [user, filters, activeTab]);

    const loadMyVirtualClasses = async () => {
        setLoading(true);
        try {
            const params = {
                upcoming: activeTab === 'upcoming' ? true : activeTab === 'past' ? false : undefined,
                status: undefined // Cargar todos los estados
            };
            
            const result = await virtualClassService.getStudentVirtualClasses(user.id, params);
            
            if (result.success) {
                let classes = result.virtual_classes || [];
                
                // Filtrar por búsqueda
                if (filters.search) {
                    const searchTerm = filters.search.toLowerCase();
                    classes = classes.filter(vc => 
                        vc.title?.toLowerCase().includes(searchTerm) ||
                        vc.course_title?.toLowerCase().includes(searchTerm) ||
                        vc.instructor_name?.toLowerCase().includes(searchTerm)
                    );
                }
                
                // Ordenar por fecha
                classes.sort((a, b) => {
                    const dateA = new Date(a.scheduled_at);
                    const dateB = new Date(b.scheduled_at);
                    return activeTab === 'past' ? dateB - dateA : dateA - dateB;
                });
                
                setVirtualClasses(classes);
            } else {
                setVirtualClasses([]);
            }
        } catch (error) {
            console.error('Error loading my virtual classes:', error);
            setVirtualClasses([]);
        } finally {
            setLoading(false);
        }
    };

    // Registrarse para una clase virtual
    const handleRegisterForClass = async (classId) => {
        if (registering.has(classId)) return;
        
        setRegistering(prev => new Set([...prev, classId]));
        
        try {
            const result = await virtualClassService.registerForVirtualClass(classId);
            
            if (result.success) {
                alert('Te has registrado exitosamente para la clase virtual');
                loadMyVirtualClasses(); // Recargar para mostrar el cambio
            } else {
                alert('Error: ' + (result.error || 'No se pudo registrar para la clase'));
            }
        } catch (error) {
            console.error('Error registering for class:', error);
            alert('Error al registrarse: ' + error.message);
        } finally {
            setRegistering(prev => {
                const newSet = new Set(prev);
                newSet.delete(classId);
                return newSet;
            });
        }
    };

    // Copiar enlace de reunión al portapapeles
    const copyMeetingLink = async (url, title) => {
        try {
            await navigator.clipboard.writeText(url);
            alert(`Enlace copiado: ${title}`);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert(`Enlace copiado: ${title}`);
        }
    };

    // Contar clases por estado
    const getClassCounts = () => {
        const now = new Date();
        return {
            upcoming: virtualClasses.filter(vc => new Date(vc.scheduled_at) > now).length,
            past: virtualClasses.filter(vc => new Date(vc.scheduled_at) <= now).length,
            registered: virtualClasses.filter(vc => vc.attendance_status === 'registered').length,
            attended: virtualClasses.filter(vc => vc.attendance_status === 'attended').length
        };
    };

    const classCounts = getClassCounts();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Mis Clases Virtuales
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Próximas clases virtuales de tus cursos inscritos
                        </p>
                    </div>
                    
                    <button
                        onClick={loadMyVirtualClasses}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{classCounts.upcoming}</p>
                                <p className="text-gray-600">Próximas Clases</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <UserPlus className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{classCounts.registered}</p>
                                <p className="text-gray-600">Registrado</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{classCounts.attended}</p>
                                <p className="text-gray-600">Asistencias</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <Video className="w-8 h-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{virtualClasses.length}</p>
                                <p className="text-gray-600">Total Clases</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs y filtros */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'upcoming'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Próximas ({classCounts.upcoming})
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'past'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Pasadas ({classCounts.past})
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'all'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Todas ({virtualClasses.length})
                            </button>
                        </nav>
                    </div>

                    {/* Filtro de búsqueda */}
                    <div className="p-6 border-b">
                        <div className="max-w-lg">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por título, curso o instructor..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de clases virtuales */}
                <div className="bg-white rounded-lg shadow-sm border">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                            <span>Cargando clases virtuales...</span>
                        </div>
                    ) : virtualClasses.length === 0 ? (
                        <div className="text-center py-12">
                            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {activeTab === 'upcoming' 
                                    ? 'No tienes clases próximas'
                                    : activeTab === 'past'
                                    ? 'No tienes clases pasadas'
                                    : 'No tienes clases virtuales'
                                }
                            </h3>
                            <p className="text-gray-600">
                                {activeTab === 'upcoming' 
                                    ? 'Las clases virtuales de tus cursos inscritos aparecerán aquí cuando estén programadas'
                                    : activeTab === 'past'
                                    ? 'Tu historial de clases virtuales aparecerá aquí'
                                    : 'Solo puedes ver clases virtuales de cursos en los que estés inscrito'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {virtualClasses.map((virtualClass) => {
                                const isRegistered = virtualClass.attendance_status === 'registered' || virtualClass.attendance_status === 'attended';
                                const classStatus = virtualClassService.getClassStatus(
                                    virtualClass.scheduled_at,
                                    virtualClass.status || 'scheduled',
                                    virtualClass.duration_minutes,
                                    isRegistered,
                                    'student'
                                );
                                const formattedDate = virtualClassService.formatScheduledDate(virtualClass.scheduled_at);

                                return (
                                    <div key={virtualClass.id} className="p-6 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            {/* Información principal */}
                                            <div className="flex items-start space-x-4 flex-1">
                                                {/* Avatar/Icono con estado */}
                                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                                                    classStatus.color === 'green' ? 'bg-green-100' :
                                                    classStatus.color === 'orange' ? 'bg-orange-100' :
                                                    classStatus.color === 'blue' ? 'bg-blue-100' :
                                                    classStatus.color === 'red' ? 'bg-red-100' : 'bg-gray-100'
                                                }`}>
                                                    <Video className={`w-8 h-8 ${
                                                        classStatus.color === 'green' ? 'text-green-600' :
                                                        classStatus.color === 'orange' ? 'text-orange-600' :
                                                        classStatus.color === 'blue' ? 'text-blue-600' :
                                                        classStatus.color === 'red' ? 'text-red-600' : 'text-gray-600'
                                                    }`} />
                                                </div>
                                                
                                                {/* Datos de la clase */}
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                        {virtualClass.title}
                                                    </h3>
                                                    
                                                    {virtualClass.description && (
                                                        <p className="text-gray-600 mb-3 line-clamp-2">
                                                            {virtualClass.description}
                                                        </p>
                                                    )}
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center">
                                                                <BookOpen className="w-4 h-4 mr-2" />
                                                                <span className="font-medium">Curso:</span>
                                                                <span className="ml-1">{virtualClass.course_title}</span>
                                                            </div>
                                                            {virtualClass.instructor_name && (
                                                                <div className="flex items-center">
                                                                    <User className="w-4 h-4 mr-2" />
                                                                    <span className="font-medium">Instructor:</span>
                                                                    <span className="ml-1">{virtualClass.instructor_name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="space-y-2">
                                                            <div className="flex items-center">
                                                                <Calendar className="w-4 h-4 mr-2" />
                                                                <span className="font-medium">Fecha:</span>
                                                                <span className="ml-1">{formattedDate.date}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Clock className="w-4 h-4 mr-2" />
                                                                <span className="font-medium">Hora:</span>
                                                                <span className="ml-1">{formattedDate.time} ({virtualClass.duration_minutes || 60} min)</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Información adicional si asistió */}
                                                    {virtualClass.attendance_status === 'attended' && virtualClass.duration_minutes && (
                                                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                                            <div className="flex items-center text-green-800 text-sm">
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                <span className="font-medium">Asististe a esta clase</span>
                                                                <span className="ml-2">({virtualClass.duration_minutes} minutos)</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Información de rechazo si aplica */}
                                                    {virtualClass.attendance_status === 'absent' && (
                                                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                                            <div className="flex items-center text-red-800 text-sm">
                                                                <AlertCircle className="w-4 h-4 mr-2" />
                                                                <span>No asististe a esta clase</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Estado y acciones */}
                                            <div className="flex flex-col items-end space-y-3">
                                                {/* Badge de estado */}
                                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                                    classStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                                                    classStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                                    classStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                                    classStatus.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {classStatus.text}
                                                </span>

                                                {/* Estado de registro */}
                                                {isRegistered && (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                                                        Registrado
                                                    </span>
                                                )}

                                                {/* Acciones */}
                                                <div className="flex flex-col space-y-2">
                                                    {/* Botón de registro (solo si no está registrado y la clase está programada) */}
                                                    {!isRegistered && classStatus.status === 'scheduled' && (
                                                        <button
                                                            onClick={() => handleRegisterForClass(virtualClass.id)}
                                                            disabled={registering.has(virtualClass.id)}
                                                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                                                        >
                                                            <UserPlus className="w-4 h-4 mr-1" />
                                                            {registering.has(virtualClass.id) ? 'Registrando...' : 'Registrarse'}
                                                        </button>
                                                    )}

                                                    {/* Mostrar enlace de reunión para estudiantes registrados */}
                                                    {isRegistered && classStatus.showMeetingLink && virtualClass.meeting_url && (
                                                        <div className="flex flex-col space-y-2">
                                                            {/* Botón de unirse (solo si puede unirse) */}
                                                            {classStatus.canJoin && (
                                                                <a
                                                                    href={virtualClass.meeting_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                                                >
                                                                    <ExternalLink className="w-4 h-4 mr-1" />
                                                                    Unirse a la Clase
                                                                </a>
                                                            )}
                                                            
                                                            {/* Botón para copiar enlace */}
                                                            <button
                                                                onClick={() => copyMeetingLink(virtualClass.meeting_url, virtualClass.title)}
                                                                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-200 text-sm"
                                                            >
                                                                <Copy className="w-4 h-4 mr-1" />
                                                                Copiar Enlace
                                                            </button>

                                                            {/* Información sobre disponibilidad del enlace */}
                                                            {!classStatus.canJoin && classStatus.status === 'scheduled' && (
                                                                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded text-center">
                                                                    <Link className="w-3 h-3 inline mr-1" />
                                                                    Enlace disponible para guardar
                                                                    <br />
                                                                    <span className="text-blue-500">
                                                                        {classStatus.minutesUntilStart > 15 
                                                                            ? `Podrás unirte en ${Math.floor(classStatus.minutesUntilStart - 15)} minutos`
                                                                            : 'Ya puedes unirte'
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Información de tiempo restante */}
                                                    {classStatus.status === 'scheduled' && classStatus.minutesUntilStart !== undefined && (
                                                        <div className="text-xs text-gray-500 text-right">
                                                            {classStatus.minutesUntilStart > 60 
                                                                ? `En ${Math.floor(classStatus.minutesUntilStart / 60)}h ${classStatus.minutesUntilStart % 60}m`
                                                                : `En ${classStatus.minutesUntilStart} minutos`
                                                            }
                                                        </div>
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
                            <h3 className="text-blue-800 font-medium">Información sobre las Clases Virtuales</h3>
                            <div className="text-blue-700 text-sm mt-1 space-y-1">
                                <p>• Solo puedes ver las clases virtuales de los cursos en los que estás inscrito</p>
                                <p>• Regístrate para recibir el enlace de acceso a la clase</p>
                                <p>• Una vez registrado, puedes copiar y guardar el enlace de la reunión</p>
                                <p>• Puedes unirte a la clase hasta 15 minutos antes del inicio</p>
                                <p>• Tu asistencia se registrará automáticamente al participar</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentVirtualClasses;