# 🧪 CREDENCIALES DE PRUEBA - Plataforma AgroCursos

## Usuarios de Prueba Creados

### 👨‍💼 **ADMINISTRADOR**
```
Email: admin@cfda.com
Password: 123456
Rol: Administrador
```

### 👩‍🏫 **INSTRUCTOR**
```
Email: instructor@cfda.com  
Password: 123456
Rol: Instructor
```

### 👨‍🎓 **ESTUDIANTE**
```
Email: test@test.com
Password: 123456
Rol: Estudiante
```

## 🎯 **Cómo Probar**

1. **Ve a http://localhost:3002/login**
2. **Usa cualquiera de las credenciales arriba**
3. **Verifica que:**
   - Login funciona correctamente
   - Redirección al dashboard apropiado por rol
   - Header muestra el nombre y rol del usuario
   - Logout funciona y regresa al login

## ✅ **Funcionalidades Validadas**

- ✅ Registro de usuarios con campos correctos (`first_name`, `last_name`)
- ✅ Login con redirección automática al dashboard
- ✅ Detección de roles y dashboards específicos
- ✅ Header muestra información del usuario y rol en español
- ✅ Logout con redirección al login
- ✅ Persistencia de sesión (refresh mantiene login)

## 🎯 **PRUEBA DEL SISTEMA DE MÓDULOS Y CLASES**

### **Cómo Probar la Nueva Funcionalidad:**

1. **Inicia sesión como admin** (admin@cfda.com / 123456)
2. **Ve a http://localhost:3002/cursos** 
3. **Haz click en cualquier curso** para ir al detalle
4. **En la sección "Contenido del Curso"** verás:
   - ✅ Lista de módulos cargada desde la API
   - ✅ Expansión/colapso de módulos 
   - ✅ Lista de clases al expandir módulos
   - ✅ Iconos por tipo de clase (video, texto, quiz, etc.)
   - ✅ Estados de publicación (Publicado/Borrador)
   - ✅ Duración y secuencia de módulos/clases

### **Datos de Prueba Creados:**
- **Curso ID**: `6da30409-f5f3-4687-a737-05ba38ce6c80` tiene 2 módulos con clases
- **Módulo 1**: "Fundamentos de Agricultura" con 1 clase de video
- **Módulo 2**: "Técnicas de Cultivo" (sin clases aún)

### **Funcionalidades Implementadas:**
- ✅ **Servicios** de módulos y clases alineados con API
- ✅ **Componente CourseContent** interactivo
- ✅ **Carga dinámica** de clases al expandir módulos  
- ✅ **Indicadores visuales** de tipos de contenido
- ✅ **Estados de loading** y manejo de errores
- ✅ **Permisos por rol** (botones de gestión para admin/instructor)

## 🎬 **REPRODUCTOR DE CURSOS INTEGRADO - ESTILO PLATAFORMA PROFESIONAL**

### **✅ FUNCIONALIDADES IMPLEMENTADAS:**
- **Integrado con DashboardLayout** - mantiene header, sidebar y navbar de la plataforma  
- **Breadcrumb de navegación** para volver al curso sin romper el flujo
- **Área de video 16:9** con reproductor YouTube optimizado y redondeado
- **Grid responsive** (desktop 2/3 + 1/3, mobile stacked)
- **Sidebar de módulos** con progreso visual y navegación intuitiva
- **Endpoint de completar clase** funcional (POST /api/classes/{id}/complete)
- **Información detallada** con botón para marcar completada
- **Consistencia visual** - mismo estilo que el resto de la plataforma

### **🎯 CÓMO PROBAR EL REPRODUCTOR:**

1. **Inicia sesión como estudiante** (test@test.com / 123456)
2. **Ve a http://localhost:3002/cursos/6da30409-f5f3-4687-a737-05ba38ce6c80**
3. **Haz click en "Continuar Aprendiendo"** (botón verde)
4. **¡Serás redirigido al reproductor!** (http://localhost:3002/cursos/6da30409-f5f3-4687-a737-05ba38ce6c80/learn)
5. **Navega entre clases** usando el sidebar o botones anterior/siguiente
6. **Prueba tanto contenido de video como texto**

### **🔧 SI HAY PROBLEMAS:**
- **Refresca la página** (Ctrl+F5) para limpiar cache
- **Abre DevTools** (F12) y revisa la consola para errores
- **Verifica que el backend esté corriendo** en puerto 3010
- **Los endpoints están funcionando correctamente** ✅

### **📊 DATOS DE PRUEBA CONFIRMADOS:**
- ✅ **Estudiante inscrito** en curso "Agricultura Moderna" 
- ✅ **2 módulos** con clases de video y texto disponibles
- ✅ **Progreso 0%** - listo para empezar a aprender

## 🔍 **EXPLORAR CURSOS IMPLEMENTADO**

### **✅ FUNCIONALIDADES COMPLETAS:**
- **Página completa de exploración** de todos los cursos disponibles
- **Búsqueda avanzada** por texto (título, descripción, instructor)  
- **Sistema de filtros** por categoría, nivel y precio
- **Grid responsive** de tarjetas de curso con información completa
- **Navegación directa** a páginas de detalle de curso
- **Diseño consistente** con DashboardLayout
- **Estados de carga** y mensajes cuando no hay resultados

### **🎯 CÓMO PROBAR EXPLORAR CURSOS:**

1. **Inicia sesión como cualquier rol** (admin/instructor/student)
2. **Ve a http://localhost:3002/explorar** desde el menú lateral
3. **Prueba la búsqueda** escribiendo términos como "agricultura"
4. **Usa los filtros** por categoría, nivel o precio
5. **Haz click en "Ver curso"** para ir al detalle
6. **Verifica responsive design** en mobile/desktop

### **📊 DATOS DE PRUEBA DISPONIBLES:**
- ✅ **Cursos cargados** desde endpoint GET /api/courses
- ✅ **Categorías dinámicas** extraídas de los cursos
- ✅ **Navegación funcional** entre páginas
- ✅ **Sistema de inscripción** funcional para estudiantes

## 📝 **SISTEMA DE INSCRIPCIONES IMPLEMENTADO**

### **✅ FUNCIONALIDADES COMPLETAS:**
- **Inscripción en un click** para estudiantes desde página explorar
- **Indicador visual** de cursos ya inscritos (badge verde "Inscrito")
- **Estados de carga** durante el proceso de inscripción
- **Verificación de inscripciones** existentes al cargar la página
- **Endpoint correcto**: POST /api/enrollments/courses/{courseId}/enroll
- **Carga de inscripciones**: GET /api/progress/dashboard/{studentId}

### **🎯 CÓMO PROBAR INSCRIPCIONES:**

1. **Inicia sesión como estudiante** (test@test.com / 123456)
2. **Ve a http://localhost:3002/explorar**
3. **Busca cursos no inscritos** - verás botón verde "Inscribirse"
4. **Haz click en "Inscribirse"** - verás loading y mensaje de éxito
5. **Refresca la página** - ahora verás badge "Inscrito" en lugar del botón
6. **Solo estudiantes ven botones de inscripción** - admin/instructor no los ven

### **📊 DATOS NECESARIOS:**
- ✅ **Usuario estudiante** con credenciales válidas
- ✅ **Cursos publicados** en la base de datos
- ✅ **Endpoints funcionando** correctamente