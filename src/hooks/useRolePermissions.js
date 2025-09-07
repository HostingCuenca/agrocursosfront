import { useMemo } from 'react';
import useAuthStore from '../store/authStore';

export const useRolePermissions = () => {
    const { user } = useAuthStore();
    
    const permissions = useMemo(() => {
        const userRole = user?.role;
        const userId = user?.id;

        return {
            // Permisos generales por rol
            isAdmin: userRole === 'admin',
            isInstructor: userRole === 'instructor',
            isStudent: userRole === 'student',
            
            // Permisos de cursos
            courses: {
                canCreate: ['instructor', 'admin'].includes(userRole),
                canViewAll: ['instructor', 'admin'].includes(userRole),
                canEdit: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                },
                canDelete: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                },
                canManageEnrollments: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                },
                canEnroll: userRole === 'student' || userRole === 'instructor' // Instructores pueden inscribirse en otros cursos
            },

            // Permisos de módulos y clases
            content: {
                canCreate: ['instructor', 'admin'].includes(userRole),
                canEdit: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                },
                canDelete: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                },
                canReorder: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                }
            },

            // Permisos de asignaciones/exámenes
            assignments: {
                canCreate: ['instructor', 'admin'].includes(userRole),
                canEdit: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                },
                canGrade: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                },
                canTake: userRole === 'student',
                canViewAttempts: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                }
            },

            // Permisos de progreso
            progress: {
                canViewOwnProgress: true,
                canViewStudentProgress: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                },
                canViewAllProgress: userRole === 'admin'
            },

            // Permisos de certificados
            certificates: {
                canIssue: ['instructor', 'admin'].includes(userRole),
                canRevoke: ['instructor', 'admin'].includes(userRole),
                canViewOwn: true,
                canViewAll: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                },
                // Permisos para plantillas de certificados
                canCreateTemplate: userRole === 'admin',
                canEditTemplate: userRole === 'admin',
                canDeleteTemplate: userRole === 'admin',
                canViewTemplates: ['instructor', 'admin'].includes(userRole)
            },

            // Permisos de clases virtuales
            virtualClasses: {
                canCreate: ['instructor', 'admin'].includes(userRole),
                canEdit: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                },
                canDelete: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                },
                canMarkAttendance: (courseInstructorId) => {
                    return userRole === 'admin' || (userRole === 'instructor' && courseInstructorId === userId);
                },
                canRegister: userRole === 'student'
            },

            // Permisos de inscripciones y aprobaciones
            enrollments: {
                canViewAll: userRole === 'admin',
                canViewOwn: ['instructor', 'admin'].includes(userRole),
                canApprove: ['instructor', 'admin'].includes(userRole),
                canReject: ['instructor', 'admin'].includes(userRole),
                canApproveMultiple: ['instructor', 'admin'].includes(userRole),
                canViewStats: ['instructor', 'admin'].includes(userRole),
                canCreate: userRole === 'admin',
                canCancel: ['instructor', 'admin'].includes(userRole)
            },

            // Permisos administrativos
            admin: {
                canManageUsers: userRole === 'admin',
                canViewReports: ['instructor', 'admin'].includes(userRole),
                canViewStats: ['instructor', 'admin'].includes(userRole),
                canMakeAdmin: userRole === 'admin',
                canBulkEnroll: ['instructor', 'admin'].includes(userRole)
            }
        };
    }, [user]);

    return permissions;
};

export default useRolePermissions;