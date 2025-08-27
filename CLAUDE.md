# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based educational platform for "Centro de Formación Desarrollo Agropecuario" (CFDA) - an agricultural and livestock development training center. The application provides course management, user authentication with role-based access control, and educational content delivery.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm start

# Build for production
npm run build

# Run tests in interactive watch mode
npm test

# Eject Create React App configuration (one-way operation)
npm run eject
```

## Architecture Overview

### State Management
- **Zustand** for global state management
- Main store: `src/store/authStore.js` handles authentication, user data, and session management
- Authentication state persisted in localStorage with keys: `token` and `user`

### Authentication & Authorization
- JWT-based authentication with automatic token refresh
- Role-based access control with three roles: `admin`, `instructor`, `student`
- Protected routes implemented via `ProtectedRoute` component (`src/components/ProtectedRoute.js`)
- API interceptors handle automatic logout on 401 responses

### API Configuration
- Axios instance configured in `src/services/authService.js`
- Base API URL: `process.env.REACT_APP_API_BASE_URL` (fallback: `http://localhost:3001/api`)
- Current environment file sets API to `http://localhost:3010/api`
- Automatic Bearer token injection for authenticated requests

### Routing Structure
- **Public routes**: Home (`/`), Login (`/login`), Register (`/register`)
- **Protected routes**: All dashboard and functional routes require authentication
- **Role-specific routes**: 
  - Admin only: `/estudiantes`, `/instructores`, `/aprobaciones`, `/reportes`
  - Instructor only: `/mis-estudiantes`, `/estadisticas`
  - Student only: `/progreso`
- Most feature routes currently redirect to `ComingSoon` component

### Layout System
- Dashboard layout components in `src/components/Layout/`
- Components: `DashboardLayout`, `Header`, `Navbar`, `Sidebar`, `Footer`
- Layout provides consistent navigation and structure for authenticated users

### Styling
- **TailwindCSS** for styling with custom configuration
- Custom color palette: `primary` (yellow/amber) and `olive` (green) color schemes
- Custom font: TikTok Sans from Google Fonts
- Custom animations for scrolling elements

### Key Dependencies
- React 19.1.0 with React Router DOM 7.7.0
- Zustand 5.0.6 for state management
- Axios 1.10.0 for HTTP requests
- Lucide React 0.525.0 for icons
- Testing Library suite for component testing

## Environment Configuration

Required environment variables:
- `REACT_APP_API_BASE_URL`: Backend API base URL

## Course Management System

### Implementation Status: COMPLETED ✅

The course management system is fully implemented with role-based permissions:

**Course Features:**
- Complete CRUD operations for courses (Create, Read, Update, Delete)
- Advanced filtering and search capabilities
- Pagination for large course catalogs
- Role-based access control (admin/instructor can manage, students can enroll)
- Enrollment system with payment status tracking
- Course progress tracking

**Store Management:**
- `courseStore.js`: Zustand store for course state management
- Handles course listing, filtering, pagination, and CRUD operations
- Integrated with enrollment and progress tracking

**Service Layer:**
- Complete service implementations for all API endpoints
- `courseService.js`, `moduleService.js`, `classService.js`, `assignmentService.js`
- `enrollmentService.js`, `progressService.js`, `certificateService.js`, `virtualClassService.js`
- Error handling and authentication token management

**Components:**
- `CourseCard`: Responsive course display with role-based actions
- `CourseFilters`: Advanced filtering by category, level, price, duration
- `CourseForm`: Complete form for creating/editing courses with validation
- `CoursesPage`: Main page with listing, filtering, and management
- `CourseDetailPage`: Detailed course view with enrollment functionality

**Role-Based Permissions:**
- `useRolePermissions` hook for granular permission control
- Students: can view and enroll in courses
- Instructors: can create, edit own courses, manage enrollments
- Admins: full access to all course operations

**Routes Implemented:**
- `/cursos` - Course listing and management
- `/cursos/:id` - Individual course detail pages

## Development Notes

- Course management system fully functional and production-ready
- Authentication flow is fully implemented with registration, login, profile management
- Error handling implemented in both store and service layers
- Application supports Spanish language (evident from HTML lang="es" and Spanish comments/text)
- API integration follows documented endpoints in `documentacion-api.html`