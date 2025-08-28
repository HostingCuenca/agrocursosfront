import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Award } from 'lucide-react';

const EnrollmentStatus = ({ status, metadata, showReason = true, size = 'md' }) => {
    const statusConfig = {
        pending: {
            color: 'orange',
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-800',
            borderColor: 'border-orange-200',
            icon: Clock,
            text: 'Esperando aprobación',
            description: 'Tu solicitud está siendo revisada por el instructor'
        },
        enrolled: {
            color: 'green',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            borderColor: 'border-green-200',
            icon: CheckCircle,
            text: 'Inscrito',
            description: 'Puedes acceder al contenido del curso'
        },
        rejected: {
            color: 'red',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            borderColor: 'border-red-200',
            icon: XCircle,
            text: 'Solicitud rechazada',
            description: 'Tu solicitud de inscripción fue rechazada'
        },
        cancelled: {
            color: 'gray',
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-800',
            borderColor: 'border-gray-200',
            icon: AlertCircle,
            text: 'Cancelado',
            description: 'La inscripción fue cancelada'
        },
        completed: {
            color: 'blue',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            borderColor: 'border-blue-200',
            icon: Award,
            text: 'Curso completado',
            description: 'Has completado exitosamente este curso'
        }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    const sizeClasses = {
        sm: {
            container: 'px-2 py-1',
            icon: 'w-3 h-3',
            text: 'text-xs',
            reason: 'text-xs mt-1'
        },
        md: {
            container: 'px-3 py-2',
            icon: 'w-4 h-4',
            text: 'text-sm',
            reason: 'text-sm mt-2'
        },
        lg: {
            container: 'px-4 py-3',
            icon: 'w-5 h-5',
            text: 'text-base',
            reason: 'text-sm mt-2'
        }
    };

    const sizeConfig = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`inline-flex flex-col ${config.bgColor} ${config.borderColor} ${config.textColor} border rounded-lg ${sizeConfig.container}`}>
            <div className="flex items-center space-x-2">
                <IconComponent className={sizeConfig.icon} />
                <span className={`font-medium ${sizeConfig.text}`}>
                    {config.text}
                </span>
            </div>
            
            {/* Mostrar descripción en tamaños grandes */}
            {size === 'lg' && config.description && (
                <p className="text-xs opacity-75 mt-1">
                    {config.description}
                </p>
            )}
            
            {/* Mostrar razón de rechazo si aplica */}
            {showReason && status === 'rejected' && metadata?.rejection_reason && (
                <div className={`${config.textColor} ${sizeConfig.reason} p-2 mt-2 bg-white bg-opacity-50 rounded border-l-2 border-red-400`}>
                    <strong>Razón:</strong> {metadata.rejection_reason}
                </div>
            )}
        </div>
    );
};

// Componente simplificado para badges pequeños
export const EnrollmentBadge = ({ status, className = '' }) => {
    return (
        <EnrollmentStatus 
            status={status} 
            size="sm" 
            showReason={false}
            className={className}
        />
    );
};

// Hook para obtener información del estado
export const useEnrollmentStatus = (status) => {
    const statusInfo = {
        pending: {
            canAccess: false,
            nextAction: 'Esperar aprobación del instructor',
            actionColor: 'orange'
        },
        enrolled: {
            canAccess: true,
            nextAction: 'Acceder al curso',
            actionColor: 'green'
        },
        rejected: {
            canAccess: false,
            nextAction: 'Solicitar inscripción nuevamente',
            actionColor: 'blue'
        },
        cancelled: {
            canAccess: false,
            nextAction: 'Solicitar inscripción nuevamente',
            actionColor: 'blue'
        },
        completed: {
            canAccess: true,
            nextAction: 'Revisar contenido',
            actionColor: 'blue'
        }
    };

    return statusInfo[status] || statusInfo.pending;
};

export default EnrollmentStatus;