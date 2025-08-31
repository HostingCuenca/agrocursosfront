
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas principales
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import MyCourses from './pages/MyCourses';
import ExploreCourses from './pages/ExploreCourses';
import EnrollmentManagement from './pages/EnrollmentManagement';
import StudentManagement from './pages/StudentManagement';
import MyStudents from './pages/MyStudents';
import InstructorManagement from './pages/InstructorManagement';
import VirtualClassManagement from './pages/VirtualClassManagement';
import StudentVirtualClasses from './pages/StudentVirtualClasses';
import StudentEvaluations from './pages/StudentEvaluations';
import TakeEvaluation from './pages/TakeEvaluation';
import InstructorEvaluations from './pages/InstructorEvaluations';
import MyCertificates from './pages/MyCertificates';
import CertificateManagement from './pages/CertificateManagement';
import PublicCertificateVerification from './pages/PublicCertificateVerification';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';

function App() {
    const { isAuthenticated, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <Router>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<Home />} />
                
                {/* Verificación pública de certificados */}
                <Route path="/verificar" element={<PublicCertificateVerification />} />
                <Route path="/verificar/:certificateNumber" element={<PublicCertificateVerification />} />

                {/* Rutas de autenticación */}
                <Route
                    path="/login"
                    element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
                />
                <Route
                    path="/register"
                    element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />}
                />

                {/* Rutas protegidas - Dashboard principal */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas protegidas - Funcionalidades generales */}
                <Route
                    path="/cursos"
                    element={
                        <ProtectedRoute>
                            <CoursesPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/cursos/:id"
                    element={
                        <ProtectedRoute>
                            <CourseDetailPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/cursos/:id/learn"
                    element={
                        <ProtectedRoute requiredRole="student">
                            <CoursePlayerPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/mis-cursos"
                    element={
                        <ProtectedRoute>
                            <MyCourses />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/explorar"
                    element={
                        <ProtectedRoute>
                            <ExploreCourses />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas protegidas - Gestión de usuarios */}
                <Route
                    path="/estudiantes"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <StudentManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/mis-estudiantes"
                    element={
                        <ProtectedRoute requiredRole="instructor">
                            <MyStudents />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/instructores"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <InstructorManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/aprobaciones"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inscripciones"
                    element={
                        <ProtectedRoute requiredRole={["instructor", "admin"]}>
                            <EnrollmentManagement />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas protegidas - Contenido educativo */}
                <Route
                    path="/modulos"
                    element={
                        <ProtectedRoute>
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/certificados"
                    element={
                        <ProtectedRoute requiredRole={["instructor", "admin"]}>
                            <CertificateManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/mis-certificados"
                    element={
                        <ProtectedRoute requiredRole="student">
                            <MyCertificates />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas protegidas - Reportes y estadísticas */}
                <Route
                    path="/reportes"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/estadisticas"
                    element={
                        <ProtectedRoute requiredRole="instructor">
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/progreso"
                    element={
                        <ProtectedRoute requiredRole="student">
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas protegidas - Clases virtuales */}
                <Route
                    path="/clases-virtuales"
                    element={
                        <ProtectedRoute requiredRole={["instructor", "admin"]}>
                            <VirtualClassManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/mis-clases-virtuales"
                    element={
                        <ProtectedRoute requiredRole="student">
                            <StudentVirtualClasses />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas protegidas - Evaluaciones */}
                <Route
                    path="/evaluaciones"
                    element={
                        <ProtectedRoute requiredRole="student">
                            <StudentEvaluations />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/evaluaciones/:assignmentId/realizar"
                    element={
                        <ProtectedRoute requiredRole="student">
                            <TakeEvaluation />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/gestion-evaluaciones"
                    element={
                        <ProtectedRoute requiredRole={["instructor", "admin"]}>
                            <InstructorEvaluations />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/evaluaciones/crear"
                    element={
                        <ProtectedRoute requiredRole={["instructor", "admin"]}>
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/evaluaciones/:assignmentId/editar"
                    element={
                        <ProtectedRoute requiredRole={["instructor", "admin"]}>
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/evaluaciones/:assignmentId/intentos"
                    element={
                        <ProtectedRoute requiredRole={["instructor", "admin"]}>
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/evaluaciones/:assignmentId/revisar"
                    element={
                        <ProtectedRoute requiredRole={["instructor", "admin"]}>
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas protegidas - Calendario y configuración */}
                <Route
                    path="/calendario"
                    element={
                        <ProtectedRoute>
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/configuracion"
                    element={
                        <ProtectedRoute>
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />

                {/* Ruta 404 - Página no encontrada */}
                <Route path="/404" element={<NotFound />} />

                {/* Ruta catch-all - Redirigir a 404 */}
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </Router>
    );
}

export default App;