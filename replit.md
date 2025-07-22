# DefenseHub: AI-Driven Cybersecurity Awareness & GRC Stress Test Simulator

## Overview

DefenseHub is a comprehensive cybersecurity training and governance, risk, and compliance (GRC) validation platform that combines AI-powered phishing simulations with real-time crisis management exercises. The system provides adaptive security awareness training, intelligent coaching feedback, and tabletop crisis simulations to test organizational policies and response procedures.

**Current Status**: Fully operational with complete email functionality for phishing simulations, security alerts, and compliance reporting. All major features implemented and tested successfully.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

✓ **Rebranding Complete** - Changed platform name from "SentinelSim" to "DefenseHub" across all components

✓ **Email Integration Complete** - Full SMTP functionality implemented with Yahoo Mail integration
✓ **Phishing Simulation Emails** - Realistic phishing templates with training disclaimers for spam filter compliance
✓ **Security Alert System** - Automated security notifications with severity levels
✓ **Compliance Reporting** - Automated compliance report generation and email delivery
✓ **Email Center UI** - Complete interface for managing all email communications
✓ **API Endpoints** - All email-related backend functionality operational

✓ **Reports System Complete** - Full-stack report generation and storage implementation
✓ **Database Storage** - Reports table with complete CRUD operations and PostgreSQL persistence
✓ **6 Report Templates** - Professional templates covering executive summaries, security awareness, phishing campaigns, incident response, compliance audits, and risk assessments
✓ **Real-time UI Updates** - Live report generation with loading states, success notifications, and automatic list refresh
✓ **Report Management** - Complete display of generated reports with download functionality and metadata tracking

✓ **Quick Actions Optimization** - Streamlined dashboard Quick Actions for better user experience
✓ **Database Constraints Fixed** - Resolved foreign key constraint issues by using valid user IDs for simulation creation
✓ **Simulation Creation Working** - Fixed validation errors and improved UI with pre-selected target audiences and clear visual indicators
✓ **Redundant Features Removed** - Eliminated duplicate "AI Coach" action that was redundant with "New Phishing Test"

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and data fetching
- **UI Components**: Radix UI primitives with custom Tailwind CSS styling (shadcn/ui pattern)
- **Styling**: Tailwind CSS with custom cybersecurity theme colors and variables
- **Real-time Communication**: WebSocket integration for live crisis simulations

### Backend Architecture
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js for REST API endpoints
- **WebSocket Server**: ws library for real-time crisis simulation features
- **Build Tool**: esbuild for production bundling
- **Development**: tsx for TypeScript execution in development

### Data Storage Solutions
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with connection pooling
- **Schema**: Comprehensive database schema covering users, simulations, scenarios, interactions, coaching sessions, compliance metrics, and audit logs
- **Migrations**: Drizzle Kit for database schema management

### Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions
- **User Roles**: Role-based access control with user, admin, and security_admin roles
- **Security**: Password-based authentication with planned expansion for MFA

## Key Components

### 1. Phishing Simulation Engine
- **AI Integration**: OpenAI GPT-4 integration for generating adaptive phishing scenarios
- **Personalization**: Dynamic difficulty scaling based on user behavior and training history
- **Scenario Management**: Database-driven scenario storage with configurable difficulty levels
- **User Interaction Tracking**: Comprehensive logging of user actions (clicks, submissions, reports)

### 2. AI-Powered Coaching System
- **Conversational AI**: GPT-based coaching feedback system
- **Adaptive Learning**: Personalized coaching based on user performance patterns
- **Psychological Insights**: Feedback tuned to cognitive biases and security awareness principles
- **Progress Tracking**: Gamified scoring and badge system for user engagement

### 3. Crisis Simulation Framework
- **Multi-Actor Scenarios**: AI-generated crisis scenarios with branching decision trees
- **Real-time Collaboration**: WebSocket-powered live simulation environments
- **Decision Impact Analysis**: Real-time evaluation of crisis response decisions
- **Communication Simulation**: Slack-style interface for crisis communication practice

### 4. Compliance and Audit System
- **Framework Support**: NIST, ISO 27001, GDPR, and SOC 2 compliance tracking
- **Audit Trail**: Comprehensive logging of all user actions and system events
- **Reporting Engine**: Automated compliance report generation
- **Metrics Dashboard**: Real-time compliance scoring and trend analysis

## Data Flow

### Training Flow
1. Admin creates simulation with target audience and difficulty settings
2. AI generates personalized phishing scenarios based on user profiles
3. Users interact with scenarios (click, report, ignore)
4. System logs all interactions and calculates security scores
5. AI coach provides immediate feedback and recommendations
6. Progress is tracked and reported for compliance purposes

### Crisis Simulation Flow
1. Admin initiates crisis scenario with complexity settings
2. AI generates multi-phase crisis with various stakeholder roles
3. WebSocket connections enable real-time participant communication
4. System evaluates decisions and provides dynamic scenario updates
5. Results are scored and analyzed for organizational preparedness

### Audit and Compliance Flow
1. All user actions are automatically logged to audit trail
2. Compliance metrics are calculated based on training completion and performance
3. Reports are generated for various compliance frameworks
4. Dashboard provides real-time visibility into security posture

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4 integration for scenario generation and coaching
- **Fallback Strategy**: Configurable API keys with environment variable support

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL for production
- **Connection Pooling**: Optimized for serverless environments

### Frontend Libraries
- **Radix UI**: Accessible component primitives for consistent UX
- **Tailwind CSS**: Utility-first styling with custom cybersecurity theme
- **TanStack Query**: Robust data fetching and caching
- **Date-fns**: Date manipulation and formatting

### Development Tools
- **TypeScript**: Type safety across full stack
- **Vite**: Fast development and optimized production builds
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite-powered frontend with Express backend
- **TypeScript Compilation**: Real-time type checking with tsx
- **Database Migrations**: Drizzle Kit push for schema updates
- **Environment Variables**: Secure API key and database URL management

### Production Deployment
- **Build Process**: Vite builds frontend assets, esbuild bundles backend
- **Static Assets**: Frontend served from `/dist/public`
- **API Routes**: Express server handles `/api/*` endpoints
- **WebSocket Support**: Production-ready WebSocket server for real-time features
- **Database Connection**: Neon serverless PostgreSQL with connection pooling

### Scalability Considerations
- **Serverless Architecture**: Designed for serverless deployment environments
- **Connection Pooling**: Efficient database connection management
- **Static Asset Optimization**: Vite optimizations for fast loading
- **Real-time Scaling**: WebSocket connection management for concurrent crisis simulations

The application is architected as a full-stack TypeScript application with a focus on security training and compliance management, leveraging AI for personalized learning experiences and real-time crisis simulation capabilities.