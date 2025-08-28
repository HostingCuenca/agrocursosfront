# Sistema de Aprobación de Inscripciones - AgriCourses

## 📋 Resumen del Sistema

El sistema implementa un flujo de aprobación donde:
1. **Estudiante solicita inscripción** → Estado `pending`
2. **Instructor/Admin aprueba o rechaza** → Estado `enrolled` o `rejected`
3. **Solo inscripciones aprobadas** pueden acceder al contenido del curso

---

## 🔄 Flujo Completo de Inscripción

### 1. Solicitud de Inscripción (Estudiante)
**Endpoint:** `POST /api/enrollments/courses/{courseId}/enroll`
**Headers:** `Authorization: Bearer {student_token}`
**Body:** `{}`

**Respuesta:**
```json
{
  "success": true,
  "message": "Solicitud de inscripción enviada. Esperando aprobación del instructor.",
  "enrollment": {
    "id": "15e55067-04f3-47f2-a462-55b96af183bc",
    "status": "pending",
    "course_title": "Huerto Casero: Guía Completa para Principiantes",
    "enrollment_date": "2025-08-28T19:10:27.000Z"
  }
}
```

### 2. Ver Inscripciones Pendientes (Instructor/Admin)
**Endpoint:** `GET /api/enrollments/courses/{courseId}/enrollments?status=pending`
**Headers:** `Authorization: Bearer {instructor_token}`

**Respuesta:**
```json
{
  "success": true,
  "enrollments": [
    {
      "id": "15e55067-04f3-47f2-a462-55b96af183bc",
      "status": "pending",
      "student_name": "Test User",
      "student_email": "test@test.com",
      "enrollment_date": "2025-08-28T19:10:27.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 3a. Aprobar Inscripción (Instructor/Admin)
**Endpoint:** `POST /api/enrollments/{enrollmentId}/approve`
**Headers:** `Authorization: Bearer {instructor_token}`
**Body:** `{}`

**Respuesta:**
```json
{
  "success": true,
  "message": "Inscripción aprobada exitosamente",
  "enrollment": {
    "id": "15e55067-04f3-47f2-a462-55b96af183bc",
    "status": "enrolled",
    "student_name": "Test User",
    "course_title": "Huerto Casero: Guía Completa para Principiantes",
    "updated_at": "2025-08-28T19:12:14.000Z"
  }
}
```

### 3b. Rechazar Inscripción (Instructor/Admin)
**Endpoint:** `POST /api/enrollments/{enrollmentId}/reject`
**Headers:** `Authorization: Bearer {instructor_token}`
**Body:**
```json
{
  "reason": "El curso está completo para este período"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Inscripción rechazada",
  "enrollment": {
    "id": "15e55067-04f3-47f2-a462-55b96af183bc",
    "status": "rejected",
    "metadata": {
      "rejection_reason": "El curso está completo para este período",
      "rejected_by": "instructor_id",
      "rejected_at": "2025-08-28T19:15:00.000Z"
    }
  }
}
```

### 4. Ver Cursos del Estudiante
**Endpoint:** `GET /api/enrollments/students/{studentId}/enrollments`
**Headers:** `Authorization: Bearer {student_token}`

**Respuesta:**
```json
{
  "success": true,
  "enrollments": [
    {
      "id": "15e55067-04f3-47f2-a462-55b96af183bc",
      "status": "enrolled",
      "course_title": "Huerto Casero: Guía Completa para Principiantes",
      "course_description": "Aprende a crear y mantener tu propio huerto casero...",
      "course_thumbnail": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
      "instructor_name": "Test User",
      "progress_percentage": "0.00"
    }
  ]
}
```

---

## 📊 Estados de Inscripción

| Estado | Descripción | Puede Acceder al Curso |
|--------|-------------|------------------------|
| `pending` | Esperando aprobación | ❌ No |
| `enrolled` | Aprobada y activa | ✅ Sí |
| `rejected` | Rechazada por instructor | ❌ No |
| `cancelled` | Cancelada por estudiante/instructor | ❌ No |
| `completed` | Curso completado | ✅ Sí (solo lectura) |

---

## 🔐 Permisos por Rol

### **Estudiante (`student`)**
- ✅ Solicitar inscripción
- ✅ Ver sus propias inscripciones
- ✅ Cancelar sus inscripciones
- ❌ Aprobar/rechazar inscripciones

### **Instructor (`instructor`)**
- ✅ Ver inscripciones de sus cursos
- ✅ Aprobar/rechazar inscripciones de sus cursos
- ✅ Inscribir estudiantes directamente (bulk)
- ❌ Gestionar inscripciones de otros instructores

### **Administrador (`admin`)**
- ✅ Ver todas las inscripciones
- ✅ Aprobar/rechazar cualquier inscripción
- ✅ Gestionar inscripciones de cualquier curso
- ✅ Acceso completo al sistema

---

## 🎯 Implementación en Frontend

### Pantalla de Estudiante - Solicitar Inscripción
```javascript
// Cuando el estudiante hace clic en "Inscribirse"
const enrollInCourse = async (courseId) => {
  try {
    const response = await fetch(`/api/enrollments/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Mostrar mensaje: "Solicitud enviada, esperando aprobación"
      showNotification(result.message, 'info');
    }
  } catch (error) {
    showNotification('Error al solicitar inscripción', 'error');
  }
};
```

### Pantalla de Instructor - Gestionar Inscripciones
```javascript
// Obtener inscripciones pendientes
const getPendingEnrollments = async (courseId) => {
  const response = await fetch(`/api/enrollments/courses/${courseId}/enrollments?status=pending`, {
    headers: {
      'Authorization': `Bearer ${instructorToken}`
    }
  });
  return response.json();
};

// Aprobar inscripción
const approveEnrollment = async (enrollmentId) => {
  const response = await fetch(`/api/enrollments/${enrollmentId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${instructorToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  return response.json();
};

// Rechazar inscripción
const rejectEnrollment = async (enrollmentId, reason) => {
  const response = await fetch(`/api/enrollments/${enrollmentId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${instructorToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  return response.json();
};
```

### Componente de Estado de Inscripción
```jsx
const EnrollmentStatus = ({ status, metadata }) => {
  const statusConfig = {
    pending: {
      color: 'orange',
      icon: '⏳',
      text: 'Esperando aprobación'
    },
    enrolled: {
      color: 'green',
      icon: '✅',
      text: 'Inscrito'
    },
    rejected: {
      color: 'red',
      icon: '❌',
      text: 'Rechazado'
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <div className={`status-badge ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
      {status === 'rejected' && metadata?.rejection_reason && (
        <p className="rejection-reason">Razón: {metadata.rejection_reason}</p>
      )}
    </div>
  );
};
```

---

## 📱 UX/UI Recomendaciones

### Para Estudiantes
1. **Botón de Inscripción:**
    - Antes: "Inscribirse"
    - Después: "Solicitar Inscripción"

2. **Estados Visuales:**
    - `pending`: Badge naranja con "Pendiente de aprobación"
    - `enrolled`: Badge verde con "Inscrito" + botón "Acceder al curso"
    - `rejected`: Badge rojo con "Solicitud rechazada" + razón

3. **Notificaciones:**
    - Mostrar confirmación al enviar solicitud
    - Notificar cuando sea aprobada/rechazada

### Para Instructores
1. **Dashboard de Inscripciones:**
    - Tab separado para "Pendientes de Aprobación"
    - Contador de solicitudes pendientes
    - Vista rápida de información del estudiante

2. **Acciones Rápidas:**
    - Botones "Aprobar" y "Rechazar" en lista
    - Modal de confirmación para rechazo con campo de razón
    - Aprobación en lote para múltiples estudiantes

---

## 🔧 Filtros y Consultas Útiles

### Filtrar por Estado
```javascript
// Obtener solo inscripciones aprobadas
GET /api/enrollments/students/{studentId}/enrollments?status=enrolled

// Obtener solo inscripciones pendientes
GET /api/enrollments/courses/{courseId}/enrollments?status=pending

// Obtener solo inscripciones rechazadas
GET /api/enrollments/courses/{courseId}/enrollments?status=rejected
```

### Paginación
```javascript
// Paginar resultados (por defecto 20 por página)
GET /api/enrollments/courses/{courseId}/enrollments?page=2&limit=10
```

---

## 🚨 Casos de Error a Manejar

### Error 403 - Sin Permisos
```json
{
  "error": "No tienes permisos para aprobar esta inscripción"
}
```
**Acción:** Verificar que el usuario sea instructor del curso o admin.

### Error 400 - Estado Inválido
```json
{
  "error": "Solo se pueden aprobar inscripciones pendientes",
  "current_status": "enrolled"
}
```
**Acción:** Refrescar la lista de inscripciones pendientes.

### Error 404 - Inscripción No Encontrada
```json
{
  "error": "Inscripción no encontrada"
}
```
**Acción:** La inscripción fue eliminada o el ID es incorrecto.

---

## 📈 Estadísticas Actualizadas

El endpoint de estadísticas ahora incluye información sobre inscripciones pendientes:

**Endpoint:** `GET /api/enrollments/stats`
```json
{
  "success": true,
  "stats": {
    "total_enrollments": "15",
    "active_enrollments": "12",
    "pending_enrollments": "2",
    "rejected_enrollments": "1",
    "completed_enrollments": "8",
    "avg_progress": "65.5"
  }
}
```

---

## 🔄 Flujo de Notificaciones Sugerido

1. **Estudiante solicita inscripción** → Notificar al instructor
2. **Instructor aprueba** → Notificar al estudiante + email de bienvenida
3. **Instructor rechaza** → Notificar al estudiante con razón
4. **Estudiante completa curso** → Notificar al instructor

---

## ✅ Lista de Verificación para Frontend

- [ ] Actualizar botón de inscripción para mostrar "Solicitar Inscripción"
- [ ] Implementar estados visuales para inscripciones (pending/enrolled/rejected)
- [ ] Crear dashboard de instructor para gestionar inscripciones pendientes
- [ ] Agregar modal de confirmación para rechazo con campo de razón
- [ ] Implementar filtros por estado de inscripción
- [ ] Actualizar notificaciones para reflejar nuevo flujo
- [ ] Agregar contador de solicitudes pendientes para instructores
- [ ] Implementar vista de historial de inscripciones rechazadas
- [ ] Validar permisos en frontend antes de mostrar acciones
- [ ] Manejar casos de error específicos del sistema de aprobación

---

**Nota:** Este sistema garantiza que solo estudiantes aprobados por el instructor o administrador puedan acceder al contenido de los cursos, mejorando el control de calidad y la gestión educativa de la plataforma.