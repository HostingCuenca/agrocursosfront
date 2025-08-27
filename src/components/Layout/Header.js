
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, LogOut, Menu, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuthStore();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-neutral-200 px-4 lg:px-6 py-4">
            <div className="flex justify-between items-center">
                {/* Left side */}
                <div className="flex items-center">
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors md:hidden mr-3"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Search */}
                    <div className="hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Buscar cursos, estudiantes..."
                                className="pl-10 pr-4 py-2 w-64 lg:w-96 bg-neutral-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-yellow-400 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-3">
                    {/* Mobile search button */}
                    <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors md:hidden">
                        <Search className="h-5 w-5" />
                    </button>

                    {/* Notifications */}
                    <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg relative transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-yellow-400 rounded-full"></span>
                    </button>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center">
                                <span className="text-lime-600 font-medium text-sm">
                                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                                </span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-neutral-700">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-neutral-500 capitalize">
                                    {user?.role === 'admin' && 'Administrador'}
                                    {user?.role === 'instructor' && 'Instructor'}
                                    {user?.role === 'student' && 'Estudiante'}
                                </p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-neutral-400 hidden md:block" />
                        </button>

                        {/* Dropdown menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                                <div className="px-4 py-2 border-b border-neutral-200 md:hidden">
                                    <p className="text-sm font-medium text-neutral-700">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-xs text-neutral-500 capitalize">
                                        {user?.role === 'admin' && 'Administrador'}
                                        {user?.role === 'instructor' && 'Instructor'}
                                        {user?.role === 'student' && 'Estudiante'}
                                    </p>
                                </div>

                                <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    Mi Perfil
                                </button>

                                <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center">
                                    <Bell className="h-4 w-4 mr-2" />
                                    Notificaciones
                                </button>

                                <hr className="my-2 border-neutral-200" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;