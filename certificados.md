# Guía de Certificados para Frontend - AgriCourses API

## Resumen del Sistema de Certificados

El sistema de certificados de AgriCourses permite:
- **Generar certificados** automática o manualmente para estudiantes que completan cursos
- **Verificar certificados** públicamente usando números únicos
- **Gestionar certificados** (ver, revocar) por instructores y administradores
- **Verificar elegibilidad** antes de emitir certificados

## Base URL
```
http://localhost:3010/api/certificates
```

---

## 🔑 Autenticación

La mayoría de endpoints requieren autenticación JWT:
```javascript
headers: {
    'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
}
```

**Roles y permisos:**
- **Estudiantes**: Pueden ver sus propios certificados
- **Instructores**: Pueden emitir/revocar certificados de sus cursos
- **Administradores**: Acceso completo a todos los certificados

---

## 📋 Endpoints Disponibles

### 1. **Obtener Certificados de un Estudiante**
```
GET /api/certificates/students/:studentId/certificates
```

**Autenticación:** Requerida (estudiante propio o admin)

**Respuesta exitosa:**
```json
{
  "success": true,
  "certificates": [
    {
      "id": "fe3f4874-c76f-4db1-a4b2-60b09a454a9b",
      "student_id": "cb102882-7c7c-4b9e-9e3b-a3c298e47672",
      "course_id": "291dad64-dcd8-40ee-848d-2bc56a34f855",
      "certificate_number": "AGRO-1756572958564-FO4KBD",
      "issued_at": "2025-08-30T21:55:58.000Z",
      "final_grade": "80.00",
      "status": "issued",
      "certificate_url": null,
      "metadata": {...},
      "course_title": "Curso Actualizado desde Frontend",
      "course_category": "agriculture",
      "course_level": "Avanzado",
      "course_duration": 35,
      "instructor_name": "Juan Instructor"
    }
  ]
}
```

### 2. **Verificar Certificado (Público)**
```
GET /api/certificates/:certificateNumber/verify
```

**Autenticación:** No requerida

**Ejemplo:**
```bash
GET /api/certificates/AGRO-1756572958564-FO4KBD/verify
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "valid": true,
  "certificate": {
    "certificate_number": "AGRO-1756572958564-FO4KBD",
    "student_name": "Juan Perez",
    "course_title": "Curso Actualizado desde Frontend",
    "course_category": "agriculture",
    "course_level": "Avanzado",
    "course_duration": 35,
    "instructor_name": "Juan Instructor",
    "instructor_specialization": null,
    "issued_at": "2025-08-30T21:55:58.000Z",
    "final_grade": "80.00",
    "status": "issued"
  }
}
```

**Respuesta certificado no válido:**
```json
{
  "error": "Certificado no encontrado",
  "valid": false
}
```

### 3. **Verificar Elegibilidad para Certificado**
```
GET /api/certificates/eligibility/:studentId/:courseId
```

**Autenticación:** Requerida (estudiante propio, instructor o admin)

**Respuesta exitosa:**
```json
{
  "success": true,
  "eligibility": {
    "is_eligible": false,
    "checks": {
      "class_progress_ok": false,
      "overall_grade_ok": false,
      "final_exam_passed": true,
      "all_evaluations_attempted": true
    },
    "class_progress_percentage": 0,
    "overall_grade": 0,
    "completed_classes": "0",
    "total_classes": "0",
    "evaluations": [],
    "final_exam_score": null
  },
  "existing_certificate": null,
  "course_info": {
    "title": "Curso Actualizado desde Frontend",
    "instructor": "Juan Instructor",
    "duration_hours": 35
  }
}
```

**Criterios de elegibilidad:**
- **class_progress_ok**: ≥80% de clases completadas
- **overall_grade_ok**: ≥70% promedio general
- **final_exam_passed**: ≥70% en examen final (si existe)
- **all_evaluations_attempted**: Todas las evaluaciones intentadas

### 4. **Generar Certificado**
```
POST /api/certificates/generate/:studentId/:courseId
```

**Autenticación:**
- Automático: Estudiante propio
- Manual: Instructor/Admin

**Body:**
```json
{
  "automatic": false,  // true para generación automática
  "override": true     // true para saltar validaciones
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Certificado emitido manualmente",
  "certificate": {
    "id": "fe3f4874-c76f-4db1-a4b2-60b09a454a9b",
    "student_id": "cb102882-7c7c-4b9e-9e3b-a3c298e47672",
    "course_id": "291dad64-dcd8-40ee-848d-2bc56a34f855",
    "certificate_number": "AGRO-1756572958564-FO4KBD",
    "issued_at": "2025-08-30T21:55:58.000Z",
    "final_grade": "80.00",
    "status": "issued",
    "certificate_url": null,
    "metadata": {
      "student_name": "Juan Perez",
      "course_title": "Curso Actualizado desde Frontend",
      "instructor_name": "Juan Instructor",
      "generation_type": "manual",
      "generated_by": "8b153e58-22cf-4b07-adde-6114b56c61fb",
      "completion_date": "2025-08-30T16:55:58.564Z"
    },
    "created_at": "2025-08-30T21:55:58.000Z"
  }
}
```

### 5. **Revocar Certificado**
```
PUT /api/certificates/:certificateId/revoke
```

**Autenticación:** Instructor del curso o Admin

**Body:**
```json
{
  "reason": "Motivo de la revocación"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Certificado revocado exitosamente",
  "certificate": {
    "id": "fe3f4874-c76f-4db1-a4b2-60b09a454a9b",
    "status": "revoked",
    "metadata": {
      "reason": "Certificado de prueba",
      "revoked_at": "2025-08-30T16:59:41.056Z",
      "revoked_by": "8b153e58-22cf-4b07-adde-6114b56c61fb",
      ...
    }
  }
}
```

### 6. **Estadísticas de Certificados**
```
GET /api/certificates/stats
```

**Autenticación:** Instructor/Admin

**Query params opcionales:**
- `instructor_id`: Filtrar por instructor
- `course_id`: Filtrar por curso

**Respuesta exitosa:**
```json
{
  "success": true,
  "stats": {
    "total_certificates": "4",
    "active_certificates": "0",
    "revoked_certificates": "0",
    "issued_last_month": "2",
    "courses_with_certificates": "3",
    "unique_students": "4",
    "average_grade": "65.0000000000000000"
  }
}
```

---

### 7. **Obtener Certificados de un Curso**
```
GET /api/certificates/courses/:courseId/certificates
```

**Autenticación:** Instructor del curso o Admin

**Query params opcionales:**
- `page`: Número de página (default: 1)
- `limit`: Certificados por página (default: 20, max: 100)

**Respuesta exitosa:**
```json
{
  "success": true,
  "certificates": [
    {
      "id": "fe3f4874-c76f-4db1-a4b2-60b09a454a9b",
      "certificate_number": "AGRO-1756572958564-FO4KBD",
      "student_name": "Juan Perez",
      "student_email": "student@test.com",
      "course_title": "Curso Actualizado desde Frontend",
      "instructor_name": "Juan Instructor",
      "issued_at": "2025-08-30T21:55:58.000Z",
      "final_grade": "80.00",
      "status": "revoked"
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

### 8. **Plantillas de Certificados**
```
GET /api/certificates/templates
POST /api/certificates/templates
```

**GET Plantillas - Autenticación:** Instructor/Admin

**Query params opcionales:**
- `category`: Filtrar por categoría

**Respuesta exitosa:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "85e0e010-7fe7-4f5c-b7a6-8dc880374cb7",
      "name": "Plantilla Formal Agricultura",
      "description": "Plantilla formal para certificados de cursos de agricultura",
      "category": "agriculture",
      "preview_image": "https://static.vecteezy.com/system/resources/previews/000/414/693/non_2x/a-formal-certificate-blank-template-vector.jpg",
      "is_default": true,
      "created_at": "2025-08-30T22:53:59.210Z"
    }
  ]
}
```

**POST Crear Plantilla - Autenticación:** Solo Admin

**Body requerido:**
```json
{
  "name": "Nombre de la plantilla",
  "description": "Descripción opcional",
  "template_config": {
    "background_image": "https://static.vecteezy.com/system/resources/previews/000/414/693/non_2x/a-formal-certificate-blank-template-vector.jpg",
    "title_position": {"x": 400, "y": 250},
    "name_position": {"x": 400, "y": 350},
    "course_position": {"x": 400, "y": 400},
    "date_position": {"x": 200, "y": 500},
    "signature_position": {"x": 600, "y": 500},
    "font_family": "Arial",
    "title_size": 24,
    "name_size": 32,
    "course_size": 18
  },
  "preview_image": "URL de imagen de vista previa",
  "category": "agriculture",
  "is_default": false
}
```

### 9. **Emitir Certificado (Método Original)**
```
POST /api/certificates/issue
```

**Autenticación:** Instructor del curso o Admin

**Body requerido:**
```json
{
  "student_id": "uuid-del-estudiante",
  "course_id": "uuid-del-curso",
  "final_grade": 95
}
```

**Requisitos:**
- El estudiante debe tener status "completed" en su inscripción
- Progreso debe ser 100%
- No debe tener certificado activo previo

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Certificado emitido exitosamente",
  "certificate": {
    "id": "b8a593b1-8404-438d-9449-97b2e5bed039",
    "certificate_number": "CERT-4DBDE57E",
    "student_name": "Juan Perez",
    "course_title": "Curso Actualizado desde Frontend",
    "instructor_name": "Juan Instructor",
    "final_grade": "95.00",
    "status": "active",
    "issued_at": "2025-08-30T22:54:50.000Z"
  }
}
```

### 10. **Descargar Certificado con Plantilla** 🆕
```
GET /api/certificates/:id/download
```

**Autenticación:** Requerida (estudiante propio, instructor del curso, o admin)

**Descripción:** Prepara todos los datos necesarios para que el frontend genere un PDF del certificado con la plantilla correspondiente.

**Respuesta exitosa:**
```json
{
  "success": true,
  "download_data": {
    "certificate": {
      "id": "a5941f01-491c-434f-a65a-5a939a32a654",
      "number": "AGRO-1756605784210-X7HPXP",
      "student_name": "Juan Perez",
      "course_title": "Curso Actualizado desde Frontend",
      "course_level": "Avanzado",
      "course_duration": "35 horas",
      "course_category": "agriculture",
      "instructor_name": "Juan Instructor",
      "final_grade": "80.00%",
      "issued_date": "31 de agosto de 2025",
      "status": "issued"
    },
    "template": {
      "id": "85e0e010-7fe7-4f5c-b7a6-8dc880374cb7",
      "name": "Plantilla Formal Agricultura",
      "background_image": "https://static.vecteezy.com/...",
      "config": {
        "title_position": {"x": 400, "y": 250},
        "name_position": {"x": 400, "y": 350},
        "course_position": {"x": 400, "y": 400},
        "date_position": {"x": 200, "y": 500},
        "qr_position": {"x": 650, "y": 480},
        "font_family": "Arial",
        "name_size": 32,
        "course_size": 18
      }
    },
    "qr_data": {
      "verification_url": "http://localhost:3010/api/certificates/AGRO-1756605784210-X7HPXP/verify",
      "public_url": "http://localhost:3010/verify/AGRO-1756605784210-X7HPXP",
      "certificate_number": "AGRO-1756605784210-X7HPXP"
    }
  }
}
```

---

## 💡 Flujo de Trabajo Recomendado

### Para Estudiantes:
1. **Verificar elegibilidad**: `GET /eligibility/:studentId/:courseId`
2. **Generar automáticamente**: `POST /generate/:studentId/:courseId` con `automatic: true`
3. **Ver certificados**: `GET /students/:studentId/certificates`

### Para Instructores:
1. **Ver progreso del curso**: Usar endpoints de progreso
2. **Generar manualmente**: `POST /generate/:studentId/:courseId` con `automatic: false`
3. **Revocar si necesario**: `PUT /:certificateId/revoke`
4. **Ver estadísticas**: `GET /stats?course_id=:courseId`

### Para Verificación Pública:
1. **Verificar certificado**: `GET /:certificateNumber/verify`

---

## 🔧 Estructura de Base de Datos

### Tabla `certificates`
```sql
CREATE TABLE certificates (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    course_id UUID NOT NULL,
    certificate_number VARCHAR(255) UNIQUE NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    final_grade NUMERIC(5,2) NOT NULL,
    status VARCHAR(255) NOT NULL, -- 'issued', 'active', 'revoked'
    certificate_url TEXT,
    metadata JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Estados del Certificado:
- **`issued`**: Certificado emitido y válido
- **`active`**: Certificado activo (sinónimo de issued)
- **`revoked`**: Certificado revocado

### Formato del Número de Certificado:
```
AGRO-{timestamp}-{random6chars}
Ejemplo: AGRO-1756572958564-FO4KBD
```

---

## 📱 Ejemplos de Código para Frontend

### React/JavaScript

#### Verificar Certificado
```javascript
const verifyCertificate = async (certificateNumber) => {
  try {
    const response = await fetch(`/api/certificates/${certificateNumber}/verify`);
    const data = await response.json();
    
    if (data.success && data.valid) {
      console.log('Certificado válido:', data.certificate);
      return data.certificate;
    } else {
      console.log('Certificado no válido');
      return null;
    }
  } catch (error) {
    console.error('Error verificando certificado:', error);
    return null;
  }
};
```

#### Obtener Certificados del Estudiante
```javascript
const getStudentCertificates = async (studentId, token) => {
  try {
    const response = await fetch(`/api/certificates/students/${studentId}/certificates`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data.success ? data.certificates : [];
  } catch (error) {
    console.error('Error obteniendo certificados:', error);
    return [];
  }
};
```

#### Verificar Elegibilidad
```javascript
const checkEligibility = async (studentId, courseId, token) => {
  try {
    const response = await fetch(`/api/certificates/eligibility/${studentId}/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data.success ? data.eligibility : null;
  } catch (error) {
    console.error('Error verificando elegibilidad:', error);
    return null;
  }
};
```

#### Generar Certificado
```javascript
const generateCertificate = async (studentId, courseId, token, automatic = false) => {
  try {
    const response = await fetch(`/api/certificates/generate/${studentId}/${courseId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        automatic: automatic,
        override: !automatic // Si es manual, permite override
      })
    });
    const data = await response.json();
    return data.success ? data.certificate : null;
  } catch (error) {
    console.error('Error generando certificado:', error);
    return null;
  }
};
```

#### Revocar Certificado
```javascript
const revokeCertificate = async (certificateId, reason, token) => {
  try {
    const response = await fetch(`/api/certificates/${certificateId}/revoke`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });
    const data = await response.json();
    return data.success ? data.certificate : null;
  } catch (error) {
    console.error('Error revocando certificado:', error);
    return null;
  }
};
```

---

## 🎨 Componentes UI Sugeridos

### Componente de Verificación de Certificado
```jsx
import React, { useState } from 'react';

const CertificateVerifier = () => {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyCertificate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/certificates/${certificateNumber}/verify`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Error de conexión' });
    }
    setLoading(false);
  };

  return (
    <div className="certificate-verifier">
      <h3>Verificar Certificado</h3>
      <div>
        <input
          type="text"
          placeholder="Ej: AGRO-1756572958564-FO4KBD"
          value={certificateNumber}
          onChange={(e) => setCertificateNumber(e.target.value)}
        />
        <button onClick={verifyCertificate} disabled={loading}>
          {loading ? 'Verificando...' : 'Verificar'}
        </button>
      </div>
      
      {result && (
        <div className={`result ${result.valid ? 'valid' : 'invalid'}`}>
          {result.valid ? (
            <div className="certificate-details">
              <h4>✅ Certificado Válido</h4>
              <p><strong>Estudiante:</strong> {result.certificate.student_name}</p>
              <p><strong>Curso:</strong> {result.certificate.course_title}</p>
              <p><strong>Instructor:</strong> {result.certificate.instructor_name}</p>
              <p><strong>Calificación:</strong> {result.certificate.final_grade}%</p>
              <p><strong>Emitido:</strong> {new Date(result.certificate.issued_at).toLocaleDateString()}</p>
            </div>
          ) : (
            <div className="invalid-certificate">
              <h4>❌ Certificado No Válido</h4>
              <p>{result.error || 'Certificado no encontrado'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### Componente de Lista de Certificados del Estudiante
```jsx
import React, { useEffect, useState } from 'react';

const StudentCertificates = ({ studentId, token }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(`/api/certificates/students/${studentId}/certificates`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setCertificates(data.success ? data.certificates : []);
      } catch (error) {
        console.error('Error:', error);
      }
      setLoading(false);
    };

    fetchCertificates();
  }, [studentId, token]);

  if (loading) return <div>Cargando certificados...</div>;

  return (
    <div className="student-certificates">
      <h3>Mis Certificados ({certificates.length})</h3>
      {certificates.length === 0 ? (
        <p>No tienes certificados aún.</p>
      ) : (
        <div className="certificates-grid">
          {certificates.map(cert => (
            <div key={cert.id} className="certificate-card">
              <h4>{cert.course_title}</h4>
              <p><strong>Número:</strong> {cert.certificate_number}</p>
              <p><strong>Calificación:</strong> {cert.final_grade}%</p>
              <p><strong>Emitido:</strong> {new Date(cert.issued_at).toLocaleDateString()}</p>
              <p><strong>Estado:</strong> 
                <span className={`status ${cert.status}`}>
                  {cert.status === 'issued' ? 'Válido' : cert.status === 'revoked' ? 'Revocado' : cert.status}
                </span>
              </p>
              <div className="certificate-actions">
                <button onClick={() => window.open(`/certificates/${cert.certificate_number}/verify`, '_blank')}>
                  Ver Certificado
                </button>
                <button onClick={() => navigator.clipboard.writeText(cert.certificate_number)}>
                  Copiar Número
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Componente de Elegibilidad de Certificado
```jsx
import React, { useEffect, useState } from 'react';

const CertificateEligibility = ({ studentId, courseId, token, onGenerate }) => {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const response = await fetch(`/api/certificates/eligibility/${studentId}/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setEligibility(data.success ? data.eligibility : null);
      } catch (error) {
        console.error('Error:', error);
      }
      setLoading(false);
    };

    checkEligibility();
  }, [studentId, courseId, token]);

  const generateCertificate = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/certificates/generate/${studentId}/${courseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ automatic: true })
      });
      const data = await response.json();
      if (data.success) {
        onGenerate && onGenerate(data.certificate);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setGenerating(false);
  };

  if (loading) return <div>Verificando elegibilidad...</div>;
  if (!eligibility) return <div>Error al verificar elegibilidad</div>;

  return (
    <div className="certificate-eligibility">
      <h3>Elegibilidad para Certificado</h3>
      
      <div className="eligibility-checks">
        <div className={`check ${eligibility.checks.class_progress_ok ? 'passed' : 'failed'}`}>
          ✓ Progreso de clases: {eligibility.class_progress_percentage}% 
          ({eligibility.completed_classes}/{eligibility.total_classes})
          {eligibility.checks.class_progress_ok ? ' ✅' : ' ❌ (Requerido: 80%)'}
        </div>
        
        <div className={`check ${eligibility.checks.overall_grade_ok ? 'passed' : 'failed'}`}>
          ✓ Calificación general: {eligibility.overall_grade}%
          {eligibility.checks.overall_grade_ok ? ' ✅' : ' ❌ (Requerido: 70%)'}
        </div>
        
        <div className={`check ${eligibility.checks.final_exam_passed ? 'passed' : 'failed'}`}>
          ✓ Examen final: {eligibility.final_exam_score || 'N/A'}%
          {eligibility.checks.final_exam_passed ? ' ✅' : ' ❌ (Requerido: 70%)'}
        </div>
        
        <div className={`check ${eligibility.checks.all_evaluations_attempted ? 'passed' : 'failed'}`}>
          ✓ Evaluaciones completadas
          {eligibility.checks.all_evaluations_attempted ? ' ✅' : ' ❌'}
        </div>
      </div>

      <div className="course-info">
        <h4>Información del Curso</h4>
        <p><strong>Curso:</strong> {eligibility.course_info?.title}</p>
        <p><strong>Instructor:</strong> {eligibility.course_info?.instructor}</p>
        <p><strong>Duración:</strong> {eligibility.course_info?.duration_hours} horas</p>
      </div>

      {eligibility.existing_certificate ? (
        <div className="existing-certificate">
          <h4>Certificado Existente</h4>
          <p>Ya tienes un certificado para este curso: {eligibility.existing_certificate.certificate_number}</p>
        </div>
      ) : eligibility.is_eligible ? (
        <button 
          onClick={generateCertificate} 
          disabled={generating}
          className="generate-button success"
        >
          {generating ? 'Generando...' : 'Generar Certificado'}
        </button>
      ) : (
        <div className="not-eligible">
          <p>⚠️ Aún no cumples los requisitos para el certificado.</p>
          <p>Completa las actividades pendientes para obtener tu certificado.</p>
        </div>
      )}
    </div>
  );
};
```

---

## 🚀 Casos de Uso Principales

### 1. Dashboard del Estudiante
- Mostrar certificados obtenidos
- Mostrar progreso hacia certificados pendientes
- Verificación de elegibilidad en tiempo real

### 2. Panel del Instructor
- Ver certificados emitidos por curso
- Aprobar certificados manualmente
- Estadísticas de certificación

### 3. Verificador Público
- Página pública para verificar la autenticidad de certificados
- Búsqueda por número de certificado
- Información del certificado sin datos sensibles

### 4. Panel de Administración
- Gestión completa de certificados
- Estadísticas globales
- Revocación de certificados

---

## 🎨 Sistema de Plantillas de Certificados

### Plantilla por Defecto Creada
Se ha creado una plantilla formal con la imagen de Vecteezy:
- **Background:** https://static.vecteezy.com/system/resources/previews/000/414/693/non_2x/a-formal-certificate-blank-template-vector.jpg
- **Categoría:** agriculture
- **Configuración:** Posiciones definidas para título, nombre, curso, fecha y firma

### Configuración de Plantilla (`template_config`)
```json
{
  "background_image": "URL de imagen de fondo",
  "title_position": {"x": 400, "y": 250},
  "name_position": {"x": 400, "y": 350}, 
  "course_position": {"x": 400, "y": 400},
  "date_position": {"x": 200, "y": 500},
  "signature_position": {"x": 600, "y": 500},
  "font_family": "Arial",
  "title_size": 24,
  "name_size": 32,
  "course_size": 18
}
```

### Estructura de Base de Datos - Templates
```sql
CREATE TABLE certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by_id UUID NOT NULL,
    template_config JSON NOT NULL,
    preview_image TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    is_default BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Todos los Endpoints Funcionales

**TODOS LOS ENDPOINTS ESTÁN FUNCIONANDO CORRECTAMENTE:**

- ✅ `GET /students/:studentId/certificates` - Obtener certificados del estudiante
- ✅ `GET /:certificateNumber/verify` - Verificación pública
- ✅ `GET /eligibility/:studentId/:courseId` - Verificar elegibilidad
- ✅ `POST /generate/:studentId/:courseId` - Generar certificado
- ✅ `PUT /:id/revoke` - Revocar certificado
- ✅ `GET /stats` - Estadísticas de certificados
- ✅ `GET /courses/:courseId/certificates` - Certificados por curso (CORREGIDO)
- ✅ `GET /templates` - Obtener plantillas (IMPLEMENTADO)
- ✅ `POST /templates` - Crear plantillas (IMPLEMENTADO)
- ✅ `POST /issue` - Emitir certificado método original (CORREGIDO)
- ✅ `GET /:id/download` - Descargar certificado con plantilla (NUEVO)

---

## 📊 Datos de Prueba Utilizados

**Usuario Estudiante:**
- ID: `cb102882-7c7c-4b9e-9e3b-a3c298e47672`
- Email: `student@test.com`
- Nombre: Juan Perez

**Usuario Admin:**
- ID: `8b153e58-22cf-4b07-adde-6114b56c61fb`
- Email: `admin@test.com`
- Nombre: Maria Admin

**Curso de Prueba:**
- ID: `291dad64-dcd8-40ee-848d-2bc56a34f855`
- Título: "Curso Actualizado desde Frontend"

**Certificado Generado:**
- Número: `AGRO-1756605784210-X7HPXP`
- Estado: Activo

---

## 🔻 **NUEVO: SISTEMA DE DESCARGA CON PLANTILLAS Y QR**

### 📋 **Endpoint de Descarga:**
```
GET /api/certificates/:id/download
```

**Roles permitidos:** Estudiante propio, instructor del curso, admin

### 📱 **Implementación Frontend:**

**Librerías necesarias:**
```bash
npm install jspdf qrcode
```

**Componente de descarga:**
```jsx
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const CertificateDownloader = ({ certificateId, token }) => {
  const downloadCertificate = async () => {
    // 1. Obtener datos del backend
    const response = await fetch(`/api/certificates/${certificateId}/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const { download_data } = await response.json();
    const { certificate, template, qr_data } = download_data;

    // 2. Generar QR Code
    const qrDataUrl = await QRCode.toDataURL(qr_data.verification_url);

    // 3. Crear PDF
    const pdf = new jsPDF('landscape', 'px', [800, 600]);
    
    // 4. Cargar plantilla como fondo
    const img = new Image();
    img.onload = () => {
      pdf.addImage(img, 'JPEG', 0, 0, 800, 600);
      
      // 5. Superponer datos del certificado
      pdf.setFont('Arial', 'bold');
      pdf.setFontSize(24);
      pdf.text('CERTIFICADO DE FINALIZACIÓN', 400, 250, {align: 'center'});
      
      pdf.setFontSize(32);
      pdf.text(certificate.student_name, 400, 350, {align: 'center'});
      
      pdf.setFontSize(18);
      pdf.text(certificate.course_title, 400, 400, {align: 'center'});
      
      pdf.setFontSize(14);
      pdf.text(`Duración: ${certificate.course_duration}`, 300, 450);
      pdf.text(`Calificación: ${certificate.final_grade}`, 500, 450);
      pdf.text(`Fecha: ${certificate.issued_date}`, 200, 500);
      pdf.text(`Instructor: ${certificate.instructor_name}`, 500, 500);
      
      // 6. Agregar QR
      const qr = new Image();
      qr.onload = () => {
        pdf.addImage(qr, 'PNG', 650, 480, 80, 80);
        pdf.save(`Certificado_${certificate.student_name}.pdf`);
      };
      qr.src = qrDataUrl;
    };
    img.src = template.background_image;
  };

  return <button onClick={downloadCertificate}>📄 Descargar PDF</button>;
};
```

### 🎯 **Flujo Completo:**
1. Usuario clic "Descargar"
2. Frontend → `GET /api/certificates/{id}/download`
3. Backend → Datos + Plantilla + QR URLs
4. Frontend → Genera QR + Carga plantilla + Superpone textos + Descarga PDF
5. Resultado → PDF profesional con verificación QR

### 🔍 **QR contiene:** `http://localhost:3010/api/certificates/{number}/verify`
**Al escanear:** Verificación pública instantánea ✅