import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <div className="w-10 h-10 bg-primary-400 rounded-xl flex items-center justify-center mr-3">
                            <GraduationCap className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-gray-900">CFDA</h1>
                            <p className="text-xs text-gray-500 hidden sm:block">Centro de Formación Desarrollo Agropecuario</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">
                            Inicio
                        </Link>
                        <Link to="/cursos" className="text-gray-600 hover:text-gray-900 font-medium">
                            Cursos
                        </Link>
                        <Link to="/sobre-nosotros" className="text-gray-600 hover:text-gray-900 font-medium">
                            Nosotros
                        </Link>
                        <Link to="/contacto" className="text-gray-600 hover:text-gray-900 font-medium">
                            Contacto
                        </Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Iniciar Sesión
                        </Link>
                        <Link
                            to="/register"
                            className="btn-primary"
                        >
                            Registrarse
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <div className="space-y-2">
                            <Link
                                to="/"
                                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                Inicio
                            </Link>
                            <Link
                                to="/cursos"
                                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                Cursos
                            </Link>
                            <Link
                                to="/sobre-nosotros"
                                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                Nosotros
                            </Link>
                            <Link
                                to="/contacto"
                                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                Contacto
                            </Link>
                            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                                <Link
                                    to="/login"
                                    className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="block mx-4 btn-primary text-center"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Registrarse
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;