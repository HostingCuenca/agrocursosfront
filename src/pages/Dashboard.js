
import React from 'react';
import useAuthStore from '../store/authStore';
import AdminDashboard from './admin/AdminDashboard';
import InstructorDashboard from './instructor/InstructorDashboard';
import StudentDashboard from './student/StudentDashboard';
import DashboardLayout from '../components/Layout/DashboardLayout';

const Dashboard = () => {
    const { user } = useAuthStore();

    const renderDashboardByRole = () => {
        switch (user?.role) {
            case 'admin':
                return <AdminDashboard />;
            case 'instructor':
                return <InstructorDashboard />;
            case 'student':
                return <StudentDashboard />;
            default:
                return (
                    <DashboardLayout>
                        <div className="flex items-center justify-center min-h-96">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Rol no reconocido
                                </h2>
                                <p className="text-gray-600">
                                    Por favor, contacta al administrador para resolver este problema.
                                </p>
                            </div>
                        </div>
                    </DashboardLayout>
                );
        }
    };

    return renderDashboardByRole();
};

export default Dashboard;