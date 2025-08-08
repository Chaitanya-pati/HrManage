# FlexUI - Human Resource Management System

## Overview

FlexUI is a comprehensive Human Resource Management System (HRMS) built as a full-stack web application. The system provides complete employee lifecycle management including employee profiles, attendance tracking, leave management, payroll processing, and performance reviews. It features a modern dashboard with analytics and reporting capabilities, designed for organizations to efficiently manage their workforce and HR operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with **React 18** using **TypeScript** for type safety. The application uses **Vite** as the build tool for fast development and optimized production builds. Routing is handled by **Wouter**, a lightweight client-side router. The UI is built with **shadcn/ui** components based on **Radix UI** primitives, styled with **Tailwind CSS** for consistent design and theming.

State management is handled through **TanStack Query (React Query)** for server state management, caching, and data synchronization. Form handling uses **React Hook Form** with **Zod** for validation. The application supports responsive design with mobile-first principles and includes dark mode theming through CSS custom properties.

### Backend Architecture
The server is built with **Express.js** running on **Node.js** with **TypeScript**. The application follows a RESTful API design pattern with dedicated route handlers for different modules (employees, departments, attendance, payroll, performance, activities). 

The server implements a storage abstraction layer through an `IStorage` interface, allowing for flexible data persistence strategies. The current implementation appears to support both in-memory and database storage options.

### Database Architecture
The application uses **PostgreSQL** as the primary database with **Drizzle ORM** for database operations and **Neon Database** as the serverless PostgreSQL provider. Database migrations are managed through **Drizzle Kit**.

The schema includes tables for:
- Users and authentication
- Employees with department relationships
- Attendance tracking with check-in/check-out times
- Leave management with approval workflows
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