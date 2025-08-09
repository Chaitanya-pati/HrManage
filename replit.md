# FlexUI - Human Resource Management System

## Overview

FlexUI is a comprehensive Human Resource Management System (HRMS) built as a frontend-only web application. The system provides complete employee lifecycle management including employee profiles, attendance tracking, leave management, payroll processing, and performance reviews. It features a modern dashboard with analytics and reporting capabilities, designed for organizations to efficiently manage their workforce and HR operations. The application now runs entirely on the frontend using localStorage for data persistence, making it perfect for demos and local development.

## User Preferences

Preferred communication style: Simple, everyday language.

## Project Requirements (Latest Update: 2025-08-09)

The user has outlined comprehensive HRMS requirements including:
- Employee Count tracking and metrics
- Shift management system
- Advanced payroll processing with:
  - Overtime tracking
  - Time office gate integration
  - In/out time tracking
  - Biometric integration support
  - Salary slip generation
- Remote/out-office employee tracking with optimal solutions
- Comprehensive leave management system

These features represent the next phase of development beyond the basic employee management currently implemented.

## System Architecture

### Frontend Architecture
The client-side is built with **React 18** using **TypeScript** for type safety. The application uses **Vite** as the build tool for fast development and optimized production builds. Routing is handled by **Wouter**, a lightweight client-side router. The UI is built with **shadcn/ui** components based on **Radix UI** primitives, styled with **Tailwind CSS** for consistent design and theming.

State management is handled through **TanStack Query (React Query)** for server state management, caching, and data synchronization. Form handling uses **React Hook Form** with **Zod** for validation. The application supports responsive design with mobile-first principles and includes dark mode theming through CSS custom properties.

### Data Architecture
The application now uses **localStorage** for data persistence, eliminating the need for a backend server or database. This makes it perfect for demos and local development. A custom data layer (`localStorage.ts`) provides a complete API simulation that:

- Stores all data in browser localStorage with automatic initialization
- Provides sample employee, department, attendance, and performance data
- Simulates API delays for realistic user experience
- Maintains data relationships and integrity
- Supports CRUD operations for all HR modules

The data structure includes:
- Employees with department relationships
- Attendance tracking with check-in/check-out times
- Payroll processing with salary calculations
- Performance reviews and ratings
- Activity logging for audit trails
- Department organization structure

### Data Validation
**Zod** schemas are used consistently across the application for runtime type validation, with **drizzle-zod** providing automatic schema generation from database models. This ensures type safety from the database layer through to the frontend components.

### Build and Development
The application uses a monorepo structure with shared types and schemas between client and server. **ESBuild** handles server-side bundling for production, while **Vite** manages client-side builds. The development environment supports hot module replacement and includes error overlay for debugging.

### Styling and UI Framework
The UI follows a design system based on **shadcn/ui** with the "new-york" style variant. **Tailwind CSS** provides utility-first styling with custom CSS variables for theming. The application includes comprehensive component library covering forms, data display, navigation, and feedback components.

## External Dependencies

### Database and Storage
- **Neon Database** - Serverless PostgreSQL hosting
- **Drizzle ORM** - Type-safe database operations and migrations
- **connect-pg-simple** - PostgreSQL session store for Express

### UI and Design
- **Radix UI** - Unstyled, accessible UI primitives (multiple packages)
- **shadcn/ui** - Pre-built component library
- **Tailwind CSS** - Utility-first CSS framework
- **Font Awesome** - Icon library
- **Lucide React** - Icon components
- **Google Fonts (Inter)** - Typography

### Development and Tooling
- **Vite** - Frontend build tool with HMR
- **TypeScript** - Type checking and development experience
- **ESBuild** - Fast JavaScript bundler for production
- **PostCSS** - CSS processing with Autoprefixer

### Data Management
- **TanStack Query** - Server state management and caching
- **React Hook Form** - Form state management
- **Zod** - Schema validation library
- **date-fns** - Date manipulation utilities

### Charts and Visualization
- **Chart.js** - Data visualization (dynamically imported)
- **Embla Carousel** - Carousel/slider components

### Development Tools
- **Replit Integration** - Development environment support with error handling and cartographer plugins