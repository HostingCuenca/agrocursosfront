import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import {
    Home,
    BookOpen,
    Users,
    GraduationCap,
    BarChart3,
    Settings,
    FileText,
    Award,
    UserCheck,
    Calendar,
    PlayCircle,
    Search,
    UserPlus,
    Video,
    CheckSquare
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { user } = useAuthStore();

    // Menú específico por rol
    const getMenuItemsForRole = () => {
        const baseItems = [
            { icon: Home, label: 'Dashboard', path: '/dashboard' },
        ];

        switch (user?.role) {
            case 'admin':
                return [
                    ...baseItems,
                    { icon: BookOpen, label: 'Cursos', path: '/cursos' },
                    { icon: Video, label: 'Clases Virtuales', path: '/clases-virtuales' },
                    { icon: CheckSquare, label: 'Evaluaciones', path: '/gestion-evaluaciones' },
                    { icon: Users, label: 'Estudiantes', path: '/estudiantes' },
                    { icon: GraduationCap, label: 'Instructores', path: '/instructores' },
                    { icon: FileText, label: 'Módulos', path: '/modulos' },
                    { icon: Award, label: 'Certificados', path: '/certificados' },
                    { icon: UserCheck, label: 'Aprobaciones', path: '/aprobaciones' },
                    { icon: BarChart3, label: 'Reportes', path: '/reportes' },
                    { icon: Settings, label: 'Configuración', path: '/configuracion' },
                ];
            case 'instructor':
                return [
                    ...baseItems,
                    { icon: BookOpen, label: 'Gestión de Cursos', path: '/cursos' },
                    { icon: Video, label: 'Clases Virtuales', path: '/clases-virtuales' },
                    { icon: CheckSquare, label: 'Evaluaciones', path: '/gestion-evaluaciones' },
                    { icon: Users, label: 'Mis Estudiantes', path: '/mis-estudiantes' },
                    { icon: UserPlus, label: 'Inscripciones', path: '/inscripciones' },
                    { icon: FileText, label: 'Módulos', path: '/modulos' },
                    { icon: Award, label: 'Certificados', path: '/certificados' },
                    { icon: BarChart3, label: 'Estadísticas', path: '/estadisticas' },
                    { icon: Settings, label: 'Configuración', path: '/configuracion' },
                ];
            case 'student':
                return [
                    ...baseItems,
                    { icon: BookOpen, label: 'Mis Cursos', path: '/mis-cursos' },
                    { icon: Video, label: 'Mis Clases Virtuales', path: '/mis-clases-virtuales' },
                    { icon: CheckSquare, label: 'Mis Evaluaciones', path: '/evaluaciones' },
                    { icon: Search, label: 'Explorar Cursos', path: '/explorar' },
                    { icon: Award, label: 'Mis Certificados', path: '/certificados' },
                    { icon: Calendar, label: 'Calendario', path: '/calendario' },
                    { icon: BarChart3, label: 'Mi Progreso', path: '/progreso' },
                    { icon: Settings, label: 'Configuración', path: '/configuracion' },
                ];
            default:
                return baseItems;
        }
    };

    const menuItems = getMenuItemsForRole();

    return (
        <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'} md:translate-x-0`}>
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b border-neutral-200">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mr-3">
                    <GraduationCap className="w-5 h-5 text-neutral-900" />
                </div>
                <div>
                    <h1 className="font-bold text-lg text-neutral-900">CFDA</h1>
                    <p className="text-xs text-neutral-500">Centro de Formación Desarrollo Agropecuario</p>
                </div>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-lime-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-lime-600 font-medium text-sm">
                            {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium text-neutral-900 text-sm">
                            {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-neutral-500 capitalize">
                            {user?.role === 'admin' && 'Administrador'}
                            {user?.role === 'instructor' && 'Instructor'}
                            {user?.role === 'student' && 'Estudiante'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-4 flex-1 overflow-y-auto">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`nav-item mb-1 ${isActive ? 'active' : ''}`}
                            onClick={onClose} // Cerrar sidebar en mobile al hacer click
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200">
                <div className="text-xs text-neutral-500 text-center">
                    <p>CFDA v1.0</p>
                    <p>© 2025 Centro de Formación</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;