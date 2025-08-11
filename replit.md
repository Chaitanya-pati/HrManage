# FlexUI - Human Resource Management System

## Overview

FlexUI is a comprehensive Human Resource Management System (HRMS) built as a frontend-only web application. The system provides complete employee lifecycle management including employee profiles, attendance tracking, leave management, payroll processing, and performance reviews. It features a modern dashboard with analytics and reporting capabilities, designed for organizations to efficiently manage their workforce and HR operations. The application now runs entirely on the frontend using localStorage for data persistence, making it perfect for demos and local development.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (2025-08-11)

### Migration to Standard Replit Environment Completed (2025-08-11)
- **Successfully migrated FlexUI HRMS from Replit Agent to standard Replit environment**
- **PostgreSQL database setup and schema migration completed** with full database integration
- **Fixed all critical TypeScript errors** in server routes and storage implementations
- **Simplified storage architecture** with proper database-based implementation using Drizzle ORM
- **Cleaned up complex biometric and client site features** that were causing migration issues
- **Application now running successfully** with hot module replacement enabled on port 5000
- **All core HRMS functionality operational**: employee management, department management, attendance tracking, leave requests, payroll processing, performance reviews, job openings and applications
- **Database-first approach implemented** with proper data relationships and type safety

### Half-Day Leave System Implementation (2025-08-10)
- **Complete half-day leave functionality added** with morning (9 AM - 1 PM) and evening (1 PM - 6 PM) options
- Updated database schema to support 0.5 day calculations with decimal precision
- Enhanced leave request dialog with checkbox for half-day selection and time slot picker
- Implemented comprehensive form validation preventing invalid half-day combinations
- Fixed approve/reject button functionality by connecting to real API data instead of mock data
- Added proper error handling with detailed error messages for failed operations
- Leave metrics dashboard now accurately displays real leave request data
- Support for both full-day (1, 2, 3+ days) and half-day (0.5 days) leave calculations

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