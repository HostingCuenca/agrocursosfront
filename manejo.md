Permisos de Edición de Cursos:

🔑 Admin (role: 'admin'):

- Puede editar CUALQUIER curso
- No importa quién sea el instructor_id
- SQL: WHERE id = $1 (sin restricción de instructor)

👨‍🏫 Instructor (role: 'instructor'):

- Solo puede editar SUS propios cursos
- Debe ser el instructor_id del curso
- SQL: WHERE id = $1 AND instructor_id = $2

👨‍🎓 Student:

- No puede editar cursos (el middleware requireRole lo bloquea)

Los logs te mostrarán exactamente qué privilegio se está usando:
- 🔑 Admin privilege: Can edit any course
- 👨‍🏫 Instructor privilege: Can only edit own courses

Ahora intenta tu actualización de nuevo y deberías poder editar cualquier curso si tienes rol admin.

> esta aplicada la misma logica para modulos y clases?

⏺ Excelente pregunta. Voy a revisar los controladores de modules y classes para ver si tienen la misma lógica de admin:

⏺ Read(controllers/modulesController.js)
⎿  Read 50 lines (ctrl+r to expand)

⏺ Search(pattern: "instructor_id|WHERE.*AND", path: "controllers", output_mode: "content")
⎿  Found 133 lines (ctrl+r to expand)

⏺ ¡Perfecto! Al revisar el grep, veo que SÍ está implementada la misma lógica en modules y classes. Aquí está el patrón:

✅ Modules Controller:

if (moduleCheck.rows[0].instructor_id !== req.user.id && req.user.role !== 'admin')
- Líneas 117, 191, 268, 324: Admin puede editar cualquier módulo

✅ Classes Controller:

if (classCheck.rows[0].instructor_id !== req.user.id && req.user.role !== 'admin')
- Líneas 124, 203, 289, 335: Admin puede editar cualquier clase

✅ Assignments Controller:

if (assignmentCheck.rows[0].instructor_id !== req.user.id && req.user.role !== 'admin')
- Líneas 148, 222, 301, 552: Admin puede editar cualquier assignment

✅ Y también en:

- Virtual Classes: req.user.role !== 'admin'
- Progress: req.user.role !== 'admin'
- Enrollments: req.user.role !== 'admin'
- Certificates: req.user.role !== 'admin'

Lógica Consistente:

Admin puede hacer TODO:
- ✅ Editar cualquier curso, módulo, clase, assignment
- ✅ Ver progreso de cualquier estudiante
- ✅ Gestionar cualquier enrollment
- ✅ Emitir/revocar certificados

Instructor solo puede gestionar SU contenido:
- ✅ Solo cursos donde instructor_id = req.user.id
- ✅ Solo módulos/clases de sus cursos
- ✅ Solo assignments de sus cursos

El sistema ya tiene role-based access control completo y consistente en toda la aplicación.

> detallame por aqui cuales son los endpoints de cada cosa tanto para crear y editar

⏺ 📋 Endpoints Completos para Crear y Editar - AgriCourses

🎓 COURSES (/api/courses)

Crear Curso

POST /api/courses
Authorization: Bearer <token> (instructor/admin)
Content-Type: application/json

{
"title": "Título del curso",
"description": "Descripción detallada",
"category": "agriculture",
"subcategory": "organic_farming",
"difficulty_level": "Básico|Intermedio|Avanzado",
"price": 99.99,
"currency": "USD|PEN|EUR",
"duration_hours": 25,
"language": "es|en|pt",
"thumbnail": "url-imagen.jpg",
"tags": ["tag1", "tag2"],
"approval_criteria": {},
"metadata": {},
"is_published": false
}

Editar Curso

PUT /api/courses/:id
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"title": "Nuevo título", // Campo opcional
"price": 149.99,         // Campo opcional
"is_published": true     // Campo opcional
}

  ---
📚 MODULES (/api/modules)

Crear Módulo

POST /api/courses/:courseId/modules
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"title": "Título del módulo",
"description": "Descripción del módulo",
"order_sequence": 1,     // Opcional, se auto-genera
"is_published": true,    // Opcional, default true
"metadata": {}           // Opcional
}

Editar Módulo

PUT /api/modules/:id
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"title": "Nuevo título del módulo",
"description": "Nueva descripción",
"is_published": false
}

Reordenar Módulos

PUT /api/courses/:courseId/modules/reorder
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"modules": [
{"id": "uuid1", "order": 1},
{"id": "uuid2", "order": 2},
{"id": "uuid3", "order": 3}
]
}

  ---
🎥 CLASSES (/api/classes)

Crear Clase

POST /api/modules/:moduleId/classes
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"title": "Título de la clase",
"description": "Descripción de la clase",
"content_type": "video|text|mixed",
"content_url": "https://video-url.com",     // Opcional
"content_text": "Contenido en texto",     // Opcional
"order_sequence": 1,                       // Opcional
"is_published": true,                      // Opcional
"metadata": {}                             // Opcional
}

Editar Clase

PUT /api/classes/:id
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"title": "Nuevo título",
"content_url": "nueva-url-video.com",
"is_published": false
}

Reordenar Clases

PUT /api/modules/:moduleId/classes/reorder
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"classes": [
{"id": "uuid1", "order": 1},
{"id": "uuid2", "order": 2}
]
}

  ---
📝 ASSIGNMENTS (/api/assignments)

Crear Assignment

POST /api/courses/:courseId/assignments
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"title": "Examen Final",
"description": "Evaluación del curso",
"assignment_type": "exam|quiz|homework",
"questions": [
{
"question": "¿Cuál es...?",
"type": "multiple_choice",
"options": ["A", "B", "C", "D"],
"correct_answer": "A",
"points": 10
}
],
"total_points": 100,
"passing_score": 70,
"time_limit_minutes": 60,          // Opcional
"max_attempts": 3,                 // Opcional
"is_published": true,              // Opcional
"due_date": "2025-12-31T23:59:59Z" // Opcional
}

Editar Assignment

PUT /api/assignments/:id
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"title": "Nuevo título",
"passing_score": 75,
"questions": [...] // Array completo actualizado
}

  ---
📋 ENROLLMENTS (/api/enrollments)

Crear Enrollment (Inscribir Estudiante)

POST /api/courses/:courseId/enroll
Authorization: Bearer <token> (student/instructor/admin)
Content-Type: application/json

{} // Body vacío para auto-enrollment del usuario actual

Enrollment Masivo

POST /api/enrollments/bulk
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"course_id": "uuid-del-curso",
"student_emails": [
"student1@email.com",
"student2@email.com"
]
}

Editar Enrollment

PUT /api/enrollments/:id
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"status": "enrolled|pending|completed|cancelled",
"progress_percentage": 45.5,
"notes": "Notas del instructor"
}

  ---
🎖️ CERTIFICATES (/api/certificates)

Emitir Certificado

POST /api/certificates/issue
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"student_id": "uuid-del-estudiante",
"course_id": "uuid-del-curso",
"template_id": "uuid-template", // Opcional
"custom_message": "Felicitaciones por tu excelente desempeño"
}

Crear Template de Certificado

POST /api/certificates/templates
Authorization: Bearer <token> (admin only)
Content-Type: application/json

{
"name": "Template Agricultura",
"design_data": {
"background_color": "#ffffff",
"logo_url": "logo.png",
"font_family": "Arial"
},
"is_default": false
}

  ---
📺 VIRTUAL CLASSES (/api/virtual-classes)

Crear Clase Virtual

POST /api/courses/:courseId/virtual-classes
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"title": "Clase en Vivo: Cultivo Orgánico",
"description": "Sesión práctica",
"scheduled_date": "2025-09-15T14:00:00Z",
"duration_minutes": 90,
"platform": "zoom|teams|meet",
"meeting_url": "https://zoom.us/j/123",
"meeting_id": "123-456-789",
"meeting_password": "password123", // Opcional
"max_participants": 50,            // Opcional
"is_recorded": true               // Opcional
}

Editar Clase Virtual

PUT /api/virtual-classes/:id
Authorization: Bearer <token> (instructor propietario/admin)
Content-Type: application/json

{
"title": "Nuevo título",
"scheduled_date": "2025-09-16T15:00:00Z",
"status": "scheduled|completed|cancelled"
}

  ---
📊 PROGRESS (Solo lectura/actualización específica)

Actualizar Tiempo de Estudio

POST /api/progress/:studentId/:courseId/update-time
Authorization: Bearer <token> (student propietario/instructor/admin)
Content-Type: application/json

{
"minutes": 30
}

  ---
🔐 Permisos Resumidos:

| Acción              | Student    | Instructor       | Admin          |
  |---------------------|------------|------------------|----------------|
| Crear Curso         | ❌          | ✅ (propio)       | ✅ (cualquiera) |
| Editar Curso        | ❌          | ✅ (propio)       | ✅ (cualquiera) |
| Crear Módulo        | ❌          | ✅ (curso propio) | ✅ (cualquiera) |
| Editar Módulo       | ❌          | ✅ (curso propio) | ✅ (cualquiera) |
| Crear Clase         | ❌          | ✅ (curso propio) | ✅ (cualquiera) |
| Editar Clase        | ❌          | ✅ (curso propio) | ✅ (cualquiera) |
| Crear Assignment    | ❌          | ✅ (curso propio) | ✅ (cualquiera) |
| Editar Assignment   | ❌          | ✅ (curso propio) | ✅ (cualquiera) |
| Inscribirse         | ✅ (propio) | ✅                | ✅              |
| Inscribir Otros     | ❌          | ✅ (curso propio) | ✅              |
| Emitir Certificados | ❌          | ✅ (curso propio) | ✅              |
