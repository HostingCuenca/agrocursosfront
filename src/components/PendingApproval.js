import React from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

const PendingApproval = ({ user, onRetry }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                {/* Icono de estado */}
                <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-10 h-10 text-yellow-600" />
                </div>

                {/* Mensaje principal */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Cuenta Pendiente de Aprobación
                </h1>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    Hola <strong>{user?.first_name || 'Usuario'}</strong>, tu cuenta ha sido registrada exitosamente
                    pero está pendiente de aprobación por parte del administrador.
                </p>

                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                            <h3 className="font-medium text-blue-900 mb-1">
                                ¿Qué significa esto?
                            </h3>
                            <p className="text-sm text-blue-800">
                                Por seguridad, todas las nuevas cuentas requieren revisión manual. 
                                Esto nos ayuda a mantener la calidad de nuestra comunidad educativa.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información del usuario */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Información de tu cuenta:</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Nombre:</strong> {user?.first_name} {user?.last_name}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Rol:</strong> {
                            user?.role === 'student' ? 'Estudiante' :
                            user?.role === 'instructor' ? 'Instructor' : 
                            'Usuario'
                        }</p>
                        <p><strong>Estado:</strong> 
                            <span className="inline-flex items-center ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                <Clock className="w-3 h-3 mr-1" />
                                Pendiente
                            </span>
                        </p>
                    </div>
                </div>

                {/* Próximos pasos */}
                <div className="text-left mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Próximos pasos:</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start">
                            <span className="flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 text-xs font-bold rounded-full mr-3 mt-0.5">1</span>
                            Un administrador revisará tu solicitud
                        </li>
                        <li className="flex items-start">
                            <span className="flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 text-xs font-bold rounded-full mr-3 mt-0.5">2</span>
                            Recibirás un email de confirmación
                        </li>
                        <li className="flex items-start">
                            <span className="flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 text-xs font-bold rounded-full mr-3 mt-0.5">3</span>
                            Podrás acceder a todos los cursos
                        </li>
                    </ul>
                </div>

                {/* Tiempo estimado */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-800">
                            <strong>Tiempo estimado:</strong> 24-48 horas hábiles
                        </span>
                    </div>
                </div>

                {/* Acciones */}
                <div className="space-y-3">
                    <button
                        onClick={onRetry}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Verificar Estado de Aprobación
                    </button>

                    <p className="text-xs text-gray-500">
                        ¿Necesitas ayuda? Contacta a soporte: 
                        <a href="mailto:soporte@cfda.com" className="text-blue-600 hover:text-blue-800 ml-1">
                            soporte@cfda.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;