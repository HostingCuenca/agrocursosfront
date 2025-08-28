import React from 'react';
import { courseService } from '../../services/courseService';
import useAuthStore from '../../store/authStore';

const TestButton = () => {
    const { user } = useAuthStore();

    const testCreateCourse = async () => {
        try {
            console.log('Testing course creation...');
            console.log('User:', user);
            console.log('Token from localStorage:', localStorage.getItem('token'));
            
            const courseData = {
                title: "Curso de Prueba Frontend",
                description: "Este es un curso de prueba creado desde el frontend",
                category: "agriculture",
                difficulty_level: "Básico",
                price: 25.99,
                currency: "USD",
                duration_hours: 8,
                language: "es",
                is_published: false
            };

            console.log('Course data to send:', courseData);
            
            const response = await courseService.createCourse(courseData);
            console.log('✅ Success! Course created:', response);
            console.log('📝 Created course details:');
            console.log(`- Title: ${response.course?.title}`);
            console.log(`- ID: ${response.course?.id}`);
            console.log(`- Instructor ID: ${response.course?.instructor_id}`);
            console.log(`- Published: ${response.course?.is_published}`);
            console.log(`- Created at: ${response.course?.created_at}`);
            
            alert(`¡Curso "${response.course?.title}" creado exitosamente!\nID: ${response.course?.id}\nRevisa la consola para más detalles.`);
            
        } catch (error) {
            console.error('❌ Error creating course:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: {
                    baseURL: error.config?.baseURL,
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
            
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    const testUpdateCourse = async () => {
        const courseId = prompt('Ingresa el ID del curso a actualizar:');
        if (!courseId) return;
        
        try {
            console.log('Testing course update...');
            
            const updateData = {
                title: "Curso Actualizado desde Frontend"
            };

            console.log('Update data to send:', updateData);
            
            const response = await courseService.updateCourse(courseId, updateData);
            console.log('✅ Success! Course updated:', response);
            alert('¡Curso actualizado exitosamente! Revisa la consola.');
            
        } catch (error) {
            console.error('❌ Error updating course:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: {
                    baseURL: error.config?.baseURL,
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
            
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    const testGetCourses = async () => {
        try {
            console.log('Testing get courses...');
            console.log('🔄 Calling API without pagination parameters...');
            
            const response = await courseService.getCourses({});
            console.log('✅ Success! Courses retrieved:', response);
            console.log('📊 Course details:');
            
            if (response.courses) {
                response.courses.forEach((course, index) => {
                    console.log(`${index + 1}. ${course.title} (ID: ${course.id}) - Instructor: ${course.instructor_id} - Published: ${course.is_published}`);
                });
                
                // Buscar cursos del instructor actual
                const myCourses = response.courses.filter(course => course.instructor_id === user?.id);
                console.log(`📋 Mis cursos (${myCourses.length}):`, myCourses);
            }
            
            alert(`¡${response.courses?.length || 0} cursos obtenidos! Revisa la consola para detalles.`);
            
        } catch (error) {
            console.error('❌ Error getting courses:', error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    if (user?.role !== 'instructor' && user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
            <h3 className="font-semibold mb-3 text-sm">🧪 Test Endpoints</h3>
            <div className="space-y-2">
                <button
                    onClick={testGetCourses}
                    className="block w-full text-xs px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    GET /courses
                </button>
                <button
                    onClick={testCreateCourse}
                    className="block w-full text-xs px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    POST /courses
                </button>
                <button
                    onClick={testUpdateCourse}
                    className="block w-full text-xs px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                    PUT /courses/:id
                </button>
            </div>
        </div>
    );
};

export default TestButton;