
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
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/continuar"
                    element={
                        <ProtectedRoute>
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas protegidas - Gestión de usuarios */}
                <Route
                    path="/estudiantes"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/mis-estudiantes"
                    element={
                        <ProtectedRoute requiredRole="instructor">
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/instructores"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <ComingSoon />
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
                        <ProtectedRoute>
                            <ComingSoon />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/mis-certificados"
                    element={
                        <ProtectedRoute>
                            <ComingSoon />
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