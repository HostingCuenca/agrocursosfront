# Sistema de Gestión de Contenido - AgriCourses

## 🧪 Usuarios para Pruebas

### **👨‍🏫 Instructor**
- **Email:** `instructor@test.com`
- **Password:** `123456`
- **Rol:** `instructor`
- **Permisos:** Crear, editar y eliminar cursos, módulos y clases propias

### **👨‍💼 Administrador**
- **Email:** `admin@test.com`
- **Password:** `123456`
- **Rol:** `admin`
- **Permisos:** Acceso completo a todos los cursos del sistema

### **Login API:**
```bash
curl -X POST "http://localhost:3010/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor@test.com","password":"123456"}'
```

---

## 🏗️ Gestión de Cursos

### **1. Crear Curso**
**Endpoint:** `POST /api/courses`  
**Permisos:** Instructor/Admin  
**Headers:** `Authorization: Bearer {token}`

**Ejemplo completo:**
```bash
curl -X POST "http://localhost:3010/api/courses" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cultivo Avanzado de Tomates Orgánicos",
    "description": "Aprende todas las técnicas para cultivar tomates orgánicos de alta calidad en tu huerto. Desde la preparación del suelo hasta la cosecha.",
    "category": "agriculture",
    "subcategory": "organic_farming",
    "difficulty_level": "Avanzado",
    "price": 99.99,
    "duration_hours": 35,
    "language": "es",
    "thumbnail": "https://images.unsplash.com/photo-1592841200221-471592b6d231",
    "is_published": true
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Curso creado exitosamente",
  "course": {
    "id": "56be9a1d-a13c-457b-a448-ff8f2ee8d349",
    "title": "Cultivo Avanzado de Tomates Orgánicos",
    "price": "99.99",
    "is_published": true,
    "instructor_id": "384964dd-7b92-4a41-b1e6-7167c2497c47",
    "created_at": "2025-08-29T00:31:46.000Z"
  }
}
```

**Campos disponibles:**
- `title` (string, required, min: 3 caracteres)
- `description` (string, required, min: 10 caracteres)
- `category` (string, optional)
- `subcategory` (string, optional)
- `difficulty_level` (string: "Básico", "Intermedio", "Avanzado")
- `price` (number, min: 0, default: 0)
- `currency` (string: "USD", "PEN", "EUR", default: "USD")
- `duration_hours` (number, min: 0, default: 0)
- `language` (string: "es", "en", "pt", default: "es")
- `thumbnail` (string, URL de imagen)
- `tags` (array de strings)
- `is_published` (boolean, default: false)

### **2. Editar Curso**
**Endpoint:** `PUT /api/courses/{course_id}`  
**Permisos:** Solo el instructor propietario o admin

```bash
curl -X PUT "http://localhost:3010/api/courses/56be9a1d-a13c-457b-a448-ff8f2ee8d349" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cultivo Avanzado de Tomates Orgánicos",
    "price": 99.99,
    "duration_hours": 35,
    "difficulty_level": "Avanzado"
  }'
```

**Ventajas del sistema de edición:**
- ✅ **Edición parcial:** Solo envía los campos que quieres cambiar
- ✅ **Validación completa:** Valida cada campo enviado
- ✅ **Seguridad:** Solo el propietario puede editar
- ✅ **Flexibilidad:** Actualiza `updated_at` automáticamente

### **3. Obtener Cursos**
**Endpoint:** `GET /api/courses`  
**Público:** Sí (con autenticación opcional para ver estado de inscripción)

```bash
# Como instructor/admin (ve todos los cursos con estado de inscripción)
curl -X GET "http://localhost:3010/api/courses" \
  -H "Authorization: Bearer {token}"

# Público (ve todos los cursos publicados)
curl -X GET "http://localhost:3010/api/courses"
```

**Filtros disponibles:**
- `?page=1&limit=10` (paginación)
- `?category=agriculture` (filtrar por categoría)
- `?level=Avanzado` (filtrar por nivel de dificultad)

### **4. Eliminar Curso (Soft Delete)**
**Endpoint:** `DELETE /api/courses/{course_id}`

```bash
curl -X DELETE "http://localhost:3010/api/courses/56be9a1d-a13c-457b-a448-ff8f2ee8d349" \
  -H "Authorization: Bearer {token}"
```

---

## 📚 Gestión de Módulos

### **1. Crear Módulo**
**Endpoint:** `POST /api/modules/courses/{course_id}/modules`  
**Permisos:** Instructor propietario del curso/Admin

```bash
curl -X POST "http://localhost:3010/api/modules/courses/56be9a1d-a13c-457b-a448-ff8f2ee8d349/modules" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Preparación del Suelo",
    "description": "Aprende cómo preparar el suelo ideal para el cultivo de tomates orgánicos",
    "order_sequence": 1
  }'
```

**Campos disponibles:**
- `title` (string, required)
- `description` (string, optional)
- `order_sequence` (number, required, orden del módulo)
- `duration_minutes` (number, optional)
- `is_published` (boolean, default: false)

### **2. Editar Módulo**
**Endpoint:** `PUT /api/modules/{module_id}`

```bash
curl -X PUT "http://localhost:3010/api/modules/b28442bb-4df5-4779-9bc9-33d208394b6c" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "duration_minutes": 45,
    "is_published": true
  }'
```

### **3. Obtener Módulos de un Curso**
**Endpoint:** `GET /api/modules/courses/{course_id}/modules`

```bash
curl -X GET "http://localhost:3010/api/modules/courses/56be9a1d-a13c-457b-a448-ff8f2ee8d349/modules" \
  -H "Authorization: Bearer {token}"
```

### **4. Reordenar Módulos**
**Endpoint:** `PUT /api/modules/courses/{course_id}/modules/reorder`

```bash
curl -X PUT "http://localhost:3010/api/modules/courses/56be9a1d-a13c-457b-a448-ff8f2ee8d349/modules/reorder" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "modules": [
      {"id": "module-2-id", "order_sequence": 1},
      {"id": "module-1-id", "order_sequence": 2}
    ]
  }'
```

---

## 🎥 Gestión de Clases

### **1. Crear Clase**
**Endpoint:** `POST /api/classes/modules/{module_id}/classes`  
**Permisos:** Instructor propietario/Admin

```bash
curl -X POST "http://localhost:3010/api/classes/modules/b28442bb-4df5-4779-9bc9-33d208394b6c/classes" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Análisis de Suelo",
    "description": "Cómo analizar la composición y pH del suelo",
    "type": "video",
    "order_sequence": 1,
    "duration_minutes": 15,
    "metadata": {
      "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "video_platform": "youtube"
    }
  }'
```

**Tipos de clase disponibles:**
- `"video"` - Clase con video (YouTube, Vimeo, etc.)
- `"text"` - Clase con contenido de texto
- `"quiz"` - Clase con cuestionario
- `"assignment"` - Clase con tarea

**Campos disponibles:**
- `title` (string, required)
- `description` (string, optional)
- `type` (string, required: "video", "text", "quiz", "assignment")
- `order_sequence` (number, required)
- `duration_minutes` (number, optional)
- `content_url` (string, opcional, URL del contenido)
- `content_text` (text, opcional, contenido textual)
- `metadata` (object, opcional, información adicional como URLs de video)
- `is_published` (boolean, default: false)

### **2. Editar Clase**
**Endpoint:** `PUT /api/classes/{class_id}`

```bash
curl -X PUT "http://localhost:3010/api/classes/f0a44448-f102-436c-88dd-878f663c299e" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "duration_minutes": 20,
    "is_published": true
  }'
```

### **3. Obtener Clases de un Módulo**
**Endpoint:** `GET /api/classes/modules/{module_id}/classes`

```bash
curl -X GET "http://localhost:3010/api/classes/modules/b28442bb-4df5-4779-9bc9-33d208394b6c/classes" \
  -H "Authorization: Bearer {token}"
```

### **4. Reordenar Clases**
**Endpoint:** `PUT /api/classes/modules/{module_id}/classes/reorder`

```bash
curl -X PUT "http://localhost:3010/api/classes/modules/b28442bb-4df5-4779-9bc9-33d208394b6c/classes/reorder" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "classes": [
      {"id": "class-2-id", "order_sequence": 1},
      {"id": "class-1-id", "order_sequence": 2}
    ]
  }'
```

---

## 🎯 Casos de Uso para Frontend

### **Flujo Completo de Creación**

```javascript
// 1. Crear curso
const courseResponse = await fetch('/api/courses', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Mi Nuevo Curso",
    description: "Descripción del curso",
    category: "agriculture",
    difficulty_level: "Básico",
    price: 49.99,
    is_published: false // Inicialmente en borrador
  })
});

const { course } = await courseResponse.json();

// 2. Crear módulos
const module1 = await fetch(`/api/modules/courses/${course.id}/modules`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Introducción",
    description: "Módulo introductorio",
    order_sequence: 1
  })
});

// 3. Crear clases
const class1 = await fetch(`/api/classes/modules/${module1.id}/classes`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Bienvenida al Curso",
    description: "Video de bienvenida",
    type: "video",
    order_sequence: 1,
    duration_minutes: 5,
    metadata: {
      video_url: "https://youtube.com/watch?v=123",
      video_platform: "youtube"
    }
  })
});

// 4. Publicar curso cuando esté listo
await fetch(`/api/courses/${course.id}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    is_published: true
  })
});
```

### **Dashboard del Instructor**

```javascript
// Obtener todos los cursos del instructor
const getMyCourses = async () => {
  const response = await fetch('/api/courses', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  // Filtrar solo los cursos del instructor actual
  const myCourses = data.courses.filter(
    course => course.instructor_id === currentUser.id
  );
  
  return myCourses;
};

// Ver estadísticas de un curso específico
const getCourseStats = async (courseId) => {
  const response = await fetch(`/api/enrollments/courses/${courseId}/enrollments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return response.json();
};
```

---

## ✅ Validaciones y Reglas de Negocio

### **Seguridad**
- ✅ **JWT requerido** para todas las operaciones CRUD
- ✅ **Autorización por roles:** instructor/admin
- ✅ **Propietario únicamente:** instructores solo pueden editar sus propios cursos
- ✅ **Admins tienen acceso total** a todos los cursos

### **Validación de Datos**
- ✅ **Títulos únicos** por instructor (recomendado)
- ✅ **Precios no negativos**
- ✅ **Duraciones válidas**
- ✅ **Niveles de dificultad limitados**
- ✅ **URLs de thumbnail válidas**
- ✅ **Orden secuencial** de módulos y clases

### **Estados de Publicación**
- `is_published: false` → **Borrador** (no visible públicamente)
- `is_published: true` → **Publicado** (visible en catálogo público)

---

## 🚀 Implementación Frontend Recomendada

### **Estructura de Páginas**
```
/dashboard/instructor/
├── /courses                 # Lista de cursos del instructor
├── /courses/new            # Crear nuevo curso
├── /courses/:id/edit       # Editar curso
├── /courses/:id/modules    # Gestionar módulos del curso
└── /courses/:id/students   # Ver estudiantes inscritos
```

### **Estados de Carga**
```javascript
const [course, setCourse] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const updateCourse = async (updates) => {
  setLoading(true);
  try {
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (response.ok) {
      const data = await response.json();
      setCourse(data.course);
      setError(null);
    } else {
      const errorData = await response.json();
      setError(errorData.error);
    }
  } catch (err) {
    setError('Error de conexión');
  } finally {
    setLoading(false);
  }
};
```

### **Manejo de Errores**
```javascript
// Estructura común de respuesta de error
{
  "error": "Datos inválidos",
  "details": [
    {
      "field": "title",
      "message": "Título debe tener al menos 3 caracteres"
    }
  ]
}

// En el frontend
const handleErrors = (errorData) => {
  if (errorData.details && Array.isArray(errorData.details)) {
    // Errores de validación campo por campo
    errorData.details.forEach(detail => {
      setFieldError(detail.field, detail.message);
    });
  } else {
    // Error general
    setGeneralError(errorData.error);
  }
};
```

Este sistema proporciona una base sólida y flexible para la gestión completa de contenido educativo, con todas las operaciones necesarias para crear una plataforma de cursos robusta y escalable.