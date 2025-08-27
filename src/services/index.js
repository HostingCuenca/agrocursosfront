// Exportar todos los servicios desde un punto centralizado
export { authService } from './authService';
export { courseService } from './courseService';
export { moduleService } from './moduleService';
export { classService } from './classService';
export { assignmentService } from './assignmentService';
export { enrollmentService } from './enrollmentService';
export { progressService } from './progressService';
export { certificateService } from './certificateService';
export { virtualClassService } from './virtualClassService';

// También exportar la instancia de API para casos especiales
export { default as api } from './authService';